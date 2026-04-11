import {
  CollectorCapability,
  LiveSignalState,
  PermissionDiagnostic,
} from '../engine/types';

const getDiagnostic = (
  diagnostics: PermissionDiagnostic[],
  id: PermissionDiagnostic['id'],
) => diagnostics.find((item) => item.id === id);

export const buildCollectorCapabilities = ({
  diagnostics,
  liveSignalState,
}: {
  diagnostics: PermissionDiagnostic[];
  liveSignalState: LiveSignalState;
}): CollectorCapability[] => {
  const motion = getDiagnostic(diagnostics, 'motion');
  const location = getDiagnostic(diagnostics, 'location');
  const notifications = getDiagnostic(diagnostics, 'notifications');
  const screenTime = getDiagnostic(diagnostics, 'screenTime');

  return [
    {
      id: 'screen-time',
      title: 'Screen Time & App Usage',
      group: 'Behavioral',
      status: screenTime?.status === 'pending' ? 'estimated' : 'native-required',
      summary:
        screenTime?.status === 'pending'
          ? 'Rule engine can estimate this family, but exact history is not active.'
          : 'Exact app-level screen history still needs native iOS and Android bridges.',
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
        liveSignalState.batteryLevel !== undefined
          ? 'Battery state and charging status are live.'
          : 'Charging and battery range logic is still using seeded estimates.',
      detail:
        'Supports overcharging, overnight charging, battery range, and charge-session heuristics.',
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
        liveSignalState.locationEnabled
          ? 'live'
          : location?.status === 'blocked'
            ? 'blocked'
            : location?.status === 'unavailable'
              ? 'unavailable'
              : 'estimated',
      summary:
        liveSignalState.locationEnabled
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
      status: 'estimated',
      summary:
        'Network intensity currently uses transparent heuristics rather than low-level modem readings.',
      detail:
        'Covers mobile data, weak signal, VPN, hotspot, cloud sync, and radio high-power scoring.',
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
      status: 'native-required',
      summary:
        'Exact call and playback telemetry needs deeper platform-specific integration.',
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
      status: 'native-required',
      summary:
        'Widgets, live wallpapers, background refresh, and process counts need native collectors.',
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
      status: 'estimated',
      summary:
        'Current scoring can represent this family, but fine-grained capture still uses prototype values.',
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
};
