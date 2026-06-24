import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../theme/tokens";
import { textStyles } from "../../theme/styles";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const STORAGE_KEY = "@aurora_ai_settings";

export interface AISettings {
  autoReadResponses: boolean;
  responseStyle: "concise" | "detailed";
  voiceSpeed: number;
}

const DEFAULT_SETTINGS: AISettings = {
  autoReadResponses: false,
  responseStyle: "concise",
  voiceSpeed: 1.0,
};

interface AISettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AISettings) => void;
}

export default function AISettingsSheet({
  visible,
  onClose,
  onSettingsChange,
}: AISettingsSheetProps) {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const translateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Animate in/out
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      friction: 10,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (e) {
      console.log("Failed to load AI settings");
    }
  };

  const saveSettings = async (newSettings: AISettings) => {
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.log("Failed to save AI settings");
    }
  };

  const updateSetting = <K extends keyof AISettings>(
    key: K,
    value: AISettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={styles.backdropTouchable}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY }] }]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[textStyles.h3, { fontSize: fontSizes.bodyLarge }]}>
            AI Preferences
          </Text>
          <TouchableOpacity onPress={onClose}>
            <X color={colors.ink} size={22} />
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          {/* Auto-read responses */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={textStyles.bodyMedium}>Read responses aloud</Text>
              <Text style={textStyles.bodySmall}>
                Aurora will speak AI responses automatically
              </Text>
            </View>
            <Switch
              value={settings.autoReadResponses}
              onValueChange={(val) => updateSetting("autoReadResponses", val)}
              trackColor={{ false: colors.line, true: colors.accentOlive }}
              thumbColor={colors.bgPaper}
            />
          </View>

          {/* Response Style */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={textStyles.bodyMedium}>Response style</Text>
              <Text style={textStyles.bodySmall}>
                How detailed should Aurora's replies be
              </Text>
            </View>
            <View style={styles.toggleGroup}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  settings.responseStyle === "concise" &&
                    styles.toggleOptionActive,
                ]}
                onPress={() => updateSetting("responseStyle", "concise")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    settings.responseStyle === "concise" &&
                      styles.toggleTextActive,
                  ]}
                >
                  Concise
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  settings.responseStyle === "detailed" &&
                    styles.toggleOptionActive,
                ]}
                onPress={() => updateSetting("responseStyle", "detailed")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    settings.responseStyle === "detailed" &&
                      styles.toggleTextActive,
                  ]}
                >
                  Detailed
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Speed */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={textStyles.bodyMedium}>Voice speed</Text>
              <Text style={textStyles.bodySmall}>
                TTS playback rate for spoken responses
              </Text>
            </View>
            <View style={styles.speedButtons}>
              {[0.75, 1.0, 1.25].map((speed) => (
                <TouchableOpacity
                  key={speed}
                  style={[
                    styles.speedButton,
                    settings.voiceSpeed === speed && styles.speedButtonActive,
                  ]}
                  onPress={() => updateSetting("voiceSpeed", speed)}
                >
                  <Text
                    style={[
                      styles.speedText,
                      settings.voiceSpeed === speed && styles.speedTextActive,
                    ]}
                  >
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
    zIndex: 90,
  },
  backdropTouchable: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.bgPaper,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.55,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  settingsContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleGroup: {
    flexDirection: "row",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  toggleOptionActive: {
    backgroundColor: colors.ink,
    borderRadius: radii.md,
  },
  toggleText: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
  },
  toggleTextActive: {
    color: colors.bgPaper,
  },
  speedButtons: {
    flexDirection: "row",
    gap: 6,
  },
  speedButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.bgPaperAlt,
    borderWidth: 1,
    borderColor: colors.line,
  },
  speedButtonActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  speedText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
  },
  speedTextActive: {
    color: colors.bgPaper,
  },
});

export { STORAGE_KEY, DEFAULT_SETTINGS };
