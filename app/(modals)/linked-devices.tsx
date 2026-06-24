import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, DeviceMobile, Clock, ArrowsClockwise } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../src/theme/tokens";

export default function LinkedDevicesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Devices</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.iconCircle}>
            <DeviceMobile size={52} color={colors.accentSlate} weight="thin" />
          </View>
          <View style={[styles.iconBadge, styles.iconBadge1]}>
            <Clock size={20} color={colors.accentMustard} weight="fill" />
          </View>
          <View style={[styles.iconBadge, styles.iconBadge2]}>
            <ArrowsClockwise size={20} color={colors.accentOlive} weight="fill" />
          </View>
        </View>

        <Text style={styles.headline}>Coming Soon</Text>
        <Text style={styles.subtext}>
          Device sync is on our roadmap. Soon you'll be able to connect Aurora to your favourite health platforms for a seamless experience.
        </Text>

        {/* Planned integrations */}
        <View style={styles.sectionLabel}>
          <Text style={styles.sectionLabelText}>PLANNED INTEGRATIONS</Text>
        </View>

        {[
          { name: "Apple Health", detail: "Steps, heart rate, workouts & sleep" },
          { name: "Google Fit", detail: "Activity tracking & health metrics" },
          { name: "Fitbit", detail: "Sleep stages, heart rate & activity" },
          { name: "Garmin Connect", detail: "Advanced fitness & GPS tracking" },
          { name: "Oura Ring", detail: "Sleep quality & recovery scores" },
        ].map((item, index, arr) => (
          <React.Fragment key={item.name}>
            <View style={styles.integrationRow}>
              <View style={styles.integrationDot} />
              <View style={styles.integrationInfo}>
                <Text style={styles.integrationName}>{item.name}</Text>
                <Text style={styles.integrationDetail}>{item.detail}</Text>
              </View>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Soon</Text>
              </View>
            </View>
            {index < arr.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
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
    alignItems: "center",
  },
  illustrationContainer: {
    width: 120,
    height: 120,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.bgPaperAlt,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBadge: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgPaper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBadge1: { top: 0, right: 0 },
  iconBadge2: { bottom: 4, left: 0 },
  headline: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h2,
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtext: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  sectionLabel: {
    alignSelf: "stretch",
    marginBottom: spacing.sm,
  },
  sectionLabelText: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
  },
  integrationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignSelf: "stretch",
    backgroundColor: colors.bgPaperAlt,
    gap: spacing.sm,
  },
  integrationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  integrationInfo: { flex: 1 },
  integrationName: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  integrationDetail: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
    marginTop: 2,
  },
  comingSoonBadge: {
    backgroundColor: colors.accentMustardLight,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  comingSoonText: {
    fontFamily: "IBMPlexMono_400Regular",
    fontSize: fontSizes.captionSmall,
    color: colors.accentMustard,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    alignSelf: "stretch",
    marginHorizontal: spacing.md,
  },
});
