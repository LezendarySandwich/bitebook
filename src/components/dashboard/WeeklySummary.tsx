import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../theme';
import { formatCalories } from '../../utils/formatting';
import { getWeeklyAverage } from '../../utils/calories';

interface WeeklySummaryProps {
  weekCalories: number;
  dayCount: number;
  target: number;
}

export function WeeklySummary({ weekCalories, dayCount, target }: WeeklySummaryProps) {
  const average = getWeeklyAverage(weekCalories, dayCount || 1);

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Weekly Avg</Text>
      <Text style={styles.value}>{formatCalories(average)}</Text>
      <Text style={styles.subtitle}>
        {average <= target ? 'On track' : 'Above target'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  value: {
    ...typography.h2,
    color: colors.text,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
});
