import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Trash, CaretDown } from "phosphor-react-native";
import { MealFoodEntry, FoodItem, ServingUnit } from "../../types/models";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../theme/tokens";

interface SelectedFoodEntryProps {
  entry: MealFoodEntry;
  food: FoodItem;
  onRemove: () => void;
  onQuantityChange: (quantity: number, unit: ServingUnit) => void;
}

export function SelectedFoodEntry({
  entry,
  food,
  onRemove,
  onQuantityChange,
}: SelectedFoodEntryProps) {
  const [quantityText, setQuantityText] = useState(String(entry.quantity));
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<ServingUnit>(entry.unit);

  function handleQuantityChange(text: string) {
    setQuantityText(text);
    const num = parseFloat(text);
    if (!isNaN(num) && num > 0) {
      onQuantityChange(num, selectedUnit);
    }
  }

  function handleUnitSelect(unit: ServingUnit) {
    setSelectedUnit(unit);
    setShowUnitPicker(false);
    const num = parseFloat(quantityText);
    if (!isNaN(num) && num > 0) {
      onQuantityChange(num, unit);
    }
  }

  const currentServingOption = food.servingOptions.find((s) => s.unit === selectedUnit);
  const unitLabel = currentServingOption?.label ?? selectedUnit;
  // Short label for display
  const unitShort = unitLabel.split("(")[0].trim();

  return (
    <View style={styles.container}>
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={styles.foodName} numberOfLines={1}>{entry.foodName}</Text>
        <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Trash size={16} color={colors.accentTerracotta} />
        </TouchableOpacity>
      </View>

      {/* Quantity + Unit row */}
      <View style={styles.quantityRow}>
        <View style={styles.quantityInputContainer}>
          <Text style={styles.quantityLabel}>Qty</Text>
          <TextInput
            style={styles.quantityInput}
            value={quantityText}
            onChangeText={handleQuantityChange}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        </View>

        <TouchableOpacity
          style={styles.unitSelector}
          onPress={() => setShowUnitPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.unitText} numberOfLines={1}>{unitShort}</Text>
          <CaretDown size={14} color={colors.inkSoft} />
        </TouchableOpacity>
      </View>

      {/* Macro row */}
      <View style={styles.macroRow}>
        <MacroCell label="Calories" value={entry.calories} unit="kcal" color={colors.accentTerracotta} />
        <MacroCell label="Protein" value={entry.protein} unit="g" color={colors.accentOlive} />
        <MacroCell label="Carbs" value={entry.carbs} unit="g" color={colors.accentMustard} />
        <MacroCell label="Fat" value={entry.fat} unit="g" color={colors.accentSlate} />
      </View>

      {/* Unit Picker Modal */}
      <Modal
        visible={showUnitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowUnitPicker(false)}>
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select Unit</Text>
            {food.servingOptions.map((opt) => (
              <TouchableOpacity
                key={opt.unit}
                style={[
                  styles.pickerRow,
                  opt.unit === selectedUnit && styles.pickerRowSelected,
                ]}
                onPress={() => handleUnitSelect(opt.unit)}
              >
                <Text
                  style={[
                    styles.pickerRowText,
                    opt.unit === selectedUnit && styles.pickerRowTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function MacroCell({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.macroCell}>
      <Text style={[styles.macroValue, { color }]}>
        {value}
        <Text style={styles.macroUnit}>{unit}</Text>
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodName: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
    flex: 1,
    marginRight: spacing.sm,
  },
  quantityRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.bgPaper,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  quantityLabel: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
  },
  quantityInput: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
    minWidth: 48,
    padding: 0,
  },
  unitSelector: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgPaper,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    gap: spacing.xs,
  },
  unitText: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
    flex: 1,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  macroCell: {
    alignItems: "center",
    flex: 1,
  },
  macroValue: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.bodySmall,
  },
  macroUnit: {
    fontSize: fontSizes.captionSmall,
    fontFamily: typography.body.fontFamily,
  },
  macroLabel: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: 9,
    color: colors.inkSoft,
    marginTop: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.xs,
  },
  pickerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  pickerRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.md,
  },
  pickerRowSelected: {
    backgroundColor: colors.accentTerracottaLight,
  },
  pickerRowText: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  pickerRowTextSelected: {
    fontFamily: typography.body.semiBold,
    color: colors.accentTerracotta,
  },
});
