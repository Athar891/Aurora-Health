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
  updateDoc,
  doc,
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

      let newCompletionInfo = null;
      let removedCompletionId = null;

      if (snap.empty) {
        // Create completion
        const docRef = await addDoc(completionsRef, {
          completedDate: dateStr,
          status: "completed",
          createdAt: serverTimestamp(),
        });
        newCompletionInfo = {
          id: docRef.id,
          completedDate: dateStr,
          status: "completed",
          createdAt: new Date(),
        };
      } else {
        // Remove completion (toggle off)
        const docToDelete = snap.docs[0];
        removedCompletionId = docToDelete.id;
        await deleteDoc(docToDelete.ref);
      }

      // Recalculate streak
      const allSnap = await getDocs(completionsRef);
      const dates = allSnap.docs.map(d => d.data().completedDate as string).sort().reverse();
      
      let currentStreak = 0;
      let lastCompletedDate: string | undefined = undefined;

      if (dates.length > 0) {
        currentStreak = 1;
        lastCompletedDate = dates[0];
        let prevDateStr = dates[0];

        for (let i = 1; i < dates.length; i++) {
          const [y, m, d] = prevDateStr.split("-").map(Number);
          const expectedPrev = new Date(y, m - 1, d - 1);
          const expectedStr = `${expectedPrev.getFullYear()}-${String(expectedPrev.getMonth() + 1).padStart(2, "0")}-${String(expectedPrev.getDate()).padStart(2, "0")}`;
          
          if (dates[i] === expectedStr) {
            currentStreak++;
            prevDateStr = dates[i];
          } else if (dates[i] !== prevDateStr) {
            break; // Gap found (ignore duplicates if any)
          }
        }
      }

      // Update habit doc
      const habitRef = doc(db, "users", uid, "habits", habitId);
      await updateDoc(habitRef, {
        currentStreak,
        lastCompletedDate: lastCompletedDate || null,
        updatedAt: serverTimestamp(),
      });

      // Update local state
      set((state) => {
        const updatedCompletions = { ...state.completions };
        if (newCompletionInfo) {
          updatedCompletions[habitId] = [...(state.completions[habitId] || []), newCompletionInfo as HabitCompletion];
        } else if (removedCompletionId) {
          updatedCompletions[habitId] = (state.completions[habitId] || []).filter(c => c.id !== removedCompletionId);
        }

        const updatedHabits = state.habits.map(h => {
          if (h.id === habitId) {
            return { ...h, currentStreak, lastCompletedDate };
          }
          return h;
        });

        return {
          completions: updatedCompletions,
          habits: updatedHabits,
        };
      });

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
