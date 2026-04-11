import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CollectorCapability } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

const statusMeta = {
  live: { label: 'Live', bg: 'rgba(173,225,175,0.32)', text: '#4C8A5C' },
  estimated: { label: 'Estimated', bg: 'rgba(221,235,221,0.85)', text: colors.warmGray },
  'native-required': {
    label: 'Native required',
    bg: 'rgba(137,210,198,0.2)',
    text: colors.deepTeal,
  },
  blocked: { label: 'Blocked', bg: 'rgba(137,210,198,0.22)', text: colors.deepTeal },
  unavailable: { label: 'Unavailable', bg: 'rgba(160,167,162,0.16)', text: colors.warmGray },
} as const;

export const CollectorCapabilityCard = ({
  capability,
}: {
  capability: CollectorCapability;
}) => {
  const meta = statusMeta[capability.status];

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.group}>{capability.group}</Text>
          <Text style={styles.title}>{capability.title}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.badgeText, { color: meta.text }]}>{meta.label}</Text>
        </View>
      </View>
      <Text style={styles.summary}>{capability.summary}</Text>
      <Text style={styles.detail}>{capability.detail}</Text>
      <View style={styles.signalWrap}>
        {capability.signals.map((signal) => (
          <View key={signal} style={styles.signalChip}>
            <Text style={styles.signalText}>{signal}</Text>
          </View>
        ))}
      </View>
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  group: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 11,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  badge: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
  },
  summary: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  detail: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  signalWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  signalChip: {
    backgroundColor: 'rgba(221,235,221,0.62)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  signalText: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 11,
  },
});
