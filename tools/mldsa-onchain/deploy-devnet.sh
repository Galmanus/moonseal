#!/usr/bin/env bash
# Deploy the moonseal ML-DSA-65 verifier to Solana DEVNET. Run it yourself: it spends devnet SOL
# from YOUR wallet (default ~/.config/solana/id.json). Program id = keys/mldsa_onchain-keypair.json
# (3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7), the same id web/app/onchain-config.js expects.
set -euo pipefail
cd "$(dirname "$0")"
WALLET="${1:-$HOME/.config/solana/id.json}"
cargo build-sbf
echo "wallet: $(solana-keygen pubkey "$WALLET")  balance: $(solana -u devnet balance -k "$WALLET")"
echo "program size: $(stat -c%s target/deploy/mldsa_onchain.so) bytes"
read -r -p "deploy to devnet now? [y/N] " a; [ "$a" = "y" ] || exit 0
solana program deploy -u devnet -k "$WALLET" --program-id keys/mldsa_onchain-keypair.json \
  --with-compute-unit-price 50000 target/deploy/mldsa_onchain.so
echo "done. the site's 'Verify the ticket on Solana' now finds it on devnet."
echo "if it stalls (devnet congestion): rerun with --buffer <BUFFER> as you did for lunar_contacts."
