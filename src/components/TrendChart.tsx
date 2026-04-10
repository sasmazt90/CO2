import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { weekdayLabel } from '../utils/formatters';

interface TrendPoint {
  date: string;
  value: number;
}

export const TrendChart = ({ data }: { data: TrendPoint[] }) => {
  const width = 300;
  const height = 120;
  const padding = 12;
  const max = Math.max(...data.map((point) => point.value), 100);
  const min = Math.min(...data.map((point) => point.value), 0);
  const range = Math.max(1, max - min);

  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <View style={styles.wrapper}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={path} stroke="#89D2C6" strokeWidth={4} fill="none" strokeLinecap="round" />
        {points.map((point) => (
          <Circle key={point.date} cx={point.x} cy={point.y} r={4.5} fill="#ADE1AF" />
        ))}
      </Svg>
      <View style={styles.labels}>
        {data.map((point) => (
          <Text key={point.date} style={styles.label}>
            {weekdayLabel(point.date)}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 12,
  },
});
