// Regression test for the devnet failure of 2026-11-15 ~01:20 -03: the public RPC answered HTTP 429
// ("Too many requests for a specific RPC call") in the middle of a run, verifyOnChain threw after
// "WRITE 0..900" and the half-written buffer account (and its rent) was left open.
// Runs against a local validator that has the moonseal program loaded:
//   bun test-ratelimit.mjs http://127.0.0.1:8899 <programId> <fixturesDir>
// Case A: every 3rd JSON-RPC call is answered with that exact 429 (web3.js's own retry disabled, so only
//         the client's backoff can save the run) -> the run must still end VERIFIED and close its buffer.
// Case B: one transaction fails for good (the 8th sendTransaction, i.e. PREP) -> the error must reach the
//         caller AND the buffer must be closed (rent refunded), not leaked.
import { readFileSync } from "node:fs";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { verifyOnChain } from "./moonseal-onchain.mjs";

const [rpc, programId, fx] = process.argv.slice(2);
const rd = n => new Uint8Array(readFileSync(`${fx}/${n}`));
const pk = rd("noble_pk.bin"), sig = rd("noble_sig.bin"), msg = rd("msg.bin");
const DEVNET_429 = '{"jsonrpc":"2.0","error":{"code": 429, "message":"Too many requests for a specific RPC call"}, "id": "x" }';

function injecting(decide) {               // decide(callNo, method, methodCallNo) -> null | Response
  let n = 0; const per = {}; const log = [];
  const f = async (url, init) => {
    const body = JSON.parse(init.body);
    const m = body.method; n++; per[m] = (per[m] || 0) + 1;
    const r = decide(n, m, per[m]);
    log.push(m + (r ? "!" + r.status : ""));
    return r || fetch(url, init);
  };
  return { f, log };
}
const conn = fetchImpl => new Connection(rpc, { commitment: "confirmed", fetch: fetchImpl, disableRetryOnRateLimit: true });

async function funded() {
  const c = new Connection(rpc, "confirmed"), kp = Keypair.generate();
  const s = await c.requestAirdrop(kp.publicKey, 2e9);
  for (let i = 0; i < 60; i++) { const v = (await c.getSignatureStatuses([s])).value[0]; if (v && (v.confirmationStatus === "confirmed" || v.confirmationStatus === "finalized")) break; await new Promise(r => setTimeout(r, 300)); }
  return kp;
}
let fails = 0;
const check = (ok, what) => { console.log((ok ? "PASS " : "FAIL ") + what); if (!ok) fails++; };

// ---- case A: rate-limited every 3rd call
{
  const inj = injecting(n => (n % 3 === 0 ? new Response(DEVNET_429, { status: 429 }) : null));
  let r, err;
  try { r = await verifyOnChain({ connection: conn(inj.f), programId, payer: await funded(), pk, sig, msg, backoffMs: 50 }); }
  catch (e) { err = e; }
  const injected = inj.log.filter(x => x.endsWith("!429")).length;
  console.log(`  case A: ${inj.log.length} RPC calls, ${injected} answered 429`);
  check(!err, "A: run survives injected 429s" + (err ? " (threw: " + err.message.slice(0, 120) + ")" : ""));
  check(r && r.verified === true, "A: signature VERIFIED on chain");
  check(r && !!r.closeSig, "A: buffer closed at the end");
}

// ---- case B: PREP (8th sendTransaction) fails permanently
{
  const hard = '{"jsonrpc":"2.0","error":{"code":-32002,"message":"injected permanent failure"},"id":"x"}';
  const inj = injecting((n, m, k) => (m === "sendTransaction" && k === 8 ? new Response(hard, { status: 200 }) : null));
  let err;
  try { await verifyOnChain({ connection: conn(inj.f), programId, payer: await funded(), pk, sig, msg, backoffMs: 50 }); }
  catch (e) { err = e; }
  check(!!err, "B: the failure reaches the caller");
  check(!!(err && err.buffer), "B: the error names the buffer account");
  const left = err && err.buffer ? await new Connection(rpc, "confirmed").getAccountInfo(new PublicKey(err.buffer), "confirmed") : "unknown";
  check(left === null, "B: buffer account closed after the failure (rent refunded)" + (left && left !== "unknown" ? ` (still open: ${left.lamports} lamports)` : ""));
}
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exit(fails ? 1 : 0);
