import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { X, MicrophoneSlash, Microphone } from "phosphor-react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../theme/tokens";
import { voiceService } from "../../services/ai/voiceService";
import { aiOrchestrator } from "../../services/ai/orchestrator";
import VoiceWaveform from "./VoiceWaveform";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type LiveState = "idle" | "listening" | "processing" | "speaking";

interface LiveAssistantOverlayProps {
  visible: boolean;
  onClose: () => void;
  /** Callback when AI generates a response (to add to chat history) */
  onMessage?: (userText: string, aiText: string) => void;
}

export default function LiveAssistantOverlay({
  visible,
  onClose,
  onMessage,
}: LiveAssistantOverlayProps) {
  const [state, setState] = useState<LiveState>("idle");
  const [statusText, setStatusText] = useState("Tap the mic to start");
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isClosingRef = useRef(false);

  // Animate overlay in/out
  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Auto-start listening when overlay opens
      handleStartListening();
    } else {
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Pulse animation for the mic button during listening
  useEffect(() => {
    if (state === "listening") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

  const handleStartListening = useCallback(async () => {
    try {
      setState("listening");
      setStatusText("Listening...");
      await voiceService.startRecording();
    } catch (err: any) {
      setStatusText(err.message || "Mic error");
      setState("idle");
    }
  }, []);

  const handleStopAndProcess = useCallback(async () => {
    if (isClosingRef.current) return;

    try {
      setState("processing");
      setStatusText("Transcribing...");

      const uri = await voiceService.stopRecording();
      if (!uri) {
        setState("idle");
        setStatusText("No audio recorded");
        return;
      }

      const transcribedText = await voiceService.transcribe(uri);
      if (!transcribedText || transcribedText.length === 0) {
        setState("idle");
        setStatusText("Couldn't understand. Tap mic to try again.");
        return;
      }

      setStatusText(`You said: "${transcribedText}"`);

      // Send to AI orchestrator
      setStatusText("Aurora is thinking...");
      const aiResponse = await aiOrchestrator.sendMessage(
        transcribedText,
        (progress) => setStatusText(progress)
      );

      // Notify parent of the conversation
      onMessage?.(transcribedText, aiResponse);

      // Speak the response
      if (!isClosingRef.current) {
        setState("speaking");
        setStatusText("Aurora is speaking...");
        await voiceService.speak(aiResponse, {
          onDone: () => {
            if (!isClosingRef.current) {
              // Auto-restart listening for continuous conversation
              handleStartListening();
            }
          },
        });
      }
    } catch (err: any) {
      console.error("Live assistant error:", err);
      setStatusText(err.message || "Something went wrong");
      setState("idle");
    }
  }, [onMessage]);

  const handleClose = useCallback(() => {
    isClosingRef.current = true;
    voiceService.stopSpeaking();
    voiceService.stopRecording().catch(() => {});
    setState("idle");
    setStatusText("Tap the mic to start");
    onClose();
  }, [onClose]);

  const handleMicPress = useCallback(() => {
    if (state === "listening") {
      handleStopAndProcess();
    } else if (state === "idle") {
      handleStartListening();
    }
  }, [state, handleStopAndProcess, handleStartListening]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: overlayAnim,
          transform: [
            {
              translateY: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <X color={colors.bgPaper} size={24} weight="bold" />
      </TouchableOpacity>

      {/* Status Text */}
      <Text style={styles.statusLabel}>
        {state === "listening"
          ? "LISTENING"
          : state === "processing"
          ? "PROCESSING"
          : state === "speaking"
          ? "AURORA"
          : "LIVE ASSISTANT"}
      </Text>

      {/* Waveform Visualizer */}
      <View style={styles.waveformContainer}>
        <VoiceWaveform
          isActive={state === "listening" || state === "speaking"}
          mode={
            state === "listening"
              ? "listening"
              : state === "speaking"
              ? "speaking"
              : "idle"
          }
        />
      </View>

      {/* Status Detail */}
      <Text style={styles.statusText}>{statusText}</Text>

      {/* Processing Spinner */}
      {state === "processing" && (
        <ActivityIndicator
          size="small"
          color={colors.bgPaper}
          style={{ marginTop: spacing.md }}
        />
      )}

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Main Mic / Stop Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              state === "listening" && styles.mainButtonListening,
              state === "speaking" && styles.mainButtonSpeaking,
            ]}
            onPress={handleMicPress}
            disabled={state === "processing" || state === "speaking"}
          >
            {state === "listening" ? (
              <View style={styles.stopIcon} />
            ) : (
              <Microphone
                color={colors.bgPaper}
                size={32}
                weight="fill"
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill as object,
    backgroundColor: "rgba(43, 36, 28, 0.92)", // colors.ink with alpha
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  closeButton: {
    position: "absolute",
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.caption,
    color: "rgba(244, 239, 225, 0.6)",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: spacing.lg,
  },
  waveformContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: spacing.xl,
  },
  statusText: {
    fontFamily: typography.body.fontFamily,
    fontSize: fontSizes.body,
    color: colors.bgPaper,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  controls: {
    position: "absolute",
    bottom: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: {
    backgroundColor: colors.accentTerracotta,
  },
  mainButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(244, 239, 225, 0.4)",
  },
  mainButtonListening: {
    backgroundColor: colors.accentTerracotta,
    borderColor: colors.accentTerracotta,
  },
  mainButtonSpeaking: {
    backgroundColor: colors.accentOlive,
    borderColor: colors.accentOlive,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.bgPaper,
  },
});
