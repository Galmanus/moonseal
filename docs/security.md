# Security model

moonseal is a hackathon prototype. This page states what it defends against, which test shows it, and what it assumes. The on-chain verifier and gate have not been audited.

## What is protected

- **Command authority.** Only a key the base has registered can command it, and each command is used once.
- **Command privacy.** A recorded uplink cannot be read without the lander's key, including by a future quantum computer.
- **The record.** Which uplinks a base authorized, and which it refused, is public and tamper-evident on Solana.

## Threats and mitigations

| Threat | What stops it | Shown by |
|---|---|---|
| An attacker forges a command without the operator's key | The lander verifies ML-DSA-65 under the operator's key. On chain, `AUTHORIZE` requires a key in the base's registry (`0x15`). | `tests/gate.rs::valid_signature_is_not_enough`; page scenario "Forged"; devnet refusal `52Pjd7wN...` |
| A valid key that this base never authorized signs a command | Registry membership is checked after the signature verifies (`0x15`) | `tests/gate.rs::valid_signature_is_not_enough` (the signature is VERIFIED, then refused) |
| A ticket signed for base A is submitted for base B | The ticket names its registry (`0x17`) | `tests/gate.rs`; `solana/client/e2e-gate.mjs` "other base" |
| A captured ticket or packet is replayed | On chain, the counter must exceed the base's last counter (`0x18`). At the lander, the counter must be new. | `tests/gate.rs::registered_key_fresh_counter_is_authorized_and_recorded`; page scenario "Replay"; devnet refusal `4f7jrwPy...` |
| A relay flips bits in the encrypted packet | AES-GCM's tag fails at the lander. Before relaying, stations compare the packet's hash with the hash the base authorized. | Page scenario "Tampered in transit" (decrypt gate fails; stations refuse) |
| The signature or message in the buffer is altered | ML-DSA-65 verification returns REJECTED, and `AUTHORIZE` refuses (`0x14`) | `tests/staged.rs::tampering_is_rejected_on_chain`; `tests/native.rs::rejects_tampering` |
| A registered key's signature over some other message is presented as a command | `AUTHORIZE` accepts only the 101-byte ticket format (`0x16`) | `tests/gate.rs::valid_signature_is_not_enough` |
| Someone edits a base's registry or re-initializes it | Only the recorded authority may edit (`0x1c`); `REG_INIT` works once | `tests/gate.rs::registry_is_governed_by_its_authority_only` |
| Accounts are swapped, or forged by another program | Owner checks, exact registry size and magic bytes | `tests/gate.rs::accounts_cannot_be_swapped_or_faked` |
| A third party writes into, or re-initializes, someone's buffer | Every buffer instruction must be signed by the authority recorded at `INIT` (`0x3`) | `tests/staged.rs::protocol_guards` |
| The input changes after verification starts | `PREP` seals the buffer (`0x4`) and records `sha256(pk ‖ sig ‖ msg)` | `tests/staged.rs::protocol_guards` |
| Stages are skipped, reordered or repeated | Stage machine and row order (`0x7`, `0x8`) | `tests/staged.rs::protocol_guards` |
| The public RPC rate-limits a run halfway | Backoff, re-sending the same signed bytes, and closing the buffer on failure | `solana/client/test-ratelimit.mjs` |
| An uplink recorded today is decrypted later | ML-KEM-768 key agreement | Design: [post-quantum.md](post-quantum.md) |

## Trust assumptions

- **The demo operator key is public.** On the web page the operator's ML-DSA-65 key is derived from a public seed, so anyone can produce AUTHORIZED tickets for the demo base on devnet. This is deliberate, so that the demo works for every visitor. A real base registers keys held on operators' devices.
- **Single-key authorities on devnet.** The demo registry's authority and the program's upgrade authority are one wallet. Whoever holds the upgrade authority can replace the verifier. In production, both should be a multisig of the base's owners, or the program should be made immutable.
- **The chain does not stop a transmitter.** Anyone with an antenna can radiate a packet. The lander's own gates are the physical barrier. What the chain adds is a shared, public policy: which keys count, which counter is next, which packet the base authorized, and a record that ground stations, payers and auditors can all check without trusting one operator.
- **The planned hour is recorded, not enforced, on chain.** `AUTHORIZE` stores the ticket's hour; the line-of-sight check happens at the lander.
- **One counter per base.** All operators of a base share one counter. Two tickets racing for the same counter value cannot both be authorized. The web page uses the current time in milliseconds as the counter, so a visitor whose clock runs ahead can make later tickets from other visitors look like replays.
- **Implementation maturity.** The verifier is new code. It agrees with two independent ML-DSA-65 implementations (@noble/post-quantum and BouncyCastle) on the test vectors, which is evidence, not proof. Constant-time behavior is not required, because every input to verification is public.
- **Keys at rest.** In the browser, keys live in page memory. In the Seeker app, the ML-DSA key is stored in the app's files, not yet wrapped by the Android Keystore.
- **The first prototype is not gated.** `solana/programs/lunar_contacts` records contact windows and command hashes but verifies no signatures.

## Secrets in this repository

None. The devnet demo payer key (`web/solana-demo-config.js`), the program and registry keypairs, and the Seeker spike's private key are excluded from version control. `web/solana-demo-config.example.js` shows the expected format. The demo operator seed in `web/app/onchain-config.js` is public by design.

## Reporting a problem

Open an issue on this repository without exploit details, and ask for a private channel.
