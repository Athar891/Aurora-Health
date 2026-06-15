import React, { useEffect, useRef } from "react";
import { View, StyleSheet, ViewStyle, Animated } from "react-native";
import { colors, radii, motion } from "../../theme/tokens";

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  style?: ViewStyle;
}

/**
 * ProgressBar
 * A linear progress indicator with smooth animation.
 * Uses the built-in Animated API to avoid requiring react-native-reanimated.
 */
export function ProgressBar({
  progress,
  color = colors.accentOlive,
  height = 8,
  style,
}: ProgressBarProps) {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: motion.normal,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { height }, style]}>
      <Animated.View style={[styles.fill, { backgroundColor: color, width: widthInterpolation }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.pill,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radii.pill,
  },
});
