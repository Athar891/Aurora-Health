import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, Camera } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes, borders } from "../../src/theme/tokens";
import { useAuthStore } from "../../src/stores/authStore";
import { uploadToCloudinary } from "../../src/config/cloudinary";

export default function EditProfileModal() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [heightCm, setHeightCm] = useState(user?.heightCm ? String(user.heightCm) : "");
  const [weightKg, setWeightKg] = useState(user?.weightKg ? String(user.weightKg) : "");
  const [gender, setGender] = useState(user?.gender || "prefer-not-to-say");
  const [photoUri, setPhotoUri] = useState(user?.profilePhotoUrl || null);

  const genders = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
    { label: "Prefer not to say", value: "prefer-not-to-say" },
  ];

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please provide your name.");
      return;
    }
    
    setSaving(true);
    try {
      let finalPhotoUrl = user?.profilePhotoUrl || null;

      // If photoUri is a local file (not starting with http), upload it
      if (photoUri && !photoUri.startsWith("http")) {
        const upload = await uploadToCloudinary(photoUri, "aurora/profiles");
        finalPhotoUrl = upload.secure_url;
      } else if (!photoUri) {
        finalPhotoUrl = null;
      }

      const updates: any = {
        name: name.trim(),
        age: parseInt(age as string) || 0,
        heightCm: parseFloat(heightCm as string) || 0,
        weightKg: parseFloat(weightKg as string) || 0,
        gender: gender as any,
      };

      if (finalPhotoUrl !== null) {
        updates.profilePhotoUrl = finalPhotoUrl;
      }

      await updateProfile(updates);
      handleClose();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />
      <KeyboardAvoidingView
        style={styles.sheetContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={handlePickPhoto} style={styles.photoContainer} activeOpacity={0.8}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </Text>
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Camera size={14} color={colors.white} weight="fill" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Jane Doe"
              placeholderTextColor={colors.inkSoft}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="e.g. 28"
                placeholderTextColor={colors.inkSoft}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderGrid}>
                {genders.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[
                      styles.genderChip,
                      gender === g.value && styles.genderChipActive,
                    ]}
                    onPress={() => setGender(g.value)}
                  >
                    <Text
                      style={[
                        styles.genderChipText,
                        gender === g.value && styles.genderChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={heightCm}
                onChangeText={setHeightCm}
                placeholder="e.g. 175"
                placeholderTextColor={colors.inkSoft}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weightKg}
                onChangeText={setWeightKg}
                placeholder="e.g. 70"
                placeholderTextColor={colors.inkSoft}
                keyboardType="numeric"
              />
            </View>
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
            {saving ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Check size={18} color={colors.white} weight="bold" />
                <Text style={styles.saveText}>Save Profile</Text>
              </>
            )}
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
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: "90%", // Prevents drawer from taking up the entire screen on large devices
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
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  scroll: { flexGrow: 0 }, // Allow ScrollView to take only as much height as needed
  scrollContent: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  photoSection: {
    alignItems: "center",
    marginBottom: -spacing.sm, // pull up slightly due to gap
  },
  photoContainer: {
    position: "relative",
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    borderWidth: 2,
    borderColor: colors.bgPaperAlt,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    backgroundColor: colors.bgPaperAlt,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h2,
    color: colors.inkSoft,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.accentSlate,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bgPaper,
  },
  formGroup: { gap: spacing.xs },
  formRow: { flexDirection: "row", gap: spacing.md },
  label: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    color: colors.ink,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    ...borders.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    color: colors.ink,
  },
  genderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  genderChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.bgPaperAlt,
    flexGrow: 1,
    alignItems: "center",
  },
  genderChipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  genderChipText: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
  },
  genderChipTextActive: {
    color: colors.white,
  },
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
    borderRadius: radii.md,
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
    borderRadius: radii.md,
    backgroundColor: colors.ink,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: {
    fontFamily: typography.body.semiBold,
    fontSize: fontSizes.body,
    color: colors.white,
  },
});
