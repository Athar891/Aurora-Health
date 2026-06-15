import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Button } from "../../src/components/ui/Button";
import { TimePicker } from "../../src/components/ui/TimePicker";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { textStyles } from "../../src/theme/styles";
import { Clock } from "phosphor-react-native";
import { useSleepStore } from "../../src/stores/sleepStore";

function formatTime(hours: number, minutes: number): string {
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${String(minutes).padStart(2, "0")} ${ampm}`;
}

export default function SleepLogModal() {
  const router = useRouter();

  const [bedtime, setBedtime] = useState({ hours: 23, minutes: 0 });
  const [wakeUp, setWakeUp] = useState({ hours: 7, minutes: 0 });
  const [activePicker, setActivePicker] = useState<"bedtime" | "wakeup" | null>(null);

  // Calculate duration
  const getDuration = (): string => {
    let bedMinutes = bedtime.hours * 60 + bedtime.minutes;
    let wakeMinutes = wakeUp.hours * 60 + wakeUp.minutes;
    let diff = wakeMinutes - bedMinutes;
    if (diff < 0) diff += 24 * 60; // handle overnight
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  const { addLog } = useSleepStore();

  const handleSave = async () => {
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

      router.back();
    } catch (err) {
      console.error("Failed to save sleep log:", err);
      Alert.alert("Error", "Could not save sleep log. Please try again.");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader
          title="Log Sleep"
          subtitle="How did you sleep last night?"
        />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Bedtime */}
        <Text style={[textStyles.caption, styles.label]}>BEDTIME</Text>
        <TouchableOpacity
          style={[styles.timeButton, activePicker === "bedtime" && styles.timeButtonActive]}
          onPress={() => setActivePicker(activePicker === "bedtime" ? null : "bedtime")}
          activeOpacity={0.7}
        >
          <Clock color={activePicker === "bedtime" ? colors.accentTerracotta : colors.inkSoft} size={20} />
          <Text style={[textStyles.bodySemiBold, styles.timeText]}>
            {formatTime(bedtime.hours, bedtime.minutes)}
          </Text>
        </TouchableOpacity>

        {activePicker === "bedtime" && (
          <View style={styles.pickerWrapper}>
            <TimePicker value={bedtime} onChange={setBedtime} />
          </View>
        )}

        {/* Wake-up */}
        <Text style={[textStyles.caption, styles.label]}>WAKE-UP TIME</Text>
        <TouchableOpacity
          style={[styles.timeButton, activePicker === "wakeup" && styles.timeButtonActive]}
          onPress={() => setActivePicker(activePicker === "wakeup" ? null : "wakeup")}
          activeOpacity={0.7}
        >
          <Clock color={activePicker === "wakeup" ? colors.accentOlive : colors.inkSoft} size={20} />
          <Text style={[textStyles.bodySemiBold, styles.timeText]}>
            {formatTime(wakeUp.hours, wakeUp.minutes)}
          </Text>
        </TouchableOpacity>

        {activePicker === "wakeup" && (
          <View style={styles.pickerWrapper}>
            <TimePicker value={wakeUp} onChange={setWakeUp} />
          </View>
        )}

        {/* Duration Summary */}
        <View style={styles.durationCard}>
          <Text style={[textStyles.caption, { color: colors.inkSoft, letterSpacing: 1 }]}>SLEEP DURATION</Text>
          <Text style={[textStyles.h2, { color: colors.accentOlive }]}>{getDuration()}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => router.back()}
          style={styles.cancelButton}
        />
        <Button
          title="Save Log"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  form: {
    flex: 1,
  },
  label: {
    color: colors.inkSoft,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
    letterSpacing: 1,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.bgPaperAlt,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  timeButtonActive: {
    borderColor: colors.accentTerracotta,
  },
  timeText: {
    color: colors.ink,
  },
  pickerWrapper: {
    marginTop: spacing.sm,
  },
  durationCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.accentOliveLight,
    borderRadius: radii.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 2,
  },
});
