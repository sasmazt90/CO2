import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TriggeredRule } from '../engine/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { TooltipInfo } from './TooltipInfo';

export const BreakdownRow = ({ entry }: { entry: TriggeredRule }) => (
  <View style={styles.row}>
    <View style={styles.copy}>
      <View style={styles.titleRow}>
        <Text style={styles.category}>{entry.category}</Text>
        <Text style={[styles.impact, entry.scoreImpact > 0 ? styles.positive : styles.negative]}>
          {entry.scoreImpact > 0 ? '+' : ''}
          {entry.scoreImpact}
        </Text>
      </View>
      <Text style={styles.notification}>{entry.notification}</Text>
      <Text style={styles.recommendation}>{entry.recommendation}</Text>
      <Text style={styles.source}>{entry.source}</Text>
    </View>
    <TooltipInfo summary={entry.summary} referenceId={entry.referenceId} />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  impact: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  positive: {
    color: '#4C9B72',
  },
  negative: {
    color: colors.deepTeal,
  },
  notification: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  recommendation: {
    color: colors.deepTeal,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
  source: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
  },
});
