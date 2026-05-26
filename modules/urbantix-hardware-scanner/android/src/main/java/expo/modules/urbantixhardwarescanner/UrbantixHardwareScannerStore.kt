package expo.modules.urbantixhardwarescanner

import android.content.Context
import org.json.JSONObject

internal object UrbantixHardwareScannerStore {
  private fun preferences(context: Context) =
    context.applicationContext.getSharedPreferences(
      UrbantixHardwareScannerConstants.PREFS_NAME,
      Context.MODE_PRIVATE
    )

  fun saveSession(context: Context, session: Map<String, Any?>) {
    val json = JSONObject()
    json.put("authToken", session["authToken"]?.toString().orEmpty())
    json.put(
      "baseUrl",
      session["baseUrl"]?.toString()?.takeIf { it.isNotBlank() }
        ?: UrbantixHardwareScannerConstants.DEFAULT_BASE_URL
    )
    json.put("mode", session["mode"]?.toString()?.ifBlank { "ticket" } ?: "ticket")
    json.put("eventId", session["eventId"]?.toIntOrNull())
    json.put("userId", session["userId"]?.toIntOrNull())

    preferences(context)
      .edit()
      .putString(UrbantixHardwareScannerConstants.SESSION_KEY, json.toString())
      .apply()
  }

  fun getSession(context: Context): HardwareScannerSessionPayload? {
    val rawJson = preferences(context).getString(UrbantixHardwareScannerConstants.SESSION_KEY, null)
      ?: return null
    val json = JSONObject(rawJson)
    val authToken = json.optString("authToken")
    val baseUrl = json.optString("baseUrl", UrbantixHardwareScannerConstants.DEFAULT_BASE_URL)
    val mode = json.optString("mode", "ticket")

    return HardwareScannerSessionPayload(
      authToken = authToken,
      baseUrl = baseUrl,
      mode = mode,
      eventId = json.optIntOrNull("eventId"),
      userId = json.optIntOrNull("userId")
    )
  }

  fun clearSession(context: Context) {
    preferences(context)
      .edit()
      .remove(UrbantixHardwareScannerConstants.SESSION_KEY)
      .apply()
  }

  fun savePendingScanResult(context: Context, result: HardwareScannerResultPayload) {
    val json = JSONObject()
    json.put("scannedCode", result.scannedCode)
    json.put("success", result.success)
    json.put("message", result.message)
    json.put("mode", result.mode)
    json.put("source", result.source)
    json.put("processedAt", result.processedAt)

    preferences(context)
      .edit()
      .putString(UrbantixHardwareScannerConstants.PENDING_RESULT_KEY, json.toString())
      .apply()
  }

  fun getPendingScanResult(context: Context): Map<String, Any>? {
    return getPendingScanResultPayload(context)?.toMap()
  }

  fun getPendingScanResultPayload(context: Context): HardwareScannerResultPayload? {
    val rawJson =
      preferences(context).getString(UrbantixHardwareScannerConstants.PENDING_RESULT_KEY, null)
        ?: return null
    val json = JSONObject(rawJson)

    return HardwareScannerResultPayload(
      scannedCode = json.optString("scannedCode"),
      success = json.optBoolean("success"),
      message = json.optString("message"),
      mode = json.optString("mode", "unknown"),
      source = json.optString("source", "hardware"),
      processedAt = json.optLong("processedAt", System.currentTimeMillis())
    )
  }

  fun clearPendingScanResult(context: Context) {
    preferences(context)
      .edit()
      .remove(UrbantixHardwareScannerConstants.PENDING_RESULT_KEY)
      .apply()
  }
}

private fun Any?.toIntOrNull(): Int? {
  return when (this) {
    is Int -> this
    is Long -> toInt()
    is Double -> toInt()
    is Float -> toInt()
    is String -> toIntOrNull()
    else -> null
  }
}

private fun JSONObject.optIntOrNull(key: String): Int? {
  if (isNull(key)) {
    return null
  }
  return optInt(key)
}
