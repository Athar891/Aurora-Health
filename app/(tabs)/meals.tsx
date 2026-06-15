import React, { useEffect } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { ForkKnife, Plus } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Card } from "../../src/components/ui/Card";
import { WeeklyBarChart } from "../../src/components/charts/WeeklyBarChart";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { useNutritionStore } from "../../src/stores/nutritionStore";
import { useTodayDate } from "../../src/hooks/useTodayDate";

export default function MealsScreen() {
  const router = useRouter();
  const { logs, fetchLogs } = useNutritionStore();
  const todayStr = useTodayDate(); // auto-updates at midnight

  useEffect(() => {
    fetchLogs(todayStr);
  }, [fetchLogs, todayStr]);

  // Chart data — today shows real count, rest are placeholders
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayDayIndex = (new Date().getDay() + 6) % 7;
  const chartData = dayLabels.map((label, i) => ({
    label,
    value: i === todayDayIndex ? logs.length : 0,
    displayValue: i === todayDayIndex ? `${logs.length}` : "",
  }));

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <SectionHeader
            index="02"
            label="NUTRITION"
            title="Meals"
            subtitle="Nourish your body."
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(modals)/nutrition-log")}
            activeOpacity={0.8}
          >
            <Plus color={colors.bgPaper} weight="bold" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={[textStyles.h3, styles.sectionTitle]}>This Week</Text>
        <Card style={styles.chartCard}>
          <WeeklyBarChart
            data={chartData}
            maxValue={6}
            goalValue={3}
            accentColor={colors.accentTerracotta}
          />
        </Card>

        <Text style={[textStyles.h3, styles.sectionTitle, { marginTop: spacing.xl }]}>Today's Log</Text>
        <View style={styles.logList}>
          {logs.map((log) => (
            <Card key={log.id} style={styles.logCard}>
              <View style={styles.logCardHeader}>
                <View style={styles.logCardLeft}>
                  <ForkKnife color={colors.accentTerracotta} weight="regular" size={20} />
                  <Text style={[textStyles.bodyMedium, { textTransform: "capitalize" }]}>
                    {log.mealType || "Meal"}
                  </Text>
                </View>
                <Text style={textStyles.caption}>
                  {log.createdAt instanceof Date
                    ? log.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : ""}
                </Text>
              </View>
              {log.description ? (
                <Text style={[textStyles.body, styles.logDesc]}>{log.description}</Text>
              ) : null}
              {log.photoUrl ? (
                <Image source={{ uri: log.photoUrl }} style={styles.logImage} />
              ) : null}
            </Card>
          ))}
          {logs.length === 0 && (
            <Text style={[textStyles.body, { color: colors.inkSoft, textAlign: "center", marginTop: spacing.md }]}>
              No meals logged yet today.
            </Text>
          )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  addButton: {
    backgroundColor: colors.accentTerracotta,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.md,
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
    padding: spacing.md,
  },
  logCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  logCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logDesc: {
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  logImage: {
    width: "100%",
    height: 150,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
});
