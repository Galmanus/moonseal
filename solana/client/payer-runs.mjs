// Group a payer's recent moonseal transactions by buffer account: one line per run (read-only).
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
const [rpc, programId, payer, limit] = process.argv.slice(2);
const conn = new Connection(rpc, "confirmed");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sigs = (await conn.getSignaturesForAddress(new PublicKey(payer), { limit: +limit })).reverse();
const runs = new Map();
for (const s of sigs) {
  let tx; for (let k = 0; k < 6 && !tx; k++) { try { tx = await conn.getTransaction(s.signature, { maxSupportedTransactionVersion: 0, commitment: "confirmed" }); } catch { await sleep(1500 * 2 ** k); } }
  if (!tx) continue;
  const keys = tx.transaction.message.accountKeys.map(k => k.toBase58());
  for (const ix of tx.transaction.message.instructions) {
    if (keys[ix.programIdIndex] !== programId) continue;
    const d = bs58.decode(ix.data), buf = keys[ix.accounts[0]];
    const tag = { 0: "INIT", 1: "W", 2: "PREP", 3: `R${d[1]}`, 4: "CLOSE", 9: "AUTH" }[d[0]] || "t" + d[0];
    const log = (tx.meta.logMessages || []).find(l => l.includes("moonseal:")) || "";
    if (!runs.has(buf)) runs.set(buf, { t0: new Date(tx.blockTime * 1000).toTimeString().slice(0, 8), steps: [], verdict: "" });
    const r = runs.get(buf); r.steps.push(tag + (tx.meta.err ? "!" : "")); if (log) r.verdict = log.replace("Program log: moonseal: ", "");
    if (d[0] === 9) { const b = keys[ix.accounts[0]]; if (!runs.has(b)) runs.set(b, { t0: "", steps: [], verdict: "" }); }
  }
  await sleep(120);
}
for (const [buf, r] of runs) console.log(r.t0, buf.slice(0, 8), r.steps.join(" "), "|", r.verdict);
