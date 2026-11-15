// Close a moonseal buffer account left open by an interrupted run and refund its rent to the authority.
//   bun close-buffer.mjs <rpc> <programId> <authority.json> <bufferPubkey>
// The program's CLOSE (ix 4) works at any stage; only the authority recorded at INIT can call it.
import { readFileSync } from "node:fs";
import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
const [rpc, programId, authPath, bufferB58] = process.argv.slice(2);
const auth = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(authPath, "utf8"))));
const conn = new Connection(rpc, "confirmed");
const buffer = new PublicKey(bufferB58);
const before = await conn.getAccountInfo(buffer, "confirmed");
if (!before) { console.log("buffer already closed:", bufferB58); process.exit(0); }
console.log(`buffer ${bufferB58}: ${before.lamports} lamports, owner ${before.owner.toBase58()}`);
const tx = new Transaction().add(new TransactionInstruction({ programId: new PublicKey(programId), data: Buffer.from([4]),
  keys: [{ pubkey: buffer, isSigner: false, isWritable: true }, { pubkey: auth.publicKey, isSigner: true, isWritable: true }] }));
const sig = await conn.sendTransaction(tx, [auth], { preflightCommitment: "confirmed" });
for (let i = 0; i < 60; i++) { const s = (await conn.getSignatureStatuses([sig])).value[0]; if (s && s.err) throw new Error(JSON.stringify(s.err)); if (s && (s.confirmationStatus === "confirmed" || s.confirmationStatus === "finalized")) break; await new Promise(r => setTimeout(r, 700)); }
console.log("closed, tx", sig);
console.log("buffer now:", (await conn.getAccountInfo(buffer, "confirmed")) ? "STILL OPEN" : "gone");
