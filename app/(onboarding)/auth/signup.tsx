import React, { useState } from "react";
import { View, StyleSheet, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { Divider } from "../../../src/components/ui/Divider";
import { spacing } from "../../../src/theme/tokens";
import { textStyles } from "../../../src/theme/styles";
import { useAuthStore } from "../../../src/stores/authStore";

import { Platform } from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "615319703339-jb2bqnudam5eoh8u7f9r2s9vp1qfj0i9.apps.googleusercontent.com",
  iosClientId: "615319703339-kpbhmocpolketobkuf0nmvk3dpmle623.apps.googleusercontent.com",
});

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithApple, isLoading, error } =
    useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Please fill out all fields.");
      return;
    }
    try {
      await signUp(email, password, name);
      // Let the _layout auth listener redirect to profile
    } catch {
      // Handled by store
    }
  };

  const handleGoogleSignUp = async () => {
    if (Platform.OS === "web") {
      try {
        await signInWithGoogle();
      } catch (err) {
        console.error(err);
      }
    } else {
      try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const idToken = userInfo.data?.idToken || (userInfo as any).idToken;
        if (idToken) {
          await signInWithGoogle(idToken);
        }
      } catch (err: any) {
        console.error("Native Google sign-in error:", err);
      }
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch {
      // Error is set in the store
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Back"
          variant="ghost"
          size="small"
          onPress={() => router.back()}
          style={styles.backButton}
        />
        <SectionHeader
          title="Create your account."
          subtitle="Let's begin your journey."
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[textStyles.bodySmall, styles.errorText]}>{error}</Text>
        </View>
      )}

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Create Account"
          onPress={handleSignup}
          loading={isLoading}
          style={styles.submitButton}
        />
      </View>

      <View style={styles.social}>
        <View style={styles.dividerContainer}>
          <Divider style={styles.dividerLine} />
          <Text style={[textStyles.caption, styles.dividerText]}>or continue with</Text>
          <Divider style={styles.dividerLine} />
        </View>

        <View style={styles.socialButtons}>
          <Button
            title="Google"
            variant="secondary"
            onPress={handleGoogleSignUp}
            style={styles.socialButton}
          />
          <Button
            title="Apple"
            variant="secondary"
            onPress={handleAppleSignIn}
            style={styles.socialButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  backButton: {
    alignSelf: "flex-start",
    marginLeft: -spacing.md,
    marginBottom: spacing.md,
  },
  errorContainer: {
    backgroundColor: "#FFF0F0",
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: "#CC3333",
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  social: {
    marginTop: spacing.lg,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
  },
  socialButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
  },
});
