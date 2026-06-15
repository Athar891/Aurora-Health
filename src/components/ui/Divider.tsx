import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { colors, spacing } from "../../theme/tokens";

interface DividerProps {
  style?: ViewStyle;
}

/**
 * Divider
 * A 1px hairline in --line color. Used liberally between sections
 * instead of large gaps or boxes (per Style.md).
 */
export function Divider({ style }: DividerProps) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.md,
  },
});
