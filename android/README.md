# moonseal: Android app for the Solana Seeker

A WebView shell around the mission console (`web/index.html`) plus a native post-quantum signing bridge,
`LunarBridge.kt`: ML-DSA-65 through BouncyCastle 1.81 (`bcprov-jdk18on:1.81`), mirroring `seeker-spike/`.

## Status
- The project was written without an Android SDK in the development sandbox. What was verified on a
  device is the cryptography: ML-DSA-65 through BouncyCastle runs on the phone's runtime (proved with the
  `seeker-spike/` bundle under Termux). Build the app in Android Studio before relying on it.
- `app/src/main/assets/` holds copies of the older console and its data. Re-copy them from `web/` before a
  release (see below); the current site is `web/app.html`.
- The bridge signs text payloads (`signMLDSA(String)`). On-chain uplink tickets are binary, so today the web
  page signs them with the demo operator key; a bytes-signing bridge method is the next step
  (see `docs/post-quantum.md`).
- Signatures made with BouncyCastle 1.81 (the library the phone app uses) and with `@noble/post-quantum` in the browser verify each
  other in both directions, and the on-chain verifier accepts both (`tools/mldsa-onchain/tests/`).

## Build
1. Open `android/` in Android Studio (it resolves the Gradle wrapper and the SDK),
   or with a local Gradle: `cd android && gradle :app:assembleDebug`.
2. A debug build runs on the emulator or a Seeker. The Solana dApp Store requires a signed release build.

## How the bridge connects to the console
`MainActivity` injects `LunarBridge` as `window.LunarBridge`. The console detects it:
- `window.LunarBridge` present: "on-device" badge, gate 1 is the real ML-DSA signature.
- absent (a browser): "preview" badge, gate 1 is a labeled stand-in.

Methods: `signMLDSA(payload) -> base64`, `verifyMLDSA(payload, sig) -> bool`, `publicKeyB64()`.

## Layout
```
settings.gradle.kts · build.gradle.kts · gradle.properties
app/build.gradle.kts            (bcprov-jdk18on:1.81, minify off)
app/src/main/AndroidManifest.xml
app/src/main/java/app/lunar/pqnav/MainActivity.kt
app/src/main/java/app/lunar/pqnav/LunarBridge.kt
app/src/main/assets/index.html + windows_data.js   (copies from web/)
```

## Keeping the assets in sync
`app/src/main/assets/` holds copies of `web/`. After changing the console, copy them again:
`cp web/index.html web/windows_data.js android/app/src/main/assets/`

The devnet demo payer (`solana-demo-config.js`) is never committed; see `web/solana-demo-config.example.js`.
