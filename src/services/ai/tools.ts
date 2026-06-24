export const aiTools = [
  {
    type: "function",
    function: {
      name: "logHydration",
      description: "Log water/fluid intake for the user. Convert cups/glasses/bottles to ml. Ensure quantity is known.",
      parameters: {
        type: "object",
        properties: {
          amountMl: {
            type: "number",
            description: "The amount of fluid consumed in milliliters (ml).",
          },
        },
        required: ["amountMl"],
      },
    }
  },
  {
    type: "function",
    function: {
      name: "logSleep",
      description: "Log sleep data for the user. Requires start and end time.",
      parameters: {
        type: "object",
        properties: {
          sleepStart: {
            type: "string",
            description: "The time the user went to sleep (ISO 8601 format string, local timezone).",
          },
          sleepEnd: {
            type: "string",
            description: "The time the user woke up (ISO 8601 format string, local timezone).",
          },
        },
        required: ["sleepStart", "sleepEnd"],
      },
    }
  },
  {
    type: "function",
    function: {
      name: "logMeal",
      description: "Log a meal or food item for the user. Estimate standard macros (Calories, Protein, Carbs, Fat) based on the food description.",
      parameters: {
        type: "object",
        properties: {
          foodName: {
            type: "string",
            description: "Name of the food or meal.",
          },
          servingSize: {
            type: "string",
            description: "The serving size or quantity consumed.",
          },
          calories: {
            type: "number",
            description: "Estimated total calories.",
          },
          protein: {
            type: "number",
            description: "Estimated total protein in grams.",
          },
          carbs: {
            type: "number",
            description: "Estimated total carbohydrates in grams.",
          },
          fat: {
            type: "number",
            description: "Estimated total fat in grams.",
          },
        },
        required: ["foodName", "calories", "protein", "carbs", "fat"],
      },
    }
  },
  {
    type: "function",
    function: {
      name: "logHabit",
      description: "Log progress or completion for a specific habit.",
      parameters: {
        type: "object",
        properties: {
          habitName: {
            type: "string",
            description: "The name of the habit (e.g., 'Meditation', 'Reading').",
          },
          progress: {
            type: "string",
            description: "The amount of progress made (e.g., '15 minutes', 'done').",
          },
        },
        required: ["habitName"],
      },
    }
  },
  {
    type: "function",
    function: {
      name: "updateMemory",
      description: "Save a fact, preference, or contextual piece of information to the user's memory.",
      parameters: {
        type: "object",
        properties: {
          fact: {
            type: "string",
            description: "The specific fact or preference to remember.",
          },
          category: {
            type: "string",
            description: "Category of the memory: 'hydration', 'sleep', 'nutrition', 'habit', or 'general'.",
          },
        },
        required: ["fact", "category"],
      },
    }
  }
];
