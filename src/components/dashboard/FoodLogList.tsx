import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FoodEntry } from '../../types/database';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../theme';
import { formatTime } from '../../utils/dates';
import { formatCalories } from '../../utils/formatting';

interface FoodLogListProps {
  entries: FoodEntry[];
  onEdit?: (entry: FoodEntry) => void;
}

export function FoodLogList({ entries, onEdit }: FoodLogListProps) {
  if (entries.length === 0) {
    return (
      <Card style={styles.emptyCard}>
        <Text style={styles.emptyText}>
          No food logged today. Start a chat to log your meals!
        </Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Food</Text>
      {entries.map((entry) => (
        <TouchableOpacity key={entry.id} onPress={() => onEdit?.(entry)} activeOpacity={0.7}>
          <Card style={styles.entryCard}>
            <View style={styles.entryRow}>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
              </View>
              <Text style={styles.entryCalories}>
                {formatCalories(entry.calories)} cal
              </Text>
            </View>
          </Card>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  entryCard: {
    marginBottom: spacing.sm,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    ...typography.body,
    color: colors.text,
  },
  entryTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  entryCalories: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
