package app.lunar.pqnav

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Bundle
import android.webkit.WebView

class MainActivity : Activity() {
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val web = WebView(this)
        web.settings.javaScriptEnabled = true
        web.settings.allowFileAccess = true
        // expõe a ponte de assinatura ML-DSA ao console (window.LunarBridge)
        web.addJavascriptInterface(LunarBridge(this), "LunarBridge")
        web.loadUrl("file:///android_asset/index.html")
        setContentView(web)
    }
}
