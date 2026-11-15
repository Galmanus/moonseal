// Verify the browser bundle (web3.js browser build + Buffer polyfill + lunar-core)
// actually runs end-to-end against devnet, by giving it browser-like globals.
globalThis.window = globalThis;
await import("../../web/solana-bundle.js");        // sets globalThis.LunarSolana
await import("../../web/solana-demo-config.js");   // sets window.LUNAR_SOLANA_DEMO
await import("../../web/windows_data.js");          // sets window.LUNAR_DATA

const S = globalThis.LunarSolana, C = globalThis.LUNAR_SOLANA_DEMO, D = globalThis.LUNAR_DATA;
if (!S || !C || !D) throw new Error("globals missing: " + [!!S, !!C, !!D]);
const kp = S.Keypair.fromSecretKey(new Uint8Array(C.secretKey));
const site = D.sites.find(s => s.id === "connecting_ridge");
const w0 = site.comm_windows[0];
const EPOCH0 = Date.UTC(2026, 1, 1) / 1000;
const win = {
  id: Math.floor(Date.now() / 1000),
  startTs: Math.round(EPOCH0 + w0.start_h * 3600),
  endTs: Math.round(EPOCH0 + w0.end_h * 3600),
  latE6: Math.round(site.lat * 1e6), lonE6: Math.round(site.lon * 1e6),
};
console.log("bundle globals OK. running browser-bundled flow on devnet for:", site.name);
const sigs = await S.runDemo({ url: C.rpc, keypair: kp, win, onLog: m => console.log("  " + m) });
console.log("BROWSER BUNDLE FLOW OK:", Object.keys(sigs).join(", "));
