import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jcajce.spec.MLDSAParameterSpec;

import java.nio.charset.StandardCharsets;
import java.security.*;

/**
 * De-risk spike for NASA Space Apps #11 crypto layer.
 *
 * Proves, at the ALGORITHM level on a plain JVM, the command-authentication
 * core before any Android packaging:
 *   - generate an ML-DSA (FIPS 204) keypair
 *   - sign a lunar-asset command
 *   - ACCEPT a genuine command
 *   - REJECT a forged/tampered command (unforgeability)
 *   - REJECT a replayed command (monotonic counter)
 *
 * If this runs here, only on-device packaging (bcprov jar on Android runtime)
 * remains as a risk for the Android build. That split is the whole point.
 */
public class MLDSACommandSpike {

    /** Canonical byte serialization of a command. Both signer and verifier
     *  MUST build these bytes identically, or every signature fails. */
    static byte[] canonical(String assetId, String command, long counter,
                            long issuedAtEpoch, String windowId) {
        String s = "v1|" + assetId + "|" + command + "|" + counter + "|"
                 + issuedAtEpoch + "|" + windowId;
        return s.getBytes(StandardCharsets.UTF_8);
    }

    public static void main(String[] args) throws Exception {
        Security.addProvider(new BouncyCastleProvider());

        System.out.println("=== ML-DSA command-auth spike (BouncyCastle, JVM) ===");

        // 1. keypair (ML-DSA-65 = NIST security category 3)
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-DSA", "BC");
        kpg.initialize(MLDSAParameterSpec.ml_dsa_65, new SecureRandom());
        KeyPair kp = kpg.generateKeyPair();
        System.out.println("pubkey bytes : " + kp.getPublic().getEncoded().length);
        System.out.println("privkey bytes: " + kp.getPrivate().getEncoded().length);

        // 2. a genuine command from the operator's phone to a lunar asset
        long counter = 42;
        long issuedAt = 1762000000L;
        byte[] msg = canonical("LUNAR-ROVER-01", "DEPLOY_PANEL", counter,
                               issuedAt, "WIN-2026-W07-A");

        Signature signer = Signature.getInstance("ML-DSA", "BC");
        signer.initSign(kp.getPrivate());
        signer.update(msg);
        long t0 = System.nanoTime();
        byte[] sig = signer.sign();
        long signUs = (System.nanoTime() - t0) / 1000;
        System.out.println("signature bytes: " + sig.length + "  (sign " + signUs + " us)");

        // 3. ground verifies a GENUINE command -> must ACCEPT
        Signature ver = Signature.getInstance("ML-DSA", "BC");
        ver.initVerify(kp.getPublic());
        ver.update(msg);
        long t1 = System.nanoTime();
        boolean okGenuine = ver.verify(sig);
        long verUs = (System.nanoTime() - t1) / 1000;
        System.out.println("\n[1] genuine command        -> verify=" + okGenuine
                + (okGenuine ? "  ACCEPT (correto)" : "  REJECT (BUG!)")
                + "  (verify " + verUs + " us)");

        // 4. FORGED command: adversary changes the command, keeps old signature
        byte[] forged = canonical("LUNAR-ROVER-01", "SELF_DESTRUCT", counter,
                                  issuedAt, "WIN-2026-W07-A");
        Signature ver2 = Signature.getInstance("ML-DSA", "BC");
        ver2.initVerify(kp.getPublic());
        ver2.update(forged);
        boolean okForged = ver2.verify(sig);
        System.out.println("[2] forged command         -> verify=" + okForged
                + (okForged ? "  ACCEPT (BUG! quebra)" : "  REJECT (correto)"));

        // 5. REPLAY: identical, valid signature, but counter not advanced.
        //    Signature is cryptographically valid; the COUNTER POLICY rejects it.
        long lastSeenCounter = 42;              // ground already processed #42
        boolean sigValidReplay = okGenuine;      // same bytes, same sig -> valid
        boolean counterOk = counter > lastSeenCounter;
        boolean acceptReplay = sigValidReplay && counterOk;
        System.out.println("[3] replay (counter=" + counter + ", last=" + lastSeenCounter
                + ") -> sigValid=" + sigValidReplay + " counterFresh=" + counterOk
                + " => " + (acceptReplay ? "ACCEPT (BUG!)" : "REJECT (correto)"));

        boolean allPass = okGenuine && !okForged && !acceptReplay;
        System.out.println("\n=== RESULTADO: " + (allPass ? "TODOS OS GATES OK" : "FALHA") + " ===");
        System.exit(allPass ? 0 : 1);
    }
}
