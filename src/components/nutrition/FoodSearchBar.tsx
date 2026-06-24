import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { MagnifyingGlass, X } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../theme/tokens";

interface FoodSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function FoodSearchBar({ value, onChangeText, placeholder }: FoodSearchBarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <MagnifyingGlass
        size={18}
        color={focused ? colors.accentTerracotta : colors.inkSoft}
        weight="regular"
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? "Search foods…"}
        placeholderTextColor={colors.inkSoft}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={16} color={colors.inkSoft} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  containerFocused: {
    borderColor: colors.accentTerracotta,
  },
  input: {
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    color: colors.ink,
    padding: 0,
  },
});
