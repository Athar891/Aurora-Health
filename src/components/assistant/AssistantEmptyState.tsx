import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { colors, typography, fontSizes, spacing } from "../../theme/tokens";
import { Sparkle } from "phosphor-react-native";

interface AssistantEmptyStateProps {
  firstName: string;
}

export default function AssistantEmptyState({ firstName }: AssistantEmptyStateProps) {
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
      <View style={styles.iconWrapper}>
        <Sparkle color={colors.accentTerracotta} size={64} weight="fill" />
      </View>
      <Text style={styles.titleText}>
        Ask away, {firstName}.
      </Text>
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
  iconWrapper: {
    marginBottom: spacing.lg,
  },
  titleText: {
    fontFamily: typography.display.bold,
    fontSize: 32,
    color: colors.ink,
    textAlign: "center",
  },
});
