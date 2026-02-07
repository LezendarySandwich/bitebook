import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ToolCallDisplayItem } from '../../stores/useChatStore';
import { colors, spacing, typography } from '../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ToolCallBubbleProps {
  item: ToolCallDisplayItem;
}

const TOOL_LABELS: Record<string, string> = {
  logFood: 'Logging food',
  searchWeb: 'Searching web',
  writeNote: 'Writing note',
  getCalories: 'Getting calories',
  getTargetCalories: 'Getting target',
};

const TOOL_ICONS: Record<string, string> = {
  logFood: '🍽',
  searchWeb: '🔍',
  writeNote: '📝',
  getCalories: '📊',
  getTargetCalories: '🎯',
};

export function ToolCallBubble({ item }: ToolCallBubbleProps) {
  const [expanded, setExpanded] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (item.status === 'running') {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    }
  }, [item.status]);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const label = TOOL_LABELS[item.toolName] || item.toolName;
  const icon = TOOL_ICONS[item.toolName] || '⚙';

  const statusIcon =
    item.status === 'running' ? '⏳' : item.status === 'done' ? '✓' : '✗';
  const statusColor =
    item.status === 'running'
      ? colors.secondary
      : item.status === 'done'
      ? colors.success
      : colors.error;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.label}>
            {label}
            {item.status === 'running' ? '...' : ''}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.statusIcon, { color: statusColor }]}>
            {statusIcon}
          </Text>
          <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <Text style={styles.detailLabel}>Parameters:</Text>
          <Text style={styles.detailContent}>
            {JSON.stringify(item.params, null, 2)}
          </Text>

          {item.status !== 'running' && (
            <>
              <Text style={styles.detailLabel}>
                {item.status === 'done' ? 'Result:' : 'Error:'}
              </Text>
              <Text
                style={[
                  styles.detailContent,
                  item.status === 'error' && styles.errorContent,
                ]}
              >
                {item.status === 'done'
                  ? JSON.stringify(item.result, null, 2)
                  : item.error}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    maxWidth: '90%',
    backgroundColor: colors.chat.toolIndicator,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 16,
  },
  label: {
    ...typography.bodySmall,
    color: colors.secondaryDark,
    fontWeight: '600',
  },
  statusIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  details: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  detailContent: {
    ...typography.caption,
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#FFF8E1',
    padding: spacing.sm,
    borderRadius: 6,
    overflow: 'hidden',
  },
  errorContent: {
    color: colors.error,
    backgroundColor: '#FFEBEE',
  },
});
