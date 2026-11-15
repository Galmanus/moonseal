/* Devnet demo payer for the "Check it on Solana" button (web/app/command.js) and web/solana-demo.html.
   The real file, web/solana-demo-config.js, is NOT in the repository: it holds a private key.

   To run the on-chain demo against Solana devnet:
     1. solana-keygen new --no-bip39-passphrase -o devnet-demo.json      (a throwaway key, devnet only)
     2. fund it at https://faucet.solana.com (devnet)
     3. cp web/solana-demo-config.example.js web/solana-demo-config.js
        and paste the 64 numbers of devnet-demo.json into secretKey below.
   A local validator needs none of this: the page airdrops a throwaway payer there (docs/quickstart.md).
   Never put a key that holds real (mainnet) funds in a web page. */
window.LUNAR_SOLANA_DEMO = {
  "rpc": "https://api.devnet.solana.com",
  "programId": "HuBV5gmKwQJvJuGvHLSY58hq2DE76khJYMrCzz6ipFYk",
  "secretKey": null
};
