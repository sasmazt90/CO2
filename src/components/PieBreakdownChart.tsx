import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { GroupBreakdownItem, ScoreGroup } from '../engine/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const groupColors: Record<ScoreGroup, string> = {
  'Device Energy': '#8FD7C8',
  'Network & Cloud': '#B8E3B4',
  Audio: '#C9D7F2',
  Behavioral: '#F2D0A7',
  Charging: '#B8E1E6',
  'Processing & Sensors': '#E4C8E8',
};

export const PieBreakdownChart = ({
  items,
  size = 180,
}: {
  items: GroupBreakdownItem[];
  size?: number;
}) => {
  const radius = size / 2;
  let startAngle = -90;

  const normalized = items
    .filter((item) => item.share > 0)
    .map((item) => ({
      ...item,
      share: Math.max(0, item.share),
    }));

  const describeArc = (start: number, end: number) => {
    const startRadians = (Math.PI / 180) * start;
    const endRadians = (Math.PI / 180) * end;
    const x1 = radius + radius * Math.cos(startRadians);
    const y1 = radius + radius * Math.sin(startRadians);
    const x2 = radius + radius * Math.cos(endRadians);
    const y2 = radius + radius * Math.sin(endRadians);
    const largeArcFlag = end - start > 180 ? 1 : 0;

    return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <View style={styles.wrapper}>
      <Svg height={size} width={size}>
        {normalized.map((item) => {
          const sweep = (item.share / 100) * 360;
          const endAngle = startAngle + sweep;
          const midAngle = startAngle + sweep / 2;
          const labelRadius = radius * 0.62;
          const labelX = radius + labelRadius * Math.cos((Math.PI / 180) * midAngle);
          const labelY = radius + labelRadius * Math.sin((Math.PI / 180) * midAngle);
          const path = describeArc(startAngle, endAngle);
          startAngle = endAngle;

          return (
            <React.Fragment key={item.group}>
              <Path
                d={path}
                fill={groupColors[item.group]}
                stroke={colors.softWhite}
                strokeWidth={1.5}
              />
              {item.share >= 8 ? (
                <SvgText
                  fill={colors.forestInk}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  x={labelX}
                  y={labelY}
                >
                  {Math.round(item.share)}%
                </SvgText>
              ) : null}
            </React.Fragment>
          );
        })}
      </Svg>

      <View style={styles.legend}>
        {normalized.map((item) => (
          <View key={item.group} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: groupColors[item.group] }]} />
            <View style={styles.legendCopy}>
              <Text style={styles.legendLabel}>{item.group}</Text>
              <Text style={styles.legendMeta}>{item.estimatedKgCo2.toFixed(2)} kg CO2e</Text>
            </View>
            <Text style={styles.legendValue}>{Math.round(item.share)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  legend: {
    flex: 1,
    gap: spacing.sm,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    borderRadius: 999,
    height: 10,
    marginRight: spacing.sm,
    width: 10,
  },
  legendCopy: {
    flex: 1,
  },
  legendLabel: {
    color: colors.forestInk,
    fontFamily: typography.body,
    fontSize: 12,
  },
  legendMeta: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 10,
    marginTop: 1,
  },
  legendValue: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
});
