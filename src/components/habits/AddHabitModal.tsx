import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { X } from "phosphor-react-native";
import { colors, spacing, radii } from "../../theme/tokens";
import { textStyles } from "../../theme/styles";
import { HabitFrequency } from "../../types/models";

interface AddHabitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: { title: string; description: string; frequency: HabitFrequency }) => void;
}

const FREQUENCIES: { label: string; value: HabitFrequency }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekdays", value: "weekdays" },
  { label: "Weekends", value: "weekends" },
];

export function AddHabitModal({ visible, onClose, onAdd }: AddHabitModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim(), frequency });
    setTitle("");
    setDescription("");
    setFrequency("daily");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={textStyles.h3}>New Habit</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X color={colors.inkSoft} size={22} />
            </TouchableOpacity>
          </View>

          {/* Title Field */}
          <Text style={[textStyles.caption, styles.label]}>HABIT NAME *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Morning Meditation"
            placeholderTextColor={colors.inkSoft}
            value={title}
            onChangeText={setTitle}
            autoFocus
            maxLength={60}
          />

          {/* Description Field */}
          <Text style={[textStyles.caption, styles.label]}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="What does this habit involve?"
            placeholderTextColor={colors.inkSoft}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />

          {/* Frequency Picker */}
          <Text style={[textStyles.caption, styles.label]}>FREQUENCY</Text>
          <View style={styles.frequencyRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.frequencyChip,
                  frequency === f.value && styles.frequencyChipActive,
                ]}
                onPress={() => setFrequency(f.value)}
              >
                <Text
                  style={[
                    textStyles.bodySmall,
                    frequency === f.value
                      ? styles.frequencyTextActive
                      : styles.frequencyTextInactive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !title.trim() && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!title.trim()}
            activeOpacity={0.8}
          >
            <Text style={[textStyles.bodySemiBold, styles.submitText]}>Add Habit</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
    color: colors.inkSoft,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    fontFamily: textStyles.bodyMedium.fontFamily,
    fontSize: textStyles.bodyMedium.fontSize,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  frequencyRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  frequencyChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPaperAlt,
    borderWidth: 1,
    borderColor: colors.line,
  },
  frequencyChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  frequencyTextActive: {
    color: colors.bgPaper,
  },
  frequencyTextInactive: {
    color: colors.inkSoft,
  },
  submitButton: {
    backgroundColor: colors.ink,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: colors.bgPaper,
  },
});
