// moonseal on-chain client: upload an ML-DSA-65 key + signature + message into a buffer account and
// run the staged verification of tools/mldsa-onchain (the Vineland/riverrun buffer pattern):
//   createAccount + INIT  ->  WRITE x N (900-byte chunks)  ->  PREP  ->  ROWS(0,2) -> ROWS(2,2) -> ROWS(4,2)+FINAL
// Env-agnostic (node/bun + browser). Confirmation by HTTP polling (no websockets: sandboxes and venue
// wifi block wss). Every transaction stays under 1232 bytes and 1.4M compute units (measured).
import {
  Connection, Keypair, PublicKey, Transaction, TransactionInstruction, SystemProgram, ComputeBudgetProgram,
} from "@solana/web3.js";

export const ACCOUNT_LEN = 13392;
export const H = { STAGE: 2, RESULT: 3, ROWS: 4, COMMIT: 39, KEYID: 71 };
const IX = { INIT: 0, WRITE: 1, PREP: 2, ROWS: 3, CLOSE: 4, REG_INIT: 6, REG_ADD: 7, REG_REMOVE: 8, AUTHORIZE: 9 };
// command registry (src/lib.rs): one account per base, REG_LEN bytes, which ML-DSA-65 keys may command it
export const REG_LEN = 384;
export const R = { MAGIC: 0, NKEYS: 2, AUTH: 8, COUNTER: 40, HOUR: 48, PACKET: 56, SLOT: 88, KEYID: 96, KEYS: 128 };
export const TICKET_LEN = 101;

/** The uplink ticket the operator signs (layout mirrored in src/lib.rs and web/app/command.js):
 *  "MSUT" | 1 | registry pubkey (32) | counter u64 LE | planned hour i64 LE | sha256(packet) (32) | site id (16, ASCII). */
export function uplinkTicket({ registry, counter, hour, packetSha, site }) {
  const t = new Uint8Array(TICKET_LEN), v = new DataView(t.buffer);
  t.set(new TextEncoder().encode("MSUT"), 0); t[4] = 1; t.set(new PublicKey(registry).toBytes(), 5);
  v.setBigUint64(37, BigInt(counter), true); v.setBigInt64(45, BigInt(hour), true);
  t.set(packetSha, 53); t.set(new TextEncoder().encode(site).subarray(0, 16), 85);
  return t;
}
const hexOf = b => Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
const CHUNK = 900;
const u16 = n => new Uint8Array([n & 255, n >> 8]);
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const toBuf = b => (typeof Buffer !== "undefined") ? Buffer.from(b) : b;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The public devnet RPC rate-limits per IP and per method: HTTP 429 "Too many requests for a specific RPC
// call" (seen live on 2026-11-15, it killed a run mid-way). web3.js retries a 429 a few times and then
// throws; this backs off further (backoffMs, x2, x4 ...). Only for calls that are safe to repeat.
export const isRateLimit = e => /\b429\b|too many requests/i.test(String((e && e.message) || e));
async function retryRateLimited(ctx, fn, tries = 6) {
  for (let k = 0; ; k++) {
    try { return await fn(); }
    catch (e) { if (!isRateLimit(e) || k >= tries - 1) throw e; await sleep(ctx.backoffMs * 2 ** k); }
  }
}

async function confirm(ctx, sig, timeoutMs = 60000) {
  const t0 = Date.now();
  for (;;) {
    const st = (await retryRateLimited(ctx, () => ctx.conn.getSignatureStatuses([sig]))).value[0];
    if (st && st.err) throw new Error("transaction failed: " + JSON.stringify(st.err));
    if (st && (st.confirmationStatus === "confirmed" || st.confirmationStatus === "finalized")) return;
    if (Date.now() - t0 > timeoutMs) throw new Error("confirmation timeout " + sig);
    await sleep(600);
  }
}

// One blockhash serves 20 s of transactions (it stays valid for 150 blocks): fewer calls against the limit.
async function blockhash(ctx) {
  if (!ctx.bh || Date.now() - ctx.bhAt > 20000) {
    ctx.bh = (await retryRateLimited(ctx, () => ctx.conn.getLatestBlockhash("confirmed"))).blockhash;
    ctx.bhAt = Date.now();
  }
  return ctx.bh;
}

async function send(ctx, payer, ixs, extraSigners = []) {
  const tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }));
  tx.add(ComputeBudgetProgram.requestHeapFrame({ bytes: 256 * 1024 }));
  ixs.forEach(ix => tx.add(ix));
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = await blockhash(ctx);
  tx.sign(payer, ...extraSigners);
  const raw = tx.serialize();
  let sig;
  try { sig = await ctx.conn.sendRawTransaction(raw, { skipPreflight: false, preflightCommitment: "confirmed" }); }
  catch (e) {
    if (!isRateLimit(e)) throw e;
    // Re-send the SAME signed bytes, so a stage can never run twice: if a copy did land, the cluster drops
    // the duplicate. skipPreflight so that copy is not reported as "already processed"; errors still
    // surface in confirm().
    await sleep(ctx.backoffMs);
    sig = await retryRateLimited(ctx, () => ctx.conn.sendRawTransaction(raw, { skipPreflight: true }));
  }
  await confirm(ctx, sig);
  return { sig, bytes: raw.length };
}

// A transaction whose failure is an ANSWER, not an error (AUTHORIZE denying an uplink): skipPreflight so the
// denial lands on chain with its log line (an Explorer receipt), and return { sig, err, line, reason }.
async function sendVerdict(ctx, payer, ixs) {
  const tx = new Transaction();
  ixs.forEach(ix => tx.add(ix));
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = await blockhash(ctx);
  tx.sign(payer);
  const raw = tx.serialize();
  const sig = await retryRateLimited(ctx, () => ctx.conn.sendRawTransaction(raw, { skipPreflight: true }));
  const t0 = Date.now();
  let st;
  for (;;) {
    st = (await retryRateLimited(ctx, () => ctx.conn.getSignatureStatuses([sig]))).value[0];
    if (st && (st.confirmationStatus === "confirmed" || st.confirmationStatus === "finalized")) break;
    if (Date.now() - t0 > 60000) throw new Error("confirmation timeout " + sig);
    await sleep(600);
  }
  let logs = [];
  for (let k = 0; k < 8 && !logs.length; k++) {
    const t = await retryRateLimited(ctx, () => ctx.conn.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 }));
    logs = (t && t.meta && t.meta.logMessages) || [];
    if (!logs.length) await sleep(500);
  }
  const line = (logs.find(l => l.includes("moonseal: uplink")) || "").replace("Program log: ", "");
  return { sig, bytes: raw.length, err: st.err || null, line, reason: st.err ? (line.split("DENIED: ")[1] || JSON.stringify(st.err)) : null };
}

const regIx = (program, registry, authority, data) => new TransactionInstruction({ programId: program, data: toBuf(data),
  keys: [{ pubkey: registry, isSigner: false, isWritable: true }, { pubkey: authority, isSigner: true, isWritable: true }] });

/** Create a base's command registry (an account of the program, REG_LEN bytes) and REG_INIT it, in one
 *  transaction. `registry` is a Keypair: its address is what tickets name. `authority` signs every change. */
export async function createRegistry({ rpc, connection, programId, payer, registry, authority = payer, backoffMs = 1500 }) {
  const ctx = { conn: connection || new Connection(rpc, "confirmed"), backoffMs };
  const program = new PublicKey(programId);
  const lamports = await retryRateLimited(ctx, () => ctx.conn.getMinimumBalanceForRentExemption(REG_LEN));
  const extra = [registry];
  if (!authority.publicKey.equals(payer.publicKey)) extra.push(authority);
  return (await send(ctx, payer, [
    SystemProgram.createAccount({ fromPubkey: payer.publicKey, newAccountPubkey: registry.publicKey, lamports, space: REG_LEN, programId: program }),
    regIx(program, registry.publicKey, authority.publicKey, new Uint8Array([IX.REG_INIT])),
  ], extra)).sig;
}

/** Authorize (or, with remove, revoke) one ML-DSA-65 key: keyId = sha256(public key). */
export async function registryKey({ rpc, connection, programId, payer, registry, authority = payer, keyId, remove = false, backoffMs = 1500 }) {
  const ctx = { conn: connection || new Connection(rpc, "confirmed"), backoffMs };
  const extra = authority.publicKey.equals(payer.publicKey) ? [] : [authority];
  return (await send(ctx, payer, [regIx(new PublicKey(programId), new PublicKey(registry), authority.publicKey,
    cat([remove ? IX.REG_REMOVE : IX.REG_ADD], keyId))], extra)).sig;
}

export async function readRegistry({ rpc, connection, registry }) {
  const conn = connection || new Connection(rpc, "confirmed");
  const acc = await conn.getAccountInfo(new PublicKey(registry), "confirmed");
  if (!acc) return null;
  const d = acc.data, dv = new DataView(d.buffer, d.byteOffset, d.length), n = d[R.NKEYS];
  return {
    authority: new PublicKey(d.subarray(R.AUTH, R.AUTH + 32)).toBase58(),
    keys: Array.from({ length: n }, (_, i) => hexOf(d.subarray(R.KEYS + 32 * i, R.KEYS + 32 * (i + 1)))),
    counter: dv.getBigUint64(R.COUNTER, true), hour: dv.getBigInt64(R.HOUR, true), slot: dv.getBigUint64(R.SLOT, true),
    packet: hexOf(d.subarray(R.PACKET, R.PACKET + 32)), keyId: hexOf(d.subarray(R.KEYID, R.KEYID + 32)),
  };
}

/** Verify on chain. `onStep({label, sig, bytes, i, n})` fires after each confirmed transaction.
 *  Returns { verified, result, buffer, commit, keyId, sigs, closeSig? }. On failure the thrown error carries
 *  `buffer` and, when the half-written buffer could be closed (rent refunded), `closeSig`. */
export async function verifyOnChain({ rpc, connection, programId, payer, pk, sig, msg, registry, onStep = () => {}, close = true, backoffMs = 1500 }) {
  const ctx = { conn: connection || new Connection(rpc, "confirmed"), backoffMs };
  const conn = ctx.conn;
  const program = new PublicKey(programId);
  const buffer = Keypair.generate();
  const meta = [{ pubkey: buffer.publicKey, isSigner: false, isWritable: true }, { pubkey: payer.publicKey, isSigner: true, isWritable: true }];
  const ix = data => new TransactionInstruction({ programId: program, keys: meta, data: toBuf(data) });
  const closeIx = () => ix(new Uint8Array([IX.CLOSE]));
  const data = cat(pk, sig, msg);
  const chunks = [];
  for (let o = 0; o < data.length; o += CHUNK) chunks.push([o, data.subarray(o, o + CHUNK)]);
  const n = 1 + chunks.length + 4 + (registry ? 1 : 0);
  let i = 0;
  const sigs = [];
  const step = (label, r) => { sigs.push({ label, ...r }); onStep({ label, ...r, i: ++i, n }); };
  let auth = {};

  const lamports = await retryRateLimited(ctx, () => conn.getMinimumBalanceForRentExemption(ACCOUNT_LEN));
  try {
    step("create + INIT", await send(ctx, payer, [
      SystemProgram.createAccount({ fromPubkey: payer.publicKey, newAccountPubkey: buffer.publicKey, lamports, space: ACCOUNT_LEN, programId: program }),
      ix(cat([IX.INIT], u16(msg.length))),
    ], [buffer]));
    for (const [o, ch] of chunks) step(`WRITE ${o}..${o + ch.length}`, await send(ctx, payer, [ix(cat([IX.WRITE], u16(o), ch))]));
    step("PREP (seal, z, hints, mu, c)", await send(ctx, payer, [ix(new Uint8Array([IX.PREP]))]));
    for (const [first, count] of [[0, 2], [2, 2], [4, 2]]) {
      step(`ROWS ${first}-${first + count - 1}${first + count === 6 ? " + FINAL" : ""}`, await send(ctx, payer, [ix(new Uint8Array([IX.ROWS, first, count]))]));
    }
    if (registry) {
      // the base's policy, on chain: is this VERIFIED signature allowed to command the base?
      const v = await sendVerdict(ctx, payer, [new TransactionInstruction({ programId: program, data: toBuf(new Uint8Array([IX.AUTHORIZE])),
        keys: [{ pubkey: buffer.publicKey, isSigner: false, isWritable: false }, { pubkey: new PublicKey(registry), isSigner: false, isWritable: true }] })]);
      auth = { authorized: !v.err, authSig: v.sig, authReason: v.reason, authLine: v.line };
      step(v.err ? "AUTHORIZE: DENIED" : "AUTHORIZE: AUTHORIZED", { sig: v.sig, bytes: v.bytes });
      if (!v.err) auth.registryState = await retryRateLimited(ctx, () => readRegistry({ connection: conn, registry }));
    }
  } catch (e) {
    // Never leak the half-written buffer: its rent belongs to the payer (on devnet, the shared demo key).
    e.buffer = buffer.publicKey.toBase58();
    if (close) {
      try {
        const left = await retryRateLimited(ctx, () => conn.getAccountInfo(buffer.publicKey, "confirmed"));
        if (left) e.closeSig = (await send(ctx, payer, [closeIx()])).sig;
      } catch (e2) { e.closeError = e2.message; }
    }
    throw e;
  }
  const acc = await retryRateLimited(ctx, () => conn.getAccountInfo(buffer.publicKey, "confirmed"));
  const d = acc.data;
  const out = {
    result: d[H.RESULT], verified: d[H.STAGE] === 3 && d[H.RESULT] === 1, buffer: buffer.publicKey.toBase58(),
    commit: Buffer.from(d.subarray(H.COMMIT, H.COMMIT + 32)).toString("hex"),
    keyId: Buffer.from(d.subarray(H.KEYID, H.KEYID + 32)).toString("hex"), sigs,
    verifySig: (sigs.find(s => s.label.endsWith("+ FINAL")) || {}).sig, ...auth,
  };
  if (close) { try { out.closeSig = (await send(ctx, payer, [closeIx()])).sig; } catch (e) { out.closeError = e.message; } }
  return out;
}

// ---- line of sight (tools/los-onchain): is Earth in view from a point on the Moon at a given hour? ----------------
// One transaction: the program computes Earth's elevation from the sub-Earth point and distance (JPL Horizons), with
// topocentric parallax, and compares it with the point's skyline (LRO LOLA). Layout: tools/los-onchain/src/lib.rs.
export const LOS_HEADER = 31;
export function losData({ lat, lon, elevM = 0, earthLat, earthLon, earthDistKm, hour, skyline }) {
  const n = skyline.length;
  const d = new Uint8Array(LOS_HEADER + 2 * n), v = new DataView(d.buffer);
  const ude = x => Math.round(x * 1e6);
  d[0] = 1;
  v.setInt32(1, ude(lat), true); v.setInt32(5, ude(lon), true); v.setInt32(9, Math.round(elevM), true);
  v.setInt32(13, ude(earthLat), true); v.setInt32(17, ude(earthLon), true); v.setUint32(21, Math.round(earthDistKm * 1000), true);
  v.setUint32(25, hour >>> 0, true); v.setUint16(29, n, true);
  for (let i = 0; i < n; i++) v.setInt16(LOS_HEADER + 2 * i, Math.max(-32767, Math.min(32767, Math.round(skyline[i] * 1000))), true);
  return d;
}
export async function checkLineOfSight({ rpc, connection, programId, payer, query, backoffMs = 1500 }) {
  const ctx = { conn: connection || new Connection(rpc, "confirmed"), backoffMs };
  const tx = new Transaction();
  tx.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }));
  tx.add(new TransactionInstruction({ programId: new PublicKey(programId), keys: [], data: toBuf(losData(query)) }));
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = await blockhash(ctx);
  tx.sign(payer);
  const raw = tx.serialize();
  const sig = await retryRateLimited(ctx, () => ctx.conn.sendRawTransaction(raw, { skipPreflight: true }));
  const t0 = Date.now();
  let st;
  for (;;) {
    st = (await retryRateLimited(ctx, () => ctx.conn.getSignatureStatuses([sig]))).value[0];
    if (st && (st.confirmationStatus === "confirmed" || st.confirmationStatus === "finalized")) break;
    if (Date.now() - t0 > 60000) throw new Error("confirmation timeout " + sig);
    await sleep(600);
  }
  if (st.err) throw new Error("the program rejected the query: " + JSON.stringify(st.err));
  let t = null;
  for (let k = 0; k < 8 && !(t && t.meta && t.meta.logMessages && t.meta.logMessages.length); k++) {
    t = await retryRateLimited(ctx, () => ctx.conn.getTransaction(sig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 }));
    if (!(t && t.meta && t.meta.logMessages && t.meta.logMessages.length)) await sleep(500);
  }
  const logs = (t && t.meta && t.meta.logMessages) || [];
  const line = (logs.find(l => l.includes("moonseal: Earth")) || "").replace("Program log: ", "");
  const rd = t && t.meta && t.meta.returnData && t.meta.returnData.data && t.meta.returnData.data[0];
  if (!rd) throw new Error("no answer in the transaction " + sig);
  const b = Uint8Array.from(atob(rd), c => c.charCodeAt(0)), dv = new DataView(b.buffer);
  const m = o => dv.getInt32(o, true) / 1000;
  return { sig, bytes: raw.length, inView: b[0] === 1, el: m(1), az: m(5), sky: m(9), margin: m(13), line };
}

export { Keypair, Connection, PublicKey };
