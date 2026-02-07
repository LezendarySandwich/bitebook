import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface ToolCallIndicatorProps {
  toolName: string;
}

const TOOL_LABELS: Record<string, string> = {
  logFood: 'Logging food...',
  searchWeb: 'Searching web...',
  writeNote: 'Writing note...',
  getCalories: 'Checking calories...',
  getTargetCalories: 'Getting target...',
};

export function ToolCallIndicator({ toolName }: ToolCallIndicatorProps) {
  const dots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dots, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dots, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const label = TOOL_LABELS[toolName] || `Running ${toolName}...`;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { opacity: dots }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.chat.toolIndicator,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
    marginRight: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.secondaryDark,
  },
});
