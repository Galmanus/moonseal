plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "app.lunar.pqnav"
    compileSdk = 36

    defaultConfig {
        applicationId = "app.lunar.pqnav"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "0.1.0"
        // sem lib nativa: o APK roda em arm64-v8a (exigência da dApp store) e demais ABIs.
    }

    buildTypes {
        release {
            // minify OFF de propósito: R8 pode stripar a reflexão do provider bouncycastle.
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    // MESMA lib que rodou no spike (jvm) e que o termux-bundle validou no device.
    implementation("org.bouncycastle:bcprov-jdk18on:1.81")
}
