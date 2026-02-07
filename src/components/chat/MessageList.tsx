import React, { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Message } from '../../types/database';
import { ChatDisplayItem, ToolCallDisplayItem } from '../../stores/useChatStore';
import { MessageBubble } from './MessageBubble';
import { StreamingText } from './StreamingText';
import { ToolCallBubble } from './ToolCallBubble';
import { colors, spacing, typography } from '../../theme';

interface MessageListProps {
  displayItems: ChatDisplayItem[];
  streamingText: string;
  isStreaming: boolean;
}

export function MessageList({ displayItems, streamingText, isStreaming }: MessageListProps) {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current && (displayItems.length > 0 || isStreaming)) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [displayItems.length, streamingText, isStreaming]);

  const renderItem = ({ item }: { item: ChatDisplayItem }) => {
    if (item.type === 'message') {
      return <MessageBubble message={item.data} />;
    }
    return <ToolCallBubble item={item.data} />;
  };

  const getItemKey = (item: ChatDisplayItem, index: number) => {
    if (item.type === 'message') return `msg_${item.data.id}`;
    return `tc_${index}_${item.data.id}`;
  };

  return (
    <FlatList
      ref={flatListRef}
      data={displayItems}
      renderItem={renderItem}
      keyExtractor={getItemKey}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        !isStreaming ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Tell me what you ate today and I'll help track your calories!
            </Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        isStreaming ? <StreamingText text={streamingText} /> : null
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
