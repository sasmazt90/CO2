package expo.modules.digitalcarbonusagebridge

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Process
import android.net.TrafficStats
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class DigitalCarbonUsageBridgeModule : Module() {
  private val baseSupportedMetrics = listOf(
    "screenTimeMinutes",
    "socialMediaMinutes",
    "videoStreamingMinutes",
    "musicListeningMinutes",
    "navigationMinutes",
    "cameraMinutes",
    "arUsageMinutes",
    "heavyAppOpens",
    "unusedAppsCount",
    "mobileDataUsageMb"
  )
  private val socialPackages = listOf(
    "com.instagram.android",
    "com.zhiliaoapp.musically",
    "com.snapchat.android",
    "com.facebook.katana",
    "com.facebook.orca",
    "com.reddit.frontpage",
    "com.linkedin.android",
    "com.twitter.android",
    "com.threadsapp",
    "com.pinterest",
    "com.discord",
    "org.telegram.messenger",
    "com.whatsapp",
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
    ,
    "discord",
    "telegram",
    "whatsapp",
    "messenger"
  )

  private val videoPackages = listOf(
    "com.google.android.youtube",
    "com.netflix.mediaclient",
    "tv.twitch.android.app",
    "com.disney.disneyplus",
    "com.amazon.avod.thirdpartyclient",
    "com.hulu.plus",
    "com.wbd.stream",
    "com.google.android.videos",
    "org.videolan.vlc",
    "com.plexapp.android",
    "com.google.android.apps.youtube.music",
    "youtube",
    "netflix",
    "primevideo",
    "disney",
    "twitch",
    "hulu",
    "max",
    "vlc",
    "plex",
    "video",
    "player"
  )

  private val musicPackages = listOf(
    "com.spotify.music",
    "com.apple.android.music",
    "com.google.android.apps.youtube.music",
    "deezer.android.app",
    "com.soundcloud.android",
    "com.amazon.mp3",
    "com.bandcamp.android",
    "com.pandora.android",
    "com.aspiro.tidal",
    "spotify",
    "music",
    "soundcloud",
    "deezer",
    "tidal",
    "pandora",
    "bandcamp",
    "audio"
  )

  private val navigationPackages = listOf(
    "com.google.android.apps.maps",
    "com.waze",
    "com.here.app.maps",
    "com.tomtom.gplay.navapp",
    "com.sygic.aura",
    "maps",
    "waze",
    "nav",
    "navigation",
    "sygic",
    "tomtom"
  )

  private val cameraPackages = listOf(
    "com.android.camera",
    "com.google.android.GoogleCamera",
    "com.sec.android.app.camera",
    "com.oplus.camera",
    "com.oneplus.camera",
    "com.miui.camera",
    "camera",
    "cam",
    "gcam"
  )

  private val arPackages = listOf(
    "com.nianticlabs.pokemongo",
    "com.google.ar.core",
    "com.microsoft.mesh",
    "com.ikea.place",
    "pokemon",
    "arcore",
    "augmented",
    "spatial",
    "ar."
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
    "supportedMetrics" to supportedMetrics(),
    "note" to if (isUsageAccessGranted()) {
      "Android usage access is active, so device-wide app usage can feed the score. Mobile data totals are tracked from the first native bridge sync of the day."
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
    val mobileDataUsageMb = getTodayMobileDataUsageMb(context, end)
    val providedMetrics = supportedMetrics(mobileDataUsageMb != null)

    if (stats.isNullOrEmpty()) {
      val snapshot = mutableMapOf<String, Any>(
        "collectedAt" to formatUtc(end),
        "observedAppsCount" to 0,
        "supportsCategoryBreakdown" to true,
        "providedMetrics" to providedMetrics,
        "unusedAppsCount" to unusedAppsCount,
      )
      if (mobileDataUsageMb != null) {
        snapshot["mobileDataUsageMb"] = mobileDataUsageMb
      }
      return snapshot
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
    val musicMinutes = filteredStats
      .filter { matchesAny(it.packageName ?: "", musicPackages) }
      .sumOf { it.totalTimeInForeground } / 60000.0
    val navigationMinutes = filteredStats
      .filter { matchesAny(it.packageName ?: "", navigationPackages) }
      .sumOf { it.totalTimeInForeground } / 60000.0
    val cameraMinutes = filteredStats
      .filter { matchesAny(it.packageName ?: "", cameraPackages) }
      .sumOf { it.totalTimeInForeground } / 60000.0
    val arUsageMinutes = filteredStats
      .filter { matchesAny(it.packageName ?: "", arPackages) }
      .sumOf { it.totalTimeInForeground } / 60000.0

    val snapshot = mutableMapOf<String, Any>(
      "collectedAt" to formatUtc(end),
      "screenTimeMinutes" to totalForegroundMinutes,
      "socialMediaMinutes" to socialMinutes,
      "videoStreamingMinutes" to videoMinutes,
      "musicListeningMinutes" to musicMinutes,
      "navigationMinutes" to navigationMinutes,
      "cameraMinutes" to cameraMinutes,
      "arUsageMinutes" to arUsageMinutes,
      "heavyAppOpens" to countHeavyAppForegroundEvents(usageStatsManager, start, end),
      "unusedAppsCount" to unusedAppsCount,
      "observedAppsCount" to filteredStats.size,
      "supportsCategoryBreakdown" to true,
      "providedMetrics" to providedMetrics
    )
    if (mobileDataUsageMb != null) {
      snapshot["mobileDataUsageMb"] = mobileDataUsageMb
    }
    return snapshot
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

  private fun getTodayMobileDataUsageMb(context: Context, end: Long): Double? {
    val totalBytes = getTotalMobileBytes() ?: return null
    val preferences = context.getSharedPreferences(
      "digital-carbon-usage-bridge",
      Context.MODE_PRIVATE
    )
    val dayKey = localDayKey(end)
    val storedDayKey = preferences.getString("mobile_bytes_day", null)
    val storedBaseline = preferences.getLong("mobile_bytes_baseline", -1L)

    if (storedDayKey != dayKey || storedBaseline < 0L || totalBytes < storedBaseline) {
      preferences.edit()
        .putString("mobile_bytes_day", dayKey)
        .putLong("mobile_bytes_baseline", totalBytes)
        .apply()
      return 0.0
    }

    return (totalBytes - storedBaseline).toDouble() / 1048576.0
  }

  private fun getTotalMobileBytes(): Long? {
    val received = TrafficStats.getMobileRxBytes()
    val sent = TrafficStats.getMobileTxBytes()

    if (
      received == TrafficStats.UNSUPPORTED.toLong() ||
      sent == TrafficStats.UNSUPPORTED.toLong()
    ) {
      return null
    }

    return received + sent
  }

  private fun supportedMetrics(includeMobileData: Boolean = getTotalMobileBytes() != null): List<String> {
    return if (includeMobileData) {
      baseSupportedMetrics
    } else {
      baseSupportedMetrics.filterNot { it == "mobileDataUsageMb" }
    }
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

  private fun localDayKey(timestamp: Long): String {
    val formatter = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    return formatter.format(Date(timestamp))
  }
}
