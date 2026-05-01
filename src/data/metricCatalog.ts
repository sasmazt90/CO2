import { DailyMetrics, ScoreGroup } from '../engine/types';

export interface MetricDefinition {
  key: keyof DailyMetrics;
  label: string;
  group: ScoreGroup;
  subcategory: string;
  unit: 'count' | 'minutes' | 'percent' | 'boolean' | 'mb' | 'steps' | 'celsius';
  ruleIds: string[];
}

const defineMetric = (metric: MetricDefinition) => metric;

export const metricCatalog: MetricDefinition[] = [
  defineMetric({ key: 'avgBrightness', label: 'Brightness', group: 'Device Energy', subcategory: 'Display', unit: 'percent', ruleIds: ['brightness_high', 'brightness_positive'] }),
  defineMetric({ key: 'screenTime', label: 'Screen Time', group: 'Device Energy', subcategory: 'Display', unit: 'minutes', ruleIds: ['screen_time_high', 'screen_time_positive'] }),
  defineMetric({ key: 'idleScreenOn', label: 'Idle Screen-On', group: 'Device Energy', subcategory: 'Display', unit: 'minutes', ruleIds: ['idle_screen_on_high'] }),
  defineMetric({ key: 'avgTemp', label: 'Phone Temperature', group: 'Device Energy', subcategory: 'Thermals', unit: 'celsius', ruleIds: ['phone_temperature_high', 'phone_temperature_positive'] }),
  defineMetric({ key: 'btOnTime', label: 'Bluetooth Usage', group: 'Device Energy', subcategory: 'Connectivity', unit: 'minutes', ruleIds: ['bluetooth_usage_high', 'bluetooth_usage_positive'] }),
  defineMetric({ key: 'btActiveDevices', label: 'Bluetooth Active Devices', group: 'Device Energy', subcategory: 'Connectivity', unit: 'count', ruleIds: ['bluetooth_usage_high'] }),
  defineMetric({ key: 'locationRequests', label: 'Location Polling', group: 'Device Energy', subcategory: 'Connectivity', unit: 'count', ruleIds: ['location_polling_high'] }),
  defineMetric({ key: 'locationAlwaysOnApps', label: 'Always-on Location Apps', group: 'Device Energy', subcategory: 'Connectivity', unit: 'count', ruleIds: ['location_polling_positive'] }),
  defineMetric({ key: 'hotspotDuration', label: 'Hotspot Usage', group: 'Device Energy', subcategory: 'Connectivity', unit: 'minutes', ruleIds: ['hotspot_usage_high'] }),
  defineMetric({ key: 'sleepEnergy', label: 'Sleep-mode Drain', group: 'Device Energy', subcategory: 'Standby', unit: 'count', ruleIds: ['sleep_mode_drain_high', 'sleep_mode_drain_positive'] }),
  defineMetric({ key: 'sleepBaseline', label: 'Sleep Baseline', group: 'Device Energy', subcategory: 'Standby', unit: 'count', ruleIds: ['sleep_mode_drain_high', 'sleep_mode_drain_positive'] }),
  defineMetric({ key: 'backgroundActiveApps', label: 'Background Processes', group: 'Device Energy', subcategory: 'Standby', unit: 'count', ruleIds: ['background_processes_high', 'background_processes_positive'] }),
  defineMetric({ key: 'widgetCount', label: 'Widgets & Live Activities', group: 'Device Energy', subcategory: 'Standby', unit: 'count', ruleIds: ['widgets_live_activities_high', 'widgets_live_activities_positive'] }),
  defineMetric({ key: 'liveWallpaperEnabled', label: 'Live Wallpapers', group: 'Device Energy', subcategory: 'Standby', unit: 'boolean', ruleIds: ['live_wallpapers_high'] }),

  defineMetric({ key: 'mobileDataUsage', label: 'Mobile Data Usage', group: 'Network & Cloud', subcategory: 'Data Transfer', unit: 'mb', ruleIds: ['mobile_data_usage_high', 'mobile_data_usage_positive'] }),
  defineMetric({ key: 'videoStreamingTime', label: 'High-Data Streaming', group: 'Network & Cloud', subcategory: 'Streaming', unit: 'minutes', ruleIds: ['high_data_streaming_high', 'high_data_streaming_positive'] }),
  defineMetric({ key: 'largeMobileTransfers', label: 'Large Mobile Transfers', group: 'Network & Cloud', subcategory: 'Data Transfer', unit: 'mb', ruleIds: ['large_mobile_transfers_high'] }),
  defineMetric({ key: 'cloudSyncSessions', label: 'Cloud Sync Bursts', group: 'Network & Cloud', subcategory: 'Sync & Backup', unit: 'count', ruleIds: ['cloud_sync_bursts_high', 'cloud_sync_bursts_positive'] }),
  defineMetric({ key: 'autoplayVideosCount', label: 'Auto-play', group: 'Network & Cloud', subcategory: 'Streaming', unit: 'count', ruleIds: ['autoplay_high'] }),
  defineMetric({ key: 'mobileUpdatesData', label: 'Updates on Mobile', group: 'Network & Cloud', subcategory: 'Data Transfer', unit: 'mb', ruleIds: ['updates_on_mobile_high'] }),
  defineMetric({ key: 'vpnUsageTime', label: 'VPN', group: 'Network & Cloud', subcategory: 'Connection Quality', unit: 'minutes', ruleIds: ['vpn_high'] }),
  defineMetric({ key: 'lowSignalTime', label: 'Weak Signal', group: 'Network & Cloud', subcategory: 'Connection Quality', unit: 'minutes', ruleIds: ['weak_signal_high', 'weak_signal_positive'] }),
  defineMetric({ key: 'multiDeviceSyncEvents', label: 'Multi-Device Sync', group: 'Network & Cloud', subcategory: 'Sync & Backup', unit: 'count', ruleIds: ['multi_device_sync_high'] }),
  defineMetric({ key: 'backupRunsPerDay', label: 'Auto-backup Frequency', group: 'Network & Cloud', subcategory: 'Sync & Backup', unit: 'count', ruleIds: ['auto_backup_frequency_high'] }),

  defineMetric({ key: 'speakerCallTime', label: 'Speakerphone', group: 'Audio', subcategory: 'Calls', unit: 'minutes', ruleIds: ['speakerphone_high', 'speakerphone_positive'] }),
  defineMetric({ key: 'avgMusicVolume', label: 'High-Volume Music', group: 'Audio', subcategory: 'Playback', unit: 'percent', ruleIds: ['high_volume_music_high', 'high_volume_music_positive'] }),
  defineMetric({ key: 'musicListeningTime', label: 'Long Music Sessions', group: 'Audio', subcategory: 'Playback', unit: 'minutes', ruleIds: ['long_music_sessions_high'] }),
  defineMetric({ key: 'singleCallDuration', label: 'Long Calls', group: 'Audio', subcategory: 'Calls', unit: 'minutes', ruleIds: ['long_calls_high'] }),
  defineMetric({ key: 'callCount', label: 'Frequent Call Bursts', group: 'Audio', subcategory: 'Calls', unit: 'count', ruleIds: ['frequent_call_bursts_high'] }),
  defineMetric({ key: 'btAudioTime', label: 'Bluetooth Audio', group: 'Audio', subcategory: 'Playback', unit: 'minutes', ruleIds: ['bluetooth_audio_high'] }),

  defineMetric({ key: 'socialMediaTime', label: 'Social Media Time', group: 'Behavioral', subcategory: 'Attention', unit: 'minutes', ruleIds: ['social_media_time_high', 'social_media_time_positive'] }),
  defineMetric({ key: 'notificationsPerDay', label: 'Notification Bursts', group: 'Behavioral', subcategory: 'Attention', unit: 'count', ruleIds: ['notification_bursts_high'] }),
  defineMetric({ key: 'shortVehicleTrips', label: 'Short-Trip Vehicle Behavior', group: 'Behavioral', subcategory: 'Mobility', unit: 'count', ruleIds: ['short_trip_vehicle_behavior_high'] }),
  defineMetric({ key: 'steps', label: 'Low Movement', group: 'Behavioral', subcategory: 'Mobility', unit: 'steps', ruleIds: ['low_movement_high'] }),
  defineMetric({ key: 'unusedAppsCount', label: 'Unused Apps', group: 'Behavioral', subcategory: 'Digital Hygiene', unit: 'count', ruleIds: ['unused_apps_high'] }),
  defineMetric({ key: 'duplicateMedia', label: 'Digital Clutter', group: 'Behavioral', subcategory: 'Digital Hygiene', unit: 'count', ruleIds: ['digital_clutter_high'] }),
  defineMetric({ key: 'compressionTasks', label: 'File Compression', group: 'Behavioral', subcategory: 'Digital Hygiene', unit: 'count', ruleIds: ['file_compression_high'] }),
  defineMetric({ key: 'heavyAppOpens', label: 'Heavy App Startup Frequency', group: 'Behavioral', subcategory: 'Attention', unit: 'count', ruleIds: ['heavy_app_startups_high'] }),

  defineMetric({ key: 'timeAt100WhilePlugged', label: 'Overcharging at 100%', group: 'Charging', subcategory: 'Charge Window', unit: 'minutes', ruleIds: ['overcharging_high', 'overcharging_positive'] }),
  defineMetric({ key: 'chargingBetween00_06', label: 'Overnight Charging', group: 'Charging', subcategory: 'Charge Window', unit: 'minutes', ruleIds: ['overnight_charging_high'] }),
  defineMetric({ key: 'chargeSessions', label: 'Frequent Charge Cycles', group: 'Charging', subcategory: 'Charge Behavior', unit: 'count', ruleIds: ['frequent_charge_cycles_high'] }),
  defineMetric({ key: 'fastChargeSessions', label: 'Fast Charging', group: 'Charging', subcategory: 'Charge Behavior', unit: 'count', ruleIds: ['fast_charging_high'] }),
  defineMetric({ key: 'timeBelow20', label: 'Battery Below 20%', group: 'Charging', subcategory: 'Charge Window', unit: 'minutes', ruleIds: ['charging_outside_zone_high'] }),
  defineMetric({ key: 'timeAbove80', label: 'Battery Above 80%', group: 'Charging', subcategory: 'Charge Window', unit: 'minutes', ruleIds: ['charging_outside_zone_high'] }),

  defineMetric({ key: 'cpuHighUsage', label: 'CPU Spikes', group: 'Processing & Sensors', subcategory: 'Processing', unit: 'count', ruleIds: ['cpu_spikes_high'] }),
  defineMetric({ key: 'backgroundComputeTime', label: 'Background Compute', group: 'Processing & Sensors', subcategory: 'Processing', unit: 'minutes', ruleIds: ['background_compute_high'] }),
  defineMetric({ key: 'backgroundComputeBaseline', label: 'Background Compute Baseline', group: 'Processing & Sensors', subcategory: 'Processing', unit: 'minutes', ruleIds: ['background_compute_high'] }),
  defineMetric({ key: 'navigationTime', label: 'Navigation Usage', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'minutes', ruleIds: ['navigation_usage_high'] }),
  defineMetric({ key: 'cameraUsage', label: 'Camera Usage', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'minutes', ruleIds: ['camera_usage_high'] }),
  defineMetric({ key: 'recorded4KVideo', label: '4K Video Recording', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'boolean', ruleIds: ['video_recording_4k_high'] }),
  defineMetric({ key: 'gyroActiveApps', label: 'Gyroscope-heavy Usage', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'count', ruleIds: ['gyroscope_heavy_usage_high'] }),
  defineMetric({ key: 'arAppUsage', label: 'AR Apps', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'minutes', ruleIds: ['ar_apps_high'] }),
  defineMetric({ key: 'proximityActiveTime', label: 'Proximity Sensor', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'minutes', ruleIds: ['proximity_sensor_high'] }),
  defineMetric({ key: 'proximityBaseline', label: 'Proximity Baseline', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'minutes', ruleIds: ['proximity_sensor_high'] }),
  defineMetric({ key: 'faceIDUnlocks', label: 'Face ID IR Projector', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'count', ruleIds: ['face_id_ir_projector_high'] }),
  defineMetric({ key: 'faceIDBaseline', label: 'Face ID Baseline', group: 'Processing & Sensors', subcategory: 'Sensors', unit: 'count', ruleIds: ['face_id_ir_projector_high'] }),
  defineMetric({ key: 'radioHighPowerTime', label: 'Radio Power Boost', group: 'Processing & Sensors', subcategory: 'Wireless Power', unit: 'minutes', ruleIds: ['radio_power_high'] }),
];

export const metricGroups: ScoreGroup[] = [
  'Device Energy',
  'Network & Cloud',
  'Audio',
  'Behavioral',
  'Charging',
  'Processing & Sensors',
];

export const metricsByGroup = metricGroups.map((group) => ({
  group,
  metrics: metricCatalog.filter((metric) => metric.group === group),
}));

export const allTrackableMetricKeys = metricCatalog.map((metric) => metric.key);
