import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Button } from "../../../src/components/ui/Button";
import { textStyles } from "../../../src/theme/styles";
import { colors, spacing, radii, borders } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";

export default function GoalsScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const goals = [
    { id: "improve-hydration", label: "Improve hydration" },
    { id: "sleep-better", label: "Sleep better" },
    { id: "build-habits", label: "Build new habits" },
    { id: "eat-healthier", label: "Eat healthier" },
    { id: "improve-energy", label: "Improve energy levels" },
    { id: "improve-consistency", label: "Improve consistency" },
  ];

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    await updateProfile({ goals: selectedGoals });
    router.push("/(onboarding)/setup/notifications");
  };

  const isFormValid = selectedGoals.length > 0;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader
          index="03"
          label="GOALS"
          title="What are you focusing on?"
          subtitle="Select all that apply."
        />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {goals.map((item) => {
            const isSelected = selectedGoals.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggleGoal(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text style={[textStyles.bodySemiBold, isSelected && styles.optionTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

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
    paddingBottom: spacing.xxl,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.bgPaperAlt,
    ...borders.hairline,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.accentMustardLight,
    borderColor: colors.accentMustard,
  },
  optionTextSelected: {
    color: colors.accentMustard,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
