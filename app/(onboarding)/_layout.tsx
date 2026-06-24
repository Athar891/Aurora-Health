import { Stack } from "expo-router";
import { colors } from "../../src/theme/tokens";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bgPaper } }}>
      <Stack.Screen name="landing" />
      <Stack.Screen name="slides" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="setup/personal-info" />
      <Stack.Screen name="setup/lifestyle" />
      <Stack.Screen name="setup/goals" />
      <Stack.Screen name="setup/notifications" />
      <Stack.Screen name="setup/tracking-setup" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
