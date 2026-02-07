import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../theme';
import { formatCalories } from '../../utils/formatting';
import { getCaloriePercentage, isOverTarget, getRemainingCalories } from '../../utils/calories';

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = getCaloriePercentage(consumed, target);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const over = isOverTarget(consumed, target);
  const remaining = getRemainingCalories(consumed, target);

  return (
    <Card style={styles.card}>
      <View style={styles.ringContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.calorieRing.background}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={over ? colors.calorieRing.over : colors.calorieRing.progress}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.ringTextContainer}>
          <Text style={styles.consumedText}>{formatCalories(consumed)}</Text>
          <Text style={styles.targetText}>of {formatCalories(target)}</Text>
          <Text style={[styles.remainingText, over && styles.overText]}>
            {over
              ? `${formatCalories(consumed - target)} over`
              : `${formatCalories(remaining)} left`}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  ringContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTextContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  consumedText: {
    ...typography.h1,
    color: colors.text,
  },
  targetText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  remainingText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  overText: {
    color: colors.error,
  },
});
