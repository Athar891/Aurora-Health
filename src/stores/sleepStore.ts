import { create } from "zustand";
import { SleepLog } from "../types/models";
import { addSubDoc, querySubDocs, querySubDocsBetweenDates, toDate } from "../services/firestoreService";

interface SleepState {
  logs: SleepLog[];
  weeklyLogs: SleepLog[];
  isLoading: boolean;

  // Actions
  addLog: (log: Omit<SleepLog, "id" | "createdAt">) => Promise<void>;
  fetchLogs: (dateStr: string) => Promise<void>;
  fetchWeeklyLogs: (startDateStr: string, endDateStr: string) => Promise<void>;
}

export const useSleepStore = create<SleepState>((set) => ({
  logs: [],
  weeklyLogs: [],
  isLoading: false,

  addLog: async (logData) => {
    try {
      const id = await addSubDoc("sleepLogs", logData as Record<string, unknown>);
      const newLog: SleepLog = {
        ...logData,
        id,
        createdAt: new Date(),
      };
      set((state) => ({ logs: [newLog, ...state.logs] }));
    } catch (err) {
      console.error("Failed to add sleep log:", err);
    }
  },

  fetchLogs: async (dateStr) => {
    set({ isLoading: true });
    try {
      const docs = await querySubDocs<SleepLog>("sleepLogs", "date", dateStr);
      const logs = docs.map((d) => ({
        ...d,
        sleepStart: toDate(d.sleepStart),
        sleepEnd: toDate(d.sleepEnd),
        createdAt: toDate(d.createdAt),
      }));
      set({ logs, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch sleep logs:", err);
      set({ isLoading: false });
    }
  },

  fetchWeeklyLogs: async (startDateStr: string, endDateStr: string) => {
    set({ isLoading: true });
    try {
      const docs = await querySubDocsBetweenDates<SleepLog>("sleepLogs", "date", startDateStr, endDateStr);
      const weeklyLogs = docs.map((d) => ({
        ...d,
        sleepStart: toDate(d.sleepStart),
        sleepEnd: toDate(d.sleepEnd),
        createdAt: toDate(d.createdAt),
      }));
      set({ weeklyLogs, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch weekly sleep logs:", err);
      set({ isLoading: false });
    }
  },
}));
