import {
  CollectorCapability,
  CollectorCapabilityId,
  CollectorCapabilitySeed,
  CollectorCapabilityStatus,
} from '../engine/types';
import { carbonRules } from '../engine/rules';

const categoryCollectorMap: Record<string, CollectorCapabilityId> = {
  Brightness: 'brightness-display',
  'Screen Time': 'screen-time',
  'Idle Screen-On': 'brightness-display',
  'Phone Temperature': 'battery-charging',
  'Bluetooth Usage': 'network-radios',
  'Location Polling': 'location-mobility',
  'Hotspot Usage': 'network-radios',
  'Sleep-mode Drain': 'battery-charging',
  'Background Processes': 'background-processes',
  'Widgets & Live Activities': 'background-processes',
  'Live Wallpapers': 'background-processes',
  'Mobile Data Usage': 'network-radios',
  'High-Data Streaming': 'network-radios',
  'Large Mobile Transfers': 'network-radios',
  'Cloud Sync Bursts': 'network-radios',
  'Auto-play': 'network-radios',
  'Updates on Mobile': 'network-radios',
  VPN: 'network-radios',
  'Weak Signal': 'network-radios',
  'Multi-Device Sync': 'network-radios',
  'Auto-backup Frequency': 'network-radios',
  Speakerphone: 'audio-calls',
  'High-Volume Music': 'audio-calls',
  'Long Music Sessions': 'audio-calls',
  'Long Calls': 'audio-calls',
  'Frequent Call Bursts': 'audio-calls',
  'Bluetooth Audio': 'audio-calls',
  'Social Media Time': 'screen-time',
  'Notification Bursts': 'notifications-local',
  'Short-Trip Vehicle Behavior': 'motion-steps',
  'Low Movement': 'motion-steps',
  'Unused Apps': 'background-processes',
  'Digital Clutter': 'background-processes',
  'File Compression': 'background-processes',
  'Heavy App Startup Frequency': 'screen-time',
  'Overcharging at 100%': 'battery-charging',
  'Overnight Charging': 'battery-charging',
  'Frequent Charge Cycles': 'battery-charging',
  'Fast Charging': 'battery-charging',
  'Charging Outside 20-80%': 'battery-charging',
  'CPU Spikes': 'background-processes',
  'Background Compute': 'background-processes',
  'Navigation Usage': 'location-mobility',
  'Camera Usage': 'camera-ar-sensors',
  '4K Video Recording': 'camera-ar-sensors',
  'Gyroscope-heavy Usage': 'camera-ar-sensors',
  'AR Apps': 'camera-ar-sensors',
  'Proximity Sensor': 'camera-ar-sensors',
  'FaceID IR Projector': 'camera-ar-sensors',
  'Radio Power (Low Signal Antenna Boost)': 'network-radios',
};

const createEmptyCoverage = () => ({
  categories: new Set<string>(),
  outcomeCount: 0,
});

const toCategoryKey = (category: string) =>
  category.replaceAll('â€“', '-').replaceAll('–', '-').trim();

export const attachCollectorCoverage = (
  capabilities: CollectorCapabilitySeed[],
): CollectorCapability[] => {
  const coverageById = new Map(
    capabilities.map((capability) => [capability.id, createEmptyCoverage()]),
  );
  const missingCategories = new Set<string>();

  for (const rule of carbonRules) {
    const collectorId = categoryCollectorMap[toCategoryKey(rule.category)];

    if (!collectorId) {
      missingCategories.add(rule.category);
      continue;
    }

    const coverage = coverageById.get(collectorId);

    if (!coverage) {
      missingCategories.add(rule.category);
      continue;
    }

    coverage.categories.add(rule.category);
    coverage.outcomeCount += 1;
  }

  if (missingCategories.size > 0) {
    console.warn(
      'Collector coverage is missing categories:',
      Array.from(missingCategories).join(', '),
    );
  }

  return capabilities.map((capability) => {
    const coverage = coverageById.get(capability.id) ?? createEmptyCoverage();
    const coveredCategories = Array.from(coverage.categories);

    return {
      ...capability,
      coverage: {
        categoryCount: coveredCategories.length,
        outcomeCount: coverage.outcomeCount,
        coverageShare: coverage.outcomeCount / carbonRules.length,
        coveredCategories,
      },
    };
  });
};

const createStatusSummary = () => ({
  familyCount: 0,
  categoryCount: 0,
  outcomeCount: 0,
});

export const summarizeCollectorCoverage = (capabilities: CollectorCapability[]) => {
  const byStatus: Record<
    CollectorCapabilityStatus,
    ReturnType<typeof createStatusSummary>
  > = {
    live: createStatusSummary(),
    estimated: createStatusSummary(),
    'native-required': createStatusSummary(),
    blocked: createStatusSummary(),
    unavailable: createStatusSummary(),
  };

  for (const capability of capabilities) {
    byStatus[capability.status].familyCount += 1;
    byStatus[capability.status].categoryCount += capability.coverage.categoryCount;
    byStatus[capability.status].outcomeCount += capability.coverage.outcomeCount;
  }

  return {
    totalFamilies: capabilities.length,
    totalCategories: capabilities.reduce(
      (sum, capability) => sum + capability.coverage.categoryCount,
      0,
    ),
    totalOutcomes: capabilities.reduce(
      (sum, capability) => sum + capability.coverage.outcomeCount,
      0,
    ),
    byStatus,
  };
};
