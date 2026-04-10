import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GroupBreakdownItem } from '../engine/types';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatKgCo2 } from '../utils/formatters';

export const GroupBar = ({ item }: { item: GroupBreakdownItem }) => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.group}>{item.group}</Text>
      <Text style={styles.value}>{formatKgCo2(item.estimatedKgCo2)}</Text>
    </View>
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(10, item.share)}%` }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  group: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  value: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  track: {
    backgroundColor: 'rgba(160,167,162,0.12)',
    borderRadius: radius.sm,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.softTeal,
    borderRadius: radius.sm,
    height: 8,
  },
});
