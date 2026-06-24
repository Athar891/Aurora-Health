import { StyleSheet } from "react-native";
import { colors, typography, fontSizes, lineHeights, spacing, borders } from "./tokens";

/**
 * Shared style presets used across the app.
 * These complement the tokens by providing ready-to-use StyleSheet objects.
 */
export const textStyles = StyleSheet.create({
  h1: {
    fontFamily: typography.display.bold,
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    color: colors.ink,
  },
  h2: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    color: colors.ink,
  },
  h3: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
    color: colors.ink,
  },
  bodyLarge: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
    color: colors.ink,
  },
  body: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    color: colors.ink,
  },
  bodyMedium: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    color: colors.ink,
  },
  bodySemiBold: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    color: colors.ink,
  },
  bodySmall: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
    color: colors.inkSoft,
  },
  caption: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    letterSpacing: 0.5,
    color: colors.inkSoft,
  },
  captionSmall: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    lineHeight: lineHeights.captionSmall,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.inkSoft,
  },
});

export const layoutStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.bgPaper,
    paddingHorizontal: spacing.lg,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: 6,
    ...borders.hairline,
    padding: spacing.md,
  },
});
