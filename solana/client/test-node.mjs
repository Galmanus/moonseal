// Headless verification: run the full flow against devnet and print explorer links.
import { Keypair } from "@solana/web3.js";
import { readFileSync } from "fs";
import { runDemo } from "./lunar-core.mjs";

const kp = Keypair.fromSecretKey(new Uint8Array(JSON.parse(readFileSync("./demo-keypair.json"))));
const txt = readFileSync("../../web/windows_data.js", "utf8").trim();
const data = JSON.parse(txt.slice("window.LUNAR_DATA = ".length, -1));
const s = data.sites.find(x => x.id === "connecting_ridge");
const w0 = s.comm_windows[0];
const EPOCH0 = Date.UTC(2026, 1, 1) / 1000;
const win = {
  id: Math.floor(Date.now() / 1000),
  startTs: Math.round(EPOCH0 + w0.start_h * 3600),
  endTs: Math.round(EPOCH0 + w0.end_h * 3600),
  latE6: Math.round(s.lat * 1e6),
  lonE6: Math.round(s.lon * 1e6),
};
console.log("site:", s.name, "| window:", win);
const sigs = await runDemo({ keypair: kp, win, onLog: m => console.log("  " + m) });
console.log("\nexplorer links (devnet):");
for (const [k, v] of Object.entries(sigs)) console.log(`  ${k}: https://explorer.solana.com/tx/${v}?cluster=devnet`);
