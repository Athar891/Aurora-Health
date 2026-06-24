import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ShieldCheck } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../src/theme/tokens";

const LAST_UPDATED = "June 15, 2025";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "Aurora collects the following information to provide our health and hydration tracking services:\n\n• Account Information: Your name and email address when you create an account.\n• Health Data: Water intake logs, sleep duration, meal logs, and habit completion records that you voluntarily enter.\n• Usage Data: App interactions and feature usage to improve Aurora's functionality.\n• Device Information: Device type and operating system version for technical support purposes.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use the information we collect to:\n\n• Provide and improve Aurora's health tracking features.\n• Personalise your experience based on your goals and preferences.\n• Generate AI-powered insights through our Gemini-powered assistant.\n• Send optional notifications and reminders (only if you enable them).\n• Diagnose technical issues and improve app stability.",
  },
  {
    title: "3. Data Storage & Security",
    body: "Your data is stored securely in Google Firebase Firestore, a cloud database with enterprise-grade security. We implement:\n\n• Firestore Security Rules to ensure only you can access your data.\n• Firebase Authentication to protect your account with industry-standard protocols.\n• HTTPS encryption for all data transmitted between the app and our servers.\n\nWe do not store your health data on our own servers — it lives entirely within your personal Firebase account space.",
  },
  {
    title: "4. Data Sharing",
    body: "Aurora does not sell, rent, or trade your personal information to third parties. We may share information only in the following circumstances:\n\n• Service Providers: With trusted partners (Firebase, Cloudinary) solely to operate the app.\n• Legal Requirements: If required by law, regulation, or a valid legal process.\n• Business Transfers: In the event of a merger or acquisition, with appropriate protections.\n\nWe will never share your health data for advertising purposes.",
  },
  {
    title: "5. AI & Data Processing",
    body: "Aurora uses Google's Gemini AI model to power the Aurora Assistant feature. When you interact with the assistant, your messages may be sent to Google's Gemini API for processing. Please review Google's privacy policy to understand how they handle API data.\n\nWe do not use your health data to train AI models without your explicit consent.",
  },
  {
    title: "6. Your Rights & Controls",
    body: "You have full control over your data:\n\n• Access: View all your stored health data within the app.\n• Deletion: Delete your account and all associated data at any time by contacting us.\n• Correction: Edit any logged data directly within the app.\n• Data Portability: Request an export of your health data by contacting support.\n• Notifications: Opt out of all notifications through your device's notification settings.",
  },
  {
    title: "7. Data Retention",
    body: "We retain your data for as long as your account is active. If you delete your account, we will permanently delete all associated health data within 30 days. Some anonymised, aggregated data may be retained for service improvement purposes, but this cannot be linked back to you.",
  },
  {
    title: "8. Children's Privacy",
    body: "Aurora is not intended for children under the age of 13 (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.",
  },
  {
    title: "9. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the 'Last Updated' date at the top of this page and, where appropriate, through an in-app notification. Continued use of Aurora after changes constitutes acceptance of the updated policy.",
  },
  {
    title: "10. Contact Us",
    body: "If you have questions about this Privacy Policy or your data:\n\nEmail: privacy@aurorahealth.app\n\nWe take privacy seriously and aim to respond to all enquiries within 5 business days.",
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Banner */}
        <View style={styles.banner}>
          <View style={styles.shieldCircle}>
            <ShieldCheck size={36} color={colors.accentOlive} weight="fill" />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Your Privacy Matters</Text>
            <Text style={styles.bannerSubtitle}>Last updated: {LAST_UPDATED}</Text>
          </View>
        </View>

        <Text style={styles.intro}>
          Aurora is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal health information.
        </Text>

        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Aurora, you agree to the terms of this Privacy Policy.
          </Text>
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
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.accentOliveLight,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentOlive + "30",
  },
  shieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.bgPaper,
    alignItems: "center",
    justifyContent: "center",
  },
  bannerText: { flex: 1 },
  bannerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.body,
    color: colors.accentOlive,
  },
  bannerSubtitle: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.caption,
    color: colors.accentOlive,
    marginTop: 2,
    opacity: 0.7,
  },
  intro: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerText: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
    textAlign: "center",
  },
});
