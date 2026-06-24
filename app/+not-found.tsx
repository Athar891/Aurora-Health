import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { textStyles, layoutStyles } from "../src/theme/styles";
import { ScreenWrapper } from "../src/components/ui/ScreenWrapper";
import { spacing } from "../src/theme/tokens";

export default function NotFoundScreen() {
  return (
    <ScreenWrapper>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={textStyles.h2}>This screen doesn't exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  linkText: {
    ...textStyles.bodyLarge,
    color: textStyles.h2.color,
    textDecorationLine: "underline",
  },
});
