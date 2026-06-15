import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, Link } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { SpecimenLabel } from "../../src/components/shared/SpecimenLabel";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing } from "../../src/theme/tokens";

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper scrollable={false} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[textStyles.h1, styles.title]}>✦ Aurora</Text>
          <Text style={[textStyles.bodyLarge, styles.subtitle]}>
            Understand yourself better every day.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          onPress={() => router.push("/(onboarding)/slides")}
          style={styles.button}
        />
        <View style={styles.loginPrompt}>
          <Text style={textStyles.body}>Already have an account? </Text>
          <Link href="/(onboarding)/auth/login" style={styles.link}>
            <Text style={[textStyles.body, styles.linkText]}>Sign in</Text>
          </Link>
        </View>

        <View style={styles.labelContainer}>
          <SpecimenLabel index="01" label="AURORA" />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.inkSoft,
    maxWidth: "80%",
  },
  footer: {
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  button: {
    marginBottom: spacing.lg,
  },
  loginPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  link: {
    justifyContent: "center",
  },
  linkText: {
    color: colors.accentSlate,
    textDecorationLine: "underline",
  },
  labelContainer: {
    alignItems: "center",
  },
});
