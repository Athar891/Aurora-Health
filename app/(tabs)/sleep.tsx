import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from "react-native";
import { Moon, Plus, Gear } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Card } from "../../src/components/ui/Card";
import { WeeklyBarChart } from "../../src/components/charts/WeeklyBarChart";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing } from "../../src/theme/tokens";
import { useSleepStore } from "../../src/stores/sleepStore";
import { useTodayDate } from "../../src/hooks/useTodayDate";

export default function SleepScreen() {
  const router = useRouter();
  const { logs, fetchLogs } = useSleepStore();
  const todayStr = useTodayDate(); // auto-updates at midnight

  useEffect(() => {
    fetchLogs(todayStr);
  }, [fetchLogs, todayStr]);

  const getDuration = (start: Date, end: Date) => {
    let diff = (end.getTime() - start.getTime()) / 60000;
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = Math.floor(diff % 60);
    return { hours, mins, totalHours: diff / 60 };
  };

  // Chart data — today shows real value, rest are placeholders
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const todayHours =
    logs.length > 0 ? getDuration(logs[0].sleepStart, logs[0].sleepEnd).totalHours : 0;
  const chartData = dayLabels.map((label, i) => ({
    label,
    value: i === todayDayIndex ? todayHours : 0,
    displayValue: i === todayDayIndex && todayHours > 0 ? `${Math.floor(todayHours)}h` : "",
  }));

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.header, { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }]}>
          <SectionHeader
            style={{ flex: 1 }}
            index="03"
            label="RECOVERY"
            title="Sleep"
            subtitle="Rest and recharge."
          />
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Gear color={colors.ink} size={24} weight="regular" />
          </TouchableOpacity>
        </View>

        <Text style={[textStyles.h3, styles.sectionTitle]}>This Week (Hours)</Text>
        <Card style={styles.chartCard}>
          <WeeklyBarChart
            data={chartData}
            maxValue={12}
            goalValue={8}
            accentColor={colors.accentOlive}
          />
        </Card>

        <Text style={[textStyles.h3, styles.sectionTitle, { marginTop: spacing.xl }]}>Last Night</Text>
        <View style={styles.logList}>
          {logs.map((log) => {
            const duration = getDuration(log.sleepStart, log.sleepEnd);
            return (
              <Card key={log.id} style={styles.logCard}>
                <View style={styles.logCardLeft}>
                  <Moon color={colors.accentOlive} weight="fill" size={24} />
                  <View>
                    <Text style={textStyles.bodyMedium}>
                      {duration.hours}h {duration.mins}m
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.inkSoft }]}>
                      {log.sleepStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" → "}
                      {log.sleepEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })}
          {logs.length === 0 && (
            <Text style={[textStyles.body, { color: colors.inkSoft, textAlign: "center", marginTop: spacing.md }]}>
              No sleep logged for today.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(modals)/sleep-log")}
        activeOpacity={0.8}
      >
        <Plus color={colors.bgPaper} weight="bold" size={24} />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
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
  sectionTitle: {
    marginBottom: spacing.md,
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
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  logCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
