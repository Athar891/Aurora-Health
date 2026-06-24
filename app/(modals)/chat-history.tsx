import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft, ClockCounterClockwise } from "phosphor-react-native";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { textStyles } from "../../src/theme/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChatHistoryModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <CaretLeft color={colors.ink} size={24} weight="bold" />
        </TouchableOpacity>
        <Text style={textStyles.h3}>Chat History</Text>
        <View style={styles.rightPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.emptyState}>
          <ClockCounterClockwise color={colors.inkSoft} size={48} weight="regular" />
          <Text style={[textStyles.h4, { marginTop: spacing.md, color: colors.ink }]}>
            No History Yet
          </Text>
          <Text style={[textStyles.body, { textAlign: "center", color: colors.inkSoft, marginTop: spacing.xs }]}>
            Your past conversations with Aurora will appear here.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPaper,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    padding: spacing.xs,
    width: 40,
  },
  rightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
});
