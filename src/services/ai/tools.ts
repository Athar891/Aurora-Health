export const aiTools = [
  {
    functionDeclarations: [
      {
        name: "logHydration",
        description: "Log water/fluid intake for the user. Convert cups/glasses/bottles to ml. Ensure quantity is known.",
        parameters: {
          type: "OBJECT",
          properties: {
            amountMl: {
              type: "NUMBER",
              description: "The amount of fluid consumed in milliliters (ml).",
            },
          },
          required: ["amountMl"],
        },
      },
      {
        name: "logSleep",
        description: "Log sleep data for the user. Requires start and end time.",
        parameters: {
          type: "OBJECT",
          properties: {
            sleepStart: {
              type: "STRING",
              description: "The time the user went to sleep (ISO 8601 format string, local timezone).",
            },
            sleepEnd: {
              type: "STRING",
              description: "The time the user woke up (ISO 8601 format string, local timezone).",
            },
          },
          required: ["sleepStart", "sleepEnd"],
        },
      },
      {
        name: "logMeal",
        description: "Log a meal or food item for the user. Estimate standard macros (Calories, Protein, Carbs, Fat) based on the food description.",
        parameters: {
          type: "OBJECT",
          properties: {
            foodName: {
              type: "STRING",
              description: "Name of the food or meal.",
            },
            servingSize: {
              type: "STRING",
              description: "The serving size or quantity consumed.",
            },
            calories: {
              type: "NUMBER",
              description: "Estimated total calories.",
            },
            protein: {
              type: "NUMBER",
              description: "Estimated total protein in grams.",
            },
            carbs: {
              type: "NUMBER",
              description: "Estimated total carbohydrates in grams.",
            },
            fat: {
              type: "NUMBER",
              description: "Estimated total fat in grams.",
            },
          },
          required: ["foodName", "calories", "protein", "carbs", "fat"],
        },
      },
      {
        name: "logHabit",
        description: "Log progress or completion for a specific habit.",
        parameters: {
          type: "OBJECT",
          properties: {
            habitName: {
              type: "STRING",
              description: "The name of the habit (e.g., 'Meditation', 'Reading').",
            },
            progress: {
              type: "STRING",
              description: "The amount of progress made (e.g., '15 minutes', 'done').",
            },
          },
          required: ["habitName"],
        },
      },
      {
        name: "updateMemory",
        description: "Save a fact, preference, or contextual piece of information to the user's memory.",
        parameters: {
          type: "OBJECT",
          properties: {
            fact: {
              type: "STRING",
              description: "The specific fact or preference to remember (e.g., 'User wakes up at 7 AM', 'User drinks 500ml from a blue bottle').",
            },
            category: {
              type: "STRING",
              description: "Category of the memory: 'hydration', 'sleep', 'nutrition', 'habit', or 'general'.",
            },
          },
          required: ["fact", "category"],
        },
      },
    ],
  },
];
