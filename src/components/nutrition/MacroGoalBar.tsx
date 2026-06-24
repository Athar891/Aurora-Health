import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MealTotals, NutritionGoals } from "../../types/models";
import { colors, spacing, radii, typography, fontSizes } from "../../theme/tokens";

interface MacroGoalBarProps {
  totals: MealTotals;
  goals: NutritionGoals;
}

export function MacroGoalBar({ totals, goals }: MacroGoalBarProps) {
  return (
    <View style={styles.container}>
      <MacroBar
        label="Calories"
        current={totals.calories}
        goal={goals.calorieGoal}
        unit="kcal"
        color={colors.accentTerracotta}
      />
      <MacroBar
        label="Protein"
        current={totals.protein}
        goal={goals.proteinGoal}
        unit="g"
        color={colors.accentOlive}
      />
      <MacroBar
        label="Carbs"
        current={totals.carbs}
        goal={goals.carbGoal}
        unit="g"
        color={colors.accentMustard}
      />
      <MacroBar
        label="Fat"
        current={totals.fat}
        goal={goals.fatGoal}
        unit="g"
        color={colors.accentSlate}
      />
    </View>
  );
}

function MacroBar({
  label,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const progress = goal > 0 ? Math.min(current / goal, 1) : 0;
  const remaining = Math.max(goal - current, 0);

  return (
    <View style={styles.row}>
      <View style={styles.labelCol}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.current, { color }]}>
          {current}
          <Text style={styles.unit}>{unit}</Text>
        </Text>
      </View>
      <View style={styles.barCol}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${progress * 100}%`, backgroundColor: color },
            ]}
          />
        </View>
        <Text style={styles.remaining}>
          {current} / {goal} {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  labelCol: {
    width: 70,
  },
  label: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  current: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.bodySmall,
    marginTop: 2,
  },
  unit: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.captionSmall,
  },
  barCol: {
    flex: 1,
    gap: 4,
  },
  track: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPaperAlt,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
  },
  remaining: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: 9,
    color: colors.inkSoft,
  },
});
