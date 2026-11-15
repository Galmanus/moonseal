// Vercel build step (web/vercel.json): writes solana-demo-config.js from the MOONSEAL_DEMO_PAYER environment
// variable, so the devnet demo payer never enters git. MOONSEAL_DEMO_PAYER is a JSON array of 64 numbers
// (a Solana keypair file's content). Any key a static page uses is visible to its visitors: this must only
// ever be a disposable DEVNET key with no real value. Without the variable the build writes nothing and the
// page explains that the on-chain demo needs a payer (or a local validator).
import { readFileSync, writeFileSync } from "node:fs";

const raw = process.env.MOONSEAL_DEMO_PAYER;
if (!raw) {
  console.log("MOONSEAL_DEMO_PAYER is not set: no devnet demo payer in this deployment");
  process.exit(0);
}
const secretKey = JSON.parse(raw);
if (!Array.isArray(secretKey) || secretKey.length !== 64 || !secretKey.every(n => Number.isInteger(n) && n >= 0 && n < 256)) {
  throw new Error("MOONSEAL_DEMO_PAYER must be a JSON array of 64 bytes");
}
const template = readFileSync(new URL("./solana-demo-config.example.js", import.meta.url), "utf8");
if (!template.includes('"secretKey": null')) throw new Error("unexpected template format");
writeFileSync(new URL("./solana-demo-config.js", import.meta.url), template.replace('"secretKey": null', '"secretKey": ' + JSON.stringify(secretKey)));
console.log("wrote solana-demo-config.js (devnet demo payer)");
