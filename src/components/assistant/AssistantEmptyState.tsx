import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors, typography, fontSizes, spacing } from "../../theme/tokens";

// Colors for each letter of "Aurora AI" — using Aurora's palette
const LETTER_COLORS = [
  colors.accentTerracotta, // A
  colors.accentOlive,      // u
  colors.accentSlate,      // r
  colors.accentMustard,    // o
  colors.ink,              // r
  colors.accentTerracotta, // a
  "",                      // space
  colors.accentOlive,      // A
  colors.accentSlate,      // I
];

const TITLE_TEXT = "Aurora AI";

export default function AssistantEmptyState() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.titleRow}>
        {TITLE_TEXT.split("").map((letter, index) => (
          <Text
            key={index}
            style={[
              styles.titleLetter,
              letter === " "
                ? styles.space
                : { color: LETTER_COLORS[index] || colors.ink },
            ]}
          >
            {letter}
          </Text>
        ))}
      </View>
      <Text style={styles.subtitle}>Your health companion</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 80, // offset slightly above center
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  titleLetter: {
    fontFamily: typography.display.bold,
    fontSize: 42,
    lineHeight: 52,
  },
  space: {
    width: 12,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    marginTop: spacing.sm,
    letterSpacing: 0.5,
  },
});
