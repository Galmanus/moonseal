// End to end: the command gate on a running validator (local by default, devnet works the same).
//   bun e2e-gate.mjs <rpc> <programId> <payer.json> <registryPubkey>
// The registry must exist with the demo operator key authorized (registry.mjs create + add-demo-operator).
// Runs five uplink tickets through verify + AUTHORIZE and checks each verdict the chain gives.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Connection, Keypair } from "@solana/web3.js";
import { ml_dsa65 } from "../../tools/pq-bundle/node_modules/@noble/post-quantum/ml-dsa.js";
import { verifyOnChain, uplinkTicket, readRegistry } from "./moonseal-onchain.mjs";
const DEMO_SEED_TEXT = "moonseal devnet demo operator v1"; // same public seed as registry.mjs and the web page

const [rpc, programId, payerPath, registry] = process.argv.slice(2);
const payer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(payerPath, "utf8"))));
const sha = b => new Uint8Array(createHash("sha256").update(b).digest());
const op = ml_dsa65.keygen(sha(DEMO_SEED_TEXT)), att = ml_dsa65.keygen();
const conn = new Connection(rpc, "confirmed");
const base = { registry, hour: 7000, site: "connecting-ridge" };
const now = BigInt(Date.now());
const honest = uplinkTicket({ ...base, counter: now, packetSha: sha("uplink packet A") });
const honestSig = ml_dsa65.sign(honest, op.secretKey);
const forged = uplinkTicket({ ...base, counter: now + 1n, packetSha: sha("uplink packet B") });
const other = uplinkTicket({ ...base, registry: Keypair.generate().publicKey, counter: now + 2n, packetSha: sha("uplink packet C") });
const tampered = honest.slice(); tampered[60] ^= 1;
const cases = [
  ["honest (registered key, this base, fresh counter)", op.publicKey, honestSig, honest, true, null],
  ["replay (the same signed ticket again)", op.publicKey, honestSig, honest, false, "replay"],
  ["forged (valid signature, unregistered key)", att.publicKey, ml_dsa65.sign(forged, att.secretKey), forged, false, "not in this base's registry"],
  ["other base (ticket names another registry)", op.publicKey, ml_dsa65.sign(other, op.secretKey), other, false, "another base"],
  ["tampered (one bit of the packet hash)", op.publicKey, honestSig, tampered, false, "not VERIFIED"],
];
let fails = 0;
for (const [name, pk, sig, msg, want, why] of cases) {
  const t0 = Date.now();
  const r = await verifyOnChain({ rpc, programId, payer, pk, sig, msg, registry });
  const tx = await conn.getTransaction(r.authSig, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  const ok = r.authorized === want && (want || (r.authReason || "").includes(why));
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: verified=${r.verified} authorized=${r.authorized} ` +
    `${r.authReason ? "(" + r.authReason + ") " : ""}txs=${r.sigs.length} authorize_cu=${tx?.meta?.computeUnitsConsumed} ${((Date.now() - t0) / 1000).toFixed(1)}s closed=${!!r.closeSig}`);
  console.log(`     authorize tx ${r.authSig}`);
}
const st = await readRegistry({ rpc, registry });
console.log(`registry: ${st.keys.length} key(s), counter ${st.counter}, last packet ${st.packet.slice(0, 16)}... ` +
  `(= sha256("uplink packet A"): ${st.packet === Buffer.from(sha("uplink packet A")).toString("hex")})`);
console.log(fails ? `${fails} FAILED` : "ALL PASS");
process.exit(fails ? 1 : 0);
