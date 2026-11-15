# Post-quantum command path

A command to a lunar lander has two jobs: it must be **unforgeable** (only the operator can issue it) and **private** (no one who records the uplink can read it). moonseal does both with NIST's post-quantum standards, and adds a third check on Solana: whether the key that signed is allowed to command this base at all.

| Job | Algorithm | Where it runs |
|---|---|---|
| Sign the command | ML-DSA-65 (FIPS 204) | Browser (@noble/post-quantum 0.7.1) or Seeker app (BouncyCastle 1.81) |
| Agree a key with the lander | ML-KEM-768 (FIPS 203) | Browser (@noble/post-quantum 0.7.1) |
| Seal command and signature | AES-256-GCM | Browser (WebCrypto) |
| Verify the signature, apply the base's policy | ML-DSA-65 + command registry | Solana program, see [onchain.md](onchain.md) |
| Vouch for the post-quantum key with hardware | ed25519 message signature | Seed Vault on a Solana Seeker, through Mobile Wallet Adapter |

## Why post-quantum

- **Signatures outlive their keys' assumptions.** A lander runs for years on command keys set before launch, and a forged command is as dangerous at the end of the mission as at the start. NIST IR 8547 sets 2030 for deprecating, and 2035 for disallowing, quantum-vulnerable signatures such as RSA and ECDSA.
- **Uplinks can be recorded today.** Anyone can record radio traffic now and decrypt it later if the key agreement breaks ("harvest now, decrypt later"). ML-KEM keeps the recorded uplink unreadable.

## The pipeline

Open **Command** in `web/app.html`. The four stages on screen are the four steps below. Sizes are from a run of the page.

1. **Operator signs.** The payload is `{v, site, cmd, counter, hour}`: the command, a monotonic counter and the planned hour. It is signed with ML-DSA-65; the signature is 3,309 bytes and the public key 1,952 bytes.
2. **Encrypt for the lander.** ML-KEM-768 encapsulates a fresh shared secret to the lander's public key (1,184 bytes), producing a 1,088-byte ciphertext. The shared secret becomes an AES-256-GCM key that seals the payload and its signature. The uplink packet is about 4.5 KB, roughly five 1,024-byte telecommand frames, so in operations you would sign a plan rather than every command.
3. **Relay through an untrusted ground station.** The station sees only ciphertext. Before relaying, it checks on Solana that the packet's hash is the one the base authorized. This step is where **Verify the ticket on Solana** runs.
4. **The lander checks, in order:**

| Gate | Passes when | Fails in scenario |
|---|---|---|
| Line of sight to Earth | Earth is above the lander's skyline at the planned hour (the planner) | Send during a blackout |
| Decrypt (ML-KEM-768 + AES-GCM) | The ciphertext opens with the lander's key and the GCM tag verifies | Tampered in transit |
| Key attested by the operator's wallet (ed25519) | Only when a wallet is connected: the signing key is the one the wallet vouched for | (a wallet attested a different key) |
| Signature (ML-DSA-65) | The signature verifies under the operator's key | Forged (unregistered key) |
| Fresh counter | The counter is above the last accepted one | Replay an old packet |

The command executes only if every gate passes. Each scenario fails at a different gate, which you can watch by switching the scenario buttons above **Sign & send**.

## The uplink ticket

The lander's packet is private, but the chain needs something public to check. The operator therefore also signs a 101-byte **uplink ticket**: the base's registry address, a counter, the planned hour, the SHA-256 of the encrypted packet and the site. The Solana program verifies the ticket's signature and applies the base's registry. Ground stations then relay only a packet whose hash matches the one the base authorized. The command itself never goes on chain. The ticket's byte layout is in [onchain.md](onchain.md#uplink-ticket).

## Interoperability

The browser and the Seeker app use different implementations: @noble/post-quantum 0.7.1 (JavaScript) and BouncyCastle 1.81 (Java). Signatures made by either verify in the other, in both directions. Both also verify in the Solana program's own verifier (`tools/mldsa-onchain/tests/native.rs`, `tests/staged.rs`), which makes three independent implementations agree on the same signatures.

## Hybrid seal: the Seed Vault vouches for the post-quantum key

The Solana Seeker's Seed Vault holds an ed25519 key in secure hardware. ed25519 is not post-quantum, but it is a strong statement of identity today. moonseal uses it to vouch for the post-quantum key, not to sign commands.

1. Press **Connect your Solana wallet** in **Command**. On a Seeker, Mobile Wallet Adapter reaches the Seed Vault. On a laptop, the page lists Wallet Standard wallets that support `solana:signMessage`. The flow was tested with a mock Wallet Standard wallet; the Mobile Wallet Adapter hop can only be exercised on a phone.
2. The wallet signs this statement with its ed25519 key:

   ```text
   moonseal operator attestation
   This post-quantum key may command landers on my behalf.
   ML-DSA-65 key sha256: <hash of the operator's ML-DSA-65 public key>
   Issued: <ISO 8601 time>
   ```

3. The page verifies the ed25519 signature (@noble/curves) and from then on the lander requires that the command was signed by the attested key.

The result pairs a classical hardware identity with a post-quantum command key. To be exact about what runs where: the Seed Vault signs ed25519 only. ML-DSA-65 signing runs in software, in the browser or in the Seeker app.

The wallet code is pinned in `tools/wallet-bundle` (`@solana-mobile/wallet-standard-mobile` 0.7.0, `@wallet-standard/app` 1.1.1, `@noble/curves` 2.4.0, with `@solana-mobile/mobile-wallet-adapter-protocol` forced to 3.0.1) and bundled into `web/app/wallet-bundle.js`. Mobile Wallet Adapter needs a secure context; see [quickstart.md](quickstart.md#4-run-it-on-a-solana-seeker).

## Limits

- **Demo keys.** On the web page, the operator's ML-DSA-65 key is derived from a public seed (`demoOperatorSeedHex` in `web/app/onchain-config.js`) so that anyone can try the demo base. A real operator key would live on the Seeker and never be published. The lander's ML-KEM key is generated in the page for the demo.
- **Keys in memory.** In the browser, keys live in page memory. In the Seeker app, the ML-DSA key is stored in the app's files and is not yet wrapped by the Android Keystore.
- **Text-only bridge.** The Seeker app's bridge signs text, not raw bytes, so on that build the binary uplink ticket is signed with the demo operator key.
- **Bandwidth.** About 4.5 KB per command is large for a deep-space uplink. Signing a command plan, rather than each command, is the realistic use.
