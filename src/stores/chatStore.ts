import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => {
        const newMsg: ChatMessage = {
          ...msg,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, newMsg],
        }));
      },
      setMessages: (messages) => set({ messages }),
      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: "aurora-chat-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
