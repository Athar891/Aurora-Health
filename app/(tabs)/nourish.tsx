import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Animated, Platform, Easing } from "react-native";
import { Drop, Plus, CheckCircle } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { HeaderAvatar } from "../../src/components/shared/HeaderAvatar";
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

  const fillAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fill animation (bouncier)
    Animated.spring(fillAnim, {
      toValue: hydrationPercent,
      useNativeDriver: false,
      friction: 5,
      tension: 60,
    }).start();

    // Continuous wave rotation (slower)
    Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [hydrationPercent, waveAnim]);

  const heightInterpolation = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const waveRotation = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

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
    <ScreenWrapper scrollable={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={textStyles.captionSmall}>NOURISH</Text>
          <Text style={[textStyles.h2, { marginTop: spacing.xs }]}>Fuel and flow.</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HeaderAvatar />
        </TouchableOpacity>
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.twoColumnContainer}>
          {/* ── COLUMN 1: HYDRATION ── */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <Text style={[textStyles.h3, styles.sectionTitle]}>Hydration</Text>
            </View>

            <View style={styles.bottleContainer}>
              <View style={styles.bottleCap} />
              <View style={styles.bottleNeck} />
              <View style={styles.bottleBody}>
                <Animated.View style={[
                  styles.waterFill, 
                  { height: heightInterpolation }
                ]}>
                  {totalMl > 0 && (
                    <Animated.View style={[styles.wave, { transform: [{ rotate: waveRotation }] }]} />
                  )}
                </Animated.View>
                <View style={styles.measurementContainer}>
                  <View style={styles.measurementLine} />
                  <View style={styles.measurementLine} />
                  <View style={styles.measurementLine} />
                </View>
              </View>
              <Text style={[textStyles.bodySemiBold, { marginTop: spacing.md, color: colors.ink }]}>
                {totalMl} <Text style={[textStyles.caption, { color: colors.inkSoft }]}>/ {dailyGoalMl} ml</Text>
              </Text>
            </View>

            <View style={styles.counterRow}>
              <TouchableOpacity 
                onPress={() => addHydrationLog(-100)} 
                style={[styles.adjustButton, totalMl <= 0 && { opacity: 0.3 }]} 
                activeOpacity={0.7}
                disabled={totalMl <= 0}
              >
                <Text style={textStyles.bodySemiBold}>−</Text>
              </TouchableOpacity>
              
              <Text style={[textStyles.bodyMedium, { color: colors.ink }]}>100 ml</Text>
              
              <TouchableOpacity 
                onPress={() => addHydrationLog(100)} 
                style={[styles.adjustButton, totalMl >= dailyGoalMl && { backgroundColor: colors.success + '20', borderColor: colors.success }]} 
                activeOpacity={0.7}
                disabled={totalMl >= dailyGoalMl}
              >
                {totalMl >= dailyGoalMl ? (
                  <CheckCircle size={18} color={colors.success} weight="fill" />
                ) : (
                  <Text style={textStyles.bodySemiBold}>+</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.quickAddRow}>
              {[100, 250, 500].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  activeOpacity={0.7}
                  style={[styles.quickAddButton, totalMl >= dailyGoalMl && { opacity: 0.4 }]}
                  onPress={() => addHydrationLog(amount)}
                  disabled={totalMl >= dailyGoalMl}
                >
                  <Drop color={colors.accentSlate} weight="fill" size={18} />
                  <Text style={[textStyles.caption, { color: colors.accentSlate, marginTop: spacing.xs }]}>+{amount}ml</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Card style={styles.chartCard}>
              <Text style={[textStyles.caption, styles.chartLabel]}>THIS WEEK — HYDRATION</Text>
              <WeeklyBarChart data={hydrationChartData} maxValue={3000} accentColor={colors.accentSlate} height={120} />
            </Card>
          </View>

          {/* ── COLUMN 2: NUTRITION ── */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
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
              <Text style={[textStyles.caption, styles.totalsLabel]}>DAILY TOTALS</Text>
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
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: -spacing.lg,
    backgroundColor: colors.bgPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
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
  twoColumnContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.lg,
  },
  column: {
    flex: 1,
  },
  // Hydration
  bottleContainer: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  bottleCap: {
    width: 32,
    height: 12,
    backgroundColor: colors.accentSlate,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.ink,
    borderBottomWidth: 0,
  },
  bottleNeck: {
    width: 24,
    height: 14,
    backgroundColor: colors.bgPaperAlt,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.ink,
  },
  bottleBody: {
    width: 100,
    height: 180,
    backgroundColor: "rgba(92, 122, 138, 0.05)",
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "relative",
  },
  waterFill: {
    width: "100%",
    backgroundColor: colors.accentSlate,
    opacity: 0.85,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  wave: {
    position: 'absolute',
    top: -10,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: colors.accentSlate,
    borderRadius: 95, // very subtle wave (5px variance from perfect circle)
  },
  measurementContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  measurementLine: {
    width: 24,
    height: 2,
    backgroundColor: colors.ink,
    opacity: 0.15,
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
  },
  totalsLabel: {
    color: colors.inkSoft,
    letterSpacing: 1,
    fontWeight: "bold",
    marginBottom: spacing.md,
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
