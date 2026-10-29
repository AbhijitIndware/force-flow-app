package com.forceflow

import android.app.AlertDialog
import android.os.Build
import android.os.Bundle
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
    RNBootSplash.init(this, R.style.BootTheme)
    // react-native-screens < 4.16 must not restore Fragment state on activity recreation.
    super.onCreate(null)

    // Tapjacking/overlay protection. `filterTouchesWhenObscured` is a
    // View property — applying it to the root decor view covers all
    // touch targets within this single Activity.
    window.decorView.setFilterTouchesWhenObscured(true)
    // Android 12+: hide other apps' overlay windows while ours is shown.
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      window.setHideOverlayWindows(true)
    }

    // Runtime instrumentation / anti-tampering checks
    // — prevent analysis via Frida, Objection, Xposed, or debuggers
    if (isDebuggerAttached()) {
      // Exit immediately if a debugger is attached in non-debug mode — this prevents
      // runtime hooking and analysis of application logic.
      finishAndRemoveTask()
      System.exit(0)
    }

    // Refuse to run on a rooted or hooked device, and say why. This is a
    // defensive measure; determined attackers may bypass, but it raises
    // the bar.
    if (!BuildConfig.DEBUG && (isRootPresent() || isInstrumentationPresent())) {
      AlertDialog.Builder(this)
        .setTitle("Device not supported")
        .setMessage(
          "This device is rooted or is running app-hooking tools " +
            "(such as Frida or Xposed). For the security of your data, " +
            "ForceFlow cannot run on it.",
        )
        .setCancelable(false)
        .setPositiveButton("Close") { _, _ ->
          finishAndRemoveTask()
          System.exit(0)
        }
        .show()
    }
  }

  /**
   * Returns true if Frida, Objection (Frida-based) or Xposed / LSPosed
   * appears to be present: their classes, their libraries mapped into this
   * process, the Frida server's files, or its default port.
   */
  private fun isInstrumentationPresent(): Boolean {
    val hookClasses = listOf(
      "de.robv.android.xposed.XposedBridge",
      "de.robv.android.xposed.XposedHelpers",
    )
    val classFound = hookClasses.any { name ->
      try {
        Class.forName(name)
        true
      } catch (_: Throwable) {
        false
      }
    }

    val mapsFound = try {
      java.io.File("/proc/self/maps").useLines { lines ->
        lines.any { line ->
          val l = line.lowercase()
          l.contains("frida") || l.contains("libgadget") ||
            l.contains("xposed") || l.contains("lsposed") ||
            l.contains("substrate")
        }
      }
    } catch (_: Exception) {
      false
    }

    val fridaFiles = listOf(
      "/data/local/tmp/frida-server",
      "/data/local/tmp/re.frida.server",
      "/system/bin/frida-server",
      "/system/xbin/frida-server",
    ).any { java.io.File(it).exists() }

    // Frida server's default port, 27042 (0x69A2), listening locally.
    val fridaPort = listOf("/proc/net/tcp", "/proc/net/tcp6").any { path ->
      try {
        java.io.File(path).useLines { lines ->
          lines.any { it.contains(":69A2 ", ignoreCase = true) }
        }
      } catch (_: Exception) {
        false
      }
    }

    return classFound || mapsFound || fridaFiles || fridaPort
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
