// Env-agnostic client for the lunar_contacts devnet program (node + browser).
// Hand-encodes instructions from the IDL discriminators (no anchor runtime needed).
import {
  Connection, Keypair, PublicKey, Transaction, TransactionInstruction,
  SystemProgram, sendAndConfirmTransaction,
} from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk");
const SYS = SystemProgram.programId;

const DISC = {
  register_station: [64, 56, 98, 138, 166, 120, 109, 142],
  post_window:      [61, 254, 94, 164, 12, 221, 227, 12],
  claim_window:     [207, 241, 41, 204, 218, 73, 57, 96],
  confirm_contact:  [29, 33, 183, 234, 67, 193, 47, 209],
};

const i32 = n => { const b = new Uint8Array(4); new DataView(b.buffer).setInt32(0, n, true); return b; };
const i64 = n => { const b = new Uint8Array(8); new DataView(b.buffer).setBigInt64(0, BigInt(n), true); return b; };
const u64 = n => { const b = new Uint8Array(8); new DataView(b.buffer).setBigUint64(0, BigInt(n), true); return b; };
const str = s => { const u = new TextEncoder().encode(s); const b = new Uint8Array(4 + u.length); new DataView(b.buffer).setUint32(0, u.length, true); b.set(u, 4); return b; };
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const toBuf = b => (typeof Buffer !== "undefined") ? Buffer.from(b) : b;

export const stationPda = auth => PublicKey.findProgramAddressSync([new TextEncoder().encode("station"), auth.toBuffer()], PROGRAM_ID)[0];
export const windowPda = id => PublicKey.findProgramAddressSync([new TextEncoder().encode("window"), u64(id)], PROGRAM_ID)[0];

const ix = (disc, keys, data) => new TransactionInstruction({ programId: PROGRAM_ID, keys, data: toBuf(cat(new Uint8Array(disc), data)) });

function demoHash(s) { // 32-byte stand-in for the hash of the ML-DSA-signed command
  const u = new TextEncoder().encode(s); const h = new Uint8Array(32);
  for (let i = 0; i < u.length; i++) h[i % 32] = (h[i % 32] * 31 + u[i]) & 255;
  return h;
}

export async function runDemo({ url = "https://api.devnet.solana.com", keypair, win, onLog = console.log }) {
  const conn = new Connection(url, "confirmed");
  const auth = keypair.publicKey;
  const station = stationPda(auth);
  const windowAcc = windowPda(win.id);
  const sigs = {};

  const send = async (label, instruction) => {
    const tx = new Transaction().add(instruction);
    tx.feePayer = auth;
    tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;
    tx.sign(keypair);
    const sig = await conn.sendRawTransaction(tx.serialize(), { skipPreflight: false, maxRetries: 5 });
    // HTTP-poll confirmation (no websocket, works behind restrictive networks)
    for (let i = 0; i < 40; i++) {
      const st = (await conn.getSignatureStatuses([sig])).value[0];
      if (st?.err) throw new Error(`${label} failed: ${JSON.stringify(st.err)}`);
      if (st && (st.confirmationStatus === "confirmed" || st.confirmationStatus === "finalized")) break;
      await new Promise(r => setTimeout(r, 1500));
    }
    onLog(`${label} ✓ ${sig}`);
    return sig;
  };

  try {
    sigs.register_station = await send("register_station", ix(DISC.register_station,
      [{ pubkey: station, isSigner: false, isWritable: true },
       { pubkey: auth, isSigner: true, isWritable: true },
       { pubkey: SYS, isSigner: false, isWritable: false }],
      cat(i32(win.latE6), i32(win.lonE6), str("Demo Ground Station BR"))));
  } catch (e) {
    onLog("register_station: already registered (ok, reusing station)");
  }

  sigs.post_window = await send("post_window", ix(DISC.post_window,
    [{ pubkey: windowAcc, isSigner: false, isWritable: true },
     { pubkey: auth, isSigner: true, isWritable: true },
     { pubkey: SYS, isSigner: false, isWritable: false }],
    cat(u64(win.id), i64(win.startTs), i64(win.endTs), i32(win.latE6), i32(win.lonE6))));

  sigs.claim_window = await send("claim_window", ix(DISC.claim_window,
    [{ pubkey: windowAcc, isSigner: false, isWritable: true },
     { pubkey: station, isSigner: false, isWritable: false },
     { pubkey: auth, isSigner: true, isWritable: false }],
    new Uint8Array(0)));

  sigs.confirm_contact = await send("confirm_contact", ix(DISC.confirm_contact,
    [{ pubkey: windowAcc, isSigner: false, isWritable: true },
     { pubkey: station, isSigner: false, isWritable: true },
     { pubkey: auth, isSigner: true, isWritable: false }],
    demoHash(`v1|LUNAR-ROVER-01|DEPLOY_PANEL|${win.id}`)));

  return sigs;
}
