import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { spacing } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const handleNext = async () => {
    await updateProfile({
      name,
      age: parseInt(age, 10) || undefined,
      height: parseInt(height, 10) || undefined,
      weight: parseInt(weight, 10) || undefined,
    });
    router.push("/(onboarding)/setup/lifestyle");
  };

  const isFormValid = name.length > 0 && age.length > 0;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader
          index="01"
          label="ABOUT YOU"
          title="Let's get to know you."
          subtitle="Aurora uses this to personalize your insights."
        />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Input
          label="What should we call you?"
          placeholder="First name"
          value={name}
          onChangeText={setName}
        />
        
        <Input
          label="Age"
          placeholder="Years"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />

        <View style={styles.row}>
          <Input
            label="Height"
            placeholder="cm"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
            containerStyle={styles.halfInput}
          />
          <Input
            label="Weight"
            placeholder="kg"
            value={weight}
            onChangeText={setWeight}
            keyboardType="number-pad"
            containerStyle={styles.halfInput}
          />
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
