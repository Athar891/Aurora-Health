import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, AppState } from "react-native";
import { Check, CheckSquareOffset, Plus, Gear } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Card } from "../../src/components/ui/Card";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { useHabitsStore } from "../../src/stores/habitsStore";
import { AddHabitModal } from "../../src/components/habits/AddHabitModal";
import { HabitFrequency } from "../../src/types/models";

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, completions, isLoading, addHabit, toggleCompletion, fetchHabits, fetchCompletions } = useHabitsStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [todayStr, setTodayStr] = useState(getTodayStr());

  // Listen for AppState changes to refresh the day if the app is left open across midnight
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setTodayStr(getTodayStr());
      }
    });
    return () => subscription.remove();
  }, []);

  // Fetch habits from Firestore on mount, and whenever auth changes
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Fetch completions for each habit when habits or todayStr change
  useEffect(() => {
    habits.forEach((h) => {
      fetchCompletions(h.id, todayStr);
    });
  }, [habits.length, todayStr]);

  const isCompletedToday = (habitId: string): boolean => {
    const habitCompletions = completions[habitId] || [];
    return habitCompletions.some((c) => c.completedDate === todayStr && c.status === "completed");
  };

  const handleToggle = (habitId: string) => {
    toggleCompletion(habitId, todayStr);
  };

  const handleAddHabit = async (data: { title: string; description: string; frequency: HabitFrequency }) => {
    await addHabit({
      title: data.title,
      description: data.description || undefined,
      frequency: data.frequency,
      active: true,
    });
  };

  const getStreakDisplay = (habitId: string): number => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit || !habit.currentStreak) return 0;
    
    // If the habit was completed today or yesterday, streak is active
    if (habit.lastCompletedDate) {
      if (habit.lastCompletedDate === todayStr) {
        return habit.currentStreak;
      }
      
      const [y, m, d] = todayStr.split("-").map(Number);
      const yesterday = new Date(y, m - 1, d - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
      
      if (habit.lastCompletedDate === yesterdayStr) {
        return habit.currentStreak;
      }
    }
    // Streak broken because last completion was older than yesterday
    return 0; 
  };

  return (
    <ScreenWrapper>
      <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
        <SectionHeader
          style={{ flex: 1 }}
          index="02"
          label="HABITS"
          title="Daily Routines"
          subtitle="Small steps, big impact."
        />
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Gear color={colors.ink} size={24} weight="regular" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.inkSoft} />
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[textStyles.bodyMedium, { color: colors.inkSoft, textAlign: "center" }]}>
            No habits yet.{"\n"}Tap + to create your first habit!
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {habits.map((habit) => {
            const completed = isCompletedToday(habit.id);
            return (
              <Card key={habit.id} style={{...styles.habitCard, ...(completed ? styles.habitCardCompleted : undefined)}}>
                <View style={styles.habitInfo}>
                  <Text style={[textStyles.bodySemiBold, completed && styles.textCompleted]}>
                    {habit.title}
                  </Text>
                  {habit.description ? (
                    <Text style={[textStyles.caption, { color: colors.inkSoft }]}>
                      {habit.description}
                    </Text>
                  ) : null}
                  <Text style={[textStyles.caption, completed && styles.textCompleted]}>
                    🔥 {getStreakDisplay(habit.id)} day streak
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleToggle(habit.id)}
                  style={[styles.checkbox, completed && styles.checkboxCompleted]}
                >
                  {completed ? (
                    <Check color={colors.bgPaper} weight="bold" size={16} />
                  ) : (
                    <CheckSquareOffset color={colors.inkSoft} weight="regular" size={24} />
                  )}
                </TouchableOpacity>
              </Card>
            );
          })}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Plus color={colors.bgPaper} weight="bold" size={24} />
      </TouchableOpacity>
      <AddHabitModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddHabit}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  floatingButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.accentOlive,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxl * 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: spacing.xxl * 2,
  },
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  habitCardCompleted: {
    backgroundColor: colors.bgPaper,
    borderColor: colors.line,
    opacity: 0.7,
  },
  habitInfo: {
    flex: 1,
  },
  textCompleted: {
    color: colors.inkSoft,
    textDecorationLine: "line-through",
  },
  checkbox: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: colors.accentOlive,
    borderRadius: radii.sm,
  },
});
