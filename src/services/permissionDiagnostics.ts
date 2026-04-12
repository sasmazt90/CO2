import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';

import {
  PermissionDiagnostic,
  PermissionState,
} from '../engine/types';
import { getNativeAppUsageBridgeStatus } from './appUsageCollector';

const screenTimeDiagnostic = (
  selected: boolean,
): PermissionDiagnostic => {
  const bridgeStatus = getNativeAppUsageBridgeStatus();

  if (!selected) {
    return {
      id: 'screenTime',
      title: 'Screen time data',
      status: 'pending',
      summary: 'Not requested yet.',
      detail:
        'Enable this if you want the app to prepare for a deeper native screen-time integration later.',
      actionLabel: 'Enable in onboarding',
    };
  }

  if (bridgeStatus.installed) {
    if (bridgeStatus.supportsDeviceWideUsage && bridgeStatus.accessGranted) {
      return {
        id: 'screenTime',
        title: 'Screen time data',
        status: 'granted',
        summary:
          'A native app-usage bridge is installed and already has device-wide access on this platform.',
        detail:
          'The shared collector can read device-wide usage snapshots here, while the local app-session journal remains as a calm fallback.',
        actionLabel: 'Bridge ready',
      };
    }

    if (bridgeStatus.supportsDeviceWideUsage && !bridgeStatus.accessGranted) {
      return {
        id: 'screenTime',
        title: 'Screen time data',
        status: 'blocked',
        summary:
          'The native app-usage bridge is installed, but system usage access still needs to be enabled.',
        detail: bridgeStatus.note,
        actionLabel: bridgeStatus.canOpenSettings
          ? 'Open usage access'
          : 'Needs approval',
      };
    }

    return {
      id: 'screenTime',
      title: 'Screen time data',
      status: 'native-required',
      summary:
        'A local bridge exists, but this platform still does not expose the full device-wide usage history needed here.',
      detail:
        `${bridgeStatus.note} The app-session journal remains active as the truthful fallback.`,
      actionLabel: 'Fallback active',
    };
  }

  return {
    id: 'screenTime',
    title: 'Screen time data',
    status: 'native-required',
    summary:
      'Exact OS screen-time access still needs platform-specific native integration, while a local app-session fallback can already run.',
    detail:
      'This Expo build can journal in-app foreground sessions today, and it is ready to accept a native usage bridge later for broader daily totals.',
    actionLabel: 'Native module needed',
  };
};

const motionDiagnostic = async (
  selected: boolean,
): Promise<PermissionDiagnostic> => {
  try {
    const available = await Pedometer.isAvailableAsync();
    if (!selected) {
      return {
        id: 'motion',
        title: 'Activity & motion',
        status: 'pending',
        summary: available ? 'Motion support is available on this device.' : 'Motion support is unavailable on this device.',
        detail: available
          ? 'Turn this on to use steps and movement cues in scoring.'
          : 'This device or runtime does not expose pedometer support here.',
        actionLabel: available ? 'Enable in onboarding' : 'Unavailable',
      };
    }

    return {
      id: 'motion',
      title: 'Activity & motion',
      status: available ? 'granted' : 'unavailable',
      summary: available ? 'Motion signals are ready.' : 'Motion signals are unavailable.',
      detail: available
        ? 'Step count and movement cues can be used in the rule engine.'
        : 'The current device cannot provide pedometer access in this build.',
      actionLabel: available ? 'Ready' : 'Unavailable',
    };
  } catch {
    return {
      id: 'motion',
      title: 'Activity & motion',
      status: 'unavailable',
      summary: 'Motion signals could not be checked.',
      detail: 'The runtime could not confirm pedometer availability.',
      actionLabel: 'Unavailable',
    };
  }
};

const locationDiagnostic = async (
  selected: boolean,
  requestIfNeeded: boolean,
): Promise<PermissionDiagnostic> => {
  try {
    const current = requestIfNeeded && selected
      ? await Location.requestForegroundPermissionsAsync()
      : await Location.getForegroundPermissionsAsync();

    if (!selected) {
      return {
        id: 'location',
        title: 'Location',
        status: 'pending',
        summary: 'Location is optional and currently off.',
        detail: 'Turn this on for mobility patterns and short-trip suggestions.',
        actionLabel: 'Optional',
      };
    }

    if (current.granted) {
      return {
        id: 'location',
        title: 'Location',
        status: 'granted',
        summary: 'Foreground location is allowed.',
        detail: 'Mobility coaching can use approved foreground location checks.',
        actionLabel: 'Granted',
      };
    }

    return {
      id: 'location',
      title: 'Location',
      status: current.canAskAgain ? 'blocked' : 'blocked',
      summary: 'Location is selected but not granted.',
      detail: current.canAskAgain
        ? 'The app still needs foreground location approval.'
        : 'Location was denied and now needs to be changed in system settings.',
      actionLabel: current.canAskAgain ? 'Needs approval' : 'Open settings',
    };
  } catch {
    return {
      id: 'location',
      title: 'Location',
      status: 'unavailable',
      summary: 'Location support could not be checked.',
      detail: 'The runtime could not confirm location permission state.',
      actionLabel: 'Unavailable',
    };
  }
};

const notificationsDiagnostic = async (
  selected: boolean,
  requestIfNeeded: boolean,
): Promise<PermissionDiagnostic> => {
  if (Platform.OS === 'web') {
    return {
      id: 'notifications',
      title: 'Notifications',
      status: selected ? 'available' : 'pending',
      summary: selected
        ? 'In-app notifications are ready in this web build.'
        : 'Notifications are off in onboarding.',
      detail: selected
        ? 'Device-level banners are limited on web here, but the in-app notification center still works.'
        : 'Enable this to receive rule-driven nudges where the platform allows it.',
      actionLabel: selected ? 'In-app only' : 'Enable in onboarding',
    };
  }

  try {
    const current = requestIfNeeded && selected
      ? await Notifications.requestPermissionsAsync()
      : await Notifications.getPermissionsAsync();

    if (!selected) {
      return {
        id: 'notifications',
        title: 'Notifications',
        status: 'pending',
        summary: 'Notifications are currently off.',
        detail: 'Enable this to mirror triggered rules into local alerts.',
        actionLabel: 'Enable in onboarding',
      };
    }

    const granted =
      current.granted ||
      current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (granted) {
      return {
        id: 'notifications',
        title: 'Notifications',
        status: 'granted',
        summary: 'Notification permission is active.',
        detail: 'Triggered rules can appear in the notification center and as local alerts where supported.',
        actionLabel: 'Granted',
      };
    }

    return {
      id: 'notifications',
      title: 'Notifications',
      status: 'blocked',
      summary: 'Notifications are selected but not granted.',
      detail: current.canAskAgain
        ? 'The app still needs notification approval.'
        : 'Notifications were denied and now need a system settings change.',
      actionLabel: current.canAskAgain ? 'Needs approval' : 'Open settings',
    };
  } catch {
    return {
      id: 'notifications',
      title: 'Notifications',
      status: 'unavailable',
      summary: 'Notification status could not be checked.',
      detail: 'The runtime could not confirm notification permission state.',
      actionLabel: 'Unavailable',
    };
  }
};

export const loadPermissionDiagnostics = async (
  selectedPermissions: PermissionState,
  requestIfNeeded = false,
): Promise<PermissionDiagnostic[]> =>
  Promise.all([
    Promise.resolve(screenTimeDiagnostic(selectedPermissions.screenTime)),
    motionDiagnostic(selectedPermissions.motion),
    locationDiagnostic(selectedPermissions.location, requestIfNeeded),
    notificationsDiagnostic(selectedPermissions.notifications, requestIfNeeded),
  ]);
