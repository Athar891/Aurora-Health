/**
 * Aurora Local Food Database
 *
 * ~100 common foods with per-100g macros and serving options.
 * Foods are tagged by common meal category but are all searchable globally.
 *
 * Macro source: USDA FoodData Central (general averages).
 */

import { FoodItem } from "../types/models";

// ─── Shared serving option sets ───

const GRAM_SERVINGS = [
  { unit: "g" as const, label: "Grams (g)", gramsEquivalent: 1 },
  { unit: "kg" as const, label: "Kilograms (kg)", gramsEquivalent: 1000 },
];

const LIQUID_SERVINGS = [
  { unit: "ml" as const, label: "Millilitres (ml)", gramsEquivalent: 1 },
  { unit: "cup" as const, label: "Cup (~240ml)", gramsEquivalent: 240 },
  { unit: "tbsp" as const, label: "Tablespoon (15ml)", gramsEquivalent: 15 },
  { unit: "tsp" as const, label: "Teaspoon (5ml)", gramsEquivalent: 5 },
];

const PIECE_AND_GRAM = [
  { unit: "piece" as const, label: "Piece", gramsEquivalent: 0 }, // resolved per food
  ...GRAM_SERVINGS,
];

export const FOOD_DATABASE: FoodItem[] = [
  // ─── Breakfast ───
  {
    id: "f_oats",
    name: "Oats (Rolled)",
    category: "breakfast",
    caloriesPer100g: 379,
    proteinPer100g: 13.2,
    carbsPer100g: 67.7,
    fatPer100g: 6.5,
    servingOptions: [
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
      { unit: "cup", label: "Cup (~90g)", gramsEquivalent: 90 },
      { unit: "tbsp", label: "Tablespoon (~10g)", gramsEquivalent: 10 },
    ],
    defaultServing: { amount: 60, unit: "g" },
  },
  {
    id: "f_egg",
    name: "Egg (Whole)",
    category: "breakfast",
    caloriesPer100g: 155,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatPer100g: 10.6,
    servingOptions: [
      { unit: "piece", label: "Egg (~50g)", gramsEquivalent: 50 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "piece" },
  },
  {
    id: "f_egg_white",
    name: "Egg White",
    category: "breakfast",
    caloriesPer100g: 52,
    proteinPer100g: 10.9,
    carbsPer100g: 0.7,
    fatPer100g: 0.2,
    servingOptions: [
      { unit: "piece", label: "Egg white (~30g)", gramsEquivalent: 30 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "piece" },
  },
  {
    id: "f_bread_white",
    name: "White Bread",
    category: "breakfast",
    caloriesPer100g: 265,
    proteinPer100g: 9.0,
    carbsPer100g: 49.0,
    fatPer100g: 3.2,
    servingOptions: [
      { unit: "slice", label: "Slice (~28g)", gramsEquivalent: 28 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "slice" },
  },
  {
    id: "f_bread_whole",
    name: "Whole Wheat Bread",
    category: "breakfast",
    caloriesPer100g: 247,
    proteinPer100g: 13.0,
    carbsPer100g: 41.0,
    fatPer100g: 3.5,
    servingOptions: [
      { unit: "slice", label: "Slice (~28g)", gramsEquivalent: 28 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "slice" },
  },
  {
    id: "f_milk_whole",
    name: "Whole Milk",
    category: "breakfast",
    caloriesPer100g: 61,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.3,
    servingOptions: [
      { unit: "ml", label: "Millilitres (ml)", gramsEquivalent: 1.03 },
      { unit: "cup", label: "Cup (240ml)", gramsEquivalent: 247 },
    ],
    defaultServing: { amount: 200, unit: "ml" },
  },
  {
    id: "f_milk_skim",
    name: "Skimmed Milk",
    category: "breakfast",
    caloriesPer100g: 35,
    proteinPer100g: 3.5,
    carbsPer100g: 5.0,
    fatPer100g: 0.1,
    servingOptions: [
      { unit: "ml", label: "Millilitres (ml)", gramsEquivalent: 1.03 },
      { unit: "cup", label: "Cup (240ml)", gramsEquivalent: 247 },
    ],
    defaultServing: { amount: 200, unit: "ml" },
  },
  {
    id: "f_banana",
    name: "Banana",
    category: "breakfast",
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23.0,
    fatPer100g: 0.3,
    servingOptions: [
      { unit: "piece", label: "Medium banana (~120g)", gramsEquivalent: 120 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_peanut_butter",
    name: "Peanut Butter",
    category: "breakfast",
    caloriesPer100g: 588,
    proteinPer100g: 25.1,
    carbsPer100g: 20.0,
    fatPer100g: 50.4,
    servingOptions: [
      { unit: "tbsp", label: "Tablespoon (~16g)", gramsEquivalent: 16 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "tbsp" },
  },
  {
    id: "f_yogurt_plain",
    name: "Plain Yogurt",
    category: "breakfast",
    caloriesPer100g: 59,
    proteinPer100g: 3.5,
    carbsPer100g: 5.0,
    fatPer100g: 3.3,
    servingOptions: [
      { unit: "cup", label: "Cup (~245g)", gramsEquivalent: 245 },
      { unit: "bowl", label: "Bowl (~200g)", gramsEquivalent: 200 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 150, unit: "g" },
  },
  {
    id: "f_greek_yogurt",
    name: "Greek Yogurt",
    category: "breakfast",
    caloriesPer100g: 97,
    proteinPer100g: 9.0,
    carbsPer100g: 6.0,
    fatPer100g: 5.0,
    servingOptions: [
      { unit: "cup", label: "Cup (~227g)", gramsEquivalent: 227 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 150, unit: "g" },
  },
  {
    id: "f_toast",
    name: "Toast (Buttered)",
    category: "breakfast",
    caloriesPer100g: 315,
    proteinPer100g: 8.5,
    carbsPer100g: 43.0,
    fatPer100g: 12.0,
    servingOptions: [
      { unit: "slice", label: "Slice (~35g)", gramsEquivalent: 35 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "slice" },
  },
  {
    id: "f_granola",
    name: "Granola",
    category: "breakfast",
    caloriesPer100g: 471,
    proteinPer100g: 10.0,
    carbsPer100g: 64.0,
    fatPer100g: 20.0,
    servingOptions: [
      { unit: "cup", label: "Cup (~122g)", gramsEquivalent: 122 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 60, unit: "g" },
  },
  {
    id: "f_avocado",
    name: "Avocado",
    category: "breakfast",
    caloriesPer100g: 160,
    proteinPer100g: 2.0,
    carbsPer100g: 9.0,
    fatPer100g: 15.0,
    servingOptions: [
      { unit: "piece", label: "Half avocado (~75g)", gramsEquivalent: 75 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },

  // ─── Lunch ───
  {
    id: "f_rice_white",
    name: "White Rice (Cooked)",
    category: "lunch",
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
    servingOptions: [
      { unit: "cup", label: "Cup (~186g)", gramsEquivalent: 186 },
      { unit: "bowl", label: "Bowl (~250g)", gramsEquivalent: 250 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
  {
    id: "f_rice_brown",
    name: "Brown Rice (Cooked)",
    category: "lunch",
    caloriesPer100g: 123,
    proteinPer100g: 2.7,
    carbsPer100g: 25.6,
    fatPer100g: 1.0,
    servingOptions: [
      { unit: "cup", label: "Cup (~202g)", gramsEquivalent: 202 },
      { unit: "bowl", label: "Bowl (~250g)", gramsEquivalent: 250 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
  {
    id: "f_roti",
    name: "Roti / Chapati",
    category: "lunch",
    caloriesPer100g: 297,
    proteinPer100g: 9.3,
    carbsPer100g: 54.0,
    fatPer100g: 5.5,
    servingOptions: [
      { unit: "piece", label: "Roti (~40g)", gramsEquivalent: 40 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 2, unit: "piece" },
  },
  {
    id: "f_dal",
    name: "Dal (Lentil Curry, Cooked)",
    category: "lunch",
    caloriesPer100g: 116,
    proteinPer100g: 9.0,
    carbsPer100g: 20.0,
    fatPer100g: 0.4,
    servingOptions: [
      { unit: "bowl", label: "Bowl (~250g)", gramsEquivalent: 250 },
      { unit: "cup", label: "Cup (~200g)", gramsEquivalent: 200 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "bowl" },
  },
  {
    id: "f_chicken_breast",
    name: "Chicken Breast (Cooked)",
    category: "lunch",
    caloriesPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0.0,
    fatPer100g: 3.6,
    servingOptions: [
      { unit: "piece", label: "Piece (~150g)", gramsEquivalent: 150 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 150, unit: "g" },
  },
  {
    id: "f_chicken_thigh",
    name: "Chicken Thigh (Cooked)",
    category: "lunch",
    caloriesPer100g: 209,
    proteinPer100g: 26.0,
    carbsPer100g: 0.0,
    fatPer100g: 11.0,
    servingOptions: [
      { unit: "piece", label: "Thigh (~120g)", gramsEquivalent: 120 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_mixed_veg",
    name: "Mixed Vegetables (Cooked)",
    category: "lunch",
    caloriesPer100g: 77,
    proteinPer100g: 2.5,
    carbsPer100g: 15.0,
    fatPer100g: 0.5,
    servingOptions: [
      { unit: "cup", label: "Cup (~163g)", gramsEquivalent: 163 },
      { unit: "bowl", label: "Bowl (~200g)", gramsEquivalent: 200 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
  {
    id: "f_pasta",
    name: "Pasta (Cooked)",
    category: "lunch",
    caloriesPer100g: 158,
    proteinPer100g: 5.8,
    carbsPer100g: 31.0,
    fatPer100g: 0.9,
    servingOptions: [
      { unit: "cup", label: "Cup (~140g)", gramsEquivalent: 140 },
      { unit: "bowl", label: "Bowl (~200g)", gramsEquivalent: 200 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
  {
    id: "f_salad",
    name: "Garden Salad",
    category: "lunch",
    caloriesPer100g: 20,
    proteinPer100g: 1.2,
    carbsPer100g: 3.5,
    fatPer100g: 0.2,
    servingOptions: [
      { unit: "bowl", label: "Bowl (~150g)", gramsEquivalent: 150 },
      { unit: "cup", label: "Cup (~100g)", gramsEquivalent: 100 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "bowl" },
  },
  {
    id: "f_tuna",
    name: "Tuna (Canned in Water)",
    category: "lunch",
    caloriesPer100g: 116,
    proteinPer100g: 25.5,
    carbsPer100g: 0.0,
    fatPer100g: 1.0,
    servingOptions: [
      { unit: "piece", label: "Can (~165g)", gramsEquivalent: 165 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 100, unit: "g" },
  },
  {
    id: "f_paneer",
    name: "Paneer (Cottage Cheese)",
    category: "lunch",
    caloriesPer100g: 265,
    proteinPer100g: 18.3,
    carbsPer100g: 1.2,
    fatPer100g: 20.8,
    servingOptions: [
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
      { unit: "piece", label: "Cube (~30g)", gramsEquivalent: 30 },
    ],
    defaultServing: { amount: 100, unit: "g" },
  },

  // ─── Dinner ───
  {
    id: "f_salmon",
    name: "Salmon (Cooked)",
    category: "dinner",
    caloriesPer100g: 208,
    proteinPer100g: 20.4,
    carbsPer100g: 0.0,
    fatPer100g: 13.4,
    servingOptions: [
      { unit: "piece", label: "Fillet (~170g)", gramsEquivalent: 170 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 150, unit: "g" },
  },
  {
    id: "f_steak",
    name: "Beef Steak (Lean, Cooked)",
    category: "dinner",
    caloriesPer100g: 217,
    proteinPer100g: 26.1,
    carbsPer100g: 0.0,
    fatPer100g: 12.0,
    servingOptions: [
      { unit: "piece", label: "Serving (~200g)", gramsEquivalent: 200 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 150, unit: "g" },
  },
  {
    id: "f_potato_boiled",
    name: "Potato (Boiled)",
    category: "dinner",
    caloriesPer100g: 87,
    proteinPer100g: 1.9,
    carbsPer100g: 20.1,
    fatPer100g: 0.1,
    servingOptions: [
      { unit: "piece", label: "Medium potato (~150g)", gramsEquivalent: 150 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_sweet_potato",
    name: "Sweet Potato (Baked)",
    category: "dinner",
    caloriesPer100g: 90,
    proteinPer100g: 2.0,
    carbsPer100g: 21.0,
    fatPer100g: 0.1,
    servingOptions: [
      { unit: "piece", label: "Medium (~130g)", gramsEquivalent: 130 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_broccoli",
    name: "Broccoli (Steamed)",
    category: "dinner",
    caloriesPer100g: 35,
    proteinPer100g: 2.4,
    carbsPer100g: 7.2,
    fatPer100g: 0.4,
    servingOptions: [
      { unit: "cup", label: "Cup (~156g)", gramsEquivalent: 156 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
  {
    id: "f_lentils",
    name: "Lentils (Cooked)",
    category: "dinner",
    caloriesPer100g: 116,
    proteinPer100g: 9.0,
    carbsPer100g: 20.1,
    fatPer100g: 0.4,
    servingOptions: [
      { unit: "cup", label: "Cup (~198g)", gramsEquivalent: 198 },
      { unit: "bowl", label: "Bowl (~250g)", gramsEquivalent: 250 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
  {
    id: "f_quinoa",
    name: "Quinoa (Cooked)",
    category: "dinner",
    caloriesPer100g: 120,
    proteinPer100g: 4.4,
    carbsPer100g: 21.3,
    fatPer100g: 1.9,
    servingOptions: [
      { unit: "cup", label: "Cup (~185g)", gramsEquivalent: 185 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },

  // ─── Snacks ───
  {
    id: "f_apple",
    name: "Apple",
    category: "snack",
    caloriesPer100g: 52,
    proteinPer100g: 0.3,
    carbsPer100g: 13.8,
    fatPer100g: 0.2,
    servingOptions: [
      { unit: "piece", label: "Medium apple (~182g)", gramsEquivalent: 182 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_orange",
    name: "Orange",
    category: "snack",
    caloriesPer100g: 47,
    proteinPer100g: 0.9,
    carbsPer100g: 11.7,
    fatPer100g: 0.1,
    servingOptions: [
      { unit: "piece", label: "Medium orange (~131g)", gramsEquivalent: 131 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_almonds",
    name: "Almonds",
    category: "snack",
    caloriesPer100g: 579,
    proteinPer100g: 21.2,
    carbsPer100g: 21.6,
    fatPer100g: 49.9,
    servingOptions: [
      { unit: "piece", label: "10 almonds (~14g)", gramsEquivalent: 14 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
      { unit: "tbsp", label: "Tablespoon (~15g)", gramsEquivalent: 15 },
    ],
    defaultServing: { amount: 30, unit: "g" },
  },
  {
    id: "f_whey_protein",
    name: "Whey Protein Shake",
    category: "snack",
    caloriesPer100g: 400,
    proteinPer100g: 80.0,
    carbsPer100g: 10.0,
    fatPer100g: 5.0,
    servingOptions: [
      { unit: "piece", label: "Scoop (~30g)", gramsEquivalent: 30 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_protein_bar",
    name: "Protein Bar",
    category: "snack",
    caloriesPer100g: 380,
    proteinPer100g: 30.0,
    carbsPer100g: 40.0,
    fatPer100g: 10.0,
    servingOptions: [
      { unit: "piece", label: "Bar (~60g)", gramsEquivalent: 60 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },
  {
    id: "f_rice_cake",
    name: "Rice Cake",
    category: "snack",
    caloriesPer100g: 387,
    proteinPer100g: 7.3,
    carbsPer100g: 81.5,
    fatPer100g: 2.6,
    servingOptions: [
      { unit: "piece", label: "Cake (~9g)", gramsEquivalent: 9 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 3, unit: "piece" },
  },
  {
    id: "f_cheese",
    name: "Cheddar Cheese",
    category: "snack",
    caloriesPer100g: 403,
    proteinPer100g: 25.0,
    carbsPer100g: 1.3,
    fatPer100g: 33.1,
    servingOptions: [
      { unit: "slice", label: "Slice (~28g)", gramsEquivalent: 28 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 30, unit: "g" },
  },
  {
    id: "f_banana_snack",
    name: "Banana",
    category: "snack",
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 23.0,
    fatPer100g: 0.3,
    servingOptions: [
      { unit: "piece", label: "Medium banana (~120g)", gramsEquivalent: 120 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "piece" },
  },

  // ─── General (appear in all categories) ───
  {
    id: "f_olive_oil",
    name: "Olive Oil",
    category: "general",
    caloriesPer100g: 884,
    proteinPer100g: 0.0,
    carbsPer100g: 0.0,
    fatPer100g: 100.0,
    servingOptions: [
      { unit: "tbsp", label: "Tablespoon (~13g)", gramsEquivalent: 13 },
      { unit: "tsp", label: "Teaspoon (~4g)", gramsEquivalent: 4 },
      { unit: "ml", label: "Millilitres (ml)", gramsEquivalent: 0.92 },
    ],
    defaultServing: { amount: 1, unit: "tbsp" },
  },
  {
    id: "f_butter",
    name: "Butter",
    category: "general",
    caloriesPer100g: 717,
    proteinPer100g: 0.9,
    carbsPer100g: 0.1,
    fatPer100g: 81.1,
    servingOptions: [
      { unit: "tbsp", label: "Tablespoon (~14g)", gramsEquivalent: 14 },
      { unit: "tsp", label: "Teaspoon (~5g)", gramsEquivalent: 5 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "tbsp" },
  },
  {
    id: "f_chickpeas",
    name: "Chickpeas (Cooked)",
    category: "general",
    caloriesPer100g: 164,
    proteinPer100g: 8.9,
    carbsPer100g: 27.4,
    fatPer100g: 2.6,
    servingOptions: [
      { unit: "cup", label: "Cup (~164g)", gramsEquivalent: 164 },
      { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
    ],
    defaultServing: { amount: 1, unit: "cup" },
  },
];

// ─── Helpers ───

/**
 * Get foods for a specific meal category, plus "general" foods.
 */
export function getFoodsForMeal(mealType: "breakfast" | "lunch" | "dinner" | "snack"): FoodItem[] {
  return FOOD_DATABASE.filter(
    (f) => f.category === mealType || f.category === "general"
  );
}

/**
 * Search across all foods (local + custom) with fuzzy matching.
 */
export function searchFoods(query: string, customFoods: FoodItem[] = []): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const all = [...FOOD_DATABASE, ...customFoods];
  return all.filter((f) => f.name.toLowerCase().includes(q));
}

/**
 * Calculate macros for a given food item, quantity, and unit.
 */
export function calculateMacros(
  food: FoodItem,
  quantity: number,
  unit: string
): { calories: number; protein: number; carbs: number; fat: number } {
  const serving = food.servingOptions.find((s) => s.unit === unit);
  if (!serving) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const grams = serving.gramsEquivalent * quantity;
  const factor = grams / 100;

  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: Math.round(food.proteinPer100g * factor * 10) / 10,
    carbs: Math.round(food.carbsPer100g * factor * 10) / 10,
    fat: Math.round(food.fatPer100g * factor * 10) / 10,
  };
}
