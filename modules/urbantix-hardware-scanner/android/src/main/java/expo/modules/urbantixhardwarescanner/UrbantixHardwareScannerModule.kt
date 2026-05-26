package expo.modules.urbantixhardwarescanner

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.os.Build
import android.provider.Settings
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.lang.ref.WeakReference

class UrbantixHardwareScannerModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available." }

  private var scanObserver: ((Bundle) -> Unit)? = null
  private var runtimeReceiverRegistered = false
  private val runtimeReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      if (intent.action != UrbantixHardwareScannerConstants.RESULT_ACTION) {
        return
      }

      if (!UrbantixHardwareScannerRuntimeState.isAppInForeground) {
        return
      }

      val scannedCode = intent.getStringExtra(UrbantixHardwareScannerConstants.RESULT_DATA_KEY)
        ?.trim()
        ?.takeIf { it.isNotEmpty() }

      if (scannedCode.isNullOrEmpty()) {
        return
      }

      UrbantixHardwareScannerProcessor.processScanAsync(
        context = context.applicationContext,
        scannedCode = scannedCode,
        finish = {}
      )
    }
  }

  override fun definition() = ModuleDefinition {
    Name("UrbantixHardwareScanner")

    Events("onScanResult")

    OnCreate {
      registerRuntimeReceiverIfNeeded()
    }

    OnDestroy {
      unregisterRuntimeReceiverIfNeeded()
    }

    AsyncFunction("configureSession") { session: Map<String, Any?> ->
      UrbantixHardwareScannerStore.saveSession(context, session)
      true
    }

    AsyncFunction("clearSession") {
      UrbantixHardwareScannerStore.clearSession(context)
      true
    }

    AsyncFunction("getPendingScanResult") {
      UrbantixHardwareScannerStore.getPendingScanResult(context)
    }

    AsyncFunction("clearPendingScanResult") {
      UrbantixHardwareScannerStore.clearPendingScanResult(context)
      true
    }

    Function("startScan") {
      context.sendBroadcast(Intent(UrbantixHardwareScannerConstants.SCAN_DOWN_ACTION))
    }

    Function("stopScan") {
      context.sendBroadcast(Intent(UrbantixHardwareScannerConstants.SCAN_UP_ACTION))
    }

    Function("startScannerService") {
      val serviceIntent = Intent(context, UrbantixHardwareScannerService::class.java)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(serviceIntent)
      } else {
        context.startService(serviceIntent)
      }
    }

    Function("stopScannerService") {
      val serviceIntent = Intent(context, UrbantixHardwareScannerService::class.java)
      context.stopService(serviceIntent)
    }

    Function("canDrawOverlays") {
      UrbantixHardwareScannerOverlay.canDrawOverlays(context)
    }

    Function("openOverlayPermissionSettings") {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val intent = Intent(
          Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
          android.net.Uri.parse("package:${context.packageName}")
        ).apply {
          addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
      }
    }

    Function("setAppInForeground") { isForeground: Boolean ->
      UrbantixHardwareScannerRuntimeState.isAppInForeground = isForeground
    }

    OnStartObserving("onScanResult") {
      val weakModule = WeakReference(this@UrbantixHardwareScannerModule)
      val observer: (Bundle) -> Unit = { payload ->
        weakModule.get()?.sendEvent("onScanResult", payload)
      }
      UrbantixHardwareScannerRegistry.observers.add(observer)
      scanObserver = observer

      UrbantixHardwareScannerStore.getPendingScanResultPayload(context)?.let { pendingResult ->
        weakModule.get()?.sendEvent(
          "onScanResult",
          pendingResult.toBundle()
        )
      }
    }

    OnStopObserving("onScanResult") {
      scanObserver?.let {
        UrbantixHardwareScannerRegistry.observers.remove(it)
      }
      scanObserver = null
    }
  }

  private fun registerRuntimeReceiverIfNeeded() {
    if (runtimeReceiverRegistered) {
      return
    }
    val filter = IntentFilter(UrbantixHardwareScannerConstants.RESULT_ACTION)
    context.applicationContext.registerReceiver(runtimeReceiver, filter)
    runtimeReceiverRegistered = true
  }

  private fun unregisterRuntimeReceiverIfNeeded() {
    if (!runtimeReceiverRegistered) {
      return
    }
    runCatching {
      context.applicationContext.unregisterReceiver(runtimeReceiver)
    }
    runtimeReceiverRegistered = false
  }
}

internal object UrbantixHardwareScannerConstants {
  const val MODULE_NAME = "UrbantixHardwareScanner"
  const val PREFS_NAME = "UrbantixHardwareScannerPrefs"
  const val SESSION_KEY = "session"
  const val PENDING_RESULT_KEY = "pending_result"
  const val NOTIFICATION_CHANNEL_ID = "urbantix_hardware_scanner"
  const val NOTIFICATION_CHANNEL_NAME = "Hardware Scanner"
  const val SERVICE_CHANNEL_ID = "urbantix_hardware_scanner_service"
  const val SERVICE_CHANNEL_NAME = "Hardware Scanner Background Service"
  const val SERVICE_NOTIFICATION_ID = 3999
  const val RESULT_ACTION = "com.android.serial.BARCODEPORT_RECEIVEDDATA_ACTION"
  const val RESULT_DATA_KEY = "DATA"
  const val SCAN_DOWN_ACTION = "com.android.action.keyevent.KEYCODE_KEYCODE_SCAN_L_DOWN"
  const val SCAN_UP_ACTION = "com.android.action.keyevent.KEYCODE_KEYCODE_SCAN_L_UP"
  const val DEFAULT_BASE_URL = "https://api.urbantixs.com/api/"
}

internal object UrbantixHardwareScannerRuntimeState {
  @Volatile
  var isAppInForeground: Boolean = false

  @Volatile
  var isScannerServiceActive: Boolean = false
}

internal object UrbantixHardwareScannerRegistry {
  val observers: MutableSet<(Bundle) -> Unit> = mutableSetOf()

  fun dispatch(result: HardwareScannerResultPayload) {
    val payload = result.toBundle()
    observers.toList().forEach { it(payload) }
  }
}

internal data class HardwareScannerSessionPayload(
  val authToken: String,
  val baseUrl: String,
  val mode: String,
  val eventId: Int?,
  val userId: Int?
)

internal data class HardwareScannerResultPayload(
  val scannedCode: String,
  val success: Boolean,
  val message: String,
  val mode: String,
  val source: String = "hardware",
  val processedAt: Long = System.currentTimeMillis()
) {
  fun toBundle(): Bundle = bundleOf(
    "scannedCode" to scannedCode,
    "success" to success,
    "message" to message,
    "mode" to mode,
    "source" to source,
    "processedAt" to processedAt.toDouble()
  )

  fun toMap(): Map<String, Any> = mapOf(
    "scannedCode" to scannedCode,
    "success" to success,
    "message" to message,
    "mode" to mode,
    "source" to source,
    "processedAt" to processedAt.toDouble()
  )
}
