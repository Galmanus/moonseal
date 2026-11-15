package app.lunar.pqnav

import android.content.Context
import android.util.Base64
import android.webkit.JavascriptInterface
import org.bouncycastle.jcajce.spec.MLDSAParameterSpec
import org.bouncycastle.jce.provider.BouncyCastleProvider
import java.io.File
import java.security.KeyFactory
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.SecureRandom
import java.security.Security
import java.security.Signature
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec

/**
 * Ponte nativa de assinatura pós-quântica exposta ao console web.
 * Espelha exatamente o core provado em java-spike/ (ML-DSA-65, FIPS 204, BouncyCastle).
 *
 * Métodos chamados pelo console (web/index.html):
 *   LunarBridge.signMLDSA(payload)        -> assinatura base64
 *   LunarBridge.verifyMLDSA(payload, sig) -> boolean
 *   LunarBridge.publicKeyB64()            -> chave pública base64 (para o solo)
 *
 * HARDENING pendente (honesto, não implementado nesta v1):
 *   - embrulhar a chave privada ML-DSA com uma chave AES no Android Keystore/StrongBox
 *     (elemento seguro), em vez de persistir em filesDir.
 *   - vincular a chave ML-DSA à chave ed25519 da carteira Solana do operador (atestação).
 *   a carteira NÃO assina ML-DSA; ela dá identidade. não vender "chip assina pós-quântico".
 */
class LunarBridge(private val ctx: Context) {

    init {
        Security.removeProvider("BC")
        Security.addProvider(BouncyCastleProvider())
    }

    private val keyPair: KeyPair by lazy { loadOrCreate() }

    @JavascriptInterface
    fun signMLDSA(payload: String): String {
        val s = Signature.getInstance("ML-DSA", "BC")
        s.initSign(keyPair.private)
        s.update(payload.toByteArray(Charsets.UTF_8))
        return Base64.encodeToString(s.sign(), Base64.NO_WRAP)
    }

    @JavascriptInterface
    fun verifyMLDSA(payload: String, sigB64: String): Boolean {
        return try {
            val v = Signature.getInstance("ML-DSA", "BC")
            v.initVerify(keyPair.public)
            v.update(payload.toByteArray(Charsets.UTF_8))
            v.verify(Base64.decode(sigB64, Base64.NO_WRAP))
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun publicKeyB64(): String =
        Base64.encodeToString(keyPair.public.encoded, Base64.NO_WRAP)

    private fun loadOrCreate(): KeyPair {
        val pub = File(ctx.filesDir, "mldsa_pub.key")
        val priv = File(ctx.filesDir, "mldsa_priv.key")
        if (pub.exists() && priv.exists()) {
            val kf = KeyFactory.getInstance("ML-DSA", "BC")
            return KeyPair(
                kf.generatePublic(X509EncodedKeySpec(pub.readBytes())),
                kf.generatePrivate(PKCS8EncodedKeySpec(priv.readBytes()))
            )
        }
        val kpg = KeyPairGenerator.getInstance("ML-DSA", "BC")
        kpg.initialize(MLDSAParameterSpec.ml_dsa_65, SecureRandom())
        val kp = kpg.generateKeyPair()
        pub.writeBytes(kp.public.encoded)
        priv.writeBytes(kp.private.encoded)
        return kp
    }
}
