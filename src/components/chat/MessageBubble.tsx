import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../../types/database';
import { colors, spacing, typography } from '../../theme';
import { formatTime } from '../../utils/dates';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
      <Text style={[styles.time, isUser ? styles.userTime : styles.assistantTime]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  userBubble: {
    backgroundColor: colors.chat.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.chat.assistantBubble,
    borderBottomLeftRadius: 4,
  },
  text: {
    ...typography.body,
  },
  userText: {
    color: colors.chat.userText,
  },
  assistantText: {
    color: colors.chat.assistantText,
  },
  time: {
    ...typography.caption,
    marginTop: 2,
  },
  userTime: {
    color: colors.textLight,
    textAlign: 'right',
  },
  assistantTime: {
    color: colors.textLight,
  },
});
