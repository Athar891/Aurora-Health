/**
 * Aurora Data Models
 * TypeScript interfaces matching the Firestore document schemas
 * defined in backend-design.md
 */

// ─── Firebase Timestamp placeholder ───
// In actual Firebase usage, these will be Firestore Timestamps.
// For local state, we use number (epoch ms) or Date.
export type FirestoreTimestamp = Date;

// ─── User ───

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number;
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say";
  heightCm: number;
  weightKg: number;
  profilePhotoUrl?: string;
  onboardingComplete: boolean;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface UserPreferences {
  wakeUpTime: string; // "07:00" HH:mm
  bedtime: string; // "23:00"
  activityLevel: ActivityLevel;
  hydrationGoalMl: number;
  notifications: NotificationPreferences;
  units: UnitPreferences;
  fcmToken?: string;
}

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export interface NotificationPreferences {
  hydrationReminders: boolean;
  sleepReminders: boolean;
  habitReminders: boolean;
  dailyInsights: boolean;
}

export interface UnitPreferences {
  volume: "ml" | "oz";
  weight: "kg" | "lbs";
  height: "cm" | "ft";
}

// ─── Health Goals ───

export type GoalType =
  | "improve-hydration"
  | "sleep-better"
  | "build-habits"
  | "eat-healthier"
  | "improve-energy"
  | "improve-consistency";

export interface HealthGoal {
  id: string;
  goalType: GoalType;
  active: boolean;
  createdAt: FirestoreTimestamp;
}

// ─── Hydration ───

export interface HydrationLog {
  id: string;
  amountMl: number;
  date: string; // "2026-06-13"
  loggedAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  source: "manual" | "voice";
}

// ─── Sleep ───

export interface SleepLog {
  id: string;
  durationHours: number;
  sleepStart: FirestoreTimestamp;
  sleepEnd: FirestoreTimestamp;
  date: string; // "2026-06-13"
  source: "manual" | "voice";
  createdAt: FirestoreTimestamp;
}

// ─── Habits ───

export type HabitFrequency = "daily" | "weekdays" | "weekends" | "custom";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sun .. 6=Sat
  active: boolean;
  currentStreak?: number;
  lastCompletedDate?: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export type CompletionStatus = "completed" | "skipped";

export interface HabitCompletion {
  id: string;
  completedDate: string; // "2026-06-13"
  status: CompletionStatus;
  createdAt: FirestoreTimestamp;
}

// ─── Nutrition ───

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

/** Legacy flat log — kept for backwards compatibility with AI voice logging */
export interface NutritionLog {
  id: string;
  mealType: MealType;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  photoUrl?: string;
  date: string; // "2026-06-13"
  source: "manual" | "voice";
  createdAt: FirestoreTimestamp;
}

// ─── Structured Nutrition (Phase 1) ───

export type ServingUnit =
  | "g"
  | "kg"
  | "ml"
  | "cup"
  | "bowl"
  | "piece"
  | "slice"
  | "tbsp"
  | "tsp";

export interface ServingOption {
  unit: ServingUnit;
  label: string;
  /** How many grams this unit equals (for macro calculation) */
  gramsEquivalent: number;
}

/**
 * A food item from the local database or custom foods.
 * All macro values are per 100g.
 */
export interface FoodItem {
  id: string;
  name: string;
  category: MealType | "general";
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  servingOptions: ServingOption[];
  /** Default serving for quick-add */
  defaultServing: { amount: number; unit: ServingUnit };
  isCustom?: boolean;
}

/**
 * A food item added to a specific meal, with quantity and unit resolved.
 */
export interface MealFoodEntry {
  id: string; // local uuid
  foodId: string;
  foodName: string;
  quantity: number;
  unit: ServingUnit;
  /** Calculated macros for this specific quantity */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * The main per-day nutrition document stored in Firestore.
 * Path: users/{uid}/nutrition/dailyLogs/{YYYY-MM-DD}
 */
export interface DailyNutritionLog {
  date: string;
  breakfast: MealFoodEntry[];
  lunch: MealFoodEntry[];
  dinner: MealFoodEntry[];
  snacks: MealFoodEntry[];
  dailyTotals: MealTotals;
  updatedAt?: FirestoreTimestamp;
}

/** User's nutrition goals stored in preferences */
export interface NutritionGoals {
  calorieGoal: number;
  proteinGoal: number;
  carbGoal: number;
  fatGoal: number;
}

// ─── Streaks ───

export interface StreakData {
  current: number;
  longest: number;
  lastCompletedDate: string;
}

export interface UserStreaks {
  hydration: StreakData;
  sleep: StreakData;
  habits: StreakData;
  nutrition: StreakData;
  overallConsistencyScore: number; // 0–100
  achievements: string[];
  updatedAt: FirestoreTimestamp;
}

// ─── Insights ───

export type InsightType = "daily" | "weekly" | "monthly";
export type InsightCategory = "hydration" | "sleep" | "habits" | "nutrition" | "general";

export interface Insight {
  id: string;
  type: InsightType;
  category: InsightCategory;
  title: string;
  body: string;
  actionable: boolean;
  read: boolean;
  generatedAt: FirestoreTimestamp;
}

// ─── AI Memories ───

export type MemoryType = "pattern" | "preference" | "observation";

export interface AIMemory {
  id: string;
  memoryType: MemoryType;
  observation: string;
  confidence: number; // 0.0–1.0
  createdAt: FirestoreTimestamp;
  expiresAt?: FirestoreTimestamp;
}

// ─── AI Agent ───

export interface ConversationMessage {
  role: "user" | "model";
  text: string;
  actionsPerformed?: AgentAction[];
  timestamp: FirestoreTimestamp;
}

export interface AgentAction {
  action: string;
  details: Record<string, unknown>;
}

export interface AIAgentRequest {
  transcript: string;
  conversationHistory?: { role: "user" | "model"; text: string }[];
}

export interface AIAgentResponse {
  text: string;
  actionsPerformed: AgentAction[];
  audioBase64?: string;
}

// ─── Event Sourcing ───

export type HealthEventType = "hydration" | "sleep" | "meal" | "habit";

export interface HealthEvent {
  id?: string;
  eventType: HealthEventType;
  value?: number;
  unit?: string;
  metadata?: Record<string, any>;
  timestamp: Date | string;
  source: "ai" | "manual";
}

// ─── Assistant Memory ───

export interface AssistantMemory {
  id?: string;
  fact: string;
  category?: string;
  createdAt: Date | string;
}
