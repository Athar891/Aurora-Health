import { useHydrationStore } from "../../../stores/hydrationStore";
import { useSleepStore } from "../../../stores/sleepStore";
import { useNutritionStore } from "../../../stores/nutritionStore";
import { useEventStore } from "../../../stores/eventStore";
import { useHabitsStore } from "../../../stores/habitsStore";

// Type definition for function call arguments
export type AgentArgs = Record<string, any>;

export const agents = {
  logHydration: async (args: AgentArgs) => {
    const { amountMl } = args;
    if (typeof amountMl !== "number") throw new Error("amountMl must be a number");

    // Log the event for event sourcing
    await useEventStore.getState().addEvent({
      eventType: "hydration",
      value: amountMl,
      unit: "ml",
      source: "ai",
      timestamp: new Date().toISOString(),
    });

    // Update specific domain store
    await useHydrationStore.getState().addLog(amountMl, "voice");

    return { success: true, message: `Logged ${amountMl}ml of hydration.`, amountMl };
  },

  logSleep: async (args: AgentArgs) => {
    const { sleepStart, sleepEnd } = args;
    
    // Log the event for event sourcing
    await useEventStore.getState().addEvent({
      eventType: "sleep",
      metadata: { sleepStart, sleepEnd },
      source: "ai",
      timestamp: new Date().toISOString(),
    });

    const start = new Date(sleepStart);
    const end = new Date(sleepEnd);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    // Update specific domain store
    await useSleepStore.getState().addLog({
      sleepStart: start,
      sleepEnd: end,
      durationHours,
      source: "voice",
      date: end.toISOString().split("T")[0],
    });

    return { success: true, message: `Logged sleep from ${sleepStart} to ${sleepEnd}.` };
  },

  logMeal: async (args: AgentArgs) => {
    const { foodName, calories, protein, carbs, fat, servingSize, mealType } = args;

    // Log the event for event sourcing
    await useEventStore.getState().addEvent({
      eventType: "meal",
      metadata: { foodName, calories, protein, carbs, fat, servingSize, mealType },
      source: "ai",
      timestamp: new Date().toISOString(),
    });

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    // Determine mealType if not provided
    let finalMealType = mealType;
    if (!finalMealType) {
      const hour = now.getHours();
      if (hour >= 5 && hour < 11) finalMealType = "breakfast";
      else if (hour >= 11 && hour < 16) finalMealType = "lunch";
      else if (hour >= 16 && hour < 22) finalMealType = "dinner";
      else finalMealType = "snack";
    }

    // Update specific domain store
    await useNutritionStore.getState().addLog({
      mealType: finalMealType,
      description: `${servingSize ? servingSize + ' ' : ''}${foodName}`,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fat || 0,
      date: dateStr,
      source: "voice",
    });

    return { success: true, message: `Logged meal: ${foodName}. Estimated ${calories} kcal.` };
  },

  logHabit: async (args: AgentArgs) => {
    const { habitName, progress } = args;

    // Log the event for event sourcing
    await useEventStore.getState().addEvent({
      eventType: "habit",
      metadata: { habitName, progress },
      source: "ai",
      timestamp: new Date().toISOString(),
    });

    const habitsStore = useHabitsStore.getState();
    const allHabits = habitsStore.habits;
    
    // Find the closest matching habit by name
    const match = allHabits.find(h => h.title.toLowerCase().includes(habitName.toLowerCase()));

    if (match) {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
      
      // Simple toggle for now since progress-based habits require DB changes
      await habitsStore.toggleCompletion(match.id, dateStr);
      return { success: true, message: `Logged progress for habit: ${match.title}.` };
    } else {
      return { success: false, message: `Could not find an existing habit matching: ${habitName}. Ask the user if they want to create it.` };
    }
  },

  createHabit: async (args: AgentArgs) => {
    const { title, frequency = "daily" } = args;

    // Log the event for event sourcing
    await useEventStore.getState().addEvent({
      eventType: "habit",
      metadata: { action: "create", title, frequency },
      source: "ai",
      timestamp: new Date().toISOString(),
    });

    await useHabitsStore.getState().addHabit({
      title,
      frequency: frequency as "daily" | "weekly",
      category: "wellness", // default
    });

    return { success: true, message: `Successfully created the new habit: ${title}.` };
  },

  updateMemory: async (args: AgentArgs) => {
    const { fact, category } = args;
    
    // Note: We'll need a memory store to actually save this. 
    // For now we'll just log an event.
    await useEventStore.getState().addEvent({
      eventType: "habit", // Repurposing habit event for generic memory log
      metadata: { memory_fact: fact, category },
      source: "ai",
      timestamp: new Date().toISOString(),
    });

    return { success: true, message: `Saved memory: ${fact}.` };
  }
};
