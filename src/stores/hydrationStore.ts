import { create } from "zustand";
import { HydrationLog } from "../types/models";
import { addSubDoc, querySubDocs, querySubDocsBetweenDates, toDate } from "../services/firestoreService";

interface HydrationState {
  logs: HydrationLog[];
  weeklyLogs: HydrationLog[];
  dailyGoalMl: number;
  isLoading: boolean;

  // Computed
  getTotalForToday: () => number;

  // Actions
  addLog: (amountMl: number, source?: "manual" | "voice") => Promise<void>;
  setDailyGoal: (goalMl: number) => void;
  fetchLogs: (dateStr: string) => Promise<void>;
  fetchWeeklyLogs: (startDateStr: string, endDateStr: string) => Promise<void>;
}

export const useHydrationStore = create<HydrationState>((set, get) => ({
  logs: [],
  weeklyLogs: [],
  dailyGoalMl: 2500,
  isLoading: false,

  getTotalForToday: () => {
    return get().logs.reduce((acc, log) => acc + log.amountMl, 0);
  },

  addLog: async (amountMl, source = "manual") => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const tempId = `temp-${now.getTime()}`;

    // ── Optimistic update: add to local state immediately ──
    const optimisticLog: HydrationLog = {
      id: tempId,
      amountMl,
      date: dateStr,
      loggedAt: now,
      createdAt: now,
      source: source ?? "manual",
    };
    set((state) => ({ logs: [optimisticLog, ...state.logs] }));

    // ── Background Firestore write ──
    try {
      const realId = await addSubDoc("hydrationLogs", {
        amountMl,
        source: source ?? "manual",
        date: dateStr,
        loggedAt: now,
      });
      // Swap temp ID for real Firestore ID
      set((state) => ({
        logs: state.logs.map((l) =>
          l.id === tempId ? { ...l, id: realId } : l
        ),
      }));
    } catch (err) {
      console.error("Failed to add hydration log:", err);
      // Roll back the optimistic entry on failure
      set((state) => ({ logs: state.logs.filter((l) => l.id !== tempId) }));
    }
  },

  setDailyGoal: (goalMl) => set({ dailyGoalMl: goalMl }),

  fetchLogs: async (dateStr) => {
    set({ isLoading: true });
    try {
      const docs = await querySubDocs<HydrationLog>("hydrationLogs", "date", dateStr);
      // Convert Firestore timestamps to Dates
      const logs = docs.map((d) => ({
        ...d,
        loggedAt: toDate(d.loggedAt),
        createdAt: toDate(d.createdAt),
      }));
      set({ logs, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch hydration logs:", err);
      set({ isLoading: false });
    }
  },

  fetchWeeklyLogs: async (startDateStr: string, endDateStr: string) => {
    set({ isLoading: true });
    try {
      const docs = await querySubDocsBetweenDates<HydrationLog>("hydrationLogs", "date", startDateStr, endDateStr);
      const weeklyLogs = docs.map((d) => ({
        ...d,
        loggedAt: toDate(d.loggedAt),
        createdAt: toDate(d.createdAt),
      }));
      set({ weeklyLogs, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch weekly hydration logs:", err);
      set({ isLoading: false });
    }
  },
}));
