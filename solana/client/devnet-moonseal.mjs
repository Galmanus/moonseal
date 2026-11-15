// Run the staged ML-DSA-65 verification on Solana devnet and print every transaction hash + the program logs.
import { readFileSync } from "node:fs";
import { Connection, Keypair } from "@solana/web3.js";
import { verifyOnChain } from "./moonseal-onchain.mjs";
const [rpc, programId, payerPath, fx, which] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(payerPath, "utf8"))));
const rd = n => new Uint8Array(readFileSync(`${fx}/${n}`));
const msg = rd("msg.bin"); if (which === "tampered") msg[3] ^= 1;
const t0 = Date.now();
const r = await verifyOnChain({ rpc, programId, payer, pk: rd("noble_pk.bin"), sig: rd("noble_sig.bin"), msg,
  onStep: s => console.log(`  ${String(s.i).padStart(2)}/${s.n} ${s.label.padEnd(30)} ${s.sig}`) });
console.log(`${which}: verified=${r.verified} result=${r.result} buffer=${r.buffer} closed=${!!r.closeSig} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
console.log(`  commitment sha256(pk||sig||msg) = ${r.commit}`);
const last = r.sigs[r.sigs.length - 1].sig;
const conn = new Connection(rpc, "confirmed");
const tx = await conn.getTransaction(last, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
console.log("  final tx logs:", (tx?.meta?.logMessages || []).filter(l => /moonseal|consumed/.test(l)).join(" | "));
