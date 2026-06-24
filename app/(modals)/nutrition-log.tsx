import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Plus, PencilSimple, Check } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../src/theme/tokens";
import { MealType, FoodItem, ServingUnit } from "../../src/types/models";
import { getFoodsForMeal, searchFoods, calculateMacros } from "../../src/data/foodDatabase";
import { useNutritionStore } from "../../src/stores/nutritionStore";
import { FoodSearchBar } from "../../src/components/nutrition/FoodSearchBar";
import { FoodListItem } from "../../src/components/nutrition/FoodListItem";
import { SelectedFoodEntry } from "../../src/components/nutrition/SelectedFoodEntry";

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
};

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: colors.accentMustard,
  lunch: colors.accentTerracotta,
  dinner: colors.accentSlate,
  snack: colors.accentOlive,
};

export default function NutritionLogModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{ meal?: string; date?: string }>();

  const initialMeal = (params.meal as MealType) ?? "breakfast";
  const targetDate = params.date ?? new Date().toISOString().split("T")[0];

  const [activeMeal, setActiveMeal] = useState<MealType>(initialMeal);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<
    { food: FoodItem; quantity: number; unit: ServingUnit }[]
  >([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const { addFoodEntry, saveDailyLog, isSaving, customFoods, addCustomFood, fetchDailyLog } =
    useNutritionStore();

  // ─── Food list ───
  const suggestedFoods = useMemo(
    () => getFoodsForMeal(activeMeal),
    [activeMeal]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchFoods(searchQuery, customFoods);
  }, [searchQuery, customFoods]);

  const displayedFoods = searchQuery.trim() ? searchResults : suggestedFoods;
  const addedFoodIds = new Set(selectedFoods.map((s) => s.food.id));

  // ─── Selection handlers ───

  const handleAddFood = useCallback(
    (food: FoodItem) => {
      if (addedFoodIds.has(food.id)) {
        setSelectedFoods((prev) => prev.filter((s) => s.food.id !== food.id));
        return;
      }
      setSelectedFoods((prev) => [
        ...prev,
        {
          food,
          quantity: food.defaultServing.amount,
          unit: food.defaultServing.unit,
        },
      ]);
    },
    [addedFoodIds]
  );

  const handleUpdateEntry = useCallback(
    (foodId: string, quantity: number, unit: ServingUnit) => {
      setSelectedFoods((prev) =>
        prev.map((s) => (s.food.id === foodId ? { ...s, quantity, unit } : s))
      );
    },
    []
  );

  const handleRemoveEntry = useCallback((foodId: string) => {
    setSelectedFoods((prev) => prev.filter((s) => s.food.id !== foodId));
  }, []);

  // ─── Save ───

  const totalMacros = useMemo(() => {
    return selectedFoods.reduce(
      (acc, s) => {
        const m = calculateMacros(s.food, s.quantity, s.unit);
        return {
          calories: acc.calories + m.calories,
          protein: Math.round((acc.protein + m.protein) * 10) / 10,
          carbs: Math.round((acc.carbs + m.carbs) * 10) / 10,
          fat: Math.round((acc.fat + m.fat) * 10) / 10,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [selectedFoods]);

  async function handleSave() {
    if (selectedFoods.length === 0) {
      Alert.alert("No Foods Selected", "Please select at least one food item.");
      return;
    }
    // Commit each selected food entry to the store for the active meal
    selectedFoods.forEach(({ food, quantity, unit }) => {
      addFoodEntry(activeMeal, food, quantity, unit);
    });
    await saveDailyLog();
    await fetchDailyLog(targetDate);
    router.back();
  }

  const accentColor = MEAL_COLORS[activeMeal];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Log Meal</Text>
          <Text style={styles.headerSubtitle}>{targetDate}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Meal Type Selector */}
      <View style={styles.mealSelector}>
        {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.mealChip,
              activeMeal === m && {
                backgroundColor: MEAL_COLORS[m],
                borderColor: MEAL_COLORS[m],
              },
            ]}
            onPress={() => setActiveMeal(m)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.mealChipText,
                activeMeal === m && styles.mealChipTextActive,
              ]}
            >
              {MEAL_LABELS[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <FoodSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${MEAL_LABELS[activeMeal]} foods…`}
        />

        {/* Selected foods */}
        {selectedFoods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SELECTED</Text>
            <View style={styles.selectedList}>
              {selectedFoods.map(({ food, quantity, unit }) => (
                <SelectedFoodEntry
                  key={food.id}
                  entry={{
                    id: food.id,
                    foodId: food.id,
                    foodName: food.name,
                    quantity,
                    unit,
                    ...calculateMacros(food, quantity, unit),
                  }}
                  food={food}
                  onRemove={() => handleRemoveEntry(food.id)}
                  onQuantityChange={(q, u) => handleUpdateEntry(food.id, q, u)}
                />
              ))}
            </View>

            {/* Meal total */}
            <View style={[styles.mealTotal, { borderColor: accentColor + "40" }]}>
              <Text style={styles.mealTotalLabel}>MEAL TOTAL</Text>
              <View style={styles.mealTotalMacros}>
                <MealTotalCell label="Cal" value={totalMacros.calories} unit="kcal" color={colors.accentTerracotta} />
                <MealTotalCell label="Pro" value={totalMacros.protein} unit="g" color={colors.accentOlive} />
                <MealTotalCell label="Carb" value={totalMacros.carbs} unit="g" color={colors.accentMustard} />
                <MealTotalCell label="Fat" value={totalMacros.fat} unit="g" color={colors.accentSlate} />
              </View>
            </View>
          </View>
        )}

        {/* Food List */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {searchQuery.trim()
              ? `RESULTS (${displayedFoods.length})`
              : `SUGGESTED FOR ${MEAL_LABELS[activeMeal].toUpperCase()}`}
          </Text>

          {displayedFoods.length === 0 && searchQuery.trim() ? (
            <View style={styles.emptySearch}>
              <Text style={styles.emptyText}>No foods found for "{searchQuery}"</Text>
              <TouchableOpacity
                style={styles.createCustomBtn}
                onPress={() => setShowCustomForm(true)}
              >
                <Plus size={16} color={colors.accentTerracotta} />
                <Text style={styles.createCustomText}>Create Custom Food</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.foodList}>
              {displayedFoods.map((food, i) => (
                <React.Fragment key={food.id}>
                  <FoodListItem
                    food={food}
                    onAdd={handleAddFood}
                    isAdded={addedFoodIds.has(food.id)}
                  />
                  {i < displayedFoods.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}

              {/* Add Custom Food row */}
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.customFoodRow}
                onPress={() => setShowCustomForm(true)}
              >
                <View style={styles.customFoodIcon}>
                  <Plus size={16} color={colors.accentTerracotta} />
                </View>
                <Text style={styles.customFoodText}>Add Custom Food</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: accentColor },
            (selectedFoods.length === 0 || isSaving) && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={selectedFoods.length === 0 || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Check size={18} color={colors.white} weight="bold" />
              <Text style={styles.saveText}>
                Save {MEAL_LABELS[activeMeal]}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Custom Food Sheet */}
      {showCustomForm && (
        <CustomFoodSheet
          mealType={activeMeal}
          onClose={() => setShowCustomForm(false)}
          onSave={async (foodData) => {
            const newFood = await addCustomFood(foodData);
            setShowCustomForm(false);
            handleAddFood(newFood);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

// ─── MealTotalCell ───

function MealTotalCell({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={[{ fontFamily: typography.body.semiBold, fontSize: fontSizes.body, color }]}>
        {value}
        <Text style={{ fontSize: fontSizes.captionSmall, fontFamily: typography.body.fontFamily }}>
          {unit}
        </Text>
      </Text>
      <Text style={{ fontFamily: "IBMPlexMono_400Regular", fontSize: 9, color: colors.inkSoft }}>{label}</Text>
    </View>
  );
}

// ─── CustomFoodSheet ───

interface CustomFoodSheetProps {
  mealType: MealType;
  onClose: () => void;
  onSave: (food: Omit<FoodItem, "id" | "isCustom">) => Promise<void>;
}

function CustomFoodSheet({ mealType, onClose, onSave }: CustomFoodSheetProps) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a food name.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        category: mealType,
        caloriesPer100g: parseFloat(calories) || 0,
        proteinPer100g: parseFloat(protein) || 0,
        carbsPer100g: parseFloat(carbs) || 0,
        fatPer100g: parseFloat(fat) || 0,
        servingOptions: [
          { unit: "g", label: "Grams (g)", gramsEquivalent: 1 },
          { unit: "piece", label: "Piece (~100g)", gramsEquivalent: 100 },
        ],
        defaultServing: { amount: 100, unit: "g" },
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={sheet.overlay}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={sheet.container}
      >
        <Text style={sheet.title}>Create Custom Food</Text>
        <Text style={sheet.subtitle}>Enter nutrition values per 100g</Text>

        <CustomInput label="Food Name *" value={name} onChangeText={setName} placeholder="e.g. Homemade Dal" />
        <View style={sheet.macroRow}>
          <CustomInput label="Calories" value={calories} onChangeText={setCalories} placeholder="0" keyboardType="numeric" flex />
          <CustomInput label="Protein (g)" value={protein} onChangeText={setProtein} placeholder="0" keyboardType="numeric" flex />
        </View>
        <View style={sheet.macroRow}>
          <CustomInput label="Carbs (g)" value={carbs} onChangeText={setCarbs} placeholder="0" keyboardType="numeric" flex />
          <CustomInput label="Fat (g)" value={fat} onChangeText={setFat} placeholder="0" keyboardType="numeric" flex />
        </View>

        <View style={sheet.buttons}>
          <TouchableOpacity style={sheet.cancelBtn} onPress={onClose}>
            <Text style={sheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={sheet.saveBtn}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={sheet.saveText}>Save Food</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  flex,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  flex?: boolean;
}) {
  return (
    <View style={[{ marginBottom: spacing.sm }, flex && { flex: 1 }]}>
      <Text style={sheet.inputLabel}>{label}</Text>
      <TextInput
        style={sheet.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSoft}
        keyboardType={keyboardType}
      />
    </View>
  );
}

// ─── Styles ───

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgPaper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { width: 40 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  headerSubtitle: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    marginTop: 2,
  },
  mealSelector: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexWrap: "wrap",
  },
  mealChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgPaperAlt,
  },
  mealChipText: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
  },
  mealChipTextActive: { color: colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  section: { gap: spacing.sm },
  sectionLabel: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
  },
  selectedList: { gap: spacing.sm },
  mealTotal: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    backgroundColor: colors.bgPaperAlt,
  },
  mealTotalLabel: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  mealTotalMacros: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  foodList: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    paddingHorizontal: spacing.md,
  },
  divider: { height: 1, backgroundColor: colors.line },
  emptySearch: { alignItems: "center", paddingVertical: spacing.xl, gap: spacing.md },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    textAlign: "center",
  },
  createCustomBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accentTerracotta,
  },
  createCustomText: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    color: colors.accentTerracotta,
  },
  customFoodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  customFoodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accentTerracotta,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  customFoodText: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.accentTerracotta,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgPaper,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cancelText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.inkSoft,
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: 14,
    borderRadius: radii.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.white,
  },
});

const sheet = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    paddingBottom: 48,
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
    marginBottom: spacing.md,
  },
  macroRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  inputLabel: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cancelText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.inkSoft,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentTerracotta,
    borderRadius: radii.md,
  },
  saveText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.white,
  },
});
