import * as Battery from 'expo-battery';
import * as Brightness from 'expo-brightness';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';

import { DailyMetrics, LiveSignalState, PermissionState } from '../engine/types';
import {
  buildBatteryJournalSummary,
  recordBatterySnapshot,
} from './batteryJournalService';
import {
  buildMobilityJournalSummary,
  recordMobilityLocation,
} from './mobilityJournalService';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

export interface LiveSignalResult {
  metricPatch: Partial<DailyMetrics>;
  signalState: LiveSignalState;
}

export const collectDeviceSignalPatch = async (
  permissions: PermissionState,
): Promise<LiveSignalResult> => {
  const notes: string[] = [];
  const metricPatch: Partial<DailyMetrics> = {};

  const signalState: LiveSignalState = {
    syncedAt: new Date().toISOString(),
    status: 'ready',
    notes,
    deviceName:
      Device.deviceName ?? `${Device.brand ?? 'Mobile'} ${Device.modelName ?? ''}`.trim(),
  };

  try {
    const [batteryLevel, batteryState, lowPowerMode] = await Promise.all([
      Battery.getBatteryLevelAsync(),
      Battery.getBatteryStateAsync(),
      Battery.isLowPowerModeEnabledAsync(),
    ]);

    signalState.batteryLevel = batteryLevel;
    signalState.batteryState = Battery.BatteryState[batteryState];

    if (batteryLevel < 0.2) {
      metricPatch.timeBelow20 = 120;
      notes.push('Battery is currently under 20%, so low-range battery time was lifted.');
    }

    if (batteryLevel > 0.8) {
      metricPatch.timeAbove80 = 120;
      notes.push('Battery is above 80%, so upper-range battery time was lifted.');
    }

    if (batteryState === Battery.BatteryState.CHARGING) {
      metricPatch.chargeSessions = Math.max(metricPatch.chargeSessions ?? 1, 2);
      const hour = new Date().getHours();
      if (hour < 6) {
        metricPatch.chargingBetween00_06 = 90;
      }

      if (batteryLevel >= 0.99) {
        metricPatch.timeAt100WhilePlugged = 15;
      }

      notes.push("Charging state was detected and merged into today's charging estimate.");
    }

    if (lowPowerMode) {
      metricPatch.backgroundActiveApps = 3;
      notes.push('Low Power Mode is on, so background activity was softened.');
    }

    await recordBatterySnapshot({
      batteryLevel,
      batteryState,
      lowPowerMode,
      source: 'sync',
    });

    const batteryJournal = await buildBatteryJournalSummary();
    signalState.batteryJournalSamples = batteryJournal.sampleCount;
    signalState.batteryJournalDerived = batteryJournal.derivedFromJournal;
    signalState.batteryJournalLastSampleAt = batteryJournal.lastSampleAt;

    if (batteryJournal.derivedFromJournal) {
      Object.assign(metricPatch, batteryJournal.metricPatch);
    }

    if (batteryJournal.note) {
      notes.push(batteryJournal.note);
    }
  } catch {
    notes.push('Battery signals were unavailable on this device.');
  }

  try {
    const brightnessPermission = await Brightness.requestPermissionsAsync();
    if (brightnessPermission.granted) {
      const brightness = await Brightness.getBrightnessAsync();
      signalState.currentBrightness = brightness;
      metricPatch.avgBrightness = brightness;
      notes.push("Current screen brightness was synced into today's estimate.");
    }
  } catch {
    notes.push('Brightness signal was unavailable.');
  }

  if (permissions.motion) {
    try {
      const available = await Pedometer.isAvailableAsync();
      if (available) {
        const steps = await Pedometer.getStepCountAsync(startOfToday(), new Date());
        signalState.stepsToday = steps.steps;
        metricPatch.steps = steps.steps;
        notes.push("Today's step count was synced from the motion sensor.");
      } else {
        notes.push('Pedometer is not available on this device.');
      }
    } catch {
      notes.push('Motion data could not be synced.');
    }
  }

  if (permissions.location) {
    try {
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      signalState.locationEnabled = locationPermission.granted;
      if (locationPermission.granted) {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          await recordMobilityLocation(lastKnown, 'sync');
        }
        if (lastKnown?.coords?.speed && lastKnown.coords.speed > 4) {
          metricPatch.shortVehicleTrips = Math.max(metricPatch.shortVehicleTrips ?? 0, 1);
        }
        metricPatch.locationAlwaysOnApps = 0;
        const mobilityJournal = await buildMobilityJournalSummary();
        signalState.mobilityJournalSamples = mobilityJournal.sampleCount;
        signalState.mobilityJournalDerived = mobilityJournal.derivedFromJournal;
        signalState.mobilityJournalLastSampleAt = mobilityJournal.lastSampleAt;

        if (mobilityJournal.derivedFromJournal) {
          Object.assign(metricPatch, mobilityJournal.metricPatch);
        }

        if (mobilityJournal.note) {
          notes.push(mobilityJournal.note);
        }
        notes.push('Foreground location availability was confirmed for mobility estimates.');
      } else {
        notes.push('Location access was declined, so mobility stayed on fallback values.');
      }
    } catch {
      notes.push('Location sync was unavailable.');
    }
  }

  return {
    metricPatch,
    signalState,
  };
};
