package expo.modules.urbantixhardwarescanner

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

class UrbantixHardwareScannerService : Service() {
  private var receiverRegistered = false

  private val serviceReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      if (intent.action != UrbantixHardwareScannerConstants.RESULT_ACTION) {
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

  override fun onCreate() {
    super.onCreate()
    if (!UrbantixHardwareScannerSupport.isHardwareScannerSupported(applicationContext)) {
      stopSelf()
      return
    }
    UrbantixHardwareScannerRuntimeState.isScannerServiceActive = true
    startForeground(
      UrbantixHardwareScannerConstants.SERVICE_NOTIFICATION_ID,
      createServiceNotification()
    )
    registerReceiverIfNeeded()
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    return START_STICKY
  }

  override fun onDestroy() {
    UrbantixHardwareScannerRuntimeState.isScannerServiceActive = false
    unregisterReceiverIfNeeded()
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = null

  private fun registerReceiverIfNeeded() {
    if (receiverRegistered) {
      return
    }
    val filter = IntentFilter(UrbantixHardwareScannerConstants.RESULT_ACTION)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      applicationContext.registerReceiver(
        serviceReceiver,
        filter,
        Context.RECEIVER_EXPORTED
      )
    } else {
      @Suppress("DEPRECATION")
      applicationContext.registerReceiver(serviceReceiver, filter)
    }
    receiverRegistered = true
  }

  private fun unregisterReceiverIfNeeded() {
    if (!receiverRegistered) {
      return
    }
    runCatching {
      applicationContext.unregisterReceiver(serviceReceiver)
    }
    receiverRegistered = false
  }

  private fun createServiceNotification(): Notification {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        UrbantixHardwareScannerConstants.SERVICE_CHANNEL_ID,
        UrbantixHardwareScannerConstants.SERVICE_CHANNEL_NAME,
        NotificationManager.IMPORTANCE_MIN
      )
      manager.createNotificationChannel(channel)
    }

    return NotificationCompat.Builder(
      this,
      UrbantixHardwareScannerConstants.SERVICE_CHANNEL_ID
    )
      .setSmallIcon(android.R.drawable.ic_menu_camera)
      .setContentTitle("Scanner Ready")
      .setContentText("Hardware scan listener is active")
      .setOngoing(true)
      .setSilent(true)
      .build()
  }
}
