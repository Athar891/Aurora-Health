import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { textStyles } from "../../../src/theme/styles";
import { colors, spacing, radii, borders } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";

export default function LifestyleScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [wakeUp, setWakeUp] = useState("07:00");
  const [bedtime, setBedtime] = useState("23:00");
  const [activity, setActivity] = useState<string | null>(null);

  const activities = [
    { id: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
    { id: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
    { id: "moderate", label: "Moderate", desc: "Exercise 3-5 days/week" },
    { id: "active", label: "Active", desc: "Hard exercise 6-7 days/week" },
  ];

  const handleNext = async () => {
    await updateProfile({
      wakeUpTime: wakeUp,
      bedtime,
      activityLevel: activity,
    });
    router.push("/(onboarding)/setup/goals");
  };

  const isFormValid = activity !== null;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader
          index="02"
          label="LIFESTYLE"
          title="Your daily rhythm."
          subtitle="Help us understand your typical schedule."
        />
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <Input
            label="Wake-up Time"
            placeholder="07:00"
            value={wakeUp}
            onChangeText={setWakeUp}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Bedtime"
            placeholder="23:00"
            value={bedtime}
            onChangeText={setBedtime}
            containerStyle={styles.halfInput}
          />
        </View>

        <Text style={[textStyles.bodyMedium, styles.activityLabel]}>Activity Level</Text>
        <View style={styles.activityOptions}>
          {activities.map((item) => {
            const isSelected = activity === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setActivity(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text style={[textStyles.bodySemiBold, isSelected && styles.optionTextSelected]}>
                  {item.label}
                </Text>
                <Text style={[textStyles.caption, isSelected && styles.optionTextSelected]}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={!isFormValid}
        />
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
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  activityLabel: {
    fontSize: textStyles.bodySmall.fontSize,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  activityOptions: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.bgPaperAlt,
    ...borders.hairline,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.accentOliveLight,
    borderColor: colors.accentOlive,
  },
  optionTextSelected: {
    color: colors.accentOlive,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
