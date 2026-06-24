import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native";
import { Drop, Gear, Plus } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Card } from "../../src/components/ui/Card";
import { WeeklyBarChart } from "../../src/components/charts/WeeklyBarChart";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii, borders } from "../../src/theme/tokens";
import { useHydrationStore } from "../../src/stores/hydrationStore";
import { useNutritionStore } from "../../src/stores/nutritionStore";
import { useTodayDate } from "../../src/hooks/useTodayDate";
import { MealType } from "../../src/types/models";
import { MacroGoalBar } from "../../src/components/nutrition/MacroGoalBar";
import { MealSection } from "../../src/components/nutrition/MealSection";

export default function NourishScreen() {
  const router = useRouter();
  const todayStr = useTodayDate();

  // Hydration
  const { 
    dailyGoalMl, 
    fetchLogs: fetchHydration, 
    addLog: addHydrationLog, 
    getTotalForToday 
  } = useHydrationStore();

  // Nutrition (Phase 1)
  const {
    dailyLog,
    goals,
    fetchDailyLog,
    getDailyTotals,
  } = useNutritionStore();

  useEffect(() => {
    fetchHydration(todayStr);
    fetchDailyLog(todayStr);
  }, [fetchHydration, fetchDailyLog, todayStr]);

  // Hydration computed
  const totalMl = getTotalForToday();
  const hydrationPercent = Math.min((totalMl / dailyGoalMl) * 100, 100);

  // Hydration Chart Data (mocked for visual layout)
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const hydrationChartData = dayLabels.map((label, i) => ({
    label,
    value: i === todayDayIndex ? totalMl : 0,
  }));

  // Nutrition computed
  const totals = getDailyTotals();

  function handleLogMeal(meal: MealType) {
    router.push(`/(modals)/nutrition-log?meal=${meal}&date=${todayStr}`);
  }

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <SectionHeader
            index="01"
            label="NOURISH"
            title="Hydration & Meals"
            subtitle="Fuel and flow."
            rightAccessory={
              <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Gear color={colors.ink} size={24} weight="regular" />
              </TouchableOpacity>
            }
          />
        </View>

        {/* ── HYDRATION SECTION ── */}
        <View style={styles.sectionHeader}>
          <Text style={[textStyles.h3, styles.sectionTitle]}>Hydration</Text>
          <Text style={[textStyles.caption, { color: colors.inkSoft }]}>{totalMl} / {dailyGoalMl} ml</Text>
        </View>

        <View style={styles.hydrationBar}>
          <View style={[styles.hydrationFill, { width: `${hydrationPercent}%` }]} />
        </View>

        <View style={styles.counterRow}>
          <TouchableOpacity onPress={() => addHydrationLog(-100)} style={styles.adjustButton} activeOpacity={0.7}>
            <Text style={textStyles.bodySemiBold}>−</Text>
          </TouchableOpacity>
          <Text style={[textStyles.bodyMedium, { color: colors.ink }]}>100 ml</Text>
          <TouchableOpacity onPress={() => addHydrationLog(100)} style={styles.adjustButton} activeOpacity={0.7}>
            <Text style={textStyles.bodySemiBold}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAddRow}>
          {[100, 250, 500].map((amount) => (
            <TouchableOpacity
              key={amount}
              activeOpacity={0.7}
              style={styles.quickAddButton}
              onPress={() => addHydrationLog(amount)}
            >
              <Drop color={colors.accentSlate} weight="fill" size={18} />
              <Text style={[textStyles.caption, { color: colors.accentSlate, marginTop: spacing.xs }]}>+{amount}ml</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.chartCard}>
          <Text style={[textStyles.caption, styles.chartLabel]}>THIS WEEK — HYDRATION</Text>
          <WeeklyBarChart data={hydrationChartData} maxValue={3000} goalValue={dailyGoalMl} accentColor={colors.accentSlate} />
        </Card>

        {/* ── NUTRITION SECTION ── */}
        <View style={[styles.sectionHeader, { marginTop: spacing.xl }]}>
          <Text style={[textStyles.h3, styles.sectionTitle]}>Meals</Text>
          <TouchableOpacity
            onPress={() => router.push(`/(modals)/nutrition-log?date=${todayStr}`)}
            style={styles.addMealButton}
            activeOpacity={0.8}
          >
            <Plus color={colors.bgPaper} size={16} weight="bold" />
            <Text style={[textStyles.caption, { color: colors.bgPaper }]}>Add Meal</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Macros Card */}
        <Card style={styles.macrosCard}>
          <Text style={[textStyles.caption, styles.chartLabel]}>DAILY TOTALS</Text>
          <MacroGoalBar totals={totals} goals={goals} />
        </Card>

        {/* Meal Sections */}
        <View style={styles.mealsContainer}>
          <MealSection
            title="Breakfast"
            mealType="breakfast"
            entries={dailyLog.breakfast}
            onLogMeal={handleLogMeal}
            accentColor={colors.accentMustard}
          />
          <MealSection
            title="Lunch"
            mealType="lunch"
            entries={dailyLog.lunch}
            onLogMeal={handleLogMeal}
            accentColor={colors.accentTerracotta}
          />
          <MealSection
            title="Dinner"
            mealType="dinner"
            entries={dailyLog.dinner}
            onLogMeal={handleLogMeal}
            accentColor={colors.accentSlate}
          />
          <MealSection
            title="Snacks"
            mealType="snack"
            entries={dailyLog.snacks}
            onLogMeal={handleLogMeal}
            accentColor={colors.accentOlive}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    marginBottom: 0,
  },
  // Hydration
  hydrationBar: {
    height: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPaperAlt,
    overflow: "hidden",
    marginBottom: spacing.md,
    ...borders.hairline,
  },
  hydrationFill: {
    height: "100%",
    backgroundColor: colors.accentSlate,
    borderRadius: radii.pill,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  adjustButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgPaperAlt,
    alignItems: "center",
    justifyContent: "center",
    ...borders.hairline,
  },
  quickAddRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: colors.accentSlateLight,
    borderRadius: radii.md,
    padding: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCard: {
    padding: spacing.md,
  },
  chartLabel: {
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  // Nutrition
  macrosCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  mealsContainer: {
    gap: 0, // MealSection has its own margin
  },
  addMealButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.accentTerracotta,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
});
