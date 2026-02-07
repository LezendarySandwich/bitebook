import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { colors, spacing, typography } from '../theme';
import { useConversationStore } from '../stores/useConversationStore';
import { formatDate } from '../utils/dates';
import { truncateText } from '../utils/formatting';

export function DrawerContent(props: DrawerContentComponentProps) {
  const { conversations, loadConversations, createConversation } =
    useConversationStore();

  React.useEffect(() => {
    loadConversations();
  }, []);

  const handleNewChat = async () => {
    const conversation = await createConversation();
    props.navigation.navigate('Chat', { conversationId: conversation.id });
  };

  const handleOpenChat = (conversationId: number) => {
    props.navigation.navigate('Chat', { conversationId });
  };

  const handleOpenDashboard = () => {
    props.navigation.navigate('Dashboard');
  };

  const handleOpenSettings = () => {
    props.navigation.navigate('Settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BiteBook</Text>
      </View>

      <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
        <Text style={styles.newChatText}>+ New Chat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={handleOpenDashboard}>
        <Text style={styles.navItemText}>Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Conversations</Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        style={styles.conversationList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => handleOpenChat(item.id)}
          >
            <Text style={styles.conversationTitle}>
              {truncateText(item.title || 'New Conversation', 30)}
            </Text>
            <Text style={styles.conversationDate}>
              {formatDate(item.updated_at)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No conversations yet</Text>
        }
      />

      <View style={styles.divider} />

      <TouchableOpacity style={styles.navItem} onPress={handleOpenSettings}>
        <Text style={styles.navItemText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sidebar.background,
  },
  header: {
    backgroundColor: colors.sidebar.header,
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.textOnPrimary,
  },
  newChatButton: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  newChatText: {
    ...typography.button,
    color: colors.textOnPrimary,
  },
  navItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  navItemText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  conversationList: {
    flex: 1,
  },
  conversationItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  conversationTitle: {
    ...typography.bodySmall,
    color: colors.text,
  },
  conversationDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textLight,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
