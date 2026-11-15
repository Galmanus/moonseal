# Quickstart

This page gets you from a fresh clone to each part of moonseal: the planner in your browser, the on-chain verification against a local validator or Solana devnet, a Solana wallet on a phone, and the test suites.

## 1. Run the site

You need Python 3 and a recent browser with WebGL.

```bash
git clone https://github.com/Galmanus/moonseal.git
cd moonseal/web
python3 -m http.server 8787
```

Open <http://127.0.0.1:8787/app.html>. Serve the folder over HTTP: opening `app.html` as a `file://` URL does not work, because the page loads its data and textures with `fetch`.

What to try first:

1. **Show me when to land** opens Connecting Ridge. The site panel starts with the answer: whether landing at the selected time works for the chosen stay, how much of the stay has sunlight (power) and Earth in view (radio), and **Find the next good time to land**. Green columns on the timeline mark every good time to land in 2026 and 2027. Angles, the field guide and the mission limits are under **More details**.
2. **Moon** shows the Moon lit by the real Sun for the selected date. Drag the timeline at the bottom, or press the date chip at the top, to move through 2026 and 2027. **Map** paints where the Sun and Earth are above the horizon.
3. **South Pole** and **Site** show the LOLA terrain with ray-marched shadows. On a site, **Stand here** shows the skyline with the Sun and Earth on it.
4. On the opening screen, **Why the south pole** opens the explainer: why the south pole matters, with numbered sources.
5. **Command** opens the post-quantum command pipeline. If Earth is below the skyline, press **Jump to the next contact window** first, then **Sign & send**.

`web/index.html` is the project's first console. It still works, but `app.html` is the current app.

## 2. Verify on chain against a local validator

This path needs no wallet and no devnet SOL. The page funds a throwaway payer with an airdrop from the local validator.

**Requirements:** the Solana CLI (for `solana-test-validator`), Rust with `cargo build-sbf`, and [Bun](https://bun.sh) for the JavaScript client.

1. Build the program:

   ```bash
   cd tools/mldsa-onchain
   cargo build-sbf          # writes target/deploy/mldsa_onchain.so
   ```

   A prebuilt copy is at `tools/mldsa-onchain/dist/mldsa_onchain.so`.

2. Start a validator with the program loaded at its devnet address:

   ```bash
   solana-test-validator --reset --ledger /tmp/moonseal-ledger \
     --bpf-program 3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7 target/deploy/mldsa_onchain.so
   ```

   The ledger grows quickly (about 1.7 GB in 30 minutes in our runs). Stop the validator when you are done and delete the ledger folder.

3. Create a command registry for your local base. The registry address in `web/app/onchain-config.js` belongs to the devnet demo base, and its keypair is not published, so create your own and point the page at it:

   ```bash
   cd ../../solana/client
   bun install
   solana-keygen new --no-bip39-passphrase -o my-registry.json
   solana-keygen new --no-bip39-passphrase -o payer.json
   solana airdrop -u http://127.0.0.1:8899 10 payer.json
   RPC=http://127.0.0.1:8899
   PROGRAM=3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7
   REGISTRY=$(solana-keygen pubkey my-registry.json)
   bun registry.mjs $RPC $PROGRAM create payer.json my-registry.json
   bun registry.mjs $RPC $PROGRAM add-demo-operator payer.json $REGISTRY
   bun registry.mjs $RPC $PROGRAM show $REGISTRY
   ```

   Then set `registry` in `web/app/onchain-config.js` to the value of `$REGISTRY`.

4. Reload the page, open **Command**, press **Sign & send**, then **Verify the ticket on Solana**. The page tries the local validator first and falls back to devnet.

5. Optional: run the five on-chain cases from the command line (honest, replay, forged key, other base, tampered). Every line should say `PASS`:

   ```bash
   bun e2e-gate.mjs $RPC $PROGRAM payer.json $REGISTRY
   ```

## 3. Verify on Solana devnet

The page uses devnet when no local validator answers. On devnet it pays fees with a demo payer key read from `web/solana-demo-config.js`. That file is not in the repository, because it holds a private key.

1. Create a devnet-only key and fund it from the web faucet at <https://faucet.solana.com>:

   ```bash
   solana-keygen new --no-bip39-passphrase -o demo-devnet.json
   solana-keygen pubkey demo-devnet.json     # paste this address into the faucet
   ```

2. Copy the template and paste the key's secret (the JSON array in `demo-devnet.json`) into `secretKey`:

   ```bash
   cp web/solana-demo-config.example.js web/solana-demo-config.js
   ```

3. Reload the page and run **Command**, **Sign & send**, **Verify the ticket on Solana**. A run takes about 30 seconds on devnet and ends with links to the verifying and authorizing transactions on Solana Explorer.

Use a disposable key with devnet SOL only. Anyone who can load your page can read the key.

The public devnet endpoint rate-limits by IP (HTTP 429). The client backs off and retries, but two runs started at the same moment from one network can still time out. If that happens, the page says so and refunds the partly written buffer; wait half a minute and press again.

## 4. Connect a Solana wallet on a phone

On Android, the **Connect your Solana wallet** button reaches a wallet app on the phone through Mobile Wallet Adapter, which requires a secure context. `localhost` counts as one, so forward the port over USB:

```bash
adb reverse tcp:8787 tcp:8787     # the site
adb reverse tcp:8899 tcp:8899     # optional: the local validator
```

Open <http://localhost:8787/app.html> in the phone's browser, open **Command**, press **Connect your Solana wallet**, and approve twice in the wallet (connect, then sign). The wallet signs an ed25519 attestation of the post-quantum key; the post-quantum signing itself runs in software. See [post-quantum.md](post-quantum.md).

## 5. Run the tests

| Suite | Command | Needs |
|---|---|---|
| ML-DSA-65 verifier, native | `cd tools/mldsa-onchain && cargo test --test native` | Rust |
| Staged protocol, command gate and compute cost in the SBF VM | `cargo build-sbf && cargo test` (in `tools/mldsa-onchain`) | Solana toolchain |
| Client against a validator: staged runs | `bun e2e-moonseal.mjs <rpc> <programId> <payer.json> ../../tools/mldsa-onchain/tests/fixtures` (in `solana/client`) | a running validator |
| Client: command gate end to end | `bun e2e-gate.mjs <rpc> <programId> <payer.json> <registry>` | a validator and a registry |
| Client: rate-limit resilience | `bun test-ratelimit.mjs http://127.0.0.1:8899 <programId> ../../tools/mldsa-onchain/tests/fixtures` | a local validator |
| Terrain horizon physics | `python3 -m pytest core/tests -q` | the LOLA DEM in `data/lola/` |

`test-ratelimit.mjs` replays the exact HTTP 429 body the public devnet endpoint returned during our runs, and checks that a run survives it and that a failed run closes its buffer.

## 6. Rebuild the browser bundles

The bundles in `web/` are committed, so you only need this after changing a dependency. Each one is built with Bun from a pinned `package.json` and lock file:

```bash
cd tools/pq-bundle && bun install && \
  bun build entry.js --outfile ../../web/app/pq-bundle.js --minify --target browser --format iife
cd ../wallet-bundle && bun install && \
  bun build entry.js --outfile ../../web/app/wallet-bundle.js --minify --target browser --format iife
cd ../../solana/client && bun install && \
  bun build entry-moonseal.mjs --outfile ../../web/app/moonseal-solana.js --minify --target browser --format iife
```

`web/three-bundle.js` is three.js 0.187.0 built from `web/_moon_entry.js`.

To regenerate the data files and textures from NASA sources, see [data-sources.md](data-sources.md).
