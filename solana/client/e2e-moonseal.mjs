// e2e against a running validator: node/bun e2e-moonseal.mjs <rpc> <programId> <payer.json> <fixturesDir>
import { readFileSync } from "node:fs";
import { verifyOnChain, Keypair } from "./moonseal-onchain.mjs";
const [rpc, programId, payerPath, fx] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(payerPath, "utf8"))));
const rd = n => new Uint8Array(readFileSync(`${fx}/${n}`));
for (const [who, pk, sig, msg] of [["browser", rd("noble_pk.bin"), rd("noble_sig.bin"), rd("msg.bin")],
                                     ["bouncycastle", rd("bc_pk.bin"), rd("bc_sig.bin"), rd("msg.bin")],
                                     ["tampered", rd("noble_pk.bin"), rd("noble_sig.bin"), (() => { const m = rd("msg.bin"); m[3] ^= 1; return m; })()]]) {
  const t0 = Date.now();
  const r = await verifyOnChain({ rpc, programId, payer, pk, sig, msg });
  console.log(`${who}: verified=${r.verified} result=${r.result} txs=${r.sigs.length} max_tx_bytes=${Math.max(...r.sigs.map(s => s.bytes))} ${(Date.now() - t0) / 1000}s closed=${!!r.closeSig}`);
}
