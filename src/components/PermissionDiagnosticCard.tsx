import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PermissionDiagnostic } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { SurfaceCard } from './SurfaceCard';

const statusPalette = {
  granted: { bg: 'rgba(173,225,175,0.32)', text: '#4C8A5C', label: 'Granted' },
  available: { bg: 'rgba(179,229,201,0.3)', text: colors.deepTeal, label: 'Available' },
  pending: { bg: 'rgba(221,235,221,0.8)', text: colors.warmGray, label: 'Pending' },
  blocked: { bg: 'rgba(137,210,198,0.22)', text: colors.deepTeal, label: 'Needs approval' },
  unavailable: { bg: 'rgba(160,167,162,0.16)', text: colors.warmGray, label: 'Unavailable' },
  'native-required': {
    bg: 'rgba(137,210,198,0.18)',
    text: colors.deepTeal,
    label: 'Native module',
  },
} as const;

export const PermissionDiagnosticCard = ({
  diagnostic,
}: {
  diagnostic: PermissionDiagnostic;
}) => {
  const palette = statusPalette[diagnostic.status];

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{diagnostic.title}</Text>
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
          <Text style={[styles.badgeText, { color: palette.text }]}>{palette.label}</Text>
        </View>
      </View>
      <Text style={styles.summary}>{diagnostic.summary}</Text>
      <Text style={styles.detail}>{diagnostic.detail}</Text>
      <Text style={styles.action}>{diagnostic.actionLabel}</Text>
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
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.forestInk,
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
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
  action: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
});
