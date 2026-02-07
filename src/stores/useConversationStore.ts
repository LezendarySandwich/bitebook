import { create } from 'zustand';
import { Conversation } from '../types/database';
import * as conversationRepo from '../db/repositories/conversationRepository';

interface ConversationState {
  conversations: Conversation[];
  isLoading: boolean;

  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation>;
  updateTitle: (id: number, title: string) => Promise<void>;
  deleteConversation: (id: number) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  isLoading: true,

  loadConversations: async () => {
    try {
      const conversations = await conversationRepo.getAllConversations();
      set({ conversations, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createConversation: async (title?: string) => {
    const conversation = await conversationRepo.createConversation(title);
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
    return conversation;
  },

  updateTitle: async (id: number, title: string) => {
    await conversationRepo.updateConversationTitle(id, title);
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title } : c
      ),
    }));
  },

  deleteConversation: async (id: number) => {
    await conversationRepo.deleteConversation(id);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    }));
  },
}));
