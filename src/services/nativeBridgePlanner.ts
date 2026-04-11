import { CollectorCapability, CollectorCapabilityId } from '../engine/types';

export type BridgePriority = 'High' | 'Medium' | 'Low';
export type NativeBridgePlatform = 'iOS' | 'Android';
export type NativeBridgePlanStatus =
  | 'live'
  | 'partial'
  | 'planned'
  | 'platform-limited';

export interface NativeBridgePlatformPlan {
  platform: NativeBridgePlatform;
  status: NativeBridgePlanStatus;
  summary: string;
  implementation: string;
  permissions: string[];
}

export interface NativeBridgePlan {
  collectorId: CollectorCapabilityId;
  title: string;
  priority: BridgePriority;
  rationale: string;
  categoryCount: number;
  outcomeCount: number;
  currentStatus: CollectorCapability['status'];
  platforms: NativeBridgePlatformPlan[];
  nextSteps: string[];
}

const priorityRank: Record<BridgePriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const bridgePlanConfig: Record<
  CollectorCapabilityId,
  Omit<
    NativeBridgePlan,
    'collectorId' | 'title' | 'categoryCount' | 'outcomeCount' | 'currentStatus'
  >
> = {
  'screen-time': {
    priority: 'High',
    rationale:
      'This family covers some of the most visible behavior rules and needs true daily usage history to move beyond estimates.',
    platforms: [
      {
        platform: 'iOS',
        status: 'planned',
        summary:
          'Needs a dedicated screen-time handoff so app and daily usage totals can be imported into the shared score engine.',
        implementation:
          'Build a native collector that writes daily usage buckets and social-app minutes into local app storage before scoring.',
        permissions: ['User-approved screen-time access'],
      },
      {
        platform: 'Android',
        status: 'planned',
        summary:
          'Needs a foreground usage bridge so per-app and total screen time can be aggregated locally.',
        implementation:
          'Collect daily foreground totals, normalize app categories, and merge them into the metrics snapshot.',
        permissions: ['Usage access permission'],
      },
    ],
    nextSteps: [
      'Define daily usage schema',
      'Normalize social app categories',
      'Persist imports before morning score rebuild',
    ],
  },
  'brightness-display': {
    priority: 'Low',
    rationale:
      'Brightness is already live; the remaining gap is better idle screen history, not a full collector rewrite.',
    platforms: [
      {
        platform: 'iOS',
        status: 'partial',
        summary:
          'Current brightness can sync live, but screen-on idle duration still needs session-level bookkeeping.',
        implementation:
          'Record wake intervals and passive screen spans, then fold them into the daily metrics patch.',
        permissions: ['No new permissions beyond current brightness sync'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'Brightness sync is available, while idle screen-on still relies on heuristic timing.',
        implementation:
          'Track foreground session gaps and map them to idle display minutes.',
        permissions: ['No new permissions beyond current brightness sync'],
      },
    ],
    nextSteps: [
      'Add session timeline capture',
      'Estimate idle screen-on from wake intervals',
      'Validate against seeded fallback values',
    ],
  },
  'battery-charging': {
    priority: 'High',
    rationale:
      'Charging behavior touches several habit rules, and a real session history would make coaching much more believable.',
    platforms: [
      {
        platform: 'iOS',
        status: 'partial',
        summary:
          'Battery state is live, but historical charging windows still need a background-safe local journal.',
        implementation:
          'Persist charge start, stop, and capped ranges locally so the rule engine can score overcharge and overnight patterns.',
        permissions: ['Battery state access already active'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'Live battery information is available, while charge-session history still needs native persistence.',
        implementation:
          'Capture charge events and state transitions, then roll them into daily charging aggregates.',
        permissions: ['Battery state access already active'],
      },
    ],
    nextSteps: [
      'Store charge sessions locally',
      'Track time-at-100 and overnight windows',
      'Rebuild charging rules from persisted sessions',
    ],
  },
  'motion-steps': {
    priority: 'Medium',
    rationale:
      'Step count is already live, but short-trip replacement coaching improves when motion history becomes less approximate.',
    platforms: [
      {
        platform: 'iOS',
        status: 'partial',
        summary:
          'Pedometer data is available, though trip substitution logic still uses lightweight inference.',
        implementation:
          'Augment steps with route-length bands and daypart heuristics for short-trip coaching.',
        permissions: ['Motion access'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'Motion signals are usable now, but richer travel segmentation still needs native event batching.',
        implementation:
          'Persist motion episodes and pair them with optional location samples.',
        permissions: ['Activity recognition'],
      },
    ],
    nextSteps: [
      'Batch motion episodes',
      'Combine step density with trip windows',
      'Tune short-trip replacement thresholds',
    ],
  },
  'location-mobility': {
    priority: 'Medium',
    rationale:
      'Mobility rules are valuable, but they need careful permission handling and calm privacy messaging across both platforms.',
    platforms: [
      {
        platform: 'iOS',
        status: 'partial',
        summary:
          'Foreground location is enough for light mobility coaching, though deeper route classification still needs careful sampling.',
        implementation:
          'Use short foreground samples plus daily aggregation instead of continuous tracking.',
        permissions: ['Location while using the app'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'Optional location access can support mobility estimates, while more detailed travel traces should stay battery-aware.',
        implementation:
          'Collect lightweight trip windows and summarize them locally into transport-friendly buckets.',
        permissions: ['Fine or approximate location'],
      },
    ],
    nextSteps: [
      'Define privacy-safe trip buckets',
      'Limit sample frequency',
      'Keep route summaries on-device only',
    ],
  },
  'notifications-local': {
    priority: 'Low',
    rationale:
      'Notification delivery is already working; the main remaining gap is better analysis of notification bursts, not transport.',
    platforms: [
      {
        platform: 'iOS',
        status: 'partial',
        summary:
          'Local notifications and inbox mirroring work, but exact burst counting still depends on approximated behavior.',
        implementation:
          'Persist in-app notification events and align them with rule triggers.',
        permissions: ['Notification permission'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'Alert delivery is live, while richer notification burst tracking still needs a dedicated event sink.',
        implementation:
          'Capture delivered alert summaries locally and merge them into the daily snapshot.',
        permissions: ['Notification permission'],
      },
    ],
    nextSteps: [
      'Add delivered notification journal',
      'Compare burst totals with heuristics',
      'Keep positive and negative nudges balanced',
    ],
  },
  'network-radios': {
    priority: 'Medium',
    rationale:
      'Network rules cover many outcomes, but some low-level modem behavior should remain approximate even after native work.',
    platforms: [
      {
        platform: 'iOS',
        status: 'platform-limited',
        summary:
          'Traffic and sync behavior can improve, but exact radio power and weak-signal states are only partially observable.',
        implementation:
          'Keep transparent heuristics for radio intensity while improving app-level data transfer summaries.',
        permissions: ['Optional network usage summaries only'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'App-level transfer totals can improve with native integration, though true modem power still needs estimation.',
        implementation:
          'Bridge daily traffic totals and sync bursts into the shared rule engine, while leaving last-mile radio power heuristic.',
        permissions: ['Network usage access where available'],
      },
    ],
    nextSteps: [
      'Separate transfer totals from radio heuristics',
      'Keep weak-signal scoring explicit about estimation',
      'Validate sync and hotspot categories',
    ],
  },
  'audio-calls': {
    priority: 'Medium',
    rationale:
      'Audio rules are useful habit nudges, but exact call and playback telemetry needs more platform-specific work.',
    platforms: [
      {
        platform: 'iOS',
        status: 'planned',
        summary:
          'Playback and call patterns need a native event layer before speakerphone and volume scoring can move past prototypes.',
        implementation:
          'Record coarse call and playback sessions locally, then aggregate them into energy-friendly audio metrics.',
        permissions: ['Microphone or call-related access only where user-approved'],
      },
      {
        platform: 'Android',
        status: 'planned',
        summary:
          'Android can support richer session summaries, but audio telemetry still needs a dedicated bridge.',
        implementation:
          'Aggregate playback volume bands, Bluetooth audio time, and long-call windows into daily summaries.',
        permissions: ['Audio or call-state access where appropriate'],
      },
    ],
    nextSteps: [
      'Define privacy-safe audio summary schema',
      'Track coarse volume bands instead of raw streams',
      'Separate call duration from playback time',
    ],
  },
  'background-processes': {
    priority: 'High',
    rationale:
      'This family covers a large chunk of system-efficiency coaching and is one of the biggest remaining native gaps.',
    platforms: [
      {
        platform: 'iOS',
        status: 'platform-limited',
        summary:
          'Some background refresh signals can be approximated, but a full system-level process inventory is not a realistic app-facing feed.',
        implementation:
          'Focus on app-owned refresh patterns and user-visible surfaces instead of promising full OS visibility.',
        permissions: ['No additional permissions; keep scope narrow'],
      },
      {
        platform: 'Android',
        status: 'planned',
        summary:
          'Android can support more system-surface visibility, but the collector still needs a careful native bridge.',
        implementation:
          'Create a local bridge for refresh-heavy apps, widget presence, and compute bursts, then map them into the shared metrics.',
        permissions: ['Usage and app-state access where available'],
      },
    ],
    nextSteps: [
      'Limit collection to user-visible surfaces',
      'Keep unsupported OS signals explicitly estimated',
      'Prioritize refresh-heavy app summaries first',
    ],
  },
  'camera-ar-sensors': {
    priority: 'Medium',
    rationale:
      'Camera and AR bursts are high-intensity workloads, but the app only needs coarse daily summaries rather than frame-level telemetry.',
    platforms: [
      {
        platform: 'iOS',
        status: 'partial',
        summary:
          'Session-level capture can be modeled, while exact sensor timing should stay abstracted into daily summaries.',
        implementation:
          'Track coarse camera, AR, and unlock session counts and persist them as daily totals.',
        permissions: ['Camera access where user-approved'],
      },
      {
        platform: 'Android',
        status: 'partial',
        summary:
          'Android can support richer capture summaries, though fine sensor bursts should remain simplified.',
        implementation:
          'Aggregate session counts for camera, AR, and sensor-heavy apps into daily metrics buckets.',
        permissions: ['Camera and motion access where user-approved'],
      },
    ],
    nextSteps: [
      'Track session counts instead of raw sensor streams',
      'Keep AR and 4K recording as separate heavy events',
      'Validate biometric unlock frequency against fallback values',
    ],
  },
};

export const buildNativeBridgePlans = (
  collectorCapabilities: CollectorCapability[],
): NativeBridgePlan[] =>
  collectorCapabilities
    .map((capability) => {
      const config = bridgePlanConfig[capability.id];

      return {
        collectorId: capability.id,
        title: capability.title,
        categoryCount: capability.coverage.categoryCount,
        outcomeCount: capability.coverage.outcomeCount,
        currentStatus: capability.status,
        ...config,
      };
    })
    .sort((left, right) => {
      const priorityDelta = priorityRank[right.priority] - priorityRank[left.priority];

      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      return right.outcomeCount - left.outcomeCount;
    });

export const summarizeNativeBridgePlans = (plans: NativeBridgePlan[]) => ({
  highPriorityFamilies: plans.filter((plan) => plan.priority === 'High').length,
  iosOperationalFamilies: plans.filter((plan) =>
    plan.platforms.some(
      (platform) =>
        platform.platform === 'iOS' &&
        (platform.status === 'live' || platform.status === 'partial'),
    ),
  ).length,
  androidOperationalFamilies: plans.filter((plan) =>
    plan.platforms.some(
      (platform) =>
        platform.platform === 'Android' &&
        (platform.status === 'live' || platform.status === 'partial'),
    ),
  ).length,
  nativeGapOutcomes: plans
    .filter((plan) =>
      plan.platforms.some(
        (platform) =>
          platform.status === 'planned' || platform.status === 'platform-limited',
      ),
    )
    .reduce((sum, plan) => sum + plan.outcomeCount, 0),
  immediateFocusOutcomes: plans
    .filter((plan) => plan.priority === 'High')
    .reduce((sum, plan) => sum + plan.outcomeCount, 0),
});
