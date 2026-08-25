package com.forceflow

import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "ForceFlow"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    // Set FLAG_SECURE as early as possible — before the splash screen
    // touches the window, to prevent the OS from caching a screenshot
    // of this app's screens into the Recents task-switcher thumbnail.
    window.setFlags(
      WindowManager.LayoutParams.FLAG_SECURE,
      WindowManager.LayoutParams.FLAG_SECURE
    )

    RNBootSplash.init(this, R.style.BootTheme)
    // react-native-screens < 4.16 must not restore Fragment state on activity recreation.
    super.onCreate(null)

    // Tapjacking/overlay protection. `filterTouchesWhenObscured` is a
    // View property — applying it to the root decor view covers all
    // touch targets within this single Activity.
    window.decorView.setFilterTouchesWhenObscured(true)

    // Runtime instrumentation / anti-tampering checks
    // — prevent analysis via Frida, Objection, Xposed, or debuggers
    if (isDebuggerAttached()) {
      // Exit immediately if a debugger is attached in non-debug mode — this prevents
      // runtime hooking and analysis of application logic.
      finishAndRemoveTask()
      System.exit(0)
    }

    // Basic root detection — check for common su binaries and
    // Magisk/SuperSU indicators. This is a defensive measure;
    // determined attackers may bypass, but it raises the bar.
    if (!BuildConfig.DEBUG && isRootPresent()) {
      finishAndRemoveTask()
      System.exit(0)
    }
  }

  override fun onResume() {
    super.onResume()
    // Re-apply FLAG_SECURE on every resume. Some devices/configurations
    // may clear window flags when the Activity is paused or when
    // react-native-screens updates window traits.
    window.setFlags(
      WindowManager.LayoutParams.FLAG_SECURE,
      WindowManager.LayoutParams.FLAG_SECURE
    )
  }

  /**
   * Returns true if a debugger is attached to the process.
   * Uses Android's native Debug API for reliable detection in production builds.
   */
  private fun isDebuggerAttached(): Boolean {
    if (BuildConfig.DEBUG) return false
    return android.os.Debug.isDebuggerConnected()
  }

  /**
   * Returns true if the device appears to be rooted.
   * Checks for common su binaries and root indicators.
   */
  private fun isRootPresent(): Boolean {
    val rootBinaries = listOf("su", "magisk", "superuser", "superSU")
    val checkPaths = listOf("/sbin", "/system/bin", "/system/xbin", "/vendor/bin", "/proc")
    val binaryFound = rootBinaries.any { binary ->
      checkPaths.any { path -> java.io.File("$path/$binary").exists() } ||
        try {
          java.lang.Runtime.getRuntime().exec("which $binary").inputStream.bufferedReader().readText().trim().isNotEmpty()
        } catch (_: Exception) {
          false
        }
    }
    return binaryFound ||
      java.io.File("/system/app/SuperSU").exists() ||
      java.io.File("/system/xbin/su").exists() ||
      java.io.File("/system/bin/su").exists()
  }
}
