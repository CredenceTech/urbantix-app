package expo.modules.urbantixhardwarescanner

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import org.json.JSONObject
import java.io.BufferedReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicInteger

internal object UrbantixHardwareScannerProcessor {
  private val executor = Executors.newSingleThreadExecutor()
  private val notificationId = AtomicInteger(4000)

  fun processScanAsync(context: Context, scannedCode: String, finish: () -> Unit) {
    executor.execute {
      try {
        val result = processScan(context, scannedCode)
        UrbantixHardwareScannerStore.savePendingScanResult(context, result)
        UrbantixHardwareScannerRegistry.dispatch(result)
        showResultSurface(context, result)
      } finally {
        finish()
      }
    }
  }

  private fun processScan(context: Context, scannedCode: String): HardwareScannerResultPayload {
    val session = UrbantixHardwareScannerStore.getSession(context)
      ?: return HardwareScannerResultPayload(
        scannedCode = scannedCode,
        success = false,
        message = "Scanner session is not configured. Please open the scanner screen again.",
        mode = "unknown"
      )

    if (session.authToken.isBlank()) {
      return HardwareScannerResultPayload(
        scannedCode = scannedCode,
        success = false,
        message = "Missing authentication token. Please login again.",
        mode = session.mode
      )
    }

    if (session.mode == "student" && (session.eventId == null || session.userId == null)) {
      return HardwareScannerResultPayload(
        scannedCode = scannedCode,
        success = false,
        message = "Student pass scanner is missing event or user information.",
        mode = session.mode
      )
    }

    return try {
      val endpoint = when (session.mode) {
        "student" -> "students/checkins"
        else -> "transactions/barcodeCheckIn"
      }

      val requestBody = JSONObject().apply {
        if (session.mode == "student") {
          put("pass_code", scannedCode)
          put("event_id", session.eventId)
          put("user_id", session.userId)
        } else {
          put("barcode", scannedCode)
        }
      }

      val apiResponse = postJson(
        url = buildUrl(session.baseUrl, endpoint),
        authToken = session.authToken,
        body = requestBody
      )

      HardwareScannerResultPayload(
        scannedCode = scannedCode,
        success = apiResponse.success,
        message = apiResponse.message,
        mode = session.mode
      )
    } catch (error: Exception) {
      HardwareScannerResultPayload(
        scannedCode = scannedCode,
        success = false,
        message = error.message ?: "Unable to process scan right now.",
        mode = session.mode
      )
    }
  }

  private fun buildUrl(baseUrl: String, endpoint: String): String {
    val normalizedBase = if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"
    return normalizedBase + endpoint
  }

  private fun postJson(url: String, authToken: String, body: JSONObject): ApiResponse {
    val connection = (URL(url).openConnection() as HttpURLConnection).apply {
      requestMethod = "POST"
      connectTimeout = 15000
      readTimeout = 15000
      doOutput = true
      setRequestProperty("Accept", "application/json")
      setRequestProperty("Content-Type", "application/json")
      setRequestProperty("Authorization", "Bearer $authToken")
    }

    return try {
      OutputStreamWriter(connection.outputStream, Charsets.UTF_8).use { writer ->
        writer.write(body.toString())
        writer.flush()
      }

      val statusCode = connection.responseCode
      val responseText = (
        if (statusCode in 200..299) connection.inputStream else connection.errorStream
      )?.bufferedReader()?.use(BufferedReader::readText).orEmpty()

      val responseJson = responseText.toJSONObjectOrNull()
      ApiResponse(
        success = responseJson?.optBoolean("success", statusCode in 200..299) ?: (statusCode in 200..299),
        message = responseJson?.optString("message")?.takeIf { it.isNotBlank() }
          ?: "Scan processed."
      )
    } finally {
      connection.disconnect()
    }
  }

  private fun showResultSurface(context: Context, result: HardwareScannerResultPayload) {
    if (isAppInForeground()) {
      return
    }

    if (UrbantixHardwareScannerOverlay.show(context, result)) {
      return
    }

    showNotification(context, result)
  }

  private fun isAppInForeground(): Boolean {
    return UrbantixHardwareScannerRuntimeState.isAppInForeground
  }

  private fun showNotification(context: Context, result: HardwareScannerResultPayload) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
      ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.POST_NOTIFICATIONS
      ) != PackageManager.PERMISSION_GRANTED
    ) {
      return
    }

    val notificationManager =
      context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        UrbantixHardwareScannerConstants.NOTIFICATION_CHANNEL_ID,
        UrbantixHardwareScannerConstants.NOTIFICATION_CHANNEL_NAME,
        NotificationManager.IMPORTANCE_DEFAULT
      )
      notificationManager.createNotificationChannel(channel)
    }

    val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
    val pendingIntent = PendingIntent.getActivity(
      context,
      0,
      launchIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val notification = NotificationCompat.Builder(
      context,
      UrbantixHardwareScannerConstants.NOTIFICATION_CHANNEL_ID
    )
      .setSmallIcon(android.R.drawable.ic_menu_camera)
      .setContentTitle(if (result.success) "Scan Successful" else "Scan Status")
      .setContentText(result.message)
      .setStyle(NotificationCompat.BigTextStyle().bigText(result.message))
      .setAutoCancel(true)
      .setContentIntent(pendingIntent)
      .build()

    NotificationManagerCompat.from(context).notify(notificationId.incrementAndGet(), notification)
  }
}

internal data class ApiResponse(
  val success: Boolean,
  val message: String
)

private fun String.toJSONObjectOrNull(): JSONObject? {
  return runCatching { JSONObject(this) }.getOrNull()
}
