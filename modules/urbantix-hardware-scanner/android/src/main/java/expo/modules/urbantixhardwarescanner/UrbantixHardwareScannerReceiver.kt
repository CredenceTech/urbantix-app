package expo.modules.urbantixhardwarescanner

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class UrbantixHardwareScannerReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != UrbantixHardwareScannerConstants.RESULT_ACTION) {
      return
    }

    val scannedCode = intent.getStringExtra(UrbantixHardwareScannerConstants.RESULT_DATA_KEY)
      ?.trim()
      ?.takeIf { it.isNotEmpty() }
      ?: return

    if (
      UrbantixHardwareScannerRuntimeState.isAppInForeground ||
      UrbantixHardwareScannerRuntimeState.isScannerServiceActive
    ) {
      return
    }

    val pendingResult = goAsync()
    UrbantixHardwareScannerProcessor.processScanAsync(
      context = context.applicationContext,
      scannedCode = scannedCode,
      finish = { pendingResult.finish() }
    )
  }
}
