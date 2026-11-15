// Vendored post-quantum primitives for web/app (no CDN). Pinned in package.json / bun.lock.
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
globalThis.PQ = { ml_dsa65, ml_kem768, version: '@noble/post-quantum 0.7.1' };
