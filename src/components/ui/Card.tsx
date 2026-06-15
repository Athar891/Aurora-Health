import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing, radii, borders } from "../../theme/tokens";
import { SpecimenLabel } from "../shared/SpecimenLabel";

interface CardProps {
  children: React.ReactNode;
  /** Specimen label index, e.g. "01", "A-1" */
  index?: string;
  /** Specimen label text, e.g. "DAILY INSIGHT" */
  label?: string;
  style?: ViewStyle;
  noPadding?: boolean;
}

/**
 * Card
 * Cream-alt background, 1px hairline border, 4–6px radius.
 * Optional specimen-style mono label in top-left corner.
 */
export function Card({ children, index, label, style, noPadding }: CardProps) {
  return (
    <View style={[styles.container, noPadding && styles.noPadding, style]}>
      {index && label && (
        <View style={styles.labelContainer}>
          <SpecimenLabel index={index} label={label} />
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    padding: spacing.md,
  },
  noPadding: {
    padding: 0,
  },
  labelContainer: {
    marginBottom: spacing.sm,
  },
});
