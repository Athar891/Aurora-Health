import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/stores/authStore";

export default function CompleteScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Simple dot animation
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Simulate saving and transition
    const timeout = setTimeout(async () => {
      await updateProfile({ onboardingComplete: true });
      router.replace("/(tabs)");
    }, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <ScreenWrapper scrollable={false} style={styles.container}>
      <View style={styles.content}>
        <Text style={[textStyles.h1, styles.title]}>All set.</Text>
        <Text style={[textStyles.bodyLarge, styles.subtitle]}>
          Preparing your companion{dots}
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.inkSoft,
  },
});
