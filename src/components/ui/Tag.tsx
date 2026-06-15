import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, typography, fontSizes, lineHeights, radii, spacing } from "../../theme/tokens";

type TagColor = "olive" | "slate" | "mustard" | "terracotta";

interface TagProps {
  label: string;
  color?: TagColor;
  style?: ViewStyle;
}

const colorMap: Record<TagColor, { bg: string; text: string }> = {
  olive: { bg: colors.accentOliveLight, text: colors.accentOlive },
  slate: { bg: colors.accentSlateLight, text: colors.accentSlate },
  mustard: { bg: colors.accentMustardLight, text: colors.accentMustard },
  terracotta: { bg: colors.accentTerracottaLight, text: colors.accentTerracotta },
};

/**
 * Tag / Status Pill
 * Pill-shaped, small mono caps, colored bg at low opacity with matching text.
 */
export function Tag({ label, color = "olive", style }: TagProps) {
  const { bg, text } = colorMap[color];

  return (
    <View style={[styles.container, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    lineHeight: lineHeights.captionSmall,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
});
