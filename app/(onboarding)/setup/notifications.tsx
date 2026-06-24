import React, { useState } from "react";
import { View, StyleSheet, Text, Switch, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Button } from "../../../src/components/ui/Button";
import { textStyles } from "../../../src/theme/styles";
import { colors, spacing, radii, borders } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";

export default function NotificationsScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [preferences, setPreferences] = useState({
    hydrationReminders: true,
    sleepReminders: true,
    habitReminders: true,
    dailyInsights: true,
  });

  const toggleSwitch = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = async () => {
    await updateProfile({ notificationPreferences: preferences });
    router.push("/(onboarding)/setup/tracking-setup");
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader
          index="04"
          label="NOTIFICATIONS"
          title="Stay on track."
          subtitle="Choose what you'd like to be reminded about."
        />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Hydration</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>Gentle reminders to drink water</Text>
            </View>
            <Switch
              value={preferences.hydrationReminders}
              onValueChange={() => toggleSwitch("hydrationReminders")}
              trackColor={{ false: colors.line, true: colors.accentTerracottaLight }}
              thumbColor={preferences.hydrationReminders ? colors.accentTerracotta : colors.bgPaper}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Sleep</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>Wind-down reminders before bedtime</Text>
            </View>
            <Switch
              value={preferences.sleepReminders}
              onValueChange={() => toggleSwitch("sleepReminders")}
              trackColor={{ false: colors.line, true: colors.accentSlateLight }}
              thumbColor={preferences.sleepReminders ? colors.accentSlate : colors.bgPaper}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Habits</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>Reminders for your custom habits</Text>
            </View>
            <Switch
              value={preferences.habitReminders}
              onValueChange={() => toggleSwitch("habitReminders")}
              trackColor={{ false: colors.line, true: colors.accentMustardLight }}
              thumbColor={preferences.habitReminders ? colors.accentMustard : colors.bgPaper}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Daily Insights</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>A summary of your day</Text>
            </View>
            <Switch
              value={preferences.dailyInsights}
              onValueChange={() => toggleSwitch("dailyInsights")}
              trackColor={{ false: colors.line, true: colors.accentOliveLight }}
              thumbColor={preferences.dailyInsights ? colors.accentOlive : colors.bgPaper}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleNext} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  form: {
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.bgPaperAlt,
    ...borders.hairline,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  desc: {
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
