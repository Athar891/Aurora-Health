import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { colors, typography, fontSizes, spacing, radii, borders, motion } from "../../theme/tokens";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "small";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

/**
 * Button
 * Naturalist design: solid terracotta primary, hairline outline secondary, no gradients/shadows.
 * Press feedback: opacity 0.85, 150ms.
 */
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "default",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        size === "small" && styles.small,
        variantStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.white : colors.ink}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              size === "small" && styles.textSmall,
              variantTextStyles[variant],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    gap: spacing.sm,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    textAlign: "center",
  },
  textSmall: {
    fontSize: fontSizes.bodySmall,
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: colors.accentTerracotta,
  },
  secondary: {
    backgroundColor: colors.transparent,
    ...borders.hairline,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
};

const variantTextStyles: Record<ButtonVariant, TextStyle> = {
  primary: {
    color: colors.white,
  },
  secondary: {
    color: colors.ink,
  },
  ghost: {
    color: colors.accentSlate,
  },
};
