import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { TimePicker } from "../../src/components/ui/TimePicker";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../src/theme/tokens";
import { textStyles } from "../../src/theme/styles";
import { Clock, Moon, Sun, Check, ArrowLeft, Star, Bed, Alarm } from "phosphor-react-native";
import { useSleepStore } from "../../src/stores/sleepStore";
import Svg, { Circle as SvgCircle } from "react-native-svg";

function formatTime(hours: number, minutes: number): string {
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

/**
 * Circular arc visualization for sleep duration.
 * Shows a donut ring that fills proportionally toward 8h goal.
 */
function SleepDurationArc({ hours, minutes, size = 110 }: { hours: number; minutes: number; size?: number }) {
  const totalMinutes = hours * 60 + minutes;
  const goalMinutes = 8 * 60; // 8h target
  const progress = Math.min(totalMinutes / goalMinutes, 1);
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Color based on duration quality
  const getArcColor = () => {
    if (totalMinutes >= 7 * 60) return colors.accentOlive;     // 7h+ = great
    if (totalMinutes >= 5 * 60) return colors.accentMustard;   // 5-7h = okay
    return colors.accentTerracotta;                              // <5h = low
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {/* Track */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.line}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getArcColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center content */}
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Moon color={colors.accentMustard} size={20} weight="fill" />
        <Text style={{
          fontFamily: typography.display.semiBold,
          fontSize: fontSizes.h3,
          color: colors.ink,
          marginTop: 2,
        }}>
          {hours}h {minutes}m
        </Text>
        <Text style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: fontSizes.captionSmall,
          color: colors.inkSoft,
          letterSpacing: 0.5,
        }}>
          OF 8H GOAL
        </Text>
      </View>
    </View>
  );
}

/** Sleep quality rating (1–5 stars) */
function QualityRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={ratingStyles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          activeOpacity={0.7}
          style={ratingStyles.starBtn}
        >
          <Star
            size={28}
            weight={star <= value ? "fill" : "regular"}
            color={star <= value ? colors.accentMustard : colors.line}
          />
        </TouchableOpacity>
      ))}
      <Text style={ratingStyles.label}>
        {value === 0 ? "Tap to rate" :
         value <= 2 ? "Poor" :
         value === 3 ? "Fair" :
         value === 4 ? "Good" : "Excellent"}
      </Text>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  starBtn: {
    padding: 2,
  },
  label: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 0.5,
    marginLeft: spacing.sm,
    textTransform: "uppercase",
  },
});

export default function SleepLogModal() {
  const router = useRouter();

  const [bedtime, setBedtime] = useState({ hours: 23, minutes: 0 });
  const [wakeUp, setWakeUp] = useState({ hours: 7, minutes: 0 });
  const [activePicker, setActivePicker] = useState<"bedtime" | "wakeup" | null>(null);
  const [quality, setQuality] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/index");
    }
  };

  // Calculate duration
  const duration = useMemo(() => {
    let bedMinutes = bedtime.hours * 60 + bedtime.minutes;
    let wakeMinutes = wakeUp.hours * 60 + wakeUp.minutes;
    let diff = wakeMinutes - bedMinutes;
    if (diff < 0) diff += 24 * 60; // handle overnight
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return { hours, mins, totalMinutes: diff };
  }, [bedtime, wakeUp]);

  const { addLog } = useSleepStore();

  const handleSave = async () => {
    setSaving(true);
    try {
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];

      // Build sleepStart: use yesterday if bedtime > wakeUp (overnight)
      const sleepStart = new Date();
      sleepStart.setHours(bedtime.hours, bedtime.minutes, 0, 0);

      const sleepEnd = new Date();
      sleepEnd.setHours(wakeUp.hours, wakeUp.minutes, 0, 0);

      // If bedtime is after wakeUp, bedtime was yesterday
      if (sleepStart >= sleepEnd) {
        sleepStart.setDate(sleepStart.getDate() - 1);
      }

      let diffMin = (sleepEnd.getTime() - sleepStart.getTime()) / 60000;
      const durationHours = parseFloat((diffMin / 60).toFixed(2));

      await addLog({
        durationHours,
        sleepStart,
        sleepEnd,
        date: dateStr,
        source: "manual",
      });

      handleClose();
    } catch (err) {
      console.error("Failed to save sleep log:", err);
      Alert.alert("Error", "Could not save sleep log. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Derive quality insight text
  const getQualityInsight = () => {
    if (duration.totalMinutes >= 7 * 60 && quality >= 4) return "Great night! Keep it up 🌿";
    if (duration.totalMinutes >= 7 * 60) return "Good duration — how did it feel?";
    if (duration.totalMinutes >= 5 * 60) return "A bit short — aim for 7-8 hours.";
    if (duration.totalMinutes > 0) return "Rest more tonight — your body needs it.";
    return "";
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
      <KeyboardAvoidingView
        style={styles.sheetContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Log Sleep</Text>
            <Text style={styles.headerSubtitle}>How did you sleep last night?</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {/* Duration Arc Visualization */}
          <View style={styles.durationSection}>
            <SleepDurationArc hours={duration.hours} minutes={duration.mins} />
            {getQualityInsight() ? (
              <Text style={styles.qualityInsight}>{getQualityInsight()}</Text>
            ) : null}
          </View>

          {/* Time range summary */}
          <View style={styles.timeSummaryRow}>
            <View style={styles.timeSummaryItem}>
              <Bed color={colors.accentSlate} size={18} weight="fill" />
              <Text style={styles.timeSummaryLabel}>BEDTIME</Text>
              <Text style={styles.timeSummaryValue}>{formatTime(bedtime.hours, bedtime.minutes)}</Text>
            </View>
            <View style={styles.timeSummaryDivider} />
            <View style={styles.timeSummaryItem}>
              <Alarm color={colors.accentMustard} size={18} weight="fill" />
              <Text style={styles.timeSummaryLabel}>WAKE UP</Text>
              <Text style={styles.timeSummaryValue}>{formatTime(wakeUp.hours, wakeUp.minutes)}</Text>
            </View>
          </View>

          {/* Bedtime Picker */}
          <TouchableOpacity
            style={[styles.timeButton, activePicker === "bedtime" && styles.timeButtonActive]}
            onPress={() => setActivePicker(activePicker === "bedtime" ? null : "bedtime")}
            activeOpacity={0.7}
          >
            <View style={styles.timeButtonLeft}>
              <View style={[styles.timeIconCircle, { backgroundColor: `${colors.accentSlate}18` }]}>
                <Moon color={colors.accentSlate} size={18} weight="fill" />
              </View>
              <View>
                <Text style={styles.timeButtonLabel}>Bedtime</Text>
                <Text style={styles.timeButtonValue}>
                  {formatTime(bedtime.hours, bedtime.minutes)}
                </Text>
              </View>
            </View>
            <Text style={[styles.timeButtonChevron, activePicker === "bedtime" && { transform: [{ rotate: "180deg" }] }]}>▾</Text>
          </TouchableOpacity>

          {activePicker === "bedtime" && (
            <View style={styles.pickerWrapper}>
              <TimePicker value={bedtime} onChange={setBedtime} />
            </View>
          )}

          {/* Wake-up Picker */}
          <TouchableOpacity
            style={[styles.timeButton, activePicker === "wakeup" && styles.timeButtonActive]}
            onPress={() => setActivePicker(activePicker === "wakeup" ? null : "wakeup")}
            activeOpacity={0.7}
          >
            <View style={styles.timeButtonLeft}>
              <View style={[styles.timeIconCircle, { backgroundColor: `${colors.accentMustard}18` }]}>
                <Sun color={colors.accentMustard} size={18} weight="fill" />
              </View>
              <View>
                <Text style={styles.timeButtonLabel}>Wake-up time</Text>
                <Text style={styles.timeButtonValue}>
                  {formatTime(wakeUp.hours, wakeUp.minutes)}
                </Text>
              </View>
            </View>
            <Text style={[styles.timeButtonChevron, activePicker === "wakeup" && { transform: [{ rotate: "180deg" }] }]}>▾</Text>
          </TouchableOpacity>

          {activePicker === "wakeup" && (
            <View style={styles.pickerWrapper}>
              <TimePicker value={wakeUp} onChange={setWakeUp} />
            </View>
          )}

          {/* Quality Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SLEEP QUALITY</Text>
            <View style={styles.qualityCard}>
              <QualityRating value={quality} onChange={setQuality} />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOTES (OPTIONAL)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Had vivid dreams, woke up once..."
              placeholderTextColor={`${colors.inkSoft}80`}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Check size={18} color={colors.ink} weight="bold" />
            <Text style={styles.saveText}>Save Log</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: { width: 40 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  headerSubtitle: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  scroll: { flexGrow: 0 },
  form: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  /* Duration Arc Section */
  durationSection: {
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  qualityInsight: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: "#8B7D6B",
    fontStyle: "italic",
    marginTop: spacing.sm,
    textAlign: "center",
  },

  /* Time Summary Row */
  timeSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  timeSummaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  timeSummaryLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 0.8,
  },
  timeSummaryValue: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  timeSummaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.line,
    marginHorizontal: spacing.sm,
  },

  /* Time Buttons */
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgPaperAlt,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  timeButtonActive: {
    borderColor: colors.accentMustard,
    backgroundColor: `${colors.accentMustard}08`,
  },
  timeButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  timeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  timeButtonLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  timeButtonValue: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
    marginTop: 1,
  },
  timeButtonChevron: {
    fontFamily: typography.body.fontFamily,
    fontSize: 18,
    color: colors.inkSoft,
  },
  pickerWrapper: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },

  /* Sections */
  section: {
    marginTop: spacing.md,
  },
  sectionLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  qualityCard: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  notesInput: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.md,
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
    minHeight: 80,
    lineHeight: 22,
  },

  /* Footer */
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.bgPaper,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cancelText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.inkSoft,
  },
  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.accentMustard,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
});
