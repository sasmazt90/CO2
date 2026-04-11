import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  NativeBridgePlan,
  NativeBridgePlanStatus,
} from '../services/nativeBridgePlanner';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

const priorityMeta = {
  High: { bg: 'rgba(137,210,198,0.22)', text: colors.deepTeal },
  Medium: { bg: 'rgba(221,235,221,0.78)', text: colors.forestInk },
  Low: { bg: 'rgba(248,250,247,0.92)', text: colors.warmGray },
} as const;

const statusMeta: Record<
  NativeBridgePlanStatus,
  { label: string; bg: string; text: string }
> = {
  live: {
    label: 'Live',
    bg: 'rgba(173,225,175,0.32)',
    text: '#4C8A5C',
  },
  partial: {
    label: 'Partial',
    bg: 'rgba(179,229,201,0.3)',
    text: colors.forestInk,
  },
  planned: {
    label: 'Planned',
    bg: 'rgba(137,210,198,0.18)',
    text: colors.deepTeal,
  },
  'platform-limited': {
    label: 'Platform limited',
    bg: 'rgba(160,167,162,0.14)',
    text: colors.warmGray,
  },
};

export const NativeBridgePlanCard = ({ plan }: { plan: NativeBridgePlan }) => (
  <SurfaceCard style={styles.card}>
    <View style={styles.header}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.meta}>
          {plan.categoryCount} categories | {plan.outcomeCount} outcomes | current{' '}
          {plan.currentStatus}
        </Text>
      </View>
      <View
        style={[
          styles.priorityBadge,
          { backgroundColor: priorityMeta[plan.priority].bg },
        ]}
      >
        <Text
          style={[styles.priorityText, { color: priorityMeta[plan.priority].text }]}
        >
          {plan.priority}
        </Text>
      </View>
    </View>

    <Text style={styles.rationale}>{plan.rationale}</Text>

    <View style={styles.platforms}>
      {plan.platforms.map((platform) => (
        <View key={platform.platform} style={styles.platformBlock}>
          <View style={styles.platformHeader}>
            <Text style={styles.platformTitle}>{platform.platform}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusMeta[platform.status].bg },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusMeta[platform.status].text },
                ]}
              >
                {statusMeta[platform.status].label}
              </Text>
            </View>
          </View>
          <Text style={styles.platformSummary}>{platform.summary}</Text>
          <Text style={styles.platformImplementation}>{platform.implementation}</Text>
          <Text style={styles.permissions}>
            Permissions: {platform.permissions.join(', ')}
          </Text>
        </View>
      ))}
    </View>

    <View style={styles.stepsWrap}>
      {plan.nextSteps.map((step) => (
        <View key={step} style={styles.stepChip}>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  </SurfaceCard>
);

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 16,
  },
  meta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  priorityBadge: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  priorityText: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
  },
  rationale: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  platforms: {
    gap: spacing.sm,
  },
  platformBlock: {
    backgroundColor: 'rgba(248,250,247,0.62)',
    borderColor: 'rgba(160,167,162,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.sm,
  },
  platformHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  platformTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  statusText: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
  },
  platformSummary: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  platformImplementation: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  permissions: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
    lineHeight: 16,
  },
  stepsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  stepChip: {
    backgroundColor: 'rgba(221,235,221,0.62)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  stepText: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 11,
  },
});
