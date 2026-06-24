import React, { useRef, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plus,
  SlidersHorizontal,
  Microphone,
  PaperPlaneRight,
  Waveform,
} from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../theme/tokens";

interface GradientInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onMicPress: () => void;
  onLiveAssistantPress: () => void;
  onPlusPress: () => void;
  onSettingsPress: () => void;
  isTyping: boolean;
  isMicRecording: boolean;
}

export default function GradientInputBar({
  value,
  onChangeText,
  onSend,
  onMicPress,
  onLiveAssistantPress,
  onPlusPress,
  onSettingsPress,
  isTyping,
  isMicRecording,
}: GradientInputBarProps) {
  const hasText = value.trim().length > 0;

  // Animation for morphing live-assistant ↔ send button
  const morphAnim = useRef(new Animated.Value(0)).current;
  // 0 = live assistant button, 1 = send button

  useEffect(() => {
    Animated.spring(morphAnim, {
      toValue: hasText ? 1 : 0,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [hasText]);

  const liveAssistantScale = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const liveAssistantOpacity = morphAnim.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const sendScale = morphAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const sendOpacity = morphAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.wrapper}>
      {/* Gradient Border */}
      <LinearGradient
        colors={[
          colors.accentTerracotta,
          colors.accentOlive,
          colors.accentSlate,
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradientBorder}
      >
        {/* Inner Container */}
        <View style={styles.innerContainer}>
          {/* Text Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.inkSoft}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={500}
            editable={!isTyping}
          />

          {/* Bottom Row: action buttons on left, mic + live/send on right */}
          <View style={styles.bottomRow}>
            {/* Left-side action buttons */}
            <View style={styles.leftActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onPlusPress}
              >
                <Plus color={colors.accentOlive} size={20} weight="bold" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSettingsPress}
              >
                <SlidersHorizontal
                  color={colors.accentOlive}
                  size={20}
                  weight="bold"
                />
              </TouchableOpacity>
            </View>

            {/* Right-side buttons */}
            <View style={styles.rightActions}>
              {/* Mic button — always visible */}
              <TouchableOpacity
                style={[
                  styles.micButton,
                  isMicRecording && styles.micButtonRecording,
                ]}
                onPress={onMicPress}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color={colors.inkSoft} />
                ) : (
                  <Microphone
                    color={isMicRecording ? colors.bgPaper : colors.inkSoft}
                    size={20}
                    weight={isMicRecording ? "fill" : "regular"}
                  />
                )}
              </TouchableOpacity>

              {/* Morphing Live-Assistant / Send button */}
              <View style={styles.morphButtonContainer}>
                {/* Live Assistant (visible when no text) */}
                <Animated.View
                  style={[
                    styles.morphButtonAbsolute,
                    {
                      transform: [{ scale: liveAssistantScale }],
                      opacity: liveAssistantOpacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.liveAssistantButton}
                    onPress={onLiveAssistantPress}
                    disabled={hasText}
                  >
                    <Waveform
                      color={colors.bgPaper}
                      size={22}
                      weight="fill"
                    />
                  </TouchableOpacity>
                </Animated.View>

                {/* Send Button (visible when has text) */}
                <Animated.View
                  style={[
                    styles.morphButtonAbsolute,
                    {
                      transform: [{ scale: sendScale }],
                      opacity: sendOpacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!hasText || isTyping) && styles.sendButtonDisabled,
                    ]}
                    onPress={onSend}
                    disabled={!hasText || isTyping}
                  >
                    <PaperPlaneRight
                      color={colors.bgPaper}
                      size={18}
                      weight="fill"
                    />
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  gradientBorder: {
    borderRadius: radii.lg + 2,
    padding: 1.5, // thin gradient border
  },
  innerContainer: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 8,
  },
  textInput: {
    minHeight: 24,
    maxHeight: 100,
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    color: colors.ink,
    paddingVertical: 0,
    marginBottom: spacing.sm,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonRecording: {
    backgroundColor: colors.accentTerracotta,
  },
  morphButtonContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  morphButtonAbsolute: {
    position: "absolute",
  },
  liveAssistantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accentSlate,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.line,
  },
});
