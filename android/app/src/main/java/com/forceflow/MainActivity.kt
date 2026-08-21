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
}
