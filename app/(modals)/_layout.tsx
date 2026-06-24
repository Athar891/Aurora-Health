import { Stack } from "expo-router";
import { colors } from "../../src/theme/tokens";

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.bgPaper }
    }}>
      <Stack.Screen 
        name="sleep-log" 
        options={{ 
          presentation: "transparentModal", 
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" } 
        }} 
      />
      <Stack.Screen name="nutrition-log" options={{ presentation: "modal" }} />
      <Stack.Screen name="chat-history" options={{ presentation: "modal" }} />
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          presentation: "transparentModal", 
          animation: "fade",
          contentStyle: { backgroundColor: "transparent" } 
        }} 
      />
      <Stack.Screen name="daily-goals" options={{ presentation: "modal" }} />
      <Stack.Screen name="linked-devices" options={{ presentation: "modal" }} />
      <Stack.Screen name="help-center" options={{ presentation: "modal" }} />
      <Stack.Screen name="privacy-policy" options={{ presentation: "modal" }} />
    </Stack>
  );
}
