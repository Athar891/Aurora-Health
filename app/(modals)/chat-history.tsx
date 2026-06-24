import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft, ClockCounterClockwise } from "phosphor-react-native";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { textStyles } from "../../src/theme/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HeaderAvatar } from "../../src/components/shared/HeaderAvatar";
import { useChatStore } from "../../src/stores/chatStore";

export default function ChatHistoryModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { messages } = useChatStore();

  const visibleMessages = messages.filter(
    (m) => (m.role === "user" || m.role === "assistant") && m.content
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <CaretLeft color={colors.ink} size={24} weight="bold" />
          </TouchableOpacity>
          <View>
            <Text style={textStyles.captionSmall}>ASSISTANT</Text>
            <Text style={[textStyles.h2, { marginTop: spacing.xs }]}>Chat History</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginLeft: spacing.md }}
          >
            <HeaderAvatar />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {visibleMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <ClockCounterClockwise color={colors.inkSoft} size={48} weight="regular" />
            <Text style={[textStyles.h4, { marginTop: spacing.md, color: colors.ink }]}>
              No History Yet
            </Text>
            <Text style={[textStyles.body, { textAlign: "center", color: colors.inkSoft, marginTop: spacing.xs }]}>
              Your past conversations with Aurora will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={visibleMessages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isUser = item.role === "user";
              return (
                <View style={[styles.bubbleContainer, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                  <Text style={[textStyles.body, { color: isUser ? colors.white : colors.ink }]}>
                    {item.content}
                  </Text>
                </View>
              );
            }}
          />
        )}
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.bgPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginTop: 4, // Align slightly down to match h2 text baseline
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  bubbleContainer: {
    maxWidth: "85%",
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: colors.accentOlive,
    borderBottomRightRadius: radii.xs,
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    backgroundColor: colors.bgPaperAlt,
    borderBottomLeftRadius: radii.xs,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
});
