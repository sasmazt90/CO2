import { DailyMetrics, LiveSignalState } from '../engine/types';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

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
  }

  return patch;
};
