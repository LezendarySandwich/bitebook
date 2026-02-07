import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../theme';
import { formatCalories } from '../../utils/formatting';
import { getRemainingCalories } from '../../utils/calories';

interface DailySummaryProps {
  consumed: number;
  target: number;
}

export function DailySummary({ consumed, target }: DailySummaryProps) {
  const remaining = getRemainingCalories(consumed, target);

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Today</Text>
      <Text style={styles.value}>{formatCalories(consumed)}</Text>
      <Text style={styles.subtitle}>
        {remaining > 0 ? `${formatCalories(remaining)} remaining` : 'Target reached'}
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
