import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { colors } from "../../theme/tokens";

interface VoiceWaveformProps {
  isActive: boolean;
  /** "listening" = warm terracotta tones, "speaking" = cool olive tones */
  mode: "listening" | "speaking" | "idle";
  barCount?: number;
}

const BAR_COUNT_DEFAULT = 7;

const LISTENING_COLORS = [
  colors.accentTerracotta,
  colors.accentMustard,
  colors.accentTerracotta,
  colors.accentMustard,
  colors.accentTerracotta,
  colors.accentMustard,
  colors.accentTerracotta,
];

const SPEAKING_COLORS = [
  colors.accentOlive,
  colors.accentSlate,
  colors.accentOlive,
  colors.accentSlate,
  colors.accentOlive,
  colors.accentSlate,
  colors.accentOlive,
];

export default function VoiceWaveform({
  isActive,
  mode,
  barCount = BAR_COUNT_DEFAULT,
}: VoiceWaveformProps) {
  const animValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    if (isActive && mode !== "idle") {
      // Start staggered looping animations for each bar
      const animations = animValues.map((anim, index) => {
        const delay = index * 80; // stagger
        const minHeight = 0.15 + Math.random() * 0.15;
        const maxHeight = 0.6 + Math.random() * 0.4;
        const duration = 400 + Math.random() * 300;

        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: maxHeight,
              duration: duration,
              useNativeDriver: false,
            }),
            Animated.timing(anim, {
              toValue: minHeight,
              duration: duration * 0.8,
              useNativeDriver: false,
            }),
          ])
        );
      });

      animations.forEach((a) => a.start());

      return () => {
        animations.forEach((a) => a.stop());
      };
    } else {
      // Reset to idle state
      animValues.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.15,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive, mode]);

  const barColors =
    mode === "listening"
      ? LISTENING_COLORS
      : mode === "speaking"
      ? SPEAKING_COLORS
      : LISTENING_COLORS;

  return (
    <View style={styles.container}>
      {animValues.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: barColors[index % barColors.length],
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 80],
              }),
              opacity: isActive ? 1 : 0.4,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    gap: 6,
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 8,
  },
});
