plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
 namespace = "bw.co.gabs.anon"
 compileSdk = 35
 defaultConfig {
  applicationId = "bw.co.gabs.anon"
  minSdk = 24
  targetSdk = 35
  versionCode = 1
  versionName = "1.0.0"
  buildConfigField("String", "ANON_BASE_URL", "\"${project.findProperty("anonBaseUrl") ?: "https://YOUR-ANON-HOST"}\"")
 }
 buildFeatures { buildConfig = true }
}
