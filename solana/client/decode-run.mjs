// Map every transaction that touched one moonseal buffer to its verifier stage (read-only).
import { Connection, PublicKey } from "@solana/web3.js";
const [rpc, programId, buffer] = process.argv.slice(2);
const conn = new Connection(rpc, "confirmed");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sigs = (await conn.getSignaturesForAddress(new PublicKey(buffer))).reverse();
const name = d => ({ 0: "create + INIT", 1: `WRITE @${d[1] | (d[2] << 8)} (${d.length - 3} B of key/sig/ticket)`, 2: "PREP", 3: `ROWS ${d[1]}-${d[1] + d[2] - 1}${d[1] + d[2] === 6 ? " + FINAL" : ""}`, 4: "CLOSE (rent refunded)" })[d[0]] || "?";
let i = 0;
for (const s of sigs) {
  let tx; for (let k = 0; k < 6 && !tx; k++) { try { tx = await conn.getTransaction(s.signature, { maxSupportedTransactionVersion: 0, commitment: "confirmed" }); } catch { await sleep(1500 * 2 ** k); } }
  const keys = tx.transaction.message.accountKeys.map(k => k.toBase58());
  const ix = tx.transaction.message.instructions.find(x => keys[x.programIdIndex] === programId);
  const { default: bs58 } = await import("bs58");
  const data = ix ? bs58.decode(ix.data) : [];
  const log = (tx.meta.logMessages || []).find(l => l.includes("moonseal:")) || "";
  console.log(String(++i).padStart(2), new Date(tx.blockTime * 1000).toTimeString().slice(0, 8), s.signature.slice(0, 8), name(data).padEnd(40), String(tx.meta.computeUnitsConsumed).padStart(8), "CU", log.replace("Program log: ", ""));
  await sleep(250);
}
console.log(`${sigs.length} tx on buffer ${buffer}`);
