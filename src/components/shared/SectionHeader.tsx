import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { textStyles } from "../../theme/styles";
import { SpecimenLabel } from "./SpecimenLabel";
import { spacing } from "../../theme/tokens";

interface SectionHeaderProps {
  index?: string;
  label?: string;
  title: string;
  subtitle?: string;
  subtitleStyle?: TextStyle;
  style?: ViewStyle;
  rightAccessory?: React.ReactNode;
}

/**
 * SectionHeader
 * Combines SpecimenLabel, title, and optional subtitle.
 */
export function SectionHeader({ index, label, title, subtitle, subtitleStyle, style, rightAccessory }: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {index && label && (
        <View style={styles.labelContainer}>
          <SpecimenLabel index={index} label={label} />
        </View>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={textStyles.h2}>{title}</Text>
          {subtitle && <Text style={[textStyles.body, styles.subtitle, subtitleStyle]}>{subtitle}</Text>}
        </View>
        {rightAccessory && <View style={{ marginLeft: spacing.md }}>{rightAccessory}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
