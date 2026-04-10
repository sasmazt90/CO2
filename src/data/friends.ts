import { BadgeDefinition, FriendScore } from '../engine/types';

export const friends: FriendScore[] = [
  {
    id: 'friend-1',
    name: 'Mina',
    region: 'Berlin',
    weeklyScore: 89,
    streak: 12,
    sharedBadge: 'Eco Charger Gold',
  },
  {
    id: 'friend-2',
    name: 'Luca',
    region: 'Istanbul',
    weeklyScore: 84,
    streak: 8,
    sharedBadge: 'Green Traveller Silver',
  },
  {
    id: 'friend-3',
    name: 'Elif',
    region: 'Amsterdam',
    weeklyScore: 80,
    streak: 5,
    sharedBadge: 'Brightness Hero Bronze',
  },
];

export const createBadges = (): BadgeDefinition[] => [
  {
    id: 'brightness-hero-bronze',
    title: 'Brightness Hero',
    subtitle: 'Bronze',
    level: 'Bronze',
    icon: 'sun',
    unlocked: (breakdown) => breakdown.entries.some((entry) => entry.id === 'brightness_positive'),
  },
  {
    id: 'eco-charger-silver',
    title: 'Eco Charger',
    subtitle: 'Silver',
    level: 'Silver',
    icon: 'bolt',
    unlocked: (breakdown) => breakdown.entries.some((entry) => entry.id === 'overcharging_positive'),
  },
  {
    id: 'low-screen-time-gold',
    title: 'Low-Screen-Time Champion',
    subtitle: 'Gold',
    level: 'Gold',
    icon: 'phone',
    unlocked: (breakdown) => breakdown.score >= 84,
  },
  {
    id: 'green-traveller-silver',
    title: 'Green Traveller',
    subtitle: 'Silver',
    level: 'Silver',
    icon: 'footsteps',
    unlocked: (breakdown) =>
      !breakdown.entries.some((entry) => entry.id === 'short_trip_vehicle_behavior_high'),
  },
  {
    id: 'calm-leaf-bronze',
    title: 'Calm Leaf',
    subtitle: 'Bronze',
    level: 'Bronze',
    icon: 'leaf',
    unlocked: (breakdown) => breakdown.topPositive.length >= 2,
  },
];
