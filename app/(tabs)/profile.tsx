import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { Gear, CaretRight, SignOut } from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../src/components/shared/SectionHeader";
import { Card } from "../../src/components/ui/Card";
import { Divider } from "../../src/components/ui/Divider";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/stores/authStore";
import { uploadToCloudinary } from "../../src/config/cloudinary";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateProfile, isLoading } = useAuthStore();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to sign out?");
      if (confirmed) {
        await signOut();
        router.replace("/(onboarding)/landing");
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(onboarding)/landing");
          },
        },
      ]);
    }
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingPhoto(true);
      try {
        const upload = await uploadToCloudinary(
          result.assets[0].uri,
          "aurora/profiles"
        );
        await updateProfile({ profilePhotoUrl: upload.secure_url });
      } catch (err) {
        Alert.alert("Upload Failed", "Could not upload profile photo.");
        console.error("Photo upload error:", err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  // Derive display values from user profile
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <SectionHeader label="SETTINGS" title="Settings & Profile" subtitle="Manage your account and preferences." />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Summary */}
        <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.7}>
          <View style={styles.profileSummary}>
            {user?.profilePhotoUrl ? (
              <Image
                source={{ uri: user.profilePhotoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={textStyles.h2}>{initials}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={textStyles.h3}>{displayName}</Text>
              <Text style={textStyles.bodySmall}>{displayEmail}</Text>
              {uploadingPhoto && (
                <Text style={[textStyles.caption, { color: colors.accentOlive }]}>
                  Uploading photo...
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <Divider />

        <Text style={[textStyles.captionSmall, styles.sectionTitle]}>
          PREFERENCES
        </Text>
        <Card noPadding style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Linking.openSettings()}
            activeOpacity={0.7}
          >
            <Text style={textStyles.bodyMedium}>Notifications</Text>
            <CaretRight color={colors.inkSoft} size={20} />
          </TouchableOpacity>
          <Divider style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(modals)/daily-goals")}
            activeOpacity={0.7}
          >
            <Text style={textStyles.bodyMedium}>Daily Goals</Text>
            <CaretRight color={colors.inkSoft} size={20} />
          </TouchableOpacity>
          <Divider style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(modals)/linked-devices")}
            activeOpacity={0.7}
          >
            <Text style={textStyles.bodyMedium}>Linked Devices</Text>
            <CaretRight color={colors.inkSoft} size={20} />
          </TouchableOpacity>
        </Card>

        <Text style={[textStyles.captionSmall, styles.sectionTitle]}>
          SUPPORT
        </Text>
        <Card noPadding style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(modals)/help-center")}
            activeOpacity={0.7}
          >
            <Text style={textStyles.bodyMedium}>Help Center</Text>
            <CaretRight color={colors.inkSoft} size={20} />
          </TouchableOpacity>
          <Divider style={styles.menuDivider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(modals)/privacy-policy")}
            activeOpacity={0.7}
          >
            <Text style={textStyles.bodyMedium}>Privacy Policy</Text>
            <CaretRight color={colors.inkSoft} size={20} />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleSignOut}
        >
          <SignOut color={colors.error} size={20} />
          <Text style={[textStyles.bodySemiBold, { color: colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconButton: {
    padding: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  profileSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPaperAlt,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    color: colors.inkSoft,
  },
  menuCard: {
    marginBottom: spacing.xl,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  menuDivider: {
    marginVertical: 0,
    marginHorizontal: spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
});
