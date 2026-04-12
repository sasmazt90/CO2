import {
  CollectorCapability,
  CollectorCapabilitySeed,
  DailyMetrics,
  LiveSignalState,
  PermissionDiagnostic,
} from '../engine/types';
import { attachCollectorCoverage } from './collectorCoverage';

const getDiagnostic = (
  diagnostics: PermissionDiagnostic[],
  id: PermissionDiagnostic['id'],
) => diagnostics.find((item) => item.id === id);

export const buildCollectorCapabilities = ({
  diagnostics,
  liveSignalState,
  userConfirmedKeys = [],
}: {
  diagnostics: PermissionDiagnostic[];
  liveSignalState: LiveSignalState;
  userConfirmedKeys?: Array<keyof DailyMetrics>;
}): CollectorCapability[] => {
  const motion = getDiagnostic(diagnostics, 'motion');
  const location = getDiagnostic(diagnostics, 'location');
  const notifications = getDiagnostic(diagnostics, 'notifications');
  const screenTime = getDiagnostic(diagnostics, 'screenTime');
  const hasNativeMobileData =
    liveSignalState.appUsageSource === 'native-module' &&
    Boolean(liveSignalState.appUsageProvidedMetrics?.includes('mobileDataUsageMb'));
  const screenTimeStatus =
    liveSignalState.appUsageSource === 'native-module'
      ? 'live'
      : liveSignalState.appUsageSource === 'app-session-journal'
        ? 'estimated'
        : screenTime?.status === 'blocked'
          ? 'blocked'
          : screenTime?.status === 'unavailable'
            ? 'unavailable'
            : screenTime?.status === 'pending'
              ? 'estimated'
            : 'native-required';
  const hasUserConfirmed = (...keys: Array<keyof DailyMetrics>) =>
    keys.some((key) => userConfirmedKeys.includes(key));

  const capabilities: CollectorCapabilitySeed[] = [
    {
      id: 'screen-time',
      title: 'Screen Time & App Usage',
      group: 'Behavioral',
      status: screenTimeStatus,
      summary:
        liveSignalState.appUsageSource === 'native-module'
          ? `Device-wide app usage is live${
              liveSignalState.appUsageObservedAppsCount
                ? ` across ${liveSignalState.appUsageObservedAppsCount} apps`
                : ''
            }, with shared scoring ready for screen time and deeper behavior signals.`
        : liveSignalState.appSessionDerived
          ? `A local app-session journal has observed ${liveSignalState.appSessionMinutes ?? 0} minutes across ${liveSignalState.appSessionCount ?? 0} sessions, while full OS usage still needs native bridges.`
          : screenTime?.status === 'pending'
          ? 'Rule engine can estimate this family, but exact history is not active.'
          : screenTime?.summary ??
            'Exact app-level screen history still needs native iOS and Android bridges.',
      detail:
        'This powers screen time, social app usage, heavy app opens, and notification-heavy behavior scoring.',
      signals: ['screenTime', 'socialMediaTime', 'heavyAppOpens', 'unusedAppsCount'],
    },
    {
      id: 'brightness-display',
      title: 'Brightness & Display',
      group: 'Device Energy',
      status:
        liveSignalState.currentBrightness !== undefined ? 'live' : 'estimated',
      summary:
        liveSignalState.currentBrightness !== undefined
          ? 'Current brightness is being read directly from the device.'
          : 'Brightness logic is running on fallback values until sync succeeds.',
      detail:
        'Feeds brightness, display efficiency, and parts of idle screen behavior scoring.',
      signals: ['avgBrightness', 'idleScreenOn'],
    },
    {
      id: 'battery-charging',
      title: 'Battery & Charging',
      group: 'Charging',
      status: liveSignalState.batteryLevel !== undefined ? 'live' : 'estimated',
      summary:
        liveSignalState.batteryJournalDerived
          ? `Battery state is live and a local charging journal is shaping today's charging and overnight drain metrics from ${liveSignalState.batteryJournalSamples ?? 0} samples.`
          : liveSignalState.batteryLevel !== undefined
            ? 'Battery state is live and the charging journal is collecting local samples.'
            : 'Charging and battery range logic is still using seeded estimates.',
      detail:
        'Supports overcharging, overnight charging, battery range, charge-session heuristics, and sleep-mode drain inference.',
      signals: [
        'timeAt100WhilePlugged',
        'chargingBetween00_06',
        'timeBelow20',
        'timeAbove80',
      ],
    },
    {
      id: 'motion-steps',
      title: 'Motion & Steps',
      group: 'Behavioral',
      status:
        liveSignalState.stepsToday !== undefined
          ? 'live'
          : motion?.status === 'blocked'
            ? 'blocked'
            : motion?.status === 'unavailable'
              ? 'unavailable'
              : 'estimated',
      summary:
        liveSignalState.stepsToday !== undefined
          ? 'Step count is live from the pedometer.'
          : motion?.summary ?? 'Motion status is still being checked.',
      detail:
        'Drives low movement, short-trip replacement guidance, and travel-oriented encouragement.',
      signals: ['steps', 'shortVehicleTrips'],
    },
    {
      id: 'location-mobility',
      title: 'Location & Mobility',
      group: 'Processing & Sensors',
      status:
        liveSignalState.mobilityJournalDerived || liveSignalState.locationEnabled
          ? 'live'
          : location?.status === 'blocked'
            ? 'blocked'
            : location?.status === 'unavailable'
              ? 'unavailable'
              : 'estimated',
      summary:
        liveSignalState.mobilityJournalDerived
          ? `Foreground location is live and a mobility journal has reconstructed movement from ${liveSignalState.mobilityJournalSamples ?? 0} samples.`
          : liveSignalState.locationEnabled
            ? 'Foreground location is available for mobility estimation.'
          : location?.summary ?? 'Location status is still being checked.',
      detail:
        'Used for mobility patterns, navigation load, and short vehicle trip inference.',
      signals: ['locationRequests', 'navigationTime', 'shortVehicleTrips'],
    },
    {
      id: 'notifications-local',
      title: 'Notifications & Nudges',
      group: 'Cross-platform',
      status:
        notifications?.status === 'granted'
          ? 'live'
          : notifications?.status === 'blocked'
            ? 'blocked'
            : notifications?.status === 'unavailable'
              ? 'unavailable'
              : 'estimated',
      summary:
        notifications?.summary ??
        'Notification delivery status is still being checked.',
      detail:
        'Controls notification-center mirroring and local alerts for triggered rules.',
      signals: ['notificationsPerDay', 'notificationFeed'],
    },
    {
      id: 'network-radios',
      title: 'Network, Signal, and Radio Load',
      group: 'Network & Cloud',
      status: hasNativeMobileData || hasUserConfirmed('hotspotDuration', 'vpnUsageTime')
        ? 'live'
        : 'estimated',
      summary:
        hasNativeMobileData
          ? 'Today\'s mobile data total is coming from the native usage bridge, while radio intensity and weak-signal behavior still stay transparent and estimated.'
          : hasUserConfirmed('hotspotDuration', 'vpnUsageTime')
            ? 'Network intensity is partly completed with user-confirmed radio and VPN defaults.'
          : 'Network intensity currently uses transparent heuristics rather than low-level modem readings.',
      detail:
        hasNativeMobileData
          ? 'Mobile data totals are live on this platform, while weak signal, VPN, hotspot, cloud sync, and radio power still rely on heuristics.'
          : hasUserConfirmed('hotspotDuration', 'vpnUsageTime')
            ? 'Mobile data may still be estimated, but hotspot and VPN behavior now comes from explicit user-confirmed values.'
          : 'Covers mobile data, weak signal, VPN, hotspot, cloud sync, and radio high-power scoring.',
      signals: [
        'mobileDataUsage',
        'lowSignalTime',
        'vpnUsageTime',
        'radioHighPowerTime',
      ],
    },
    {
      id: 'audio-calls',
      title: 'Audio & Call Behavior',
      group: 'Audio',
      status: hasUserConfirmed(
        'speakerCallTime',
        'avgMusicVolume',
        'singleCallDuration',
        'callCount',
        'btAudioTime',
        'btOnTime',
        'btActiveDevices',
      )
        ? 'live'
        : 'native-required',
      summary:
        hasUserConfirmed(
          'speakerCallTime',
          'avgMusicVolume',
          'singleCallDuration',
          'callCount',
          'btAudioTime',
          'btOnTime',
          'btActiveDevices',
        )
          ? 'Audio and call surfaces are completed with explicit user-confirmed daily defaults.'
          : 'Exact call and playback telemetry needs deeper platform-specific integration.',
      detail:
        'This family powers speakerphone, volume, long call, call burst, and Bluetooth audio rules.',
      signals: [
        'speakerCallTime',
        'avgMusicVolume',
        'singleCallDuration',
        'btAudioTime',
      ],
    },
    {
      id: 'background-processes',
      title: 'Background Processes & System Surfaces',
      group: 'Device Energy',
      status: hasUserConfirmed(
        'backgroundActiveApps',
        'backgroundComputeTime',
        'widgetCount',
        'liveWallpaperEnabled',
      )
        ? 'live'
        : 'native-required',
      summary:
        hasUserConfirmed(
          'backgroundActiveApps',
          'backgroundComputeTime',
          'widgetCount',
          'liveWallpaperEnabled',
        )
          ? 'Background and system-surface metrics are completed with explicit user-confirmed values.'
          : 'Widgets, live wallpapers, background refresh, and process counts need native collectors.',
      detail:
        'This family would benefit from iOS background refresh inspection and Android usage stats bridges.',
      signals: [
        'backgroundActiveApps',
        'widgetCount',
        'liveWallpaperEnabled',
        'backgroundComputeTime',
      ],
    },
    {
      id: 'camera-ar-sensors',
      title: 'Camera, AR, and Sensor Bursts',
      group: 'Processing & Sensors',
      status: hasUserConfirmed('recorded4KVideo', 'gyroActiveApps', 'faceIDUnlocks')
        ? 'live'
        : 'estimated',
      summary:
        hasUserConfirmed('recorded4KVideo', 'gyroActiveApps', 'faceIDUnlocks')
          ? 'Camera and sensor burst metrics are completed with explicit user-confirmed values plus observed usage.'
          : 'Current scoring can represent this family, but fine-grained capture still uses prototype values.',
      detail:
        'Includes camera usage, 4K recording, gyroscope-heavy apps, AR sessions, and biometric unlocks.',
      signals: [
        'cameraUsage',
        'recorded4KVideo',
        'gyroActiveApps',
        'arAppUsage',
        'faceIDUnlocks',
      ],
    },
  ];

  return attachCollectorCoverage(capabilities);
};
