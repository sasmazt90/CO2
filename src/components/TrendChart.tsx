import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatKgCo2Compact, monthDayLabel, weekdayLabel } from '../utils/formatters';

interface TrendPoint {
  date: string;
  value: number;
}

export const TrendChart = ({ data }: { data: TrendPoint[] }) => {
  const [selectedDate, setSelectedDate] = React.useState(data[data.length - 1]?.date);
  const width = 300;
  const height = 120;
  const padding = 12;
  const max = Math.max(...data.map((point) => point.value), 0.01);
  const min = Math.min(...data.map((point) => point.value), 0);
  const range = Math.max(0.001, max - min);

  const points = data.map((point, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const selectedPoint =
    points.find((point) => point.date === selectedDate) ?? points[points.length - 1];

  return (
    <View style={styles.wrapper}>
      {selectedPoint ? (
        <View style={styles.selectedPill}>
          <Text style={styles.selectedDate}>{monthDayLabel(selectedPoint.date)}</Text>
          <Text style={styles.selectedValue}>{formatKgCo2Compact(selectedPoint.value)}</Text>
        </View>
      ) : null}
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Path d={path} stroke="#89D2C6" strokeWidth={4} fill="none" strokeLinecap="round" />
        {points.map((point) => (
          <Circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            fill={point.date === selectedPoint?.date ? colors.deepTeal : '#ADE1AF'}
            onPress={() => setSelectedDate(point.date)}
            r={point.date === selectedPoint?.date ? 6 : 4.5}
          />
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
  selectedPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(143,215,200,0.14)',
    borderRadius: 999,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectedDate: {
    color: colors.forestInk,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  selectedValue: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
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
