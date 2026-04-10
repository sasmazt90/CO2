import { ChallengeDefinition } from '../engine/types';

const toProgress = (value: number) => Math.max(0, Math.min(1, value));

export const challenges: ChallengeDefinition[] = [
  {
    id: 'brightness-hero-week',
    title: 'Reduce Brightness by 20%',
    description: 'Keep your average brightness around the efficient comfort zone for seven calmer days.',
    group: 'Device Energy',
    targetLabel: 'Target avg brightness under 60%',
    points: 120,
    progress: (metrics) => toProgress((0.8 - metrics.avgBrightness) / 0.3),
  },
  {
    id: 'instagram-balance',
    title: 'Max 1 hour Instagram',
    description: 'Keep social scroll sessions short and intentional this week.',
    group: 'Behavioral',
    targetLabel: 'Target social time under 60 min',
    points: 140,
    progress: (metrics) => toProgress((90 - metrics.socialMediaTime) / 60),
  },
  {
    id: 'eco-charger',
    title: '3 days no overcharging',
    description: 'Unplug once full and stay out of the 100% parking zone.',
    group: 'Charging',
    targetLabel: 'Target 0 min at 100% while plugged',
    points: 160,
    progress: (metrics) => toProgress(1 - metrics.timeAt100WhilePlugged / 30),
  },
  {
    id: 'gentle-streaming',
    title: 'Low-video weekend',
    description: 'Choose audio, downloads, or shorter sessions for a lighter network footprint.',
    group: 'Network & Cloud',
    targetLabel: 'Target streaming under 20 min',
    points: 110,
    progress: (metrics) => toProgress((60 - metrics.videoStreamingTime) / 40),
  },
];
