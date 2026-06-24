import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle,
  Drop,
  Moon,
  ForkKnife,
  Barbell,
  Fire,
} from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../src/theme/tokens";
import { textStyles } from "../../src/theme/styles";
import { useAuthStore } from "../../src/stores/authStore";
import { getUserDoc, setUserDoc } from "../../src/services/firestoreService";
import { UserPreferences } from "../../src/types/models";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; description: string }[] = [
  { key: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { key: "light", label: "Light", description: "1–3 days/week" },
  { key: "moderate", label: "Moderate", description: "3–5 days/week" },
  { key: "active", label: "Active", description: "6–7 days/week" },
];

export default function DailyGoalsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [hydrationGoal, setHydrationGoal] = useState("2000");
  const [sleepGoal, setSleepGoal] = useState("8");
  const [calorieGoal, setCalorieGoal] = useState("2000");
  const [proteinGoal, setProteinGoal] = useState("120");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    setIsLoading(true);
    try {
      const prefs = await getUserDoc<UserPreferences & Record<string, any>>("preferences");
      if (prefs) {
        if (prefs.hydrationGoalMl) setHydrationGoal(String(prefs.hydrationGoalMl));
        if (prefs.sleepGoalHours) setSleepGoal(String(prefs.sleepGoalHours));
        if (prefs.calorieGoal) setCalorieGoal(String(prefs.calorieGoal));
        if (prefs.proteinGoal) setProteinGoal(String(prefs.proteinGoal));
        if (prefs.activityLevel) setActivityLevel(prefs.activityLevel as ActivityLevel);
      }
    } catch (e) {
      // First time — defaults are fine
    } finally {
      setIsLoading(false);
    }
  }

  const safeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  async function handleSave() {
    const hydration = parseInt(hydrationGoal) || 2000;
    const sleep = parseFloat(sleepGoal) || 8;
    const calories = parseInt(calorieGoal) || 2000;
    const protein = parseInt(proteinGoal) || 120;

    if (hydration < 500 || hydration > 10000) {
      Alert.alert("Invalid Goal", "Hydration goal must be between 500 ml and 10,000 ml.");
      return;
    }
    if (sleep < 1 || sleep > 24) {
      Alert.alert("Invalid Goal", "Sleep goal must be between 1 and 24 hours.");
      return;
    }

    setIsSaving(true);
    try {
      await setUserDoc("preferences", {
        hydrationGoalMl: hydration,
        sleepGoalHours: sleep,
        calorieGoal: calories,
        proteinGoal: protein,
        activityLevel,
      });
      if (Platform.OS === "web") {
        window.alert("Your daily goals have been updated.");
        safeBack();
      } else {
        Alert.alert("Saved!", "Your daily goals have been updated.", [
          { text: "Done", onPress: safeBack },
        ]);
      }
    } catch (e) {
      Alert.alert("Error", "Could not save your goals. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={safeBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Goals</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.accentTerracotta} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={colors.accentTerracotta} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.subtitle}>
            Set your personal daily targets. Aurora uses these to personalize your experience and track your progress.
          </Text>

          {/* Hydration */}
          <GoalCard
            icon={<Drop size={22} color={colors.accentSlate} weight="fill" />}
            label="Hydration"
            unit="ml / day"
            value={hydrationGoal}
            onChangeText={setHydrationGoal}
            keyboardType="numeric"
            hint="Recommended: 2,000–3,000 ml"
          />

          {/* Sleep */}
          <GoalCard
            icon={<Moon size={22} color={colors.accentSlate} weight="fill" />}
            label="Sleep"
            unit="hours / night"
            value={sleepGoal}
            onChangeText={setSleepGoal}
            keyboardType="numeric"
            hint="Recommended: 7–9 hours"
          />

          {/* Calories */}
          <GoalCard
            icon={<Fire size={22} color={colors.accentTerracotta} weight="fill" />}
            label="Daily Calories"
            unit="kcal / day"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="numeric"
            hint="Based on your activity level"
          />

          {/* Protein */}
          <GoalCard
            icon={<Barbell size={22} color={colors.accentOlive} weight="fill" />}
            label="Protein"
            unit="g / day"
            value={proteinGoal}
            onChangeText={setProteinGoal}
            keyboardType="numeric"
            hint="Recommended: 0.8–1.6g per kg of body weight"
          />

          {/* Activity Level */}
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>ACTIVITY LEVEL</Text>
          </View>
          <View style={styles.activityCard}>
            {ACTIVITY_LEVELS.map((level, index) => (
              <React.Fragment key={level.key}>
                <TouchableOpacity
                  style={styles.activityRow}
                  onPress={() => setActivityLevel(level.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityLabel}>{level.label}</Text>
                    <Text style={styles.activityDescription}>{level.description}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      activityLevel === level.key && styles.radioOuterSelected,
                    ]}
                  >
                    {activityLevel === level.key && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
                {index < ACTIVITY_LEVELS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

// ─── GoalCard Component ───

function GoalCard({
  icon,
  label,
  unit,
  value,
  onChangeText,
  keyboardType,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType: "numeric" | "default";
  hint?: string;
}) {
  return (
    <View>
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>{label.toUpperCase()}</Text>
      </View>
      <View style={styles.goalCard}>
        <View style={styles.goalIconContainer}>{icon}</View>
        <View style={styles.goalInputContainer}>
          <TextInput
            style={styles.goalInput}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            selectTextOnFocus
            placeholderTextColor={colors.inkSoft}
          />
          <Text style={styles.goalUnit}>{unit}</Text>
        </View>
        {hint && <Text style={styles.goalHint}>{hint}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bgPaper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.bgPaper,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  saveButton: { padding: spacing.xs },
  saveText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.accentTerracotta,
  },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionLabelText: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
  },
  goalCard: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.bgPaper,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  goalInput: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h2,
    color: colors.ink,
    minWidth: 80,
  },
  goalUnit: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
  },
  goalHint: {
    width: "100%",
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  activityCard: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    justifyContent: "space-between",
  },
  activityInfo: { flex: 1 },
  activityLabel: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  activityDescription: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: colors.accentTerracotta,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentTerracotta,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: spacing.md,
  },
});
