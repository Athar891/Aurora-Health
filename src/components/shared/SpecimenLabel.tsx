import React from "react";
import { Text, StyleSheet } from "react-native";
import { typography, fontSizes, lineHeights, colors } from "../../theme/tokens";

interface SpecimenLabelProps {
  /** e.g. "01", "A-1", "B-2" */
  index: string;
  /** e.g. "DAILY INSIGHT", "WATER", "HABITS" */
  label: string;
}

/**
 * SpecimenLabel
 * The signature device of the naturalist design system.
 * A small monospace index + section name, like a catalog entry.
 *
 * Example: "01 · DAILY INSIGHT"
 */
export function SpecimenLabel({ index, label }: SpecimenLabelProps) {
  return (
    <Text style={styles.text}>
      {index} · {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    lineHeight: lineHeights.captionSmall,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
});
