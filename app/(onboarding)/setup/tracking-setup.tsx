import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { spacing } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";

export default function TrackingSetupScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [waterGoal, setWaterGoal] = useState("2000");
  const [sleepGoal, setSleepGoal] = useState("8");

  const handleNext = async () => {
    // Save goals, but wait for complete screen to mark onboarding complete
    await updateProfile({
      waterGoal: parseInt(waterGoal, 10) || 2000,
      sleepGoal: parseInt(sleepGoal, 10) || 8,
    });
    router.push("/(onboarding)/complete");
  };

  const isFormValid = waterGoal.length > 0 && sleepGoal.length > 0;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader
          index="05"
          label="TARGETS"
          title="Set your baselines."
          subtitle="You can always adjust these later."
        />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Input
          label="Daily Hydration Goal"
          placeholder="e.g. 2000"
          value={waterGoal}
          onChangeText={setWaterGoal}
          keyboardType="number-pad"
        />
        
        <Input
          label="Daily Sleep Goal"
          placeholder="e.g. 8"
          value={sleepGoal}
          onChangeText={setSleepGoal}
          keyboardType="number-pad"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Finish Setup"
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
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
