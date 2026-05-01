import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { useAppContext } from '../context/AppContext';
import { metricSections } from '../utils/metrics';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const MetricTrackingScreen = () => {
  const { trackedMetrics, setGroupTracked, setMetricTracked } = useAppContext();

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle
          title="Tracked metrics"
          subtitle="Turn individual measurements on or off. Group switches affect every metric inside that family."
        />
      </SurfaceCard>

      {metricSections.map((section) => {
        const groupEnabled = section.metrics.every((metric) => trackedMetrics[metric.key]);

        return (
          <SurfaceCard key={section.group}>
            <View style={styles.groupHeader}>
              <View style={styles.groupCopy}>
                <Text style={styles.groupTitle}>{section.group}</Text>
                <Text style={styles.groupSubtitle}>
                  {section.metrics.length} measurable inputs
                </Text>
              </View>
              <Switch
                onValueChange={(value) =>
                  setGroupTracked(section.metrics.map((metric) => metric.key), value)
                }
                trackColor={{ false: 'rgba(160,167,162,0.22)', true: colors.softTeal }}
                thumbColor={groupEnabled ? colors.softWhite : '#F5F6F3'}
                value={groupEnabled}
              />
            </View>

            <View style={styles.metricList}>
              {section.metrics.map((metric) => (
                <View key={metric.key} style={styles.metricRow}>
                  <View style={styles.metricCopy}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricMeta}>{metric.unit}</Text>
                  </View>
                  <Switch
                    onValueChange={(value) => setMetricTracked(metric.key, value)}
                    trackColor={{ false: 'rgba(160,167,162,0.22)', true: colors.softTeal }}
                    thumbColor={trackedMetrics[metric.key] ? colors.softWhite : '#F5F6F3'}
                    value={trackedMetrics[metric.key]}
                  />
                </View>
              ))}
            </View>
          </SurfaceCard>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  groupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupCopy: {
    flex: 1,
    gap: spacing.xxs,
    paddingRight: spacing.md,
  },
  groupTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 17,
  },
  groupSubtitle: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
  metricList: {
    borderColor: 'rgba(160,167,162,0.14)',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  metricRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(160,167,162,0.12)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metricCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  metricLabel: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
  },
  metricMeta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 11,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
