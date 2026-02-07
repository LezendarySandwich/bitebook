export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface FoodEntry {
  id: number;
  name: string;
  calories: number;
  quantity: number;
  timestamp: string;
  conversation_id: number | null;
}

export interface Setting {
  key: string;
  value: string;
}

export interface Note {
  id: number;
  content: string;
  type: string;
  created_at: string;
}

export interface SearchCacheEntry {
  id: number;
  query: string;
  results: string;
  created_at: string;
  expires_at: string;
}
