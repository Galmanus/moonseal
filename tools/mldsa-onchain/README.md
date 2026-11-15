# moonseal on-chain verifier: ML-DSA-65 (FIPS 204) inside a Solana program

A post-quantum signature verified **by the Solana runtime**. Key 1952 B + signature 3309 B do not fit a
1232-byte transaction and one verification costs ~3.4M compute units (> 1.4M cap), so, like the Vineland
staged STARK verifier (riverrun `staged.rs`), the data goes into a program-owned buffer in chunks and is
verified in stages:

```
create+INIT -> WRITE x 6-7 (900 B chunks) -> PREP (seal, z, hints, mu, c) -> ROWS 0-1 -> ROWS 2-3 -> ROWS 4-5 + FINAL
```

## Why a new implementation
`fips204` 0.5.0 needs a ~98 KB stack frame in `verify_internal`; SBF allows 4 KB per frame
(build error + "Access violation in stack frame" in LiteSVM). `src/mldsa65.rs` keeps every polynomial
on the heap and expands A row by row. All arithmetic is unsigned: SBF has no signed div/mod, and the
signed version cost ~400k CU per NTT (13.5M CU total) vs 3.4M CU unsigned.

## Measured (LiteSVM 0.6.1 = the SBF VM; and a local solana-test-validator)
| stage | CU |
|---|---|
| INIT | 872 |
| PREP | 509,361 |
| ROWS 0-1 | 982,975 |
| ROWS 2-3 | 982,964 |
| ROWS 4-5 + FINAL | 1,076,302 |

11 transactions for a 60-byte message or the 101-byte uplink ticket (plus one AUTHORIZE when the base's registry is used), every one <= 1,155 bytes.

## Tests
- `cargo test --release --test native`: verifies signatures from @noble/post-quantum 0.7.1 (browser) and
  BouncyCastle 1.81 (Seeker app); rejects tampered message / 7 signature positions / key / context.
- `cargo build-sbf && cargo test --release --test staged`: the full protocol in the SBF VM, both
  signatures VERIFIED, tampering REJECTED, guards (authority, seal, stage order, no repeats, no re-init).
- `../../solana/client/e2e-moonseal.mjs`: the browser client against a real validator.

## Run locally (no wallet, no deploy)
```
solana-test-validator --reset --ledger /tmp/lcwval/ledger \
  --bpf-program 3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7 target/deploy/mldsa_onchain.so
```
The site (web/app.html, Command -> "Verify the ticket on Solana") uses it automatically.

## Consumer rule
A program that trusts a buffer must check: owner == this program, magic/version, stage == DONE,
result == VERIFIED, and that keyid (sha256 of the key) is the registered operator key. The verifier
proves "this key signed this message"; the registry decides whose key matters.

## Command gate: who may command the base, decided on chain (2026-11-15)
The verifier proves "this key signed this message". The gate decides whether that is enough to command a
base, without a central server holding the policy:

- **Registry** (one account per base, 384 B, magic `R`): up to 8 authorized ML-DSA-65 key hashes
  (sha256 of the public key), a replay counter, and the last authorized uplink (packet sha256, hour, slot,
  key). Only its authority edits it (`REG_INIT` 6, `REG_ADD` 7, `REG_REMOVE` 8). In production the
  authority is a multisig of the base's owners; the program only checks the signer.
- **Uplink ticket** (101 B, what the operator signs): `"MSUT" | 1 | registry pubkey | counter u64 |
  hour i64 | sha256(packet) | site id`. Naming the registry binds a ticket to one base.
- **`AUTHORIZE` (9)**, permissionless: accepts a buffer only if it is DONE + VERIFIED, its key is in the
  registry, its message is a ticket naming THIS registry, and the counter is above every counter
  authorized before. Otherwise it fails with a readable log line (`moonseal: uplink DENIED: ...`), so a
  refusal is itself a public receipt. On success the registry records the packet hash that ground stations
  compare with the packet they hold before relaying.

Tests (`tests/gate.rs`, LiteSVM, fixtures from `tests/gen-gate-fixtures.mjs`): only the authority edits
the registry (no re-init, no duplicates, full at 8, wrong size or foreign owner refused); a registered key
with a fresh counter is AUTHORIZED and recorded; replays (same or older counter) are refused; a VALID
signature from an unregistered key is refused; a ticket for another base is refused; a rejected signature
is refused; a valid signature over a non-ticket is refused; a revoked key loses authority; buffer and
registry cannot be swapped or faked by another program. Local validator e2e (`solana/client/e2e-gate.mjs`):
honest AUTHORIZED (4,841 CU), replay / forged key / other base / tampered DENIED (690 to 2,654 CU).
Set up a base: `solana/client/registry.mjs create` then `add-demo-operator` (or `add <keyId>`).

## Limits (honest)
Not audited. Verification only. Constant-time is not needed (all inputs public).

## Live on Solana devnet (2026-11-15)
Program `3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7` (upgrade authority F9neSDGm...). Example verifying
transactions (log `moonseal: ML-DSA-65 VERIFIED`):
- CLI (`solana/client/devnet-moonseal.mjs`): https://explorer.solana.com/tx/2aoMkbkzJmtJ4fBaBZGdUQ2jNUvu4mxg2B9SSsk2CkpJfoixzvQSiGcqk1aDCr9NnhaqBppEaP2BtcESGCxiRZ7x?cluster=devnet
- from the web page (stage 3, "Verify the ticket on Solana"): https://explorer.solana.com/tx/3RuqMfaR6uXBac5Wdic5KMxoWNQHTGUvJ2rhpbTS9sNXEuancAxaC8PPYyHX8YcAS2RqFjMUe7TVpG2tYxV4TMAg?cluster=devnet

Command gate on devnet (program upgraded at signature 5fLtoYqjJiEcVLmBxMktwonBdTadmEXbkwNrVBUhjTUtAj5dnoE8ESkTo2ax9KWRzMkTqyJEjCyCKDTQhrCxgk6s,
program data extended by 24,064 B): registry `2QYth8MJoLCdRgWckS6QTcjjvBoESFcsohRrLxeAoQN6`, authority F9neSDGm...,
demo operator key `219ef77c...` authorized. From the web page:
- AUTHORIZED: https://explorer.solana.com/tx/3LzG1NYBPBG5YLJiHYa5rQYzeEuq2kUDXV38ZDmPzF6X63UbNBuq8bkHZ9YcykxwYEqQLLCWiLTzsSQ1CdYPXvMV?cluster=devnet
- DENIED (custom error 0x15, key not in the registry, signature valid): https://explorer.solana.com/tx/52Pjd7wNHzd3h6YEUDDiTA62BYE7t4FL38XM1aos2NcLtGb8SekAkR9rp5RWDbdHDermcHAfzcnSHHKnUm643B7i?cluster=devnet
- DENIED (custom error 0x18, replay): https://explorer.solana.com/tx/4f7jrwPysLARj44g5BQ2rcQj78Lzis97ot2LrfmrENjXGyqRHSG9e8A3yEh4wL9nT84wWibtqwk9YVGURAS5L4j6?cluster=devnet

The public devnet RPC rate-limits (HTTP 429, per IP and per method). The client backs off on 429, re-sends
the same signed bytes (a stage can never run twice) and closes a half-written buffer when a run fails
(`solana/client/test-ratelimit.mjs`); `solana/client/close-buffer.mjs` recovers any buffer left open.
