// Fixtures for tests/gate.rs: binary uplink tickets signed with ML-DSA-65 (@noble/post-quantum 0.7.1, the
// library the web page uses). Deterministic keys (seeded); signatures are hedged, so re-running changes them.
//   bun tests/gen-gate-fixtures.mjs        (from tools/mldsa-onchain)
// Ticket layout (TICKET_LEN = 101), mirrored in src/lib.rs and web/app/command.js:
//   [0,4) "MSUT" | [4] version 1 | [5,37) registry pubkey (binds the ticket to one base)
//   [37,45) counter u64 LE | [45,53) planned hour i64 LE | [53,85) sha256(uplink packet) | [85,101) site id, ASCII, 0-padded
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { ml_dsa65 } from "../../pq-bundle/node_modules/@noble/post-quantum/ml-dsa.js";

const sha = s => new Uint8Array(createHash("sha256").update(s).digest());
export function ticket({ registry, counter, hour, packetSha, site }) {
  const t = new Uint8Array(101), v = new DataView(t.buffer);
  t.set(new TextEncoder().encode("MSUT"), 0); t[4] = 1; t.set(registry, 5);
  v.setBigUint64(37, BigInt(counter), true); v.setBigInt64(45, BigInt(hour), true);
  t.set(packetSha, 53); t.set(new TextEncoder().encode(site).subarray(0, 16), 85);
  return t;
}
const REG_A = new Uint8Array(32).fill(0x52), REG_B = new Uint8Array(32).fill(0x53); // tests/gate.rs uses the same bytes
const op = ml_dsa65.keygen(sha("moonseal gate test operator"));
const att = ml_dsa65.keygen(sha("moonseal gate test attacker"));
const out = "tests/fixtures";
writeFileSync(`${out}/gate_op_pk.bin`, op.publicKey);
writeFileSync(`${out}/gate_att_pk.bin`, att.publicKey);
const cases = {
  t1: [REG_A, 1, op], t2: [REG_A, 2, op], tf: [REG_A, 3, att], tb: [REG_B, 4, op], t5: [REG_A, 5, op],
};
for (const [name, [registry, counter, key]] of Object.entries(cases)) {
  const m = ticket({ registry, counter, hour: 7000 + counter, packetSha: sha(`uplink packet ${counter}`), site: "connecting-ridge" });
  const s = key.secretKey ? ml_dsa65.sign(m, key.secretKey) : null;
  if (!ml_dsa65.verify(s, m, key.publicKey)) throw new Error("self-check failed " + name);
  writeFileSync(`${out}/gate_${name}.bin`, m);
  writeFileSync(`${out}/gate_${name}.sig`, s);
  console.log(name, "msg", m.length, "B, sig", s.length, "B, counter", counter);
}
