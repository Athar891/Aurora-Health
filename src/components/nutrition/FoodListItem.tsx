import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Plus, Star } from "phosphor-react-native";
import { FoodItem } from "../../types/models";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../theme/tokens";

interface FoodListItemProps {
  food: FoodItem;
  onAdd: (food: FoodItem) => void;
  isAdded?: boolean;
}

export function FoodListItem({ food, onAdd, isAdded }: FoodListItemProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
          {food.isCustom && (
            <View style={styles.customBadge}>
              <Star size={10} color={colors.accentMustard} weight="fill" />
              <Text style={styles.customBadgeText}>Custom</Text>
            </View>
          )}
        </View>
        <View style={styles.macroRow}>
          <MacroBit label="Cal" value={`${food.caloriesPer100g}`} color={colors.accentTerracotta} />
          <Text style={styles.macroDivider}>·</Text>
          <MacroBit label="P" value={`${food.proteinPer100g}g`} color={colors.accentOlive} />
          <Text style={styles.macroDivider}>·</Text>
          <MacroBit label="C" value={`${food.carbsPer100g}g`} color={colors.accentMustard} />
          <Text style={styles.macroDivider}>·</Text>
          <MacroBit label="F" value={`${food.fatPer100g}g`} color={colors.accentSlate} />
          <Text style={[styles.per100, { marginLeft: spacing.xs }]}>per 100g</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.addButton, isAdded && styles.addButtonAdded]}
        onPress={() => onAdd(food)}
        activeOpacity={0.7}
      >
        <Plus size={18} color={isAdded ? colors.accentOlive : colors.bgPaper} weight="bold" />
      </TouchableOpacity>
    </View>
  );
}

function MacroBit({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Text style={[styles.macroBit, { color }]}>
      <Text style={styles.macroLabel}>{label} </Text>{value}
    </Text>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  name: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.ink,
    flex: 1,
  },
  customBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.accentMustardLight,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  customBadgeText: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: 9,
    color: colors.accentMustard,
  },
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  macroBit: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
  },
  macroLabel: {
    opacity: 0.6,
  },
  macroDivider: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.line,
    marginHorizontal: 4,
  },
  per100: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: 9,
    color: colors.inkSoft,
    opacity: 0.6,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentTerracotta,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonAdded: {
    backgroundColor: colors.accentOliveLight,
    borderWidth: 1,
    borderColor: colors.accentOlive,
  },
});
