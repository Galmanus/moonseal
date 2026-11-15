# lunar_contacts: Solana coordination program

The Solana layer for Lunar Command Window: a decentralized direct-to-Earth (DTE)
ground-station coordination program. The planner computes WHEN a lunar site can reach
Earth; this program coordinates the ground stations that serve those contacts and binds
the post-quantum command authentication to the ledger.

Program id: `HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk`
Built with anchor-lang 1.2.2 (see Cargo.lock) / solana 4.3.0. **Builds clean (`lunar_contacts.so` + IDL).**
Deployed on Solana devnet: program `HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk` (last deployed in slot 522233493).
This is the earlier relay-coordination prototype; the ML-DSA-65 verifier and the command gate live in `tools/mldsa-onchain`.

## instructions (the flow)
1. `register_station(lat_e6, lon_e6, label)`: an Earth ground station registers (PDA
   `["station", authority]`). the decentralized network of antennas.
2. `post_window(window_id, start_ts, end_ts, site_lat_e6, site_lon_e6)`: the mission
   planner posts a lunar contact window computed by the Lunar Command Window tool
   (PDA `["window", window_id]`). this is where the planner's output drives the chain.
3. `claim_window()`: a registered station claims/schedules a contact window.
4. `confirm_contact(command_sig_hash)`: the station confirms it served the contact and
   records the **hash of the ML-DSA-signed command** it relayed. this binds the
   post-quantum command authentication to the on-chain coordination record: an open,
   untrusted antenna network, but every relayed command is PQ-signed and its hash is
   on-chain and auditable.

## how it ties the three pieces
- planner (NASA #11 deliverable) -> `post_window` (the contact windows)
- Solana DePIN coordination -> `register_station` + `claim_window` (who serves the link)
- post-quantum command auth -> `confirm_contact(command_sig_hash)` (the relayed command's
  ML-DSA signature hash, tamper-evident on-chain)

## build (done, reproducible)
```
cd solana && anchor build      # produces target/deploy/lunar_contacts.so + target/idl/
```

## Deploy: done (devnet, 14 Nov 2026)
LIVE: https://explorer.solana.com/address/HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk?cluster=devnet
upgrade authority = F9neSDGmb6tyPtuSFp4we2zvFA5WAaQYuFjBbagzmvTK (id.json).
gotcha: `anchor deploy` hit devnet congestion ("max retries exceeded"); resumed with
`solana program deploy target/deploy/lunar_contacts.so --program-id target/deploy/lunar_contacts-keypair.json --buffer <BUFFER> --with-compute-unit-price 50000`.
to upgrade later: `anchor build && solana program deploy ... --program-id ...` (same id).
then a client posts the planner's windows and the Seeker app records command hashes via
`confirm_contact`. a TS client sketch is the next step; the IDL is at target/idl/.

## honest scope
this is the coordination protocol, not a deployed antenna network. precedent: DecenSpace /
Oscillum / Wingbits already do decentralized ground stations on Solana for satellites; our
lunar-specific, terrain-honest contact windows are what drive the scheduling here.
