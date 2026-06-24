import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps } from "react-native";
import { colors, typography, fontSizes, lineHeights, spacing, radii, borders } from "../../theme/tokens";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

/**
 * Input
 * Text input with hairline border, warm cream aesthetic.
 * Focused state uses terracotta border.
 */
export function Input({ label, error, containerStyle, ...inputProps }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...inputProps}
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error ? styles.inputError : undefined,
        ]}
        placeholderTextColor={colors.inkSoft}
        onFocus={(e) => {
          setIsFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          inputProps.onBlur?.(e);
        }}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    color: colors.ink,
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  inputFocused: {
    borderColor: colors.accentTerracotta,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
