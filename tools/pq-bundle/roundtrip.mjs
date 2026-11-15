// Round-trip + tamper test of the exact bundle the site loads.
await import('../../web/app/pq-bundle.js');
const { ml_dsa65: D, ml_kem768: K } = globalThis.PQ;
const t = () => performance.now();
let a = t(); const op = D.keygen(); const kgMs = t() - a;
const msg = new TextEncoder().encode('v1|malapert_massif|POINT_HGA_EARTH|counter=7|t=7704');
a = t(); const sig = D.sign(msg, op.secretKey); const sgMs = t() - a;
a = t(); const ok = D.verify(sig, msg, op.publicKey); const vfMs = t() - a;
const bad = msg.slice(); bad[5] ^= 1;
const okBad = D.verify(sig, bad, op.publicKey);
const other = D.keygen(); const okOther = D.verify(D.sign(msg, other.secretKey), msg, op.publicKey);
const ln = K.keygen(); const enc = K.encapsulate(ln.publicKey); const dec = K.decapsulate(enc.cipherText, ln.secretKey);
const same = enc.sharedSecret.length === dec.length && enc.sharedSecret.every((x, i) => x === dec[i]);
console.log(JSON.stringify({ pk: op.publicKey.length, sk: op.secretKey.length, sig: sig.length,
  verify_genuine: ok, verify_tampered_msg: okBad, verify_wrong_key: okOther,
  kem_pk: ln.publicKey.length, kem_ct: enc.cipherText.length, kem_ss: dec.length, kem_secret_match: same,
  ms: { keygen: +kgMs.toFixed(1), sign: +sgMs.toFixed(1), verify: +vfMs.toFixed(1) } }));
