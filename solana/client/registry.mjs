// The base's command registry (which ML-DSA-65 keys may command it), from the command line.
//   bun registry.mjs <rpc> <programId> create  <payer.json> <registry-keypair.json> [authority.json]
//   bun registry.mjs <rpc> <programId> add-demo-operator <payer.json> <registryPubkey> [authority.json]
//   bun registry.mjs <rpc> <programId> add|remove <payer.json> <registryPubkey> <keyIdHex> [authority.json]
//   bun registry.mjs <rpc> <programId> show <registryPubkey>
// The demo operator key is derived from a PUBLIC seed (sha256 of DEMO_SEED_TEXT) so anyone can press the
// button on the web page; a real operator key lives on the Solana Seeker and never leaves it.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Keypair } from "@solana/web3.js";
import { ml_dsa65 } from "../../tools/pq-bundle/node_modules/@noble/post-quantum/ml-dsa.js";
import { createRegistry, registryKey, readRegistry } from "./moonseal-onchain.mjs";

export const DEMO_SEED_TEXT = "moonseal devnet demo operator v1";
const sha = b => new Uint8Array(createHash("sha256").update(b).digest());
const hex = b => Buffer.from(b).toString("hex");
const kp = p => Keypair.fromSecretKey(Uint8Array.from(JSON.parse(readFileSync(p, "utf8"))));
const [rpc, programId, cmd, a, b, c, d] = process.argv.slice(2);

if (cmd === "create") {
  const payer = kp(a), registry = kp(b), authority = c ? kp(c) : payer;
  const sig = await createRegistry({ rpc, programId, payer, registry, authority });
  console.log("registry", registry.publicKey.toBase58(), "authority", authority.publicKey.toBase58(), "tx", sig);
} else if (cmd === "add-demo-operator" || cmd === "add" || cmd === "remove") {
  const payer = kp(a), authority = (cmd === "add-demo-operator" ? c : d) ? kp(cmd === "add-demo-operator" ? c : d) : payer;
  const keyId = cmd === "add-demo-operator" ? sha(ml_dsa65.keygen(sha(DEMO_SEED_TEXT)).publicKey) : Uint8Array.from(Buffer.from(c, "hex"));
  const sig = await registryKey({ rpc, programId, payer, registry: b, authority, keyId, remove: cmd === "remove" });
  console.log(cmd === "remove" ? "revoked" : "authorized", "key", hex(keyId), "tx", sig);
} else if (cmd === "show") {
  const r = await readRegistry({ rpc, registry: a });
  console.log(r ? JSON.stringify(r, (k, v) => (typeof v === "bigint" ? v.toString() : v), 1) : "no such registry");
} else {
  console.log("usage: see the header of registry.mjs");
  process.exit(2);
}
