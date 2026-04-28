import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/Screen';
import { SectionTitle } from '../components/SectionTitle';
import { SurfaceCard } from '../components/SurfaceCard';
import { TooltipInfo } from '../components/TooltipInfo';
import { useAppContext } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { co2eLabel, formatKgCo2, formatKgCo2Compact, formatMetricNumber } from '../utils/formatters';
import {
  getMetricDisplayValue,
  getMetricSources,
  metricSections,
  sumMetricRuleKgCo2,
} from '../utils/metrics';

const formatMetricValue = (value: string | boolean | number, unit: string) => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'On' : 'Off';
  }

  switch (unit) {
    case 'minutes':
      return `${Math.round(value)} min`;
    case 'percent':
      return `${Math.round(value * 100)}%`;
    case 'mb':
      return `${formatMetricNumber(value)} MB`;
    case 'steps':
      return `${formatMetricNumber(value)} steps`;
    case 'celsius':
      return `${formatMetricNumber(value)}°C`;
    default:
      return formatMetricNumber(value);
  }
};

export const InsightsScreen = () => {
  const { todayBreakdown, todayMetrics, trackedMetrics } = useAppContext();
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(metricSections[0]?.group ?? null);
  const [expandedSubsections, setExpandedSubsections] = React.useState<Record<string, boolean>>({});

  const sections = metricSections.map((section) => {
    const metrics = section.metrics.map((metric) => {
      const sources = getMetricSources(metric.ruleIds);
      return {
        ...metric,
        kgCo2: sumMetricRuleKgCo2(metric.ruleIds, todayBreakdown.entries),
        value: getMetricDisplayValue(todayMetrics, metric.key),
        sourceRule: sources[0],
      };
    });

    const subsections = Array.from(new Set(metrics.map((metric) => metric.subcategory))).map(
      (subcategory) => {
        const children = metrics.filter((metric) => metric.subcategory === subcategory);
        return {
          subcategory,
          metrics: children,
          totalKgCo2: children.reduce((sum, metric) => sum + metric.kgCo2, 0),
        };
      },
    );

    return {
      ...section,
      totalKgCo2: metrics.reduce((sum, metric) => sum + metric.kgCo2, 0),
      metrics,
      subsections,
    };
  });

  const totalKgCo2 = todayBreakdown.estimatedKgCo2;

  return (
    <Screen>
      <SurfaceCard>
        <SectionTitle title="Today's total" subtitle={`Modeled footprint across every tracked metric in ${co2eLabel}`} />
        <Text style={styles.totalValue}>{formatKgCo2(totalKgCo2)}</Text>
        <Text style={styles.totalCopy}>{todayBreakdown.primaryInsight}</Text>
      </SurfaceCard>

      {sections.map((section) => {
        const expanded = expandedGroup === section.group;

        return (
          <SurfaceCard key={section.group}>
            <Pressable
              onPress={() => setExpandedGroup(expanded ? null : section.group)}
              style={styles.groupHeader}
            >
              <View style={styles.groupCopy}>
                <Text style={styles.groupTitle}>{section.group}</Text>
                <Text style={styles.groupSubtitle}>
                  {expanded
                    ? `${section.metrics.length} measurable inputs`
                    : `${formatKgCo2Compact(section.totalKgCo2)} total`}
                </Text>
              </View>
              <View style={styles.groupHeaderRight}>
                <Text style={styles.groupImpact}>{formatKgCo2Compact(section.totalKgCo2)}</Text>
                <Ionicons
                  color={colors.deepTeal}
                  name={expanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={18}
                />
              </View>
            </Pressable>

            {expanded ? (
              <View style={styles.metricList}>
                {section.subsections.map((subsection) => {
                  const subsectionKey = `${section.group}:${subsection.subcategory}`;
                  const subExpanded = expandedSubsections[subsectionKey] ?? false;

                  return (
                    <View key={subsection.subcategory} style={styles.subsectionCard}>
                      <Pressable
                        onPress={() =>
                          setExpandedSubsections((current) => ({
                            ...current,
                            [subsectionKey]: !subExpanded,
                          }))
                        }
                        style={styles.subsectionHeader}
                      >
                        <View style={styles.groupCopy}>
                          <Text style={styles.subsectionTitle}>{subsection.subcategory}</Text>
                          <Text style={styles.groupSubtitle}>
                            {subExpanded
                              ? `${subsection.metrics.length} metrics`
                              : `${formatKgCo2Compact(subsection.totalKgCo2)} total`}
                          </Text>
                        </View>
                        <View style={styles.groupHeaderRight}>
                          <Text style={styles.groupImpact}>
                            {formatKgCo2Compact(subsection.totalKgCo2)}
                          </Text>
                          <Ionicons
                            color={colors.deepTeal}
                            name={subExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                            size={18}
                          />
                        </View>
                      </Pressable>

                      {subExpanded
                        ? subsection.metrics.map((metric) => (
                            <View key={metric.key} style={styles.metricRow}>
                              <View style={styles.metricMain}>
                                <View style={styles.metricHeading}>
                                  <Text style={styles.metricLabel}>{metric.label}</Text>
                                  <Text style={styles.metricImpact}>
                                    {formatKgCo2Compact(metric.kgCo2)}
                                  </Text>
                                </View>
                                <Text style={styles.metricValue}>
                                  {formatMetricValue(metric.value, metric.unit)}
                                  {!trackedMetrics[metric.key] ? ' • untracked' : ''}
                                </Text>
                                <Text style={styles.metricNote}>
                                  {metric.sourceRule?.notification ?? 'Tracked in this category group.'}
                                </Text>
                              </View>
                              {metric.sourceRule ? (
                                <TooltipInfo
                                  referenceId={metric.sourceRule.referenceId}
                                  summary={metric.sourceRule.summary}
                                />
                              ) : null}
                            </View>
                          ))
                        : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </SurfaceCard>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  totalValue: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 42,
    lineHeight: 46,
  },
  totalCopy: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  groupHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupCopy: {
    flex: 1,
    paddingRight: spacing.md,
  },
  groupTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 18,
  },
  groupSubtitle: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: spacing.xxs,
  },
  groupHeaderRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  groupImpact: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
  },
  metricList: {
    borderColor: 'rgba(160,167,162,0.14)',
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  subsectionCard: {
    borderColor: 'rgba(160,167,162,0.14)',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  subsectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  subsectionTitle: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
  },
  metricRow: {
    borderBottomColor: 'rgba(160,167,162,0.12)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  metricMain: {
    flex: 1,
    gap: spacing.xxs,
  },
  metricHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: colors.forestInk,
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    paddingRight: spacing.sm,
  },
  metricImpact: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  metricValue: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 13,
  },
  metricNote: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
    lineHeight: 17,
  },
});
