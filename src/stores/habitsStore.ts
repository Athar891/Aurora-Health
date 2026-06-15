import { create } from "zustand";
import { Habit, HabitCompletion } from "../types/models";
import {
  addSubDoc,
  queryActiveSubDocs,
  toDate,
} from "../services/firestoreService";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

interface HabitsState {
  habits: Habit[];
  completions: Record<string, HabitCompletion[]>;
  isLoading: boolean;

  // Actions
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  toggleCompletion: (habitId: string, dateStr: string) => Promise<void>;
  fetchHabits: () => Promise<void>;
  fetchCompletions: (habitId: string, dateStr: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completions: {},
  isLoading: false,

  addHabit: async (habitData) => {
    try {
      // Firestore rejects undefined values — strip them out
      const cleanData: Record<string, unknown> = {
        title: habitData.title,
        frequency: habitData.frequency,
        active: true,
      };
      if (habitData.description) {
        cleanData.description = habitData.description;
      }
      const id = await addSubDoc("habits", cleanData);
      const newHabit: Habit = {
        ...habitData,
        id,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ habits: [newHabit, ...state.habits] }));
    } catch (err) {
      console.error("Failed to add habit:", err);
    }
  },

  toggleCompletion: async (habitId, dateStr) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Check if completion already exists for this date
      const completionsRef = collection(
        db,
        "users",
        uid,
        "habits",
        habitId,
        "completions"
      );
      const q = query(completionsRef, where("completedDate", "==", dateStr));
      const snap = await getDocs(q);

      if (snap.empty) {
        // Create completion
        const docRef = await addDoc(completionsRef, {
          completedDate: dateStr,
          status: "completed",
          createdAt: serverTimestamp(),
        });
        const newCompletion: HabitCompletion = {
          id: docRef.id,
          completedDate: dateStr,
          status: "completed",
          createdAt: new Date(),
        };
        set((state) => ({
          completions: {
            ...state.completions,
            [habitId]: [...(state.completions[habitId] || []), newCompletion],
          },
        }));
      } else {
        // Remove completion (toggle off)
        const docToDelete = snap.docs[0];
        await deleteDoc(docToDelete.ref);
        set((state) => ({
          completions: {
            ...state.completions,
            [habitId]: (state.completions[habitId] || []).filter(
              (c) => c.id !== docToDelete.id
            ),
          },
        }));
      }
    } catch (err) {
      console.error("Failed to toggle habit completion:", err);
    }
  },

  fetchHabits: async () => {
    set({ isLoading: true });
    try {
      const docs = await queryActiveSubDocs<Habit>("habits");
      const habits = docs.map((d) => ({
        ...d,
        createdAt: toDate(d.createdAt),
        updatedAt: toDate(d.updatedAt),
      }));
      set({ habits, isLoading: false });
    } catch (err) {
      console.error("Failed to fetch habits:", err);
      set({ isLoading: false });
    }
  },

  fetchCompletions: async (habitId, dateStr) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      const completionsRef = collection(
        db,
        "users",
        uid,
        "habits",
        habitId,
        "completions"
      );
      const q = query(completionsRef, where("completedDate", "==", dateStr));
      const snap = await getDocs(q);
      const completions = snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
            createdAt: toDate(d.data().createdAt),
          } as HabitCompletion)
      );
      set((state) => ({
        completions: { ...state.completions, [habitId]: completions },
      }));
    } catch (err) {
      console.error("Failed to fetch completions:", err);
    }
  },
}));
