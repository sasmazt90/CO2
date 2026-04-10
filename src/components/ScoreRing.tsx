import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export const ScoreRing = ({
  score,
  label,
  secondary,
  size = 220,
}: {
  score: number;
  label: string;
  secondary: string;
  size?: number;
}) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useMemo(
    () => circumference - (circumference * score) / 100,
    [circumference, score],
  );

  return (
    <LinearGradient colors={['rgba(255,255,255,0.78)', 'rgba(221,235,221,0.72)']} style={styles.wrapper}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#89D2C6" />
            <Stop offset="50%" stopColor="#B3E5C9" />
            <Stop offset="100%" stopColor="#ADE1AF" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(160,167,162,0.14)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.center, { width: size * 0.56 }]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.secondary}>{secondary}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 999,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  center: {
    alignItems: 'center',
    gap: spacing.xs,
    position: 'absolute',
  },
  label: {
    color: colors.warmGray,
    fontFamily: typography.body,
    fontSize: 13,
  },
  score: {
    color: colors.forestInk,
    fontFamily: typography.numbers,
    fontSize: 54,
    lineHeight: 58,
    textAlign: 'center',
  },
  secondary: {
    color: colors.deepTeal,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    textAlign: 'center',
  },
});
