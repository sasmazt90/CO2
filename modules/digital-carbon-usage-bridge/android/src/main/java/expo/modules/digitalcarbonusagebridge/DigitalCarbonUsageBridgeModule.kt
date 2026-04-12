package expo.modules.digitalcarbonusagebridge

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Process
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class DigitalCarbonUsageBridgeModule : Module() {
  private val supportedMetrics = listOf(
    "screenTimeMinutes",
    "socialMediaMinutes",
    "videoStreamingMinutes",
    "heavyAppOpens",
    "unusedAppsCount"
  )
  private val socialPackages = listOf(
    "instagram",
    "facebook",
    "tiktok",
    "snapchat",
    "twitter",
    "x.",
    "reddit",
    "linkedin",
    "pinterest",
    "threads"
  )

  private val videoPackages = listOf(
    "youtube",
    "netflix",
    "primevideo",
    "disney",
    "twitch",
    "hulu",
    "max",
    "vlc",
    "plex"
  )

  override fun definition() = ModuleDefinition {
    Name("DigitalCarbonUsageBridge")

    Function("getBridgeStatus") {
      buildBridgeStatus()
    }

    AsyncFunction("getTodayUsageSnapshot") {
      if (!isUsageAccessGranted()) {
        null
      } else {
        buildUsageSnapshot()
      }
    }

    AsyncFunction("openUsageAccessSettings") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      }

      context.startActivity(intent)
      true
    }
  }

  private fun buildBridgeStatus(): Map<String, Any> = mapOf(
    "moduleName" to "DigitalCarbonUsageBridge",
    "platform" to "android",
    "installed" to true,
    "supportsDeviceWideUsage" to true,
    "accessGranted" to isUsageAccessGranted(),
    "requiresManualAccess" to true,
    "canOpenSettings" to true,
    "supportedMetrics" to supportedMetrics,
    "note" to if (isUsageAccessGranted()) {
      "Android usage access is active, so device-wide app usage can feed the score."
    } else {
      "Android usage access still needs to be enabled in system settings before device-wide app usage can be read."
    }
  )

  private fun isUsageAccessGranted(): Boolean {
    val context = appContext.reactContext ?: return false
    val appOpsManager = context.getSystemService(Context.APP_OPS_SERVICE) as? AppOpsManager
      ?: return false

    val mode = appOpsManager.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      context.packageName
    )

    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun buildUsageSnapshot(): Map<String, Any> {
    val context = appContext.reactContext ?: return emptyMap()
    val usageStatsManager =
      context.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
        ?: return emptyMap()
    val end = System.currentTimeMillis()
    val start = startOfDayMillis()
    val stats = usageStatsManager.queryUsageStats(
      UsageStatsManager.INTERVAL_DAILY,
      start,
      end
    )
    val launcherPackages = queryLaunchablePackages(context)
    val unusedAppsCount = countUnusedLaunchableApps(usageStatsManager, launcherPackages, end)

    if (stats.isNullOrEmpty()) {
      return mapOf(
        "collectedAt" to formatUtc(end),
        "observedAppsCount" to 0,
        "supportsCategoryBreakdown" to true,
        "providedMetrics" to supportedMetrics,
        "unusedAppsCount" to unusedAppsCount
      )
    }

    val filteredStats = stats
      .filter { it.totalTimeInForeground > 0L && !isOwnPackage(it.packageName ?: "") }
    val totalForegroundMinutes = filteredStats.sumOf { it.totalTimeInForeground } / 60000.0
    val socialMinutes = filteredStats
      .filter { matchesAny(it.packageName ?: "", socialPackages) }
      .sumOf { it.totalTimeInForeground } / 60000.0
    val videoMinutes = filteredStats
      .filter { matchesAny(it.packageName ?: "", videoPackages) }
      .sumOf { it.totalTimeInForeground } / 60000.0

    return mapOf(
      "collectedAt" to formatUtc(end),
      "screenTimeMinutes" to totalForegroundMinutes,
      "socialMediaMinutes" to socialMinutes,
      "videoStreamingMinutes" to videoMinutes,
      "heavyAppOpens" to countHeavyAppForegroundEvents(usageStatsManager, start, end),
      "unusedAppsCount" to unusedAppsCount,
      "observedAppsCount" to filteredStats.size,
      "supportsCategoryBreakdown" to true,
      "providedMetrics" to supportedMetrics
    )
  }

  private fun countHeavyAppForegroundEvents(
    usageStatsManager: UsageStatsManager,
    start: Long,
    end: Long
  ): Int {
    val events = usageStatsManager.queryEvents(start, end)
    val event = UsageEvents.Event()
    var count = 0

    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      val packageName = event.packageName ?: continue

      if (isOwnPackage(packageName)) {
        continue
      }

      val movedToForeground =
        event.eventType == UsageEvents.Event.ACTIVITY_RESUMED ||
          event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND

      if (movedToForeground && (matchesAny(packageName, socialPackages) || matchesAny(packageName, videoPackages))) {
        count += 1
      }
    }

    return count
  }

  private fun matchesAny(packageName: String, patterns: List<String>): Boolean {
    val normalized = packageName.lowercase(Locale.US)
    return patterns.any { normalized.contains(it) }
  }

  private fun queryLaunchablePackages(context: Context): Set<String> {
    val packageManager = context.packageManager
    val launcherIntent = Intent(Intent.ACTION_MAIN).apply {
      addCategory(Intent.CATEGORY_LAUNCHER)
    }

    return packageManager.queryIntentActivities(launcherIntent, PackageManager.MATCH_ALL)
      .mapNotNull { it.activityInfo?.packageName }
      .filterNot { isOwnPackage(it) }
      .toSet()
  }

  private fun countUnusedLaunchableApps(
    usageStatsManager: UsageStatsManager,
    launcherPackages: Set<String>,
    end: Long
  ): Int {
    if (launcherPackages.isEmpty()) {
      return 0
    }

    val lookbackStart = end - 30L * 24L * 60L * 60L * 1000L
    val monthlyStats = usageStatsManager.queryUsageStats(
      UsageStatsManager.INTERVAL_BEST,
      lookbackStart,
      end
    )

    if (monthlyStats.isNullOrEmpty()) {
      return launcherPackages.size
    }

    val recentlyUsedPackages = monthlyStats
      .filter {
        !isOwnPackage(it.packageName ?: "") &&
          (it.totalTimeInForeground > 0L || it.lastTimeUsed > lookbackStart)
      }
      .mapNotNull { it.packageName }
      .toSet()

    return launcherPackages.count { !recentlyUsedPackages.contains(it) }
  }

  private fun isOwnPackage(packageName: String): Boolean {
    val context = appContext.reactContext ?: return false
    return packageName == context.packageName
  }

  private fun startOfDayMillis(): Long {
    val calendar = java.util.Calendar.getInstance()
    calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
    calendar.set(java.util.Calendar.MINUTE, 0)
    calendar.set(java.util.Calendar.SECOND, 0)
    calendar.set(java.util.Calendar.MILLISECOND, 0)
    return calendar.timeInMillis
  }

  private fun formatUtc(timestamp: Long): String {
    val formatter = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
    formatter.timeZone = TimeZone.getTimeZone("UTC")
    return formatter.format(Date(timestamp))
  }
}
