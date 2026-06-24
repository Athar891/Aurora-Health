import React, { useMemo, useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Plus, Drop, Moon, CheckCircle, OrangeSlice } from "phosphor-react-native";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { HeaderAvatar } from "../../src/components/shared/HeaderAvatar";
import { Card } from "../../src/components/ui/Card";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { MiniBarChart } from "../../src/components/charts/MiniBarChart";
import { ActivityRings } from "../../src/components/charts/ActivityRings";
import { Tag } from "../../src/components/ui/Tag";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/stores/authStore";
import { useHydrationStore } from "../../src/stores/hydrationStore";
import { useSleepStore } from "../../src/stores/sleepStore";
import { useHabitsStore } from "../../src/stores/habitsStore";
import { useNutritionStore } from "../../src/stores/nutritionStore";
import { useTodayDate } from "../../src/hooks/useTodayDate";

// Short, cheerful, dynamic insights by time of day
const MORNING_INSIGHTS = [
  "Rise and shine! ☀️ Start with a glass of water to kickstart your day.",
  "Good morning! 💧 Hydrate first, conquer later.",
  "Morning crew! 🌿 Log your habits early — consistency is key.",
  "Fresh day, fresh start! 🎯 Hit your water goal before noon.",
];
const AFTERNOON_INSIGHTS = [
  "Afternoon slump? 💧 Drink some water — it helps more than you think!",
  "Hey! 🌤️ How's your hydration going? Top it up if needed.",
  "Halfway there! 🏃 Keep those healthy habits rolling.",
  "Quick check-in 🌿 Did you log your lunch? Stay on track!",
];
const EVENING_INSIGHTS = [
  "Wind down well! 🌙 Log your sleep and hit that 8-hour goal.",
  "Evening check-in 🌿 Great work today — don't forget to log your meals.",
  "Almost there! ✨ Log your sleep and end the day strong.",
  "Time to wind down 🌙\nSleep well — your body recovers while you rest.",
];

function getDynamicInsight(): string {
  const hour = new Date().getHours();
  let pool: string[];
  if (hour < 12) pool = MORNING_INSIGHTS;
  else if (hour < 18) pool = AFTERNOON_INSIGHTS;
  else pool = EVENING_INSIGHTS;
  // Rotate daily so it doesn't feel static
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return pool[dayOfYear % pool.length];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getLast7DaysStrings(todayStr: string): string[] {
  const dates = [];
  const [y, m, d] = todayStr.split("-").map(Number);
  const todayDate = new Date(y, m - 1, d);
  
  for (let i = 6; i >= 0; i--) {
    const pastDate = new Date(todayDate);
    pastDate.setDate(todayDate.getDate() - i);
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, "0");
    const day = String(pastDate.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

export default function HomeDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const todayStr = useTodayDate(); // auto-updates at midnight
  
  const { 
    getTotalForToday, dailyGoalMl, 
    weeklyLogs: hydrationWeeklyLogs, 
    fetchLogs: fetchHydrationToday,
    fetchWeeklyLogs: fetchHydrationWeekly 
  } = useHydrationStore();
  
  const { 
    logs: sleepLogs, 
    weeklyLogs: sleepWeeklyLogs, 
    fetchLogs: fetchSleepToday,
    fetchWeeklyLogs: fetchSleepWeekly 
  } = useSleepStore();

  const {
    habits,
    completions,
    fetchHabits,
    fetchCompletions,
  } = useHabitsStore();

  const {
    goals: nutritionGoals,
    getDailyTotals: getNutritionTotals,
    fetchDailyLog,
  } = useNutritionStore();

  // Refresh all data on mount / when todayStr changes (e.g. at midnight)
  // The root _layout bootstrap already fires these on login, so this acts
  // as a "refresh on re-focus" safety net.
  useEffect(() => {
    const dates = getLast7DaysStrings(todayStr);
    const startDate = dates[0];
    const endDate = dates[6];

    // Today's totals (daily numbers)
    fetchHydrationToday(todayStr);
    fetchSleepToday(todayStr);
    fetchDailyLog(todayStr);

    // Weekly sparklines
    fetchHydrationWeekly(startDate, endDate);
    fetchSleepWeekly(startDate, endDate);

    // Habits list
    fetchHabits();
  }, [fetchHydrationToday, fetchHydrationWeekly, fetchSleepToday, fetchSleepWeekly, fetchDailyLog, fetchHabits, todayStr]);

  // Fetch habit completions when habits list changes
  useEffect(() => {
    habits.forEach(h => {
      fetchCompletions(h.id, todayStr);
    });
  }, [habits.length, fetchCompletions, todayStr]);

  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const insight = useMemo(() => getDynamicInsight(), []);
  const greeting = getGreeting();

  const totalMl = getTotalForToday();
  const hydrationProgress = Math.min(totalMl / dailyGoalMl, 1);

  const lastSleep = sleepLogs[0];
  const sleepHours = lastSleep
    ? Math.floor(lastSleep.durationHours)
    : null;
  const sleepMins = lastSleep
    ? Math.round((lastSleep.durationHours - Math.floor(lastSleep.durationHours)) * 60)
    : null;
  const sleepProgress = lastSleep ? Math.min(lastSleep.durationHours / 8, 1) : 0;

  const nutritionTotals = getNutritionTotals();
  const caloriesProgress = nutritionGoals.calorieGoal > 0 
    ? Math.min(nutritionTotals.calories / nutritionGoals.calorieGoal, 1) 
    : 0;

  // Calculate Habits progress
  const activeHabitsToday = habits.length; // simplify for now, assumes all active habits apply today
  const completedHabitsToday = activeHabitsToday > 0 
    ? habits.filter(h => {
        const c = completions[h.id] || [];
        return c.some(comp => comp.completedDate === todayStr && comp.status === "completed");
      }).length 
    : 0;
  const habitsProgress = activeHabitsToday > 0 ? completedHabitsToday / activeHabitsToday : 0;

  // Calculate sparkline data
  const sparklineDates = useMemo(() => getLast7DaysStrings(todayStr), [todayStr]);
  const sparklineLabels = useMemo(() => {
    return sparklineDates.map(dateStr => {
      const [y, m, d] = dateStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-US", { weekday: "narrow" }); // M, T, W, etc.
    });
  }, [sparklineDates]);
  
  const hydrationSparkline = useMemo(() => {
    return sparklineDates.map(date => {
      const logsForDate = hydrationWeeklyLogs.filter(log => log.date === date);
      return logsForDate.reduce((sum, log) => sum + log.amountMl, 0);
    });
  }, [sparklineDates, hydrationWeeklyLogs]);
  
  const sleepSparkline = useMemo(() => {
    return sparklineDates.map(date => {
      const logsForDate = sleepWeeklyLogs.filter(log => log.date === date);
      return logsForDate.reduce((sum, log) => sum + log.durationHours, 0);
    });
  }, [sparklineDates, sleepWeeklyLogs]);

  // --- Dynamic Streak Calculation ---
  const getStreak = (data: number[], threshold: number) => {
    let streak = 0;
    let isAlive = true;
    if (data[6] >= threshold) {
      streak = 1;
    } else {
      if (data[5] >= threshold) {
        // Alive from yesterday, but not counted today yet
      } else {
        isAlive = false;
      }
    }
    
    if (isAlive) {
      // data[6] is today, so loop from 5 (yesterday) down to 0
      for (let i = 5; i >= 0; i--) {
        if (data[i] >= threshold) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const hydStreak = getStreak(hydrationSparkline, dailyGoalMl);
  const slpStreak = getStreak(sleepSparkline, 8); // 8h sleep goal

  let streakLabel = "";
  let streakMessage = "";
  let streakColor: "terracotta" | "slate" | "mustard" | "olive" = "slate";

  if (hydStreak >= slpStreak && hydStreak > 0) {
    streakLabel = `${hydStreak} DAY STREAK`;
    streakMessage = "Hydration goal met";
    streakColor = "slate";
  } else if (slpStreak > hydStreak && slpStreak > 0) {
    streakLabel = `${slpStreak} DAY STREAK`;
    streakMessage = "Sleep goal met";
    streakColor = "mustard";
  } else {
    streakLabel = "NEW STREAK";
    streakMessage = "Complete a goal today to start!";
    streakColor = "terracotta";
  }

  return (
    <ScreenWrapper>
      <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
        <View>
          <Text style={textStyles.captionSmall}>{dateStr.toUpperCase()}</Text>
          <Text style={[textStyles.h2, styles.greeting]}>{greeting}, {firstName}.</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HeaderAvatar />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Daily Insight Card */}
        <Card index="01" label="DAILY INSIGHT" style={styles.insightCard}>
          <Text style={textStyles.body}>{insight}</Text>
        </Card>

        {/* Main 2-Column Dashboard Layout */}
        <View style={styles.mainColumnsRow}>
          {/* Left Column: Daily Score */}
          <View style={styles.leftColumn}>
            <Card label="DAILY SCORE" style={styles.fullHeightCard}>
              <View style={styles.scoreStacked}>
                <ActivityRings 
                  size={120}
                  strokeWidth={12}
                  gap={3}
                  rings={[
                    { progress: hydrationProgress, color: colors.accentSlate, backgroundColor: colors.accentSlateLight },
                    { progress: sleepProgress, color: colors.accentMustard, backgroundColor: colors.accentMustardLight },
                    { progress: habitsProgress, color: colors.accentOlive, backgroundColor: colors.accentOliveLight },
                    { progress: caloriesProgress, color: colors.accentTerracotta, backgroundColor: colors.accentTerracottaLight }
                  ]} 
                />
                <View style={styles.scoreDetailsStacked}>
                  <Text style={[textStyles.h3, { textAlign: 'center' }]}>You're doing great</Text>
                  <Text style={[textStyles.bodySmall, { color: colors.inkSoft, marginTop: 4, marginBottom: 16, textAlign: 'center' }]}>
                    Keep closing your rings today!
                  </Text>
                  
                  <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.accentSlate }]} />
                      <Text style={textStyles.captionSmall}>WATER</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.accentMustard }]} />
                      <Text style={textStyles.captionSmall}>SLEEP</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.accentOlive }]} />
                      <Text style={textStyles.captionSmall}>HABITS</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: colors.accentTerracotta }]} />
                      <Text style={textStyles.captionSmall}>MEALS</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </View>

          {/* Right Column: Summaries */}
          <View style={styles.rightColumn}>
            <Card style={styles.flexCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={textStyles.captionSmall}>HYDRATION</Text>
                <Drop color={colors.accentSlate} size={28} weight="fill" style={{ opacity: 0.4 }} />
              </View>
              <Text style={[textStyles.h2, styles.metricValue]}>
                {totalMl.toLocaleString()}<Text style={textStyles.bodySmall}>ml</Text>
              </Text>
              <ProgressBar progress={hydrationProgress} color={colors.accentSlate} style={styles.progress} />
              <View style={styles.bottomSparkline}>
                <MiniBarChart data={hydrationSparkline} labels={sparklineLabels} maxValue={dailyGoalMl} accentColor={colors.accentSlate} />
              </View>
            </Card>

            <Card style={styles.flexCard}>
              <View style={styles.cardHeaderRow}>
                <Text style={textStyles.captionSmall}>SLEEP</Text>
                <Moon color={colors.accentMustard} size={28} weight="fill" style={{ opacity: 0.4 }} />
              </View>
              {lastSleep ? (
                <Text style={[textStyles.h2, styles.metricValue]}>
                  {sleepHours}<Text style={textStyles.bodySmall}>h</Text>{" "}
                  {sleepMins}<Text style={textStyles.bodySmall}>m</Text>
                </Text>
              ) : (
                <Text style={[textStyles.body, { color: colors.inkSoft, marginTop: spacing.xs }]}>—</Text>
              )}
              <ProgressBar progress={sleepProgress} color={colors.accentMustard} style={styles.progress} />
              <View style={styles.bottomSparkline}>
                <MiniBarChart data={sleepSparkline} labels={sparklineLabels} maxValue={8} accentColor={colors.accentMustard} />
              </View>
            </Card>
          </View>
        </View>

        {/* Habits & Meals Summaries */}
        <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl }}>
          <Card style={{ flex: 1 }}>
            <View style={styles.cardHeaderRow}>
              <Text style={textStyles.captionSmall}>HABITS</Text>
              <CheckCircle color={colors.accentOlive} size={28} weight="fill" style={{ opacity: 0.4 }} />
            </View>
            <Text style={[textStyles.h2, styles.metricValue]}>
              {completedHabitsToday}
              <Text style={textStyles.bodySmall}>/{activeHabitsToday}</Text>
            </Text>
            <Text style={[textStyles.bodySmall, { color: colors.inkSoft, marginBottom: spacing.sm }]}>
              {activeHabitsToday > 0 
                ? `${activeHabitsToday - completedHabitsToday} remaining today` 
                : "No active habits"}
            </Text>
            <ProgressBar progress={habitsProgress} color={colors.accentOlive} style={styles.progress} />
          </Card>

          <Card style={{ flex: 1 }}>
            <View style={styles.cardHeaderRow}>
              <Text style={textStyles.captionSmall}>MEALS</Text>
              <OrangeSlice color={colors.accentTerracotta} size={28} weight="fill" style={{ opacity: 0.4 }} />
            </View>
            <Text style={[textStyles.h2, styles.metricValue]}>
              {Math.round(nutritionTotals.calories)}
              <Text style={textStyles.bodySmall}> kcal</Text>
            </Text>
            <Text style={[textStyles.bodySmall, { color: colors.inkSoft, marginBottom: spacing.sm }]}>
              {nutritionGoals.calorieGoal > 0 
                ? `${Math.max(0, Math.round(nutritionGoals.calorieGoal - nutritionTotals.calories))} kcal left` 
                : "No goal set"}
            </Text>
            <ProgressBar progress={caloriesProgress} color={colors.accentTerracotta} style={styles.progress} />
          </Card>
        </View>

        {/* Action Center */}
        <Text style={[textStyles.h3, styles.sectionTitle]}>Log & Track</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accentSlateLight }]}
            onPress={() => router.push("/(tabs)/nourish")}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.accentSlate }]}>Water</Text>
            <Plus color={colors.accentSlate} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accentOliveLight }]}
            onPress={() => router.push("/(tabs)/habits")}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.accentOlive }]}>Habit</Text>
            <Plus color={colors.accentOlive} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accentTerracottaLight }]}
            onPress={() => router.push("/(modals)/nutrition-log")}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.accentTerracotta }]}>Meal</Text>
            <Plus color={colors.accentTerracotta} size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.accentMustardLight }]}
            onPress={() => router.push("/(modals)/sleep-log")}
          >
            <Text style={[textStyles.bodyMedium, { color: colors.accentMustard }]}>Sleep</Text>
            <Plus color={colors.accentMustard} size={20} />
          </TouchableOpacity>
        </View>

        {/* Streaks preview */}
        <Text style={[textStyles.h3, styles.sectionTitle]}>Consistency</Text>
        <Card>
          <View style={styles.streakRow}>
            <Tag label={streakLabel} color={streakColor} />
            <Text style={textStyles.bodySmall}>{streakMessage}</Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greeting: {
    marginTop: spacing.xs,
  },
  content: {
    paddingBottom: spacing.xl, // Reduced — FAB handles its own spacing
  },
  mainColumnsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  leftColumn: {
    flex: 1, 
  },
  rightColumn: {
    flex: 1,
    gap: spacing.md,
  },
  fullHeightCard: {
    flex: 1,
  },
  flexCard: {
    flex: 1,
  },
  scoreStacked: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  scoreDetailsStacked: {
    marginTop: spacing.lg,
    alignItems: "center",
    width: "100%",
  },
  legendContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  insightCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.bgPaperAlt,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bottomSparkline: {
    marginTop: spacing.sm,
    height: 40,
    width: "100%",
  },
  metricValue: {
    marginTop: spacing.xs,
  },
  progress: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderRadius: radii.md,
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
