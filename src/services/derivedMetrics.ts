import { DailyMetrics, LiveSignalState } from '../engine/types';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

const clampRatio = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value * 100) / 100));

const hasProvidedMetric = (
  liveSignalState: LiveSignalState,
  metric: string,
) => Boolean(liveSignalState.appUsageProvidedMetrics?.includes(metric));

export const deriveCompositeMetricsFromUsage = ({
  currentMetrics,
  incomingPatch,
  liveSignalState,
}: {
  currentMetrics: DailyMetrics;
  incomingPatch: Partial<DailyMetrics>;
  liveSignalState: LiveSignalState;
}): Partial<DailyMetrics> => {
  if (liveSignalState.appUsageSource !== 'native-module') {
    return {};
  }

  const nextMetrics = {
    ...currentMetrics,
    ...incomingPatch,
  };

  const patch: Partial<DailyMetrics> = {};

  if (
    liveSignalState.appUsageObservedAppsCount !== undefined ||
    nextMetrics.heavyAppOpens > 0
  ) {
    patch.backgroundActiveApps = clamp(
      (liveSignalState.appUsageObservedAppsCount ?? 0) * 0.18 +
        nextMetrics.heavyAppOpens * 0.35,
      1,
      14,
    );
  }

  if (
    hasProvidedMetric(liveSignalState, 'heavyAppOpens') ||
    hasProvidedMetric(liveSignalState, 'videoStreamingMinutes') ||
    hasProvidedMetric(liveSignalState, 'cameraMinutes') ||
    hasProvidedMetric(liveSignalState, 'arUsageMinutes')
  ) {
    patch.backgroundComputeTime = clamp(
      nextMetrics.heavyAppOpens * 3.2 +
        nextMetrics.videoStreamingTime * 0.16 +
        nextMetrics.cameraUsage * 0.7 +
        nextMetrics.arAppUsage * 1.2,
      0,
      180,
    );

    patch.cpuHighUsage = clamp(
      nextMetrics.heavyAppOpens * 0.7 +
        nextMetrics.cameraUsage * 0.45 +
        nextMetrics.arAppUsage * 0.8 +
        nextMetrics.videoStreamingTime * 0.08,
      0,
      24,
    );
  }

  if (hasProvidedMetric(liveSignalState, 'mobileDataUsageMb')) {
    patch.largeMobileTransfers = clamp(nextMetrics.mobileDataUsage * 0.55, 0, 2000);
    patch.radioHighPowerTime = clamp(
      nextMetrics.mobileDataUsage * 0.12 +
        nextMetrics.navigationTime * 0.35 +
        nextMetrics.videoStreamingTime * 0.18,
      0,
      240,
    );
    patch.lowSignalTime = clamp(
      patch.radioHighPowerTime * 0.45 + nextMetrics.navigationTime * 0.12,
      0,
      180,
    );
  }

  if (hasProvidedMetric(liveSignalState, 'videoStreamingMinutes')) {
    patch.autoplayVideosCount = clamp(nextMetrics.videoStreamingTime / 18, 0, 16);
  }

  if (
    liveSignalState.appUsageObservedAppsCount !== undefined ||
    hasProvidedMetric(liveSignalState, 'unusedAppsCount')
  ) {
    patch.cloudSyncSessions = clamp(
      (liveSignalState.appUsageObservedAppsCount ?? 0) * 0.05 +
        nextMetrics.unusedAppsCount * 0.18,
      0,
      8,
    );
  }

  return patch;
};

export const deriveProxyMetricsFromObservedSignals = ({
  currentMetrics,
  liveSignalState,
}: {
  currentMetrics: DailyMetrics;
  liveSignalState: LiveSignalState;
}): Partial<DailyMetrics> => {
  const patch: Partial<DailyMetrics> = {};

  if (
    liveSignalState.appUsageSource === 'native-module' ||
    liveSignalState.appUsageSource === 'app-session-journal'
  ) {
    patch.idleScreenOn = clamp(
      currentMetrics.screenTime * 0.08 + currentMetrics.heavyAppOpens * 0.6,
      0,
      45,
    );
    patch.avgTemp = clamp(
      31 +
        currentMetrics.cpuHighUsage * 0.35 +
        currentMetrics.cameraUsage * 0.15 +
        currentMetrics.arAppUsage * 0.4 +
        currentMetrics.videoStreamingTime * 0.03,
      30,
      42,
    );
    patch.btAudioTime = clamp(currentMetrics.musicListeningTime * 0.6, 0, 360);
    patch.btOnTime = clamp((patch.btAudioTime ?? 0) + 1, 0, 720);
    patch.btActiveDevices = (patch.btAudioTime ?? 0) > 0 ? 1 : 0;
    patch.callCount = clamp(
      currentMetrics.screenTime * 0.012 + currentMetrics.socialMediaTime * 0.02,
      0,
      14,
    );
    patch.singleCallDuration = clamp(
      currentMetrics.screenTime * 0.06 + currentMetrics.socialMediaTime * 0.03,
      0,
      60,
    );
    patch.speakerCallTime = clamp((patch.singleCallDuration ?? 0) * 0.22, 0, 20);
    patch.avgMusicVolume = clampRatio(
      0.36 +
        currentMetrics.musicListeningTime / 800 +
        (patch.btAudioTime ?? 0) / 1200,
      0.28,
      0.78,
    );
    patch.duplicateMedia = clamp(
      currentMetrics.cameraUsage * 3 +
        (currentMetrics.recorded4KVideo ? 20 : 0) +
        currentMetrics.arAppUsage * 2,
      0,
      240,
    );
    patch.compressionTasks = clamp(
      (patch.duplicateMedia ?? 0) / 35 + currentMetrics.heavyAppOpens / 7,
      0,
      12,
    );
    patch.gyroActiveApps = clamp(
      currentMetrics.arAppUsage / 4 + currentMetrics.navigationTime / 25,
      0,
      10,
    );
    patch.proximityActiveTime = clamp(
      (patch.singleCallDuration ?? 0) * 0.9,
      0,
      90,
    );
    patch.faceIDUnlocks = clamp(
      currentMetrics.heavyAppOpens * 1.8 + currentMetrics.screenTime / 7,
      0,
      120,
    );
    patch.recorded4KVideo =
      currentMetrics.cameraUsage >= 18 && currentMetrics.cpuHighUsage >= 12;
  }

  if (liveSignalState.locationEnabled) {
    patch.locationRequests = clamp(
      currentMetrics.navigationTime * 2.5 +
        currentMetrics.shortVehicleTrips * 3 +
        (currentMetrics.steps < 3000 ? 8 : 2),
      0,
      120,
    );
    patch.locationAlwaysOnApps = clamp(currentMetrics.navigationTime / 35, 0, 3);
  }

  if (liveSignalState.batteryJournalDerived || liveSignalState.batteryLevel !== undefined) {
    patch.fastChargeSessions = clamp(
      currentMetrics.chargeSessions *
        (currentMetrics.timeBelow20 > 60 ? 0.7 : 0.35),
      0,
      Math.max(currentMetrics.chargeSessions, 1),
    );
  }

  if (liveSignalState.appUsageSource === 'native-module') {
    patch.hotspotDuration = clamp(
      currentMetrics.mobileDataUsage * 0.02 +
        currentMetrics.largeMobileTransfers * 0.04 -
        4,
      0,
      30,
    );
    patch.mobileUpdatesData = clamp(
      currentMetrics.unusedAppsCount * 6 + currentMetrics.cloudSyncSessions * 12,
      0,
      320,
    );
    patch.multiDeviceSyncEvents = clamp(
      currentMetrics.unusedAppsCount * 0.25 + currentMetrics.cloudSyncSessions * 0.8,
      0,
      12,
    );
    patch.backupRunsPerDay = clamp(currentMetrics.cloudSyncSessions / 2, 0, 4);
  }

  return patch;
};
