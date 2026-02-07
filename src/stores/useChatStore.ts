import { create } from 'zustand';
import { Message } from '../types/database';
import * as messageRepo from '../db/repositories/messageRepository';
import * as conversationRepo from '../db/repositories/conversationRepository';
import { generateConversationTitle } from '../utils/formatting';
import { useConversationStore } from './useConversationStore';

export interface ToolCallDisplayItem {
  id: string;
  toolName: string;
  params: Record<string, unknown>;
  status: 'running' | 'done' | 'error';
  result?: unknown;
  error?: string;
}

export type ChatDisplayItem =
  | { type: 'message'; data: Message }
  | { type: 'tool_call'; data: ToolCallDisplayItem };

interface ChatState {
  messages: Message[];
  toolCallItems: ToolCallDisplayItem[];
  currentConversationId: number | null;
  isLoading: boolean;
  streamingText: string;
  isStreaming: boolean;
  isProcessing: boolean; // true during entire chat turn (streaming + tool calls)

  loadMessages: (conversationId: number) => Promise<void>;
  addUserMessage: (content: string) => Promise<Message | null>;
  addAssistantMessage: (content: string) => Promise<Message | null>;
  addToolCallMessage: (item: ToolCallDisplayItem) => Promise<Message | null>;
  setStreamingText: (text: string) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  addToolCall: (item: ToolCallDisplayItem) => void;
  updateToolCall: (id: string, update: Partial<ToolCallDisplayItem>) => void;
  removeToolCall: (id: string) => void;
  clearToolCalls: () => void;
  setCurrentConversation: (id: number | null) => void;
  clearChat: () => void;

  getDisplayItems: () => ChatDisplayItem[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  toolCallItems: [],
  currentConversationId: null,
  isLoading: false,
  streamingText: '',
  isStreaming: false,
  isProcessing: false,

  loadMessages: async (conversationId: number) => {
    set({ isLoading: true, currentConversationId: conversationId, toolCallItems: [] });
    try {
      const messages = await messageRepo.getMessagesForConversation(
        conversationId
      );
      set({ messages, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addUserMessage: async (content: string) => {
    const { currentConversationId } = get();
    if (!currentConversationId) return null;

    const message = await messageRepo.createMessage(
      currentConversationId,
      'user',
      content
    );
    await conversationRepo.touchConversation(currentConversationId);

    const { messages } = get();
    if (messages.length === 0) {
      const title = generateConversationTitle(content);
      await useConversationStore
        .getState()
        .updateTitle(currentConversationId, title);
    }

    set((state) => ({ messages: [...state.messages, message] }));
    return message;
  },

  addAssistantMessage: async (content: string) => {
    const { currentConversationId } = get();
    if (!currentConversationId) return null;

    const message = await messageRepo.createMessage(
      currentConversationId,
      'assistant',
      content
    );
    set((state) => ({ messages: [...state.messages, message] }));
    return message;
  },

  addToolCallMessage: async (item: ToolCallDisplayItem) => {
    const { currentConversationId } = get();
    if (!currentConversationId) return null;

    const message = await messageRepo.createMessage(
      currentConversationId,
      'tool_call',
      JSON.stringify(item)
    );
    set((state) => ({ messages: [...state.messages, message] }));
    return message;
  },

  setStreamingText: (text: string) => set({ streamingText: text }),
  setIsStreaming: (isStreaming: boolean) =>
    set({ isStreaming, streamingText: isStreaming ? '' : get().streamingText }),
  setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),

  addToolCall: (item: ToolCallDisplayItem) =>
    set((state) => ({ toolCallItems: [...state.toolCallItems, item] })),

  updateToolCall: (id: string, update: Partial<ToolCallDisplayItem>) =>
    set((state) => ({
      toolCallItems: state.toolCallItems.map((tc) =>
        tc.id === id ? { ...tc, ...update } : tc
      ),
    })),

  removeToolCall: (id: string) =>
    set((state) => ({
      toolCallItems: state.toolCallItems.filter((tc) => tc.id !== id),
    })),

  clearToolCalls: () => set({ toolCallItems: [] }),

  setCurrentConversation: (id: number | null) =>
    set({ currentConversationId: id }),

  clearChat: () =>
    set({
      messages: [],
      toolCallItems: [],
      currentConversationId: null,
      streamingText: '',
      isStreaming: false,
      isProcessing: false,
    }),

  getDisplayItems: () => {
    const { messages, toolCallItems } = get();
    const items: ChatDisplayItem[] = [];
    for (const m of messages) {
      if (m.role === 'tool_call') {
        try {
          const tcData = JSON.parse(m.content) as ToolCallDisplayItem;
          items.push({ type: 'tool_call' as const, data: tcData });
        } catch {
          // Skip malformed tool call messages
        }
      } else {
        items.push({ type: 'message' as const, data: m });
      }
    }
    // Append in-flight (running) tool calls from in-memory state,
    // excluding any that have already been persisted as messages
    const persistedToolCallIds = new Set(
      items.filter((i) => i.type === 'tool_call').map((i) => i.data.id)
    );
    for (const tc of toolCallItems) {
      if (!persistedToolCallIds.has(tc.id)) {
        items.push({ type: 'tool_call' as const, data: tc });
      }
    }
    return items;
  },
}));
