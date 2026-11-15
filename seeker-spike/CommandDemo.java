import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jcajce.spec.MLDSAParameterSpec;

import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.*;
import java.security.spec.*;
import java.util.*;

/**
 * End-to-end lunar command authentication (challenge #11 crypto layer).
 *
 * Device side (Seeker): genkey, sign.
 * Ground side: verify, enforcing THREE gates:
 *    (1) ML-DSA (FIPS 204) signature valid   -> unforgeable
 *    (2) counter strictly advanced           -> no replay
 *    (3) issued_at inside an open comm window -> physically sendable
 *
 * usage:
 *   genkey <dir>
 *   sign   <privKey> <asset> <command> <counter> <issuedAtEpoch> <windowId> <out>
 *   verify <pubKey>  <windowsCsv> <cmdFile> <lastCounter>
 */
public class CommandDemo {
    static { Security.addProvider(new BouncyCastleProvider()); }

    static byte[] canonical(String asset, String cmd, long counter, long issued, String win) {
        return ("v1|"+asset+"|"+cmd+"|"+counter+"|"+issued+"|"+win).getBytes(StandardCharsets.UTF_8);
    }

    public static void main(String[] a) throws Exception {
        switch (a[0]) {
            case "genkey": genkey(a[1]); break;
            case "sign":   sign(a); break;
            case "verify": verify(a); break;
            default: System.out.println("comando desconhecido: "+a[0]); System.exit(2);
        }
    }

    static void genkey(String dir) throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("ML-DSA", "BC");
        kpg.initialize(MLDSAParameterSpec.ml_dsa_65, new SecureRandom());
        KeyPair kp = kpg.generateKeyPair();
        Files.createDirectories(Paths.get(dir));
        Files.write(Paths.get(dir, "pub.key"),  kp.getPublic().getEncoded());
        Files.write(Paths.get(dir, "priv.key"), kp.getPrivate().getEncoded());
        System.out.println("keypair ML-DSA-65 em "+dir+"  (pub "+kp.getPublic().getEncoded().length
                +" B, priv "+kp.getPrivate().getEncoded().length+" B)");
    }

    static PrivateKey loadPriv(String f) throws Exception {
        return KeyFactory.getInstance("ML-DSA","BC")
                .generatePrivate(new PKCS8EncodedKeySpec(Files.readAllBytes(Paths.get(f))));
    }
    static PublicKey loadPub(String f) throws Exception {
        return KeyFactory.getInstance("ML-DSA","BC")
                .generatePublic(new X509EncodedKeySpec(Files.readAllBytes(Paths.get(f))));
    }

    static void sign(String[] a) throws Exception {
        String priv=a[1], asset=a[2], cmd=a[3]; long counter=Long.parseLong(a[4]);
        long issued=Long.parseLong(a[5]); String win=a[6], out=a[7];
        Signature s = Signature.getInstance("ML-DSA","BC");
        s.initSign(loadPriv(priv)); s.update(canonical(asset,cmd,counter,issued,win));
        byte[] sig = s.sign();
        String body = "asset="+asset+"\ncommand="+cmd+"\ncounter="+counter+"\nissued_at="+issued
                +"\nwindow_id="+win+"\nsig_b64="+Base64.getEncoder().encodeToString(sig)+"\n";
        Files.write(Paths.get(out), body.getBytes(StandardCharsets.UTF_8));
        System.out.println("assinado -> "+out+"  (sig "+sig.length+" B)");
    }

    static void verify(String[] a) throws Exception {
        String pub=a[1], winCsv=a[2], cmdFile=a[3]; long last=Long.parseLong(a[4]);
        Map<String,String> m = new HashMap<>();
        for (String ln : Files.readAllLines(Paths.get(cmdFile))) {
            int i = ln.indexOf('='); if (i>0) m.put(ln.substring(0,i), ln.substring(i+1));
        }
        String asset=m.get("asset"), cmd=m.get("command"), win=m.get("window_id");
        long counter=Long.parseLong(m.get("counter")), issued=Long.parseLong(m.get("issued_at"));
        byte[] sig = Base64.getDecoder().decode(m.get("sig_b64"));

        Signature v = Signature.getInstance("ML-DSA","BC");
        v.initVerify(loadPub(pub)); v.update(canonical(asset,cmd,counter,issued,win));
        boolean g1 = v.verify(sig);
        boolean g2 = counter > last;
        boolean g3 = inWindow(issued, winCsv);

        System.out.println("comando: "+asset+" :: "+cmd+"  (counter="+counter+", issued="+issued+")");
        System.out.println("  gate 1 assinatura ML-DSA : "+(g1?"PASS":"FAIL"));
        System.out.println("  gate 2 contador > "+last+"      : "+(g2?"PASS":"FAIL"));
        System.out.println("  gate 3 dentro da janela  : "+(g3?"PASS":"FAIL"));
        boolean ok = g1 && g2 && g3;
        System.out.println("  => "+(ok? "ACCEPT (comando executado)" : "REJECT (comando descartado)"));
        System.exit(ok?0:1);
    }

    static boolean inWindow(long epoch, String csv) throws Exception {
        for (String ln : Files.readAllLines(Paths.get(csv))) {
            String[] p = ln.trim().split(",");
            if (p.length==2 && epoch>=Long.parseLong(p[0]) && epoch<=Long.parseLong(p[1])) return true;
        }
        return false;
    }
}
