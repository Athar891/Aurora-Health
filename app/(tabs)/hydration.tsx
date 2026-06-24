import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated } from "react-native";
import { Drop, Plus, Minus } from "phosphor-react-native";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Card } from "../../src/components/ui/Card";
import { WeeklyBarChart } from "../../src/components/charts/WeeklyBarChart";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { useHydrationStore } from "../../src/stores/hydrationStore";
import { useTodayDate } from "../../src/hooks/useTodayDate";

const QUICK_AMOUNTS = [100, 250, 500];

export default function HydrationScreen() {
  const { logs, dailyGoalMl, fetchLogs, addLog, getTotalForToday } = useHydrationStore();

  const todayStr = useTodayDate();

  useEffect(() => {
    fetchLogs(todayStr);
  }, [fetchLogs, todayStr]);

  const totalMl = getTotalForToday();
  const percentage = Math.min((totalMl / dailyGoalMl) * 100, 100);

  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fillAnim, {
      toValue: percentage,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [percentage]);

  const heightInterpolation = fillAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  const handleAdd = (amount: number) => {
    addLog(amount, "manual");
  };

  // Chart data — today's actual value, rest are placeholders until we aggregate weekly
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIndex = (new Date().getDay() + 6) % 7; // 0=Mon
  const chartData = dayLabels.map((label, i) => ({
    label,
    value: i === todayDayIndex ? totalMl : 0,
    displayValue: i === todayDayIndex ? `${totalMl}` : "",
  }));

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <SectionHeader
          style={{ marginBottom: 0 }}
          title="Daily Intake"
          subtitle="Keep the flow going."
        />
      </View>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Visualizer */}
        <View style={styles.visualizerContainer}>
          <View style={styles.bottleContainer}>
            <View style={styles.bottleCap} />
            <View style={styles.bottleNeck} />
            <View style={styles.bottleBody}>
              <Animated.View style={[styles.waterFill, { height: heightInterpolation }]} />
              <View style={styles.measurementContainer}>
                <View style={styles.measurementLine} />
                <View style={styles.measurementLine} />
                <View style={styles.measurementLine} />
              </View>
            </View>
          </View>

          {/* ± 100ml Controls */}
          <View style={styles.counterRow}>
            <TouchableOpacity
              onPress={() => handleAdd(-100)}
              style={styles.adjustButton}
              activeOpacity={0.7}
            >
              <Minus color={colors.ink} size={20} weight="bold" />
            </TouchableOpacity>

            <Text style={[textStyles.h1, styles.totalText]}>
              {totalMl} <Text style={textStyles.body}>/ {dailyGoalMl} ml</Text>
            </Text>

            <TouchableOpacity
              onPress={() => handleAdd(100)}
              style={styles.adjustButton}
              activeOpacity={0.7}
            >
              <Plus color={colors.ink} size={20} weight="bold" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Add */}
        <Text style={[textStyles.h3, styles.sectionTitle]}>Quick Add</Text>
        <View style={styles.quickAddRow}>
          {QUICK_AMOUNTS.map((amount) => (
            <TouchableOpacity
              key={amount}
              activeOpacity={0.7}
              style={styles.quickAddButton}
              onPress={() => handleAdd(amount)}
            >
              <Drop color={colors.accentSlate} weight="fill" size={24} />
              <Text style={[textStyles.bodySemiBold, { color: colors.accentSlate, marginTop: spacing.xs }]}>
                +{amount}ml
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Chart */}
        <Text style={[textStyles.h3, styles.sectionTitle]}>This Week</Text>
        <Card style={styles.chartCard}>
          <WeeklyBarChart
            data={chartData}
            maxValue={3000}
            goalValue={dailyGoalMl}
            accentColor={colors.accentSlate}
          />
        </Card>

        {/* Today's Log */}
        <Text style={[textStyles.h3, styles.sectionTitle, { marginTop: spacing.xl }]}>Today's Log</Text>
        <View style={styles.logList}>
          {logs
            .filter((l) => l.amountMl > 0)
            .map((log) => (
              <Card key={log.id} style={styles.logCard}>
                <View style={styles.logCardLeft}>
                  <Drop color={colors.accentSlate} weight="regular" size={20} />
                  <View style={styles.logDetails}>
                    <Text style={textStyles.bodyMedium}>Water</Text>
                    <Text style={textStyles.caption}>+{log.amountMl}ml</Text>
                  </View>
                </View>
                <Text style={textStyles.caption}>
                  {log.loggedAt instanceof Date
                    ? log.loggedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </Text>
              </Card>
            ))}
          {logs.filter((l) => l.amountMl > 0).length === 0 && (
            <Text style={[textStyles.body, { color: colors.inkSoft, textAlign: "center", marginTop: spacing.md }]}>
              No water logged yet today.
            </Text>
          )}
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
    alignItems: "center",
    paddingTop: spacing.md,
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
  visualizerContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  bottleContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  bottleCap: {
    width: 44,
    height: 18,
    backgroundColor: colors.accentSlate,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.ink,
    borderBottomWidth: 0,
  },
  bottleNeck: {
    width: 36,
    height: 20,
    backgroundColor: colors.bgPaperAlt,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: colors.ink,
  },
  bottleBody: {
    width: 140,
    height: 260,
    backgroundColor: "rgba(92, 122, 138, 0.05)", // slightly tinted background
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgPaperAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  totalText: {
    color: colors.ink,
    minWidth: 160,
    textAlign: "center",
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  quickAddRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: colors.accentSlateLight,
    borderRadius: radii.md,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  chartCard: {
    padding: spacing.md,
  },
  logList: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  logCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logDetails: {
    justifyContent: "center",
  },
});
