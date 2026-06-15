import { Stack } from "expo-router";
import { colors } from "../../src/theme/tokens";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.bgPaper }
    }}>
      <Stack.Screen name="sleep-log" options={{ presentation: "modal" }} />
      <Stack.Screen name="nutrition-log" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="assistant"
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen name="daily-goals" options={{ presentation: "modal" }} />
      <Stack.Screen name="linked-devices" options={{ presentation: "modal" }} />
      <Stack.Screen name="help-center" options={{ presentation: "modal" }} />
      <Stack.Screen name="privacy-policy" options={{ presentation: "modal" }} />
    </Stack>
  );
}
