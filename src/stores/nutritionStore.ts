/**
 * Nutrition Store — Phase 1
 *
 * Manages structured daily nutrition logs with per-meal food entries.
 * Firestore path: users/{uid}/nutrition/dailyLogs/{YYYY-MM-DD}
 *                 users/{uid}/nutrition/customFoods/{foodId}
 */
import { create } from "zustand";
import {
  DailyNutritionLog,
  MealFoodEntry,
  MealTotals,
  MealType,
  FoodItem,
  NutritionGoals,
} from "../types/models";
import { calculateMacros } from "../data/foodDatabase";
import { auth, db } from "../config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

// ─── Helpers ───

function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function uid(): string {
  const id = auth.currentUser?.uid;
  if (!id) throw new Error("Not authenticated");
  return id;
}

function dailyLogRef(date: string) {
  return doc(db, "users", uid(), "dailyNutritionLogs", date);
}

function customFoodsRef() {
  return collection(db, "users", uid(), "customFoods");
}

const EMPTY_TOTALS: MealTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

function computeTotals(log: Omit<DailyNutritionLog, "dailyTotals" | "updatedAt">): MealTotals {
  const all = [
    ...log.breakfast,
    ...log.lunch,
    ...log.dinner,
    ...log.snacks,
  ];
  return all.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: Math.round((acc.protein + e.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.fat) * 10) / 10,
    }),
    EMPTY_TOTALS
  );
}

function getMealArray(
  log: DailyNutritionLog,
  meal: MealType
): MealFoodEntry[] {
  if (meal === "breakfast") return log.breakfast;
  if (meal === "lunch") return log.lunch;
  if (meal === "dinner") return log.dinner;
  return log.snacks;
}

function setMealArray(
  log: DailyNutritionLog,
  meal: MealType,
  entries: MealFoodEntry[]
): DailyNutritionLog {
  const updated = { ...log };
  if (meal === "breakfast") updated.breakfast = entries;
  else if (meal === "lunch") updated.lunch = entries;
  else if (meal === "dinner") updated.dinner = entries;
  else updated.snacks = entries;
  updated.dailyTotals = computeTotals(updated);
  return updated;
}

const emptyDailyLog = (date: string): DailyNutritionLog => ({
  date,
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  dailyTotals: EMPTY_TOTALS,
});

// ─── State Interface ───

interface NutritionState {
  /** Currently viewed date */
  activeDate: string;
  /** The daily log for activeDate */
  dailyLog: DailyNutritionLog;
  /** User's nutrition goals */
  goals: NutritionGoals;
  /** Custom foods the user has created */
  customFoods: FoodItem[];
  isLoading: boolean;
  isSaving: boolean;

  // ─── Computed ───
  getMealTotals: (meal: MealType) => MealTotals;
  getDailyTotals: () => MealTotals;

  // ─── Actions ───
  fetchDailyLog: (date: string) => Promise<void>;
  addFoodEntry: (meal: MealType, food: FoodItem, quantity: number, unit: string) => void;
  removeFoodEntry: (meal: MealType, entryId: string) => void;
  updateFoodEntry: (meal: MealType, entryId: string, quantity: number, unit: string, food: FoodItem) => void;
  saveDailyLog: () => Promise<void>;
  fetchCustomFoods: () => Promise<void>;
  addCustomFood: (food: Omit<FoodItem, "id" | "isCustom">) => Promise<FoodItem>;

  // Legacy compatibility
  logs: never[];
  fetchLogs: (dateStr: string) => Promise<void>;
  addLog: (log: any, photoUri?: string) => Promise<void>;
}

// ─── Store ───

export const useNutritionStore = create<NutritionState>((set, get) => ({
  activeDate: todayStr(),
  dailyLog: emptyDailyLog(todayStr()),
  goals: {
    calorieGoal: 2000,
    proteinGoal: 120,
    carbGoal: 250,
    fatGoal: 65,
  },
  customFoods: [],
  isLoading: false,
  isSaving: false,

  // ─── Computed ───

  getMealTotals: (meal) => {
    const entries = getMealArray(get().dailyLog, meal);
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + e.calories,
        protein: Math.round((acc.protein + e.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
        fat: Math.round((acc.fat + e.fat) * 10) / 10,
      }),
      EMPTY_TOTALS
    );
  },

  getDailyTotals: () => get().dailyLog.dailyTotals,

  // ─── Fetch daily log ───

  fetchDailyLog: async (date) => {
    set({ isLoading: true, activeDate: date });
    try {
      const ref = dailyLogRef(date);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as DailyNutritionLog;
        set({ dailyLog: data, isLoading: false });
      } else {
        set({ dailyLog: emptyDailyLog(date), isLoading: false });
      }
    } catch (err) {
      console.error("Failed to fetch daily nutrition log:", err);
      set({ isLoading: false });
    }
  },

  // ─── Add food entry (local, no Firestore write) ───

  addFoodEntry: (meal, food, quantity, unit) => {
    const macros = calculateMacros(food, quantity, unit);
    const entry: MealFoodEntry = {
      id: `${food.id}_${Date.now()}`,
      foodId: food.id,
      foodName: food.name,
      quantity,
      unit: unit as any,
      ...macros,
    };

    set((state) => {
      const newLog = setMealArray(
        state.dailyLog,
        meal,
        [...getMealArray(state.dailyLog, meal), entry]
      );
      return { dailyLog: newLog };
    });
  },

  // ─── Remove food entry ───

  removeFoodEntry: (meal, entryId) => {
    set((state) => {
      const current = getMealArray(state.dailyLog, meal);
      const newLog = setMealArray(
        state.dailyLog,
        meal,
        current.filter((e) => e.id !== entryId)
      );
      return { dailyLog: newLog };
    });
  },

  // ─── Update food entry quantity/unit ───

  updateFoodEntry: (meal, entryId, quantity, unit, food) => {
    const macros = calculateMacros(food, quantity, unit);
    set((state) => {
      const current = getMealArray(state.dailyLog, meal);
      const updated = current.map((e) =>
        e.id === entryId
          ? { ...e, quantity, unit: unit as any, ...macros }
          : e
      );
      const newLog = setMealArray(state.dailyLog, meal, updated);
      return { dailyLog: newLog };
    });
  },

  // ─── Save daily log to Firestore ───

  saveDailyLog: async () => {
    set({ isSaving: true });
    try {
      const { dailyLog } = get();
      const ref = dailyLogRef(dailyLog.date);
      await setDoc(
        ref,
        { ...dailyLog, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (err) {
      console.error("Failed to save daily nutrition log:", err);
    } finally {
      set({ isSaving: false });
    }
  },

  // ─── Custom Foods ───

  fetchCustomFoods: async () => {
    try {
      const ref = customFoodsRef();
      const snap = await getDocs(ref);
      const customFoods: FoodItem[] = snap.docs.map((d) => ({
        id: d.id,
        isCustom: true,
        ...(d.data() as Omit<FoodItem, "id">),
      }));
      set({ customFoods });
    } catch (err) {
      console.error("Failed to fetch custom foods:", err);
    }
  },

  addCustomFood: async (foodData) => {
    const ref = customFoodsRef();
    const docRef = await addDoc(ref, {
      ...foodData,
      isCustom: true,
      createdAt: serverTimestamp(),
    });
    const newFood: FoodItem = {
      id: docRef.id,
      isCustom: true,
      ...foodData,
    };
    set((state) => ({ customFoods: [newFood, ...state.customFoods] }));
    return newFood;
  },

  // ─── Legacy compatibility shims ───
  logs: [] as never[],

  fetchLogs: async (dateStr) => {
    return get().fetchDailyLog(dateStr);
  },

  addLog: async (_log, _photoUri) => {
    // No-op: legacy AI voice logs still go through nutritionLogs subcollection
    // handled separately in the AI agent service
  },
}));
