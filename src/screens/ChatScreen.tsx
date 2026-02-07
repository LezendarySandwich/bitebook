import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../navigation/types';
import { useChatStore } from '../stores/useChatStore';
import { useConversationStore } from '../stores/useConversationStore';
import { useLLMStore } from '../stores/useLLMStore';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { chatManager } from '../llm/chatManager';
import { colors } from '../theme';

type ChatRouteProp = RouteProp<RootDrawerParamList, 'Chat'>;
type NavigationProp = DrawerNavigationProp<RootDrawerParamList, 'Chat'>;

export function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const {
    isLoading,
    isStreaming,
    isProcessing,
    streamingText,
    currentConversationId,
    loadMessages,
    addUserMessage,
    setCurrentConversation,
    getDisplayItems,
  } = useChatStore();
  const toolCallItems = useChatStore((s) => s.toolCallItems);
  const messages = useChatStore((s) => s.messages);
  const { isModelLoaded } = useLLMStore();
  const { createConversation } = useConversationStore();

  const conversationId = route.params?.conversationId;

  useEffect(() => {
    if (conversationId) {
      setCurrentConversation(conversationId);
      loadMessages(conversationId);
    }
  }, [conversationId]);

  // Recompute display items when messages or tool calls change
  const displayItems = getDisplayItems();

  const handleSend = async (text: string) => {
    let convId = currentConversationId;

    if (!convId) {
      const conversation = await createConversation();
      convId = conversation.id;
      setCurrentConversation(convId);
      navigation.setParams({ conversationId: convId });
    }

    await addUserMessage(text);
    await chatManager.handleUserMessage(text, convId);
  };

  const inputDisabled = isProcessing || !isModelLoaded;

  if (!conversationId && !currentConversationId) {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Start a Conversation"
          message="Tap the + button in the sidebar or type a message below to start tracking your calories."
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={90}
        >
          <ChatInput onSend={handleSend} disabled={inputDisabled} />
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <MessageList
            displayItems={displayItems}
            streamingText={streamingText}
            isStreaming={isStreaming}
          />
        )}
        <ChatInput onSend={handleSend} disabled={inputDisabled} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
});
