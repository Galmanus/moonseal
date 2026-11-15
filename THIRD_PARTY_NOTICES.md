# Third-party notices

moonseal's own code is released under the MIT license (see `LICENSE`). The files listed below include, or were built from, third-party code that keeps its own license. Versions are the exact ones pinned in this repository's lock files; licenses were read from each package's own metadata (`package.json`, `Cargo.toml`) or license file.

## Summary

| Shipped file | Built from | Main components | Licenses |
|---|---|---|---|
| `web/three-bundle.js` | `web/_moon_entry.js` | three.js 0.187.0 | MIT |
| `web/app/pq-bundle.js` | `tools/pq-bundle` | @noble/post-quantum 0.7.1, @noble/hashes 2.4.0 | MIT |
| `web/app/moonseal-solana.js` | `solana/client/entry-moonseal.mjs` | @solana/web3.js 1.98.0 and its dependencies, buffer 6.0.3 | MIT, Apache-2.0, BSD, ISC, public domain, and **LGPL-3.0-only** (rpc-websockets, see below) |
| `web/solana-bundle.js` | `solana/client/entry-browser.mjs` | same as above | same as above, including **LGPL-3.0-only** |
| `web/app/wallet-bundle.js` | `tools/wallet-bundle` | @solana-mobile/wallet-standard-mobile 0.7.0, @wallet-standard/app 1.1.1, @noble/curves 2.4.0 | MIT, Apache-2.0, ISC, 0BSD |
| `tools/mldsa-onchain` program (`.so`) | `tools/mldsa-onchain/Cargo.lock` | solana-program 2.2.1, sha3 0.10.9 | Apache-2.0; MIT OR Apache-2.0 |
| `solana/programs/lunar_contacts` | `solana/Cargo.lock` | anchor-lang 1.2.2 | Apache-2.0 |
| `android/` Android app | `android/app/build.gradle.kts` | org.bouncycastle:bcprov-jdk18on 1.81 | Bouncy Castle licence (MIT terms) |

## LGPL-3.0 component: rpc-websockets

`@solana/web3.js` 1.98.0 depends on `rpc-websockets` 9.3.10, which is licensed under the GNU Lesser General Public License v3.0 only ("Copyright (c) Elpheria j.d.o.o."; license text: <https://www.gnu.org/licenses/lgpl-3.0.html>). Its code is included, minified, in `web/app/moonseal-solana.js` and `web/solana-bundle.js`. moonseal's client confirms transactions by HTTP polling and does not use its WebSocket features.

To comply with the LGPL, the library's source is available from its upstream project and the npm registry (`rpc-websockets@9.3.10`), and you can rebuild both bundles with a modified or replacement version of the library using the pinned sources in `solana/client` (`package.json`, `bun.lock`) and the commands in `docs/quickstart.md`, section 6.

## Rust crates in the Solana program

`tools/mldsa-onchain` depends directly on `solana-program` 2.2.1 (Apache-2.0) and `sha3` 0.10.9 (MIT OR Apache-2.0). Its resolved non-development dependency set (`cargo metadata`, 195 crates on the host target, of which the SBF build uses a subset) carries permissive licenses: every crate offers MIT, Apache-2.0, BSD, Zlib, Unlicense, CC0, MIT-0 or Unicode-3.0 terms (one also offers LGPL-2.1-or-later as an alternative). Development and test dependencies, not shipped in the program: `litesvm` 0.6.1, `solana-sdk` 2.2.1 and `solana-compute-budget` 2.2.4 (Apache-2.0), `bincode` 1.3.3 (MIT).

`solana/programs/lunar_contacts` uses `anchor-lang` 1.2.2 (Apache-2.0).

## Java

The Android app and `java-spike/` use Bouncy Castle 1.81 (`bcprov-jdk18on`). Copyright (c) 2000-2023 The Legion of the Bouncy Castle Inc. (https://www.bouncycastle.org). Its licence, shipped inside the jar as `org/bouncycastle/LICENSE`, grants the MIT permissions: "Permission is hereby granted, free of charge, to any person obtaining a copy of this software ...".

## Data and imagery

NASA data and imagery are credited in `docs/data-sources.md`. MoonDAO's Moon Base Zero coordinates are facts read from its public repository (commit `0a9d527`).

## JavaScript packages, in full

`text-encoding-utf-8` 1.0.2 has no `license` field in its `package.json`; its `LICENSE.md` dedicates the code to the public domain (Unlicense text) and notes that the encoding indexes derive from the WHATWG Encoding Standard.

### tools/pq-bundle (bundled into web/app/pq-bundle.js)

4 packages installed from the pinned lock file. Not every installed package ends up in the browser bundle.

| Package | Version | License |
|---|---|---|
| `@noble/ciphers` | 2.4.0 | MIT |
| `@noble/curves` | 2.4.0 | MIT |
| `@noble/hashes` | 2.4.0 | MIT |
| `@noble/post-quantum` | 0.7.1 | MIT |

### solana/client (bundled into web/app/moonseal-solana.js and web/solana-bundle.js)

47 packages installed from the pinned lock file. Not every installed package ends up in the browser bundle.

| Package | Version | License |
|---|---|---|
| `@babel/runtime` | 7.29.14 | MIT |
| `@noble/curves` | 1.9.7 | MIT |
| `@noble/hashes` | 1.8.0 | MIT |
| `@solana/buffer-layout` | 4.0.1 | MIT |
| `@solana/web3.js` | 1.98.0 | MIT |
| `@swc/helpers` | 0.5.24 | Apache-2.0 |
| `@types/connect` | 3.4.38 | MIT |
| `@types/node` | 12.20.55 | MIT |
| `@types/ws` | 7.4.7 | MIT |
| `agentkeepalive` | 4.6.0 | MIT |
| `base-x` | 3.0.11 | MIT |
| `base64-js` | 1.5.1 | MIT |
| `bigint-buffer` | 1.1.5 | Apache-2.0 |
| `bindings` | 1.5.0 | MIT |
| `bn.js` | 5.2.5 | MIT |
| `borsh` | 0.7.0 | Apache-2.0 |
| `bs58` | 4.0.1 | MIT |
| `buffer` | 6.0.3 | MIT |
| `bufferutil` | 4.2.0 | MIT |
| `commander` | 2.20.3 | MIT |
| `delay` | 5.0.0 | MIT |
| `es6-promise` | 4.2.8 | MIT |
| `es6-promisify` | 5.0.0 | MIT |
| `eventemitter3` | 5.0.4 | MIT |
| `eyes` | 0.1.8 | MIT |
| `fast-stable-stringify` | 1.0.0 | MIT |
| `file-uri-to-path` | 1.0.0 | MIT |
| `humanize-ms` | 1.2.1 | MIT |
| `ieee754` | 1.2.1 | BSD-3-Clause |
| `isomorphic-ws` | 4.0.1 | MIT |
| `jayson` | 4.3.0 | MIT |
| `json-stringify-safe` | 5.0.1 | ISC |
| `ms` | 2.1.3 | MIT |
| `node-fetch` | 2.7.0 | MIT |
| `node-gyp-build` | 4.8.4 | MIT |
| `rpc-websockets` | 9.3.10 | LGPL-3.0-only |
| `safe-buffer` | 5.2.1 | MIT |
| `stream-chain` | 2.2.5 | BSD-3-Clause |
| `stream-json` | 1.9.1 | BSD-3-Clause |
| `superstruct` | 2.0.2 | MIT |
| `text-encoding-utf-8` | 1.0.2 | see note |
| `tr46` | 0.0.3 | MIT |
| `utf-8-validate` | 6.0.6 | MIT |
| `uuid` | 8.3.2 | MIT |
| `webidl-conversions` | 3.0.1 | BSD-2-Clause |
| `whatwg-url` | 5.0.0 | MIT |
| `ws` | 7.5.14 | MIT |

### tools/wallet-bundle (bundled into web/app/wallet-bundle.js)

90 packages installed from the pinned lock file. Not every installed package ends up in the browser bundle.

| Package | Version | License |
|---|---|---|
| `@noble/curves` | 2.4.0 | MIT |
| `@noble/hashes` | 2.4.0 | MIT |
| `@solana/accounts` | 8.6.0 | MIT |
| `@solana/addresses` | 8.6.0 | MIT |
| `@solana/assertions` | 8.6.0 | MIT |
| `@solana/codecs` | 8.6.0 | MIT |
| `@solana/codecs-core` | 8.6.0 | MIT |
| `@solana/codecs-data-structures` | 8.6.0 | MIT |
| `@solana/codecs-numbers` | 8.6.0 | MIT |
| `@solana/codecs-strings` | 8.6.0 | MIT |
| `@solana/errors` | 8.6.0 | MIT |
| `@solana/fast-stable-stringify` | 8.6.0 | MIT |
| `@solana/fixed-points` | 8.6.0 | MIT |
| `@solana/functional` | 8.6.0 | MIT |
| `@solana/instruction-plans` | 8.6.0 | MIT |
| `@solana/instructions` | 8.6.0 | MIT |
| `@solana/keys` | 8.6.0 | MIT |
| `@solana/kit` | 8.6.0 | MIT |
| `@solana/nominal-types` | 8.6.0 | MIT |
| `@solana/offchain-messages` | 8.6.0 | MIT |
| `@solana/options` | 8.6.0 | MIT |
| `@solana/plugin-core` | 8.6.0 | MIT |
| `@solana/plugin-interfaces` | 8.6.0 | MIT |
| `@solana/program-client-core` | 8.6.0 | MIT |
| `@solana/programs` | 8.6.0 | MIT |
| `@solana/promises` | 8.6.0 | MIT |
| `@solana/rpc` | 8.6.0 | MIT |
| `@solana/rpc-api` | 8.6.0 | MIT |
| `@solana/rpc-parsed-types` | 8.6.0 | MIT |
| `@solana/rpc-spec` | 8.6.0 | MIT |
| `@solana/rpc-spec-types` | 8.6.0 | MIT |
| `@solana/rpc-subscriptions` | 8.6.0 | MIT |
| `@solana/rpc-subscriptions-api` | 8.6.0 | MIT |
| `@solana/rpc-subscriptions-channel-websocket` | 8.6.0 | MIT |
| `@solana/rpc-subscriptions-spec` | 8.6.0 | MIT |
| `@solana/rpc-transformers` | 8.6.0 | MIT |
| `@solana/rpc-transport-http` | 8.6.0 | MIT |
| `@solana/rpc-types` | 8.6.0 | MIT |
| `@solana/signers` | 8.6.0 | MIT |
| `@solana/subscribable` | 8.6.0 | MIT |
| `@solana/sysvars` | 8.6.0 | MIT |
| `@solana/transaction-confirmation` | 8.6.0 | MIT |
| `@solana/transaction-introspection` | 8.6.0 | MIT |
| `@solana/transaction-messages` | 8.6.0 | MIT |
| `@solana/transactions` | 8.6.0 | MIT |
| `@solana/wallet-standard-chains` | 1.1.2 | Apache-2.0 |
| `@solana/wallet-standard-features` | 1.5.0 | Apache-2.0 |
| `@solana/wallet-standard-util` | 1.2.0 | Apache-2.0 |
| `@solana-mobile/mobile-wallet-adapter-protocol` | 3.0.1 | Apache-2.0 |
| `@solana-mobile/wallet-standard-mobile` | 0.7.0 | Apache-2.0 |
| `@wallet-standard/app` | 1.1.1 | Apache-2.0 |
| `@wallet-standard/base` | 1.1.1 | Apache-2.0 |
| `@wallet-standard/core` | 1.1.2 | Apache-2.0 |
| `@wallet-standard/errors` | 0.1.2 | Apache-2.0 |
| `@wallet-standard/features` | 1.1.1 | Apache-2.0 |
| `@wallet-standard/wallet` | 1.1.1 | Apache-2.0 |
| `ansi-regex` | 5.0.1 | MIT |
| `ansi-styles` | 4.3.0 | MIT |
| `camelcase` | 5.3.1 | MIT |
| `chalk` | 5.6.2 | MIT |
| `cliui` | 6.0.0 | ISC |
| `color-convert` | 2.0.1 | MIT |
| `color-name` | 1.1.4 | MIT |
| `commander` | 15.0.0 | MIT |
| `decamelize` | 1.2.0 | MIT |
| `dijkstrajs` | 1.0.3 | MIT |
| `emoji-regex` | 8.0.0 | MIT |
| `find-up` | 4.1.0 | MIT |
| `get-caller-file` | 2.0.5 | ISC |
| `is-fullwidth-code-point` | 3.0.0 | MIT |
| `locate-path` | 5.0.0 | MIT |
| `p-limit` | 2.3.0 | MIT |
| `p-locate` | 4.1.0 | MIT |
| `p-try` | 2.2.0 | MIT |
| `path-exists` | 4.0.0 | MIT |
| `pngjs` | 5.0.0 | MIT |
| `qrcode` | 1.5.4 | MIT |
| `require-directory` | 2.1.1 | MIT |
| `require-main-filename` | 2.0.0 | ISC |
| `set-blocking` | 2.0.0 | ISC |
| `string-width` | 4.2.3 | MIT |
| `strip-ansi` | 6.0.1 | MIT |
| `tslib` | 2.9.1 | 0BSD |
| `undici-types` | 8.12.4 | MIT |
| `which-module` | 2.0.1 | ISC |
| `wrap-ansi` | 6.2.0 | MIT |
| `ws` | 8.23.0 | MIT |
| `y18n` | 4.0.3 | ISC |
| `yargs` | 15.4.1 | MIT |
| `yargs-parser` | 18.1.3 | ISC |

