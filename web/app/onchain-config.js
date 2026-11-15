/* Where the moonseal ML-DSA-65 verifier (tools/mldsa-onchain) can be reached. The page tries each in
   order and uses the first whose program account exists. Same program id on every network: it is the
   keypair cargo build-sbf generated (tools/mldsa-onchain/target/deploy/mldsa_onchain-keypair.json).
   - local: `solana-test-validator --bpf-program <id> <.so>` (no wallet, no deploy; demo-day safe)
   - devnet: live once `tools/mldsa-onchain/deploy-devnet.sh` has run (needs a funded wallet). */
window.MOONSEAL_ONCHAIN = {
  // The demo base's command registry (its policy: which ML-DSA-65 keys may command it), same address on every
  // network: tools/mldsa-onchain/keys/registry-keypair.json. Set up with solana/client/registry.mjs.
  registry: '2QYth8MJoLCdRgWckS6QTcjjvBoESFcsohRrLxeAoQN6',
  // PUBLIC seed of the demo operator key = sha256("moonseal devnet demo operator v1"), so anyone can press the
  // button. Devnet demo only: a real operator key stays with the operator and is never published.
  demoOperatorSeedHex: '5129885dcef4967b6acb507b9432dc349a4db1229e4627497e9e2ad2641396eb',
  networks: [
    { name: 'local validator', rpc: 'http://127.0.0.1:8899', programId: '3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7', airdrop: true },
    { name: 'Solana devnet', rpc: 'https://api.devnet.solana.com', programId: '3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7',
      explorer: 'https://explorer.solana.com/tx/{sig}?cluster=devnet' }
  ]
};
