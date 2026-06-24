import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, AppState, Animated, Platform, Alert } from "react-native";
import { Check, CheckSquareOffset, Plus, Trash } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { HeaderAvatar } from "../../src/components/shared/HeaderAvatar";
import { Card } from "../../src/components/ui/Card";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii, typography, fontSizes } from "../../src/theme/tokens";
import { useHabitsStore } from "../../src/stores/habitsStore";
import { AddHabitModal } from "../../src/components/habits/AddHabitModal";
import { HabitFrequency } from "../../src/types/models";
import Svg, { Path, Circle as SvgCircle } from "react-native-svg";

function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Minimalist leaf watermark for empty/completion states.
 * A continuous-line botanical motif that keeps the calm, earthy aesthetic.
 */
function LeafWatermark({ opacity = 0.06, size = 180 }: { opacity?: number; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 180 180" fill="none" style={{ opacity }}>
      {/* Continuous-line leaf shape */}
      <Path
        d="M90 160 C90 160, 40 120, 35 75 C30 30, 65 15, 90 20 C115 15, 150 30, 145 75 C140 120, 90 160, 90 160Z"
        stroke={colors.accentOlive}
        strokeWidth={1.5}
        fill="none"
      />
      {/* Central vein */}
      <Path
        d="M90 25 L90 155"
        stroke={colors.accentOlive}
        strokeWidth={1}
        fill="none"
      />
      {/* Side veins */}
      <Path
        d="M90 50 C75 55, 55 50, 50 55 M90 70 C72 75, 48 68, 42 72 M90 90 C70 95, 50 88, 45 92 M90 110 C75 115, 58 108, 55 112"
        stroke={colors.accentOlive}
        strokeWidth={0.8}
        fill="none"
      />
      <Path
        d="M90 50 C105 55, 125 50, 130 55 M90 70 C108 75, 132 68, 138 72 M90 90 C110 95, 130 88, 135 92 M90 110 C105 115, 122 108, 125 112"
        stroke={colors.accentOlive}
        strokeWidth={0.8}
        fill="none"
      />
    </Svg>
  );
}

/**
 * Inline circular progress ring rendered via SVG.
 * Shows daily habit completion progress next to the header.
 */
function ProgressRing({ completed, total, size = 40, strokeWidth = 3 }: { completed: number; total: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  const getLabel = () => {
    if (total === 0) return "—";
    if (progress >= 1) return "Great";
    if (progress >= 0.5) return "Good";
    return "Low";
  };

  const getColor = () => {
    if (progress >= 1) return colors.accentOlive;
    if (progress >= 0.5) return colors.accentMustard;
    return colors.accentTerracotta;
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {/* Track */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.line}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        {progress > 0 && (
          <SvgCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </Svg>
      {/* Center label */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text style={{
          fontFamily: typography.display.semiBold,
          fontSize: size > 50 ? fontSizes.h3 : 10,
          color: colors.ink,
        }}>
          {getLabel()}
        </Text>
        {size > 50 && (
          <Text style={{
            fontFamily: typography.caption.fontFamily,
            fontSize: 9,
            color: colors.inkSoft,
            letterSpacing: 0.5,
            marginTop: 1,
          }}>
            {Math.round(progress * 100)}%
          </Text>
        )}
      </View>
    </View>
  );
}

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, completions, isLoading, addHabit, toggleCompletion, fetchHabits, fetchCompletions, deleteHabit } = useHabitsStore();
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

  // Compute daily progress
  const { completedCount, totalCount } = useMemo(() => {
    const total = habits.length;
    const done = habits.filter((h) => isCompletedToday(h.id)).length;
    return { completedCount: done, totalCount: total };
  }, [habits, completions, todayStr]);

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

  const AnimatedHabitCard = ({ habit }: { habit: any }) => {
    const completed = isCompletedToday(habit.id);
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const checkScale = React.useRef(new Animated.Value(completed ? 1 : 0)).current;

    React.useEffect(() => {
      Animated.spring(checkScale, {
        toValue: completed ? 1 : 0,
        useNativeDriver: true,
        bounciness: 12,
        speed: 20,
      }).start();
    }, [completed]);

    const handlePress = () => {
      // Subtle card bounce effect
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        })
      ]).start();
      
      handleToggle(habit.id);
    };

    const handleDeletePress = () => {
      const msg = `Are you sure you want to delete "${habit.title}"?`;
      if (Platform.OS === "web") {
        if (window.confirm(msg)) {
          deleteHabit(habit.id);
        }
      } else {
        Alert.alert(
          "Delete Habit",
          msg,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteHabit(habit.id) }
          ]
        );
      }
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
          <View style={[styles.habitCard, completed && styles.habitCardCompleted]}>
            <View style={styles.habitInfo}>
              <Text style={[textStyles.bodySemiBold, completed && styles.textCompleted]}>
                {habit.title}
              </Text>
              {habit.description ? (
                <Text style={[textStyles.caption, { color: colors.inkSoft, marginTop: 2 }]}>
                  {habit.description}
                </Text>
              ) : null}
              <Text style={[textStyles.caption, { marginTop: 6 }, completed && styles.textCompleted]}>
                🔥 {getStreakDisplay(habit.id)} day streak
              </Text>
            </View>

            <View style={styles.rightActions}>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDeletePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash color={colors.inkSoft} size={20} />
              </TouchableOpacity>
              
              <View style={styles.checkboxContainer}>
                <View style={[styles.checkboxOutline, completed && styles.checkboxOutlineCompleted]}>
                  <Animated.View style={[styles.checkboxFill, { transform: [{ scale: checkScale }] }]}>
                    <Check color={colors.bgPaper} weight="bold" size={16} />
                  </Animated.View>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <ScreenWrapper scrollable={false}>
      {/* Header area with sticky header + progress bar */}
      <View style={styles.headerArea}>
        <View style={styles.header}>
          <View>
            <Text style={textStyles.captionSmall}>DAILY ROUTINES</Text>
            <Text style={[textStyles.h2, { marginTop: spacing.xs }]}>Small steps, big impact.</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginLeft: spacing.md }}
            >
              <HeaderAvatar />
            </TouchableOpacity>
          </View>
        </View>

      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.inkSoft} />
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <LeafWatermark opacity={0.08} size={160} />
          <Text style={[textStyles.bodyMedium, styles.emptyText]}>
            No habits yet.{"\n"}Tap + to create your first habit!
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {/* Hero Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroWatermark}>
              <CheckSquareOffset color={colors.accentOlive} size={52} weight="fill" />
            </View>
            <View style={styles.heroLeft}>
              <ProgressRing completed={completedCount} total={totalCount} size={100} strokeWidth={5} />
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroLabel}>TODAY'S HABITS</Text>
              <Text style={styles.heroValue}>
                {completedCount} <Text style={{ fontSize: fontSizes.h3, color: colors.inkSoft }}>/ {totalCount}</Text>
              </Text>
              <Text style={[styles.heroSubtext, { marginTop: spacing.xs, color: allDone && totalCount > 0 ? colors.accentOlive : colors.inkSoft }]}>
                {allDone && totalCount > 0 ? "All done for today ✓" : `${totalCount - completedCount} remaining`}
              </Text>
            </View>
          </View>

          {habits.map((habit) => (
            <AnimatedHabitCard key={habit.id} habit={habit} />
          ))}

          {/* If all tasks done, show celebration watermark */}
          {allDone && (
            <View style={styles.celebrationContainer}>
              <LeafWatermark opacity={0.07} size={140} />
              <Text style={styles.celebrationText}>
                Beautifully done.{"\n"}Your routines are complete.
              </Text>
            </View>
          )}
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
  /* ── Header ── */
  headerArea: {
    backgroundColor: colors.bgPaper,
    zIndex: 10,
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
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  subtitleItalic: {
    fontStyle: "italic",
    color: "#8B7D6B", // Softer warm brown-grey, more elegant than inkSoft
    fontSize: fontSizes.bodySmall,
  },

  /* ── Hero Card ── */
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
    overflow: "hidden",
  },
  heroWatermark: {
    position: "absolute",
    top: 10,
    right: 10,
    opacity: 0.12,
  },
  heroLeft: {
    alignItems: "center",
  },
  heroRight: {
    flex: 1,
  },
  heroLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroValue: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h1,
    color: colors.ink,
  },
  heroSubtext: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
  },

  /* ── FAB ── */
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

  /* ── List ── */
  list: {
    paddingTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl * 2,
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
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: colors.inkSoft,
    textAlign: "center",
    marginTop: spacing.lg,
  },

  /* ── Cards: Tonal flat design — no outlines, warm fill ── */
  habitCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#EDE6D6", // bgPaperAlt – one shade warmer than canvas
    borderRadius: radii.lg,
    padding: spacing.md,
    // No border — depth from color contrast alone
    borderWidth: 0,
  },
  habitCardCompleted: {
    backgroundColor: "#E8E1CF", // Slightly darker warm tone when completed
    opacity: 0.7,
  },
  habitInfo: {
    flex: 1,
  },
  textCompleted: {
    color: colors.inkSoft,
    textDecorationLine: "line-through",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },

  /* ── Checkbox ── */
  checkboxContainer: {
    width: 44,
    height: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  checkboxOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  checkboxOutlineCompleted: {
    borderColor: colors.accentOlive,
  },
  checkboxFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.accentOlive,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  /* ── Celebration / Watermark ── */
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  celebrationText: {
    fontFamily: typography.body.fontFamily,
    fontStyle: "italic",
    fontSize: fontSizes.bodySmall,
    color: "#8B7D6B",
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 22,
  },
});
