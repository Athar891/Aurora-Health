import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { User } from "phosphor-react-native";
import { colors, typography, fontSizes, radii, spacing } from "../../theme/tokens";
import { useAuthStore } from "../../stores/authStore";

export function HeaderAvatar() {
  const user = useAuthStore((s) => s.user);

  // Default to 1 if no streak is recorded yet
  const loginCount = user?.loginStreak || 1; 

  let streakEmoji = "🌱";
  if (loginCount >= 30) streakEmoji = "👑";
  else if (loginCount >= 7) streakEmoji = "🔥";
  else if (loginCount >= 3) streakEmoji = "⭐";

  const renderAvatar = () => {
    if (user?.profilePhotoUrl) {
      return (
        <Image
          source={{ uri: user.profilePhotoUrl }}
          style={styles.avatar}
        />
      );
    }

    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "";

    return (
      <View style={styles.fallbackAvatar}>
        {initial ? (
          <Text style={styles.initialText}>{initial}</Text>
        ) : (
          <User color={colors.bgPaper} size={16} weight="bold" />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.streakBadge}>
        <Text style={styles.streakEmoji}>{streakEmoji}</Text>
        <Text style={styles.streakCount}>{loginCount}</Text>
      </View>
      {renderAvatar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPaperAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakCount: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.caption,
    color: colors.ink,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgPaperAlt,
  },
  fallbackAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  initialText: {
    color: colors.bgPaper,
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.body,
    lineHeight: 32,
  },
});
