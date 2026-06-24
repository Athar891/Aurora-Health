import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AISettings {
  autoReadResponses: boolean;
  responseStyle: "concise" | "detailed";
  voiceSpeed: number;
}

interface AISettingsState extends AISettings {
  updateSetting: <K extends keyof AISettings>(key: K, value: AISettings[K]) => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      autoReadResponses: false,
      responseStyle: "concise",
      voiceSpeed: 1.0,
      updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: "aurora-ai-settings",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
