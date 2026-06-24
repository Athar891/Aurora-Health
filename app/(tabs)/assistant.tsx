import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { CaretLeft, Sparkle, ClockCounterClockwise } from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { colors, spacing, radii } from "../../src/theme/tokens";
import { textStyles } from "../../src/theme/styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { aiOrchestrator } from "../../src/services/ai/orchestrator";
import { Message } from "../../src/types/models";
import { voiceService } from "../../src/services/ai/voiceService";
import { useAISettingsStore } from "../../src/stores/aiSettingsStore";
import { useVoiceRecorder } from "../../src/hooks/useVoiceRecorder";
import { useAuthStore } from "../../src/stores/authStore";
// Components
import { HeaderAvatar } from "../../src/components/shared/HeaderAvatar";
import AssistantEmptyState from "../../src/components/assistant/AssistantEmptyState";
import GradientInputBar from "../../src/components/assistant/GradientInputBar";
import LiveAssistantOverlay from "../../src/components/assistant/LiveAssistantOverlay";
import AISettingsSheet from "../../src/components/assistant/AISettingsSheet";

interface Message {
  id: string;
  role: "user" | "model";
  text: string;
}

export default function AssistantModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [progressText, setProgressText] = useState("");
  const { autoReadResponses, voiceSpeed } = useAISettingsStore();
  const [showLiveAssistant, setShowLiveAssistant] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const user = useAuthStore((s) => s.user);
  const firstName = user?.name ? user.name.split(" ")[0] : "there";
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Voice recorder hook for inline mic
  const {
    isRecording: isMicRecording,
    isTranscribing,
    startRecording,
    stopAndTranscribe,
  } = useVoiceRecorder();

  // Empty state animation (fade out when messages appear)
  const emptyStateOpacity = useRef(new Animated.Value(1)).current;
  const hasUserMessages = messages.some((m) => m.role === "user");

  // Initialize AI session on mount
  useEffect(() => {
    try {
      aiOrchestrator.startSession();
    } catch (e) {
      console.log("Failed to start AI session", e);
    }
  }, []);

  // Fade out empty state when first user message appears
  useEffect(() => {
    if (hasUserMessages) {
      Animated.timing(emptyStateOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [hasUserMessages]);

  // Send a text message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setProgressText("Aurora is thinking...");

    try {
      const responseText = await aiOrchestrator.sendMessage(
        userMessage.text,
        (progress) => setProgressText(progress)
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: responseText,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (autoReadResponses) {
        voiceService.speak(responseText, { rate: voiceSpeed });
      }
    } catch (error: any) {
      console.error("AI Error:", error?.message || error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: `Connection error: ${error?.message || "Unknown error"}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setProgressText("");
    }
  }, [input, isTyping]);

  // We need a ref for stopAndTranscribe because onSilence needs to call it
  const stopAndTranscribeRef = useRef(stopAndTranscribe);
  const inputRef = useRef(input);
  
  useEffect(() => {
    stopAndTranscribeRef.current = stopAndTranscribe;
    inputRef.current = input;
  }, [stopAndTranscribe, input]);

  // Handle mic press (inline voice-to-text)
  const handleMicPress = useCallback(async () => {
    const initialInput = inputRef.current;
    if (isMicRecording) {
      // Stop and transcribe manually
      const text = await stopAndTranscribeRef.current();
      if (text) {
        // If we started with text, keep it and append Whisper's final result
        setInput(initialInput ? initialInput + " " + text : text);
      }
    } else {
      // Start recording with real-time text injection and auto-stop on silence
      await startRecording({
        onLiveTranscript: (text) => {
          setInput(initialInput ? initialInput + " " + text : text);
        },
        onSilence: async () => {
          if (stopAndTranscribeRef.current) {
            const text = await stopAndTranscribeRef.current();
            if (text) {
              setInput(initialInput ? initialInput + " " + text : text);
            }
          }
        }
      });
    }
  }, [isMicRecording, startRecording]);

  // Handle image picker (+)
  const handlePlusPress = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      // For now, inform the user — image analysis can be added later
      Alert.alert(
        "Image Selected",
        "Image attachment for AI analysis will be available in a future update."
      );
    }
  }, []);

  // Handle live assistant messages (add to chat history)
  const handleLiveMessage = useCallback(
    (userText: string, aiText: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: userText,
      };
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: aiText,
      };
      setMessages((prev) => [...prev, userMsg, aiMsg]);
    },
    []
  );

  // Render a single message bubble
  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowModel,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarModel}>
            <Sparkle color={colors.bgPaper} size={14} weight="fill" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.messageBubbleUser : styles.messageBubbleModel,
          ]}
        >
          <Text
            style={[
              textStyles.bodyMedium,
              isUser ? styles.messageTextUser : styles.messageTextModel,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", borderBottomWidth: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <TouchableOpacity
            onPress={() => router.push("/(modals)/chat-history")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ClockCounterClockwise color={colors.ink} size={24} weight="regular" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <HeaderAvatar />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <View style={styles.chatArea}>
        {/* Empty State (centered Aurora AI title) */}
        {!hasUserMessages && (
          <Animated.View
            style={[
              styles.emptyStateOverlay,
              { opacity: emptyStateOpacity },
            ]}
            pointerEvents={hasUserMessages ? "none" : "auto"}
          >
            <AssistantEmptyState firstName={firstName} />
          </Animated.View>
        )}

        {/* Messages List */}
        {hasUserMessages && (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onLayout={() => flatListRef.current?.scrollToEnd()}
          />
        )}
      </View>

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={colors.inkSoft} />
          <Text
            style={[
              textStyles.caption,
              { color: colors.inkSoft, marginLeft: 8 },
            ]}
          >
            {progressText || "Aurora is typing..."}
          </Text>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View style={{ paddingBottom: insets.bottom || spacing.md }}>
          <GradientInputBar
            value={input}
            onChangeText={setInput}
            onSend={sendMessage}
            onMicPress={handleMicPress}
            onLiveAssistantPress={() => setShowLiveAssistant(true)}
            onPlusPress={handlePlusPress}
            onSettingsPress={() => setShowSettings(true)}
            isTyping={isTyping || isTranscribing}
            isMicRecording={isMicRecording}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Live Assistant Overlay */}
      <LiveAssistantOverlay
        visible={showLiveAssistant}
        onClose={() => setShowLiveAssistant(false)}
        onMessage={handleLiveMessage}
      />

      {/* AI Settings Sheet */}
      <AISettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
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
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.ink,
  },
  headerRight: {
    width: 40,
  },
  chatArea: {
    flex: 1,
    position: "relative",
  },
  emptyStateOverlay: {
    ...StyleSheet.absoluteFill as object,
    zIndex: 1,
  },
  chatContainer: {
    padding: spacing.md,
    flexGrow: 1,
    gap: spacing.sm,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: spacing.xs,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowModel: {
    justifyContent: "flex-start",
  },
  avatarModel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentTerracotta,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radii.lg,
  },
  messageBubbleUser: {
    backgroundColor: colors.ink,
    borderBottomRightRadius: 4,
  },
  messageBubbleModel: {
    backgroundColor: colors.bgPaperAlt,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  messageTextUser: {
    color: colors.bgPaper,
  },
  messageTextModel: {
    color: colors.ink,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
});
