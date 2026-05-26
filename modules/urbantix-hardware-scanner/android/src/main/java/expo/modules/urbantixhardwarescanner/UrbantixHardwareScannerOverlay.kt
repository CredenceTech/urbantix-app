package expo.modules.urbantixhardwarescanner

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.graphics.toColorInt
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

internal object UrbantixHardwareScannerOverlay {
  private const val DISMISS_DELAY_MS = 1600L
  private val mainHandler = Handler(Looper.getMainLooper())
  private var overlayView: View? = null
  private var dismissRunnable: Runnable? = null

  fun canDrawOverlays(context: Context): Boolean {
    return Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(context)
  }

  fun show(context: Context, result: HardwareScannerResultPayload): Boolean {
    if (!canDrawOverlays(context)) {
      return false
    }

    val windowManager =
      context.getSystemService(Context.WINDOW_SERVICE) as? WindowManager ?: return false
    val didShow = AtomicBoolean(false)
    val latch = CountDownLatch(1)

    mainHandler.post {
      removeCurrentOverlay(windowManager)

      val card = FrameLayout(context).apply {
        setBackgroundColor(Color.TRANSPARENT)
        addView(createMessageCard(context, result))
      }

      val layoutParams = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
          WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
          @Suppress("DEPRECATION")
          WindowManager.LayoutParams.TYPE_PHONE
        },
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
          WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
          WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT
      ).apply {
        gravity = Gravity.CENTER
      }

      runCatching {
        windowManager.addView(card, layoutParams)
        overlayView = card
        dismissRunnable = Runnable { removeCurrentOverlay(windowManager) }.also {
          mainHandler.postDelayed(it, DISMISS_DELAY_MS)
        }
        didShow.set(true)
      }
      latch.countDown()
    }

    latch.await(400, TimeUnit.MILLISECONDS)
    return didShow.get()
  }

  private fun createMessageCard(
    context: Context,
    result: HardwareScannerResultPayload
  ): View {
    val density = context.resources.displayMetrics.density
    val horizontalMargin = (24 * density).toInt()
    val horizontalPadding = (22 * density).toInt()
    val verticalPadding = (20 * density).toInt()
    val cardWidth = (context.resources.displayMetrics.widthPixels - horizontalMargin * 2)
      .coerceAtMost((340 * density).toInt())

    val statusPill = TextView(context).apply {
      text = if (result.success) "SUCCESS" else "ERROR"
      setTextColor(Color.WHITE)
      textSize = 12f
      gravity = Gravity.CENTER
      setTypeface(typeface, Typeface.BOLD)
      setPadding((16 * density).toInt(), (7 * density).toInt(), (16 * density).toInt(), (7 * density).toInt())
      background = GradientDrawable().apply {
        cornerRadius = 999 * density
        setColor(if (result.success) "#3E8B2B".toColorInt() else "#8B2E2E".toColorInt())
      }
    }

    val titleView = TextView(context).apply {
      text = if (result.success) "Scan Successful" else "Scan Status"
      setTextColor(Color.WHITE)
      textSize = 20f
      gravity = Gravity.CENTER
      setTypeface(typeface, Typeface.BOLD)
    }

    val messageView = TextView(context).apply {
      text = result.message
      setTextColor("#E5E7EB".toColorInt())
      textSize = 15f
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.12f)
    }

    val content = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      addView(statusPill, LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      ))
      addView(titleView, LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = (14 * density).toInt()
      })
      addView(messageView, LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      ).apply {
        topMargin = (10 * density).toInt()
      })
    }

    return FrameLayout(context).apply {
      setPadding(horizontalPadding, verticalPadding, horizontalPadding, verticalPadding)
      background = android.graphics.drawable.GradientDrawable().apply {
        cornerRadius = 22 * density
        setColor("#000000".toColorInt())
        setStroke((2 * density).toInt(), "#3E8B2B".toColorInt())
      }
      layoutParams = FrameLayout.LayoutParams(cardWidth, FrameLayout.LayoutParams.WRAP_CONTENT).apply {
        gravity = Gravity.CENTER
      }
      elevation = 16 * density
      addView(content, FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.WRAP_CONTENT
      ))
    }
  }

  private fun removeCurrentOverlay(windowManager: WindowManager) {
    dismissRunnable?.let(mainHandler::removeCallbacks)
    dismissRunnable = null
    overlayView?.let { view ->
      runCatching {
        if (view.isAttachedToWindow) {
          windowManager.removeView(view)
        }
      }
    }
    overlayView = null
  }
}
