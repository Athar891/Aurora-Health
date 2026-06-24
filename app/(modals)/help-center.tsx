import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, CaretDown, CaretUp, Question, Envelope } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../src/theme/tokens";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const FAQ_ITEMS = [
  {
    q: "How do I log my water intake?",
    a: "You can log water directly from the Home screen using the quick-add buttons (+250ml, +500ml), or tap the Hydration card to access the full log. You can also tell Aurora AI — just say 'I drank 2 glasses of water'.",
  },
  {
    q: "How does the Aurora AI Assistant work?",
    a: "Aurora AI is powered by Gemini and understands natural language. You can log meals, water, sleep, and habits just by typing or speaking. Try: 'Log 8 hours of sleep' or 'I had a chicken salad for lunch'.",
  },
  {
    q: "Can I edit or delete a logged entry?",
    a: "Yes. Navigate to the relevant section (e.g. Nourish for meals, Sleep tab for sleep logs), find the entry, and use the edit or delete option. Support for inline editing is being expanded continuously.",
  },
  {
    q: "How are my daily goals calculated?",
    a: "Your goals are set by you in Settings → Daily Goals. Aurora uses your activity level, hydration goal, sleep goal, and calorie targets to track your progress throughout the day.",
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. All your health data is stored securely in Firebase Firestore under your personal user account. Only you can access your data. We do not sell or share your information with third parties.",
  },
  {
    q: "How do I change my profile photo?",
    a: "Tap your profile picture (or the initials circle) at the top of the Settings & Profile screen. Your camera roll will open and you can choose a new photo.",
  },
  {
    q: "What is the streak feature?",
    a: "Streaks track how many consecutive days you've met your goals for hydration, sleep, nutrition, and habits. Maintaining streaks helps build healthy long-term consistency.",
  },
  {
    q: "Why isn't the microphone working?",
    a: "The voice feature in Aurora AI requires a native app build (not Expo Go). If you're running the app via Expo Go, you'll need to wait for a production or development build that includes the audio module.",
  },
  {
    q: "How do I sign out?",
    a: "Scroll to the bottom of the Settings & Profile screen and tap 'Sign Out'. You'll be asked to confirm before being signed out.",
  },
  {
    q: "How do I change my password?",
    a: "For accounts created with email/password, password changes are handled via Firebase. Tap 'Forgot Password' on the login screen to receive a password reset email.",
  },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggleItem(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.questionIconCircle}>
            <Question size={32} color={colors.accentSlate} weight="bold" />
          </View>
          <View style={styles.topTextContainer}>
            <Text style={styles.topTitle}>How can we help?</Text>
            <Text style={styles.topSubtitle}>Browse answers to common questions below.</Text>
          </View>
        </View>

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>FREQUENTLY ASKED QUESTIONS</Text>
        </View>

        <View style={styles.faqCard}>
          {FAQ_ITEMS.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => toggleItem(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.faqQuestion}>{item.q}</Text>
                {openIndex === index ? (
                  <CaretUp size={18} color={colors.accentTerracotta} />
                ) : (
                  <CaretDown size={18} color={colors.inkSoft} />
                )}
              </TouchableOpacity>
              {openIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.a}</Text>
                </View>
              )}
              {index < FAQ_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Contact */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>STILL NEED HELP?</Text>
        </View>
        <View style={styles.contactCard}>
          <Envelope size={22} color={colors.accentSlate} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email Support</Text>
            <Text style={styles.contactDetail}>support@aurorahealth.app</Text>
            <Text style={styles.contactNote}>We typically respond within 24 hours.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPaper },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  headerSpacer: { width: 32 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  questionIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accentSlateLight,
    alignItems: "center",
    justifyContent: "center",
  },
  topTextContainer: { flex: 1 },
  topTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  topSubtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    marginTop: 2,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionLabelText: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
  },
  faqCard: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    gap: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.ink,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  faqAnswerText: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginHorizontal: spacing.md,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  contactInfo: { flex: 1 },
  contactTitle: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  contactDetail: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.accentSlate,
    marginTop: 2,
  },
  contactNote: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
    marginTop: 4,
  },
});
