import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { CaretDown, CaretUp } from "phosphor-react-native";
import { MealFoodEntry, MealType } from "../../types/models";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../theme/tokens";

interface MealSectionProps {
  title: string;
  mealType: MealType;
  entries: MealFoodEntry[];
  onLogMeal: (meal: MealType) => void;
  accentColor: string;
}

export function MealSection({
  title,
  mealType,
  entries,
  onLogMeal,
  accentColor,
}: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const totalCals = entries.reduce((sum, e) => sum + e.calories, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.summary}>{totalCals} kcal</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.logBtn}
            onPress={() => onLogMeal(mealType)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.logBtnText, { color: accentColor }]}>+ Log</Text>
          </TouchableOpacity>
          {expanded ? (
            <CaretUp size={16} color={colors.inkSoft} />
          ) : (
            <CaretDown size={16} color={colors.inkSoft} />
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      {expanded && (
        <View style={styles.content}>
          {entries.length === 0 ? (
            <Text style={styles.emptyText}>Nothing logged yet.</Text>
          ) : (
            <View style={styles.entryList}>
              {entries.map((entry, idx) => (
                <View
                  key={entry.id}
                  style={[
                    styles.entryRow,
                    idx < entries.length - 1 && styles.borderBottom,
                  ]}
                >
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName} numberOfLines={1}>
                      {entry.foodName}
                    </Text>
                    <Text style={styles.entryDesc}>
                      {entry.quantity} {entry.unit}
                    </Text>
                  </View>
                  <Text style={styles.entryCals}>{entry.calories} kcal</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.bgPaper,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  summary: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPaperAlt,
  },
  logBtnText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.captionSmall,
    textTransform: "uppercase",
  },
  content: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
  entryList: {
    gap: 0,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  entryInfo: {
    flex: 1,
    gap: 2,
  },
  entryName: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  entryDesc: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
  },
  entryCals: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
  },
});
