import {
  DailyMetrics,
  HistorySnapshot,
  LiveSignalState,
  PermissionDiagnostic,
  ScoreGroup,
} from '../engine/types';
import { hasDerivedMetricBaseline } from './metricBaselines';

type MetricKey = Exclude<keyof DailyMetrics, 'date'>;

export type MetricReadinessStatus =
  | 'live'
  | 'journal-backed'
  | 'user-confirmed'
  | 'derived'
  | 'estimated'
  | 'native-required'
  | 'blocked';

export interface MetricReadinessItem {
  key: MetricKey;
  label: string;
  group: ScoreGroup;
  status: MetricReadinessStatus;
  sourceLabel: string;
  summary: string;
  valuePreview: string;
}

export interface MetricReadinessSummary {
  totalMetrics: number;
  productionReadyMetrics: number;
  byStatus: Record<MetricReadinessStatus, number>;
  readinessShare: number;
}

const metricDefinitions: Array<{
  key: MetricKey;
  label: string;
  group: ScoreGroup;
}> = [
  { key: 'avgBrightness', label: 'Brightness', group: 'Device Energy' },
  { key: 'screenTime', label: 'Screen Time', group: 'Device Energy' },
  { key: 'idleScreenOn', label: 'Idle Screen-On', group: 'Device Energy' },
  { key: 'avgTemp', label: 'Phone Temperature', group: 'Device Energy' },
  { key: 'btOnTime', label: 'Bluetooth Usage', group: 'Device Energy' },
  { key: 'btActiveDevices', label: 'Bluetooth Active Devices', group: 'Device Energy' },
  { key: 'locationRequests', label: 'Location Polling', group: 'Device Energy' },
  { key: 'locationAlwaysOnApps', label: 'Always-On Location Apps', group: 'Device Energy' },
  { key: 'hotspotDuration', label: 'Hotspot Usage', group: 'Device Energy' },
  { key: 'sleepEnergy', label: 'Sleep-Mode Drain', group: 'Device Energy' },
  { key: 'sleepBaseline', label: 'Sleep Baseline', group: 'Device Energy' },
  { key: 'backgroundActiveApps', label: 'Background Processes', group: 'Device Energy' },
  { key: 'widgetCount', label: 'Widgets & Live Activities', group: 'Device Energy' },
  { key: 'liveWallpaperEnabled', label: 'Live Wallpapers', group: 'Device Energy' },
  { key: 'mobileDataUsage', label: 'Mobile Data Usage', group: 'Network & Cloud' },
  { key: 'videoStreamingTime', label: 'High-Data Streaming', group: 'Network & Cloud' },
  { key: 'largeMobileTransfers', label: 'Large Mobile Transfers', group: 'Network & Cloud' },
  { key: 'cloudSyncSessions', label: 'Cloud Sync Bursts', group: 'Network & Cloud' },
  { key: 'autoplayVideosCount', label: 'Auto-play', group: 'Network & Cloud' },
  { key: 'mobileUpdatesData', label: 'Updates on Mobile', group: 'Network & Cloud' },
  { key: 'vpnUsageTime', label: 'VPN Usage', group: 'Network & Cloud' },
  { key: 'lowSignalTime', label: 'Weak Signal', group: 'Network & Cloud' },
  { key: 'multiDeviceSyncEvents', label: 'Multi-Device Sync', group: 'Network & Cloud' },
  { key: 'backupRunsPerDay', label: 'Auto-backup Frequency', group: 'Network & Cloud' },
  { key: 'speakerCallTime', label: 'Speakerphone', group: 'Audio' },
  { key: 'avgMusicVolume', label: 'High-Volume Music', group: 'Audio' },
  { key: 'musicListeningTime', label: 'Long Music Sessions', group: 'Audio' },
  { key: 'singleCallDuration', label: 'Long Calls', group: 'Audio' },
  { key: 'callCount', label: 'Frequent Call Bursts', group: 'Audio' },
  { key: 'btAudioTime', label: 'Bluetooth Audio', group: 'Audio' },
  { key: 'socialMediaTime', label: 'Social Media Time', group: 'Behavioral' },
  { key: 'notificationsPerDay', label: 'Notification Bursts', group: 'Behavioral' },
  { key: 'shortVehicleTrips', label: 'Short-Trip Vehicle Behavior', group: 'Behavioral' },
  { key: 'steps', label: 'Low Movement', group: 'Behavioral' },
  { key: 'unusedAppsCount', label: 'Unused Apps', group: 'Behavioral' },
  { key: 'duplicateMedia', label: 'Digital Clutter', group: 'Behavioral' },
  { key: 'compressionTasks', label: 'File Compression', group: 'Behavioral' },
  { key: 'heavyAppOpens', label: 'Heavy App Startup Frequency', group: 'Behavioral' },
  { key: 'timeAt100WhilePlugged', label: 'Overcharging at 100%', group: 'Charging' },
  { key: 'chargingBetween00_06', label: 'Overnight Charging', group: 'Charging' },
  { key: 'chargeSessions', label: 'Frequent Charge Cycles', group: 'Charging' },
  { key: 'fastChargeSessions', label: 'Fast Charging', group: 'Charging' },
  { key: 'timeBelow20', label: 'Battery Below 20%', group: 'Charging' },
  { key: 'timeAbove80', label: 'Battery Above 80%', group: 'Charging' },
  { key: 'cpuHighUsage', label: 'CPU Spikes', group: 'Processing & Sensors' },
  { key: 'backgroundComputeTime', label: 'Background Compute', group: 'Processing & Sensors' },
  { key: 'backgroundComputeBaseline', label: 'Background Compute Baseline', group: 'Processing & Sensors' },
  { key: 'navigationTime', label: 'Navigation Usage', group: 'Processing & Sensors' },
  { key: 'cameraUsage', label: 'Camera Usage', group: 'Processing & Sensors' },
  { key: 'recorded4KVideo', label: '4K Video Recording', group: 'Processing & Sensors' },
  { key: 'gyroActiveApps', label: 'Gyroscope-heavy Usage', group: 'Processing & Sensors' },
  { key: 'arAppUsage', label: 'AR Apps', group: 'Processing & Sensors' },
  { key: 'proximityActiveTime', label: 'Proximity Sensor', group: 'Processing & Sensors' },
  { key: 'proximityBaseline', label: 'Proximity Baseline', group: 'Processing & Sensors' },
  { key: 'faceIDUnlocks', label: 'FaceID IR Projector', group: 'Processing & Sensors' },
  { key: 'faceIDBaseline', label: 'FaceID Baseline', group: 'Processing & Sensors' },
  { key: 'radioHighPowerTime', label: 'Radio Power', group: 'Processing & Sensors' },
];

const nativeMetricFieldByMetricKey: Partial<Record<MetricKey, string>> = {
  screenTime: 'screenTimeMinutes',
  socialMediaTime: 'socialMediaMinutes',
  videoStreamingTime: 'videoStreamingMinutes',
  musicListeningTime: 'musicListeningMinutes',
  navigationTime: 'navigationMinutes',
  cameraUsage: 'cameraMinutes',
  arAppUsage: 'arUsageMinutes',
  heavyAppOpens: 'heavyAppOpens',
  unusedAppsCount: 'unusedAppsCount',
  mobileDataUsage: 'mobileDataUsageMb',
  notificationsPerDay: 'notificationsPerDay',
};

const statusRank: Record<MetricReadinessStatus, number> = {
  live: 0,
  'journal-backed': 1,
  'user-confirmed': 2,
  derived: 3,
  estimated: 4,
  'native-required': 5,
  blocked: 6,
};

const getDiagnosticStatus = (
  diagnostics: PermissionDiagnostic[],
  id: PermissionDiagnostic['id'],
) => diagnostics.find((item) => item.id === id)?.status;

const formatValuePreview = (value: DailyMetrics[MetricKey]) => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    if (value >= 0 && value <= 1 && !Number.isInteger(value)) {
      return `${Math.round(value * 100)}%`;
    }

    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }

  return String(value);
};

const buildStatus = ({
  key,
  metrics,
  liveSignalState,
  diagnostics,
  historySnapshots,
  userConfirmedKeys,
}: {
  key: MetricKey;
  metrics: DailyMetrics;
  liveSignalState: LiveSignalState;
  diagnostics: PermissionDiagnostic[];
  historySnapshots: HistorySnapshot[];
  userConfirmedKeys: MetricKey[];
}): Omit<MetricReadinessItem, 'key' | 'label' | 'group' | 'valuePreview'> => {
  const screenTimePermission = getDiagnosticStatus(diagnostics, 'screenTime');
  const motionPermission = getDiagnosticStatus(diagnostics, 'motion');
  const locationPermission = getDiagnosticStatus(diagnostics, 'location');
  const isUserConfirmed = userConfirmedKeys.includes(key);
  const hasNativeMetric = (() => {
    const nativeField = nativeMetricFieldByMetricKey[key];
    return nativeField
      ? Boolean(liveSignalState.appUsageProvidedMetrics?.includes(nativeField))
      : false;
  })();

  switch (key) {
    case 'avgBrightness':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Brightness is being filled from the user-confirmed device profile.',
        };
      }

      return liveSignalState.currentBrightness !== undefined
        ? {
            status: 'live',
            sourceLabel: 'expo-brightness',
            summary: 'Read directly from the current device brightness setting.',
          }
        : {
            status: 'estimated',
            sourceLabel: 'seeded fallback',
            summary: 'Still using fallback brightness until the display sync succeeds.',
          };

    case 'screenTime':
      if (liveSignalState.appUsageSource === 'native-module' && hasNativeMetric) {
        return {
          status: 'live',
          sourceLabel: 'native usage bridge',
          summary: 'Device-wide screen time is coming from the native usage bridge.',
        };
      }

      if (liveSignalState.appUsageSource === 'app-session-journal') {
        return {
          status: 'journal-backed',
          sourceLabel: 'app session journal',
          summary: 'Foreground sessions inside this app are journaled locally as a truthful fallback.',
        };
      }

      if (screenTimePermission === 'blocked') {
        return {
          status: 'blocked',
          sourceLabel: 'waiting for usage access',
          summary: 'A native bridge exists, but system usage access is still blocked.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'Exact device-wide totals still need native platform integration.',
      };

    case 'steps':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Movement is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.stepsToday !== undefined) {
        return {
          status: 'live',
          sourceLabel: 'pedometer',
          summary: 'Today\'s steps are coming from the motion sensor.',
        };
      }

      if (motionPermission === 'blocked') {
        return {
          status: 'blocked',
          sourceLabel: 'motion permission blocked',
          summary: 'The motion collector is present, but permission is currently blocked.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'seeded fallback',
        summary: 'Movement scoring is still using seeded values until pedometer data arrives.',
      };

    case 'shortVehicleTrips':
      if (liveSignalState.mobilityJournalDerived) {
        return {
          status: 'journal-backed',
          sourceLabel: 'mobility journal',
          summary: 'Short-trip behavior is being reconstructed from local foreground location samples.',
        };
      }

      if (liveSignalState.locationEnabled || liveSignalState.stepsToday !== undefined) {
        return {
          status: 'derived',
          sourceLabel: 'location + motion inference',
          summary: 'Trip behavior is inferred from approved location and movement cues.',
        };
      }

      return locationPermission === 'blocked'
        ? {
            status: 'blocked',
            sourceLabel: 'location permission blocked',
            summary: 'Trip inference is limited because location permission is blocked.',
          }
        : {
            status: 'estimated',
            sourceLabel: 'seeded fallback',
            summary: 'Short-trip behavior still relies on prototype estimates.',
          };

    case 'locationRequests':
    case 'locationAlwaysOnApps':
    case 'navigationTime':
      if (
        liveSignalState.mobilityJournalDerived &&
        (key === 'locationRequests' ||
          key === 'locationAlwaysOnApps' ||
          key === 'navigationTime')
      ) {
        return {
          status: 'journal-backed',
          sourceLabel: 'mobility journal',
          summary:
            key === 'navigationTime'
              ? 'Navigation pressure is being reconstructed from local foreground location samples.'
              : 'Foreground location checks are being journaled locally for this metric.',
        };
      }

      if (
        key === 'navigationTime' &&
        liveSignalState.appUsageSource === 'native-module' &&
        hasNativeMetric
      ) {
        return {
          status: 'live',
          sourceLabel: 'native usage bridge',
          summary: 'Navigation usage is coming from device-wide foreground time in navigation apps.',
        };
      }

      if (liveSignalState.locationEnabled) {
        return {
          status: 'derived',
          sourceLabel:
            key === 'navigationTime'
              ? 'foreground location'
              : 'location-backed proxy model',
          summary:
            key === 'navigationTime'
              ? 'This metric is inferred from approved foreground location availability.'
              : 'This metric is being derived from approved location availability plus navigation behavior.',
        };
      }

      return locationPermission === 'blocked'
        ? {
            status: 'blocked',
            sourceLabel: 'location permission blocked',
            summary: 'Location-backed inference is blocked until permission is granted.',
          }
        : {
            status: 'estimated',
            sourceLabel: 'seeded fallback',
            summary: 'Navigation and location intensity still use transparent fallback values.',
          };

    case 'mobileDataUsage':
    case 'socialMediaTime':
    case 'videoStreamingTime':
    case 'heavyAppOpens':
    case 'unusedAppsCount':
    case 'notificationsPerDay':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This usage metric is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module' && hasNativeMetric) {
        return {
          status: 'live',
          sourceLabel: 'native usage bridge',
          summary: 'Provided directly by the Android native usage collector in supported builds.',
        };
      }

      if (key === 'notificationsPerDay') {
        return {
          status: 'estimated',
          sourceLabel: 'rule seed',
          summary: 'Notification burst scoring still uses deterministic seeded counts here.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'seeded fallback',
        summary: 'This category is still using a transparent estimate until native usage coverage expands.',
      };

    case 'timeAt100WhilePlugged':
    case 'chargingBetween00_06':
    case 'chargeSessions':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This charging metric is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.batteryJournalDerived) {
        return {
          status: 'journal-backed',
          sourceLabel: 'battery journal',
          summary: 'This charging metric is derived from local battery sampling across the day.',
        };
      }

      if (liveSignalState.batteryLevel !== undefined) {
        return {
          status: 'derived',
          sourceLabel: 'battery state inference',
          summary: 'Current battery state can soften this metric, but the journal still needs more coverage.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'seeded fallback',
        summary: 'Charging behavior is still on fallback values until battery samples accumulate.',
      };

    case 'timeBelow20':
    case 'timeAbove80':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Battery range time is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.batteryJournalDerived) {
        return {
          status: 'journal-backed',
          sourceLabel: 'battery journal',
          summary: 'Battery range time is being reconstructed from local battery history.',
        };
      }

      if (liveSignalState.batteryLevel !== undefined) {
        return {
          status: 'derived',
          sourceLabel: 'current battery level',
          summary: 'Current battery range is available, but full daily duration is still inferred.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'seeded fallback',
        summary: 'Battery range time still uses a calm estimate until sampling history grows.',
      };

    case 'hotspotDuration':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Hotspot usage is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'proxy model from observed usage',
          summary: 'Hotspot usage is being approximated from mobile data totals and transfer intensity.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'This signal still needs a deeper platform-specific collector for production accuracy.',
      };

    case 'widgetCount':
    case 'liveWallpaperEnabled':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This metric is being filled from the user-confirmed device profile.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'This signal still needs a deeper platform-specific collector for production accuracy.',
      };

    case 'avgTemp':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Device temperature is being filled from the user-confirmed device profile.',
        };
      }

      if (
        liveSignalState.appUsageSource === 'native-module' ||
        liveSignalState.appUsageSource === 'app-session-journal'
      ) {
        return {
          status: 'derived',
          sourceLabel: 'proxy model from observed usage',
          summary: 'Device temperature is being approximated from compute, camera, AR, and streaming intensity.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'This signal still needs a deeper platform-specific collector for production accuracy.',
      };

    case 'btOnTime':
    case 'btActiveDevices':
    case 'speakerCallTime':
    case 'avgMusicVolume':
    case 'singleCallDuration':
    case 'callCount':
    case 'btAudioTime':
    case 'gyroActiveApps':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This metric is being filled from the user-confirmed device profile.',
        };
      }

      if (
        liveSignalState.appUsageSource === 'native-module' ||
        liveSignalState.appUsageSource === 'app-session-journal'
      ) {
        return {
          status: 'derived',
          sourceLabel: 'proxy model from observed usage',
          summary: 'This metric is being derived from observed usage intensity and local proxy formulas.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'This signal still needs a deeper platform-specific collector for production accuracy.',
      };

    case 'musicListeningTime':
    case 'cameraUsage':
    case 'arAppUsage':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This metric is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module' && hasNativeMetric) {
        return {
          status: 'live',
          sourceLabel: 'native usage bridge',
          summary: 'This metric is coming from native device-wide foreground usage classification.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'This signal still needs a deeper platform-specific collector for production accuracy.',
      };

    case 'recorded4KVideo':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: '4K capture usage is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'camera proxy model',
          summary: '4K recording is being approximated from heavy camera and compute intensity.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'native collector needed',
        summary: 'This signal still needs a deeper platform-specific collector for production accuracy.',
      };

    case 'backgroundActiveApps':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Background activity is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'native usage composites',
          summary: 'Background activity is being derived from observed app count and heavy app usage patterns.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'system activity collector needed',
        summary: 'Background workload still needs OS-level process and indexing telemetry.',
      };

    case 'backgroundComputeTime':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Background compute is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'native usage composites',
          summary: 'Background compute is being derived from native app usage intensity and heavy foreground sessions.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'system activity collector needed',
        summary: 'Background workload still needs OS-level process and indexing telemetry.',
      };

    case 'faceIDUnlocks':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Biometric unlock activity is being filled from the user-confirmed device profile.',
        };
      }

      if (
        liveSignalState.appUsageSource === 'native-module' ||
        liveSignalState.appUsageSource === 'app-session-journal'
      ) {
        return {
          status: 'derived',
          sourceLabel: 'proxy model from observed usage',
          summary: 'Biometric unlock activity is being approximated from screen and heavy-app usage patterns.',
        };
      }

      return {
        status: 'native-required',
        sourceLabel: 'biometric collector needed',
        summary: 'Biometric unlock counts are still represented with prototype values.',
      };

    case 'sleepEnergy':
    case 'sleepBaseline':
      if (liveSignalState.batteryJournalDerived) {
        return {
          status: 'journal-backed',
          sourceLabel: 'battery journal',
          summary: 'Overnight battery behavior is being reconstructed from local battery history.',
        };
      }

      if (
        hasDerivedMetricBaseline({
          key: 'sleepBaseline',
          currentMetrics: metrics,
          historySnapshots,
        })
      ) {
        return {
          status: 'derived',
          sourceLabel: 'history baseline',
          summary: 'Sleep drain baseline is being derived from prior local days.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'Sleep-window battery drain still uses fallback values until the journal has enough coverage.',
      };

    case 'backgroundComputeBaseline':
      if (
        hasDerivedMetricBaseline({
          key: 'backgroundComputeBaseline',
          currentMetrics: metrics,
          historySnapshots,
        })
      ) {
        return {
          status: 'derived',
          sourceLabel: 'history baseline',
          summary: 'Background compute baseline is being derived from recent local days.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'Background compute baseline still uses fallback values.',
      };

    case 'proximityBaseline':
      if (
        hasDerivedMetricBaseline({
          key: 'proximityBaseline',
          currentMetrics: metrics,
          historySnapshots,
        })
      ) {
        return {
          status: 'derived',
          sourceLabel: 'history baseline',
          summary: 'Proximity sensor baseline is being derived from recent local days.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'Proximity baseline still uses fallback values.',
      };

    case 'faceIDBaseline':
      if (
        hasDerivedMetricBaseline({
          key: 'faceIDBaseline',
          currentMetrics: metrics,
          historySnapshots,
        })
      ) {
        return {
          status: 'derived',
          sourceLabel: 'history baseline',
          summary: 'FaceID baseline is being derived from recent local days.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'FaceID baseline still uses fallback values.',
      };

    case 'idleScreenOn':
    case 'duplicateMedia':
    case 'compressionTasks':
    case 'proximityActiveTime':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This metric is being filled from the user-confirmed device profile.',
        };
      }

      if (
        liveSignalState.appUsageSource === 'native-module' ||
        liveSignalState.appUsageSource === 'app-session-journal'
      ) {
        return {
          status: 'derived',
          sourceLabel: 'proxy model from observed usage',
          summary: 'This metric is being derived from observed usage intensity and local proxy formulas.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'This metric is present in scoring, but still uses transparent heuristic data.',
      };

    case 'cloudSyncSessions':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Cloud sync intensity is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'native usage composites',
          summary: 'Cloud sync intensity is being derived from observed app surface area and unused-app pressure.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'This metric is present in scoring, but still uses transparent heuristic data.',
      };

    case 'mobileUpdatesData':
    case 'multiDeviceSyncEvents':
    case 'backupRunsPerDay':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This metric is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'proxy model from observed usage',
          summary: 'This metric is being approximated from mobile data totals, cloud pressure, and app surface area.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'This metric is present in scoring, but still uses transparent heuristic data.',
      };

    case 'fastChargeSessions':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'Fast-charge behavior is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.batteryJournalDerived || liveSignalState.batteryLevel !== undefined) {
        return {
          status: 'derived',
          sourceLabel: 'battery proxy model',
          summary: 'Fast-charge sessions are being approximated from charging cadence and low-range battery pressure.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'This metric is present in scoring, but still uses transparent heuristic data.',
      };

    case 'vpnUsageTime':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'VPN usage is being filled from the user-confirmed device profile.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'This metric is present in scoring, but still uses transparent heuristic data.',
      };

    case 'largeMobileTransfers':
    case 'radioHighPowerTime':
    case 'cpuHighUsage':
    case 'autoplayVideosCount':
    case 'lowSignalTime':
      if (isUserConfirmed) {
        return {
          status: 'user-confirmed',
          sourceLabel: 'device profile',
          summary: 'This metric is being filled from the user-confirmed device profile.',
        };
      }

      if (liveSignalState.appUsageSource === 'native-module') {
        return {
          status: 'derived',
          sourceLabel: 'native usage composites',
          summary: 'This metric is being derived from native mobile data totals and usage intensity patterns.',
        };
      }

      return {
        status: 'estimated',
        sourceLabel: 'deterministic fallback',
        summary: 'This metric is present in scoring, but still uses transparent heuristic data.',
      };

    default:
      return {
        status: 'estimated',
        sourceLabel: 'fallback',
        summary: 'This metric currently uses fallback data.',
      };
  }
};

export const buildMetricReadiness = ({
  metrics,
  liveSignalState,
  diagnostics,
  historySnapshots = [],
  userConfirmedKeys = [],
}: {
  metrics: DailyMetrics;
  liveSignalState: LiveSignalState;
  diagnostics: PermissionDiagnostic[];
  historySnapshots?: HistorySnapshot[];
  userConfirmedKeys?: MetricKey[];
}): MetricReadinessItem[] =>
  metricDefinitions
    .map((definition) => ({
      ...definition,
      ...buildStatus({
        key: definition.key,
        metrics,
        liveSignalState,
        diagnostics,
        historySnapshots,
        userConfirmedKeys,
      }),
      valuePreview: formatValuePreview(metrics[definition.key]),
    }))
    .sort((left, right) => {
      const groupCompare = left.group.localeCompare(right.group);
      if (groupCompare !== 0) {
        return groupCompare;
      }

      const statusCompare = statusRank[left.status] - statusRank[right.status];
      if (statusCompare !== 0) {
        return statusCompare;
      }

      return left.label.localeCompare(right.label);
    });

export const summarizeMetricReadiness = (
  items: MetricReadinessItem[],
): MetricReadinessSummary => {
  const byStatus: MetricReadinessSummary['byStatus'] = {
    live: 0,
    'journal-backed': 0,
    'user-confirmed': 0,
    derived: 0,
    estimated: 0,
    'native-required': 0,
    blocked: 0,
  };

  for (const item of items) {
    byStatus[item.status] += 1;
  }

  const productionReadyMetrics =
    byStatus.live + byStatus['journal-backed'] + byStatus['user-confirmed'] + byStatus.derived;
  const totalMetrics = items.length;

  return {
    totalMetrics,
    productionReadyMetrics,
    byStatus,
    readinessShare:
      totalMetrics > 0 ? productionReadyMetrics / totalMetrics : 0,
  };
};
