// Solana wallet connection for moonseal (no CDN): Mobile Wallet Adapter, so a Solana Seeker's Seed Vault can
// sign in its own browser, plus Wallet Standard discovery for desktop wallets. ed25519 verification via noble.
import { registerMwa, createDefaultAuthorizationCache, createDefaultChainSelector, createDefaultWalletNotFoundHandler } from '@solana-mobile/wallet-standard-mobile';
import { getWallets } from '@wallet-standard/app';
import { ed25519 } from '@noble/curves/ed25519.js';
let registered = false;
function setup() {
  if (registered) return;
  registered = true;
  try {
    registerMwa({
      appIdentity: { name: 'moonseal', uri: location.origin, icon: 'app/brand/moonseal-favicon.svg' },
      authorizationCache: createDefaultAuthorizationCache(),
      chains: ['solana:devnet', 'solana:mainnet'],
      chainSelector: createDefaultChainSelector(),
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    });
  } catch (e) { console.warn('MWA registration', e); }
}
globalThis.MoonsealWallet = { setup, getWallets, ed25519, versions: '@solana-mobile/wallet-standard-mobile 0.7.0, @wallet-standard/app 1.1.1, @noble/curves 2.4.0' };
