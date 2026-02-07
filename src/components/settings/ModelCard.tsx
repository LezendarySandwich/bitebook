import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModelInfo, ModelState } from '../../types/models';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { colors, spacing, typography } from '../../theme';

interface ModelCardProps {
  model: ModelInfo;
  state: ModelState;
  isActive: boolean;
  onDownload: () => void;
  onDelete: () => void;
  onActivate: () => void;
}

export function ModelCard({
  model,
  state,
  isActive,
  onDownload,
  onDelete,
  onActivate,
}: ModelCardProps) {
  const renderActions = () => {
    switch (state.status) {
      case 'not_downloaded':
        return (
          <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
            <Text style={styles.downloadText}>Download</Text>
          </TouchableOpacity>
        );
      case 'downloading':
        const downloadedMB = state.downloadedBytes
          ? (state.downloadedBytes / (1024 * 1024)).toFixed(0)
          : '0';
        return (
          <View style={styles.progressContainer}>
            <ProgressBar progress={state.progress} />
            <Text style={styles.progressText}>
              {Math.round(state.progress)}% ({downloadedMB} MB / {model.size})
            </Text>
          </View>
        );
      case 'downloaded':
        return (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.activateButton} onPress={onActivate}>
              <Text style={styles.activateText}>Activate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        );
      case 'active':
        return (
          <View style={styles.actionRow}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>Active</Text>
            </View>
            <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        );
      case 'error':
        return (
          <View>
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity style={styles.downloadButton} onPress={onDownload}>
              <Text style={styles.downloadText}>Retry</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <Card style={StyleSheet.flatten([styles.card, isActive && styles.activeCard])}>
      <View style={styles.header}>
        <Text style={styles.name}>{model.name}</Text>
        <Text style={styles.size}>{model.size}</Text>
      </View>
      <Text style={styles.description}>{model.description}</Text>
      <Text style={styles.ram}>RAM Required: {model.ramRequired}</Text>
      {renderActions()}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.h3,
    color: colors.text,
  },
  size: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  ram: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  downloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  downloadText: {
    ...typography.button,
    color: colors.textOnPrimary,
    fontSize: 14,
  },
  activateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  activateText: {
    ...typography.button,
    color: colors.textOnPrimary,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteText: {
    ...typography.button,
    color: colors.error,
    fontSize: 14,
  },
  activeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  activeText: {
    ...typography.button,
    color: colors.primaryDark,
    fontSize: 14,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
