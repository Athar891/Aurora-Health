import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, Switch, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Button } from "../../../src/components/ui/Button";
import { textStyles } from "../../../src/theme/styles";
import { colors, spacing, radii, borders } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";
import { Microphone } from "phosphor-react-native";
import { voiceService } from "../../../src/services/ai/voiceService";
import { AIVoiceOrb } from "../../../src/components/assistant/AIVoiceOrb";

export default function NotificationsScreen() {
  const router = useRouter();
  const { autoVoice } = useLocalSearchParams();
  const { updateProfile } = useAuthStore();
  
  const [preferences, setPreferences] = useState({
    hydrationReminders: true,
    sleepReminders: true,
    habitReminders: true,
    dailyInsights: true,
  });

  // --- Voice AI State ---
  const [isOrbVisible, setIsOrbVisible] = useState(false);
  const [orbState, setOrbState] = useState<"idle" | "listening" | "processing" | "speaking">("speaking");
  const [orbSubtitle, setOrbSubtitle] = useState("");

  const isOrbActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const liveTranscriptRef = useRef("");
  const hasStartedRef = useRef(false);

  const stateRef = useRef({ preferences, isConfirmed: false });

  useEffect(() => {
    stateRef.current = { preferences, isConfirmed: stateRef.current.isConfirmed };
  }, [preferences]);

  const toggleSwitch = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = async () => {
    await updateProfile({ notificationPreferences: preferences });
    router.push({ pathname: "/(onboarding)/setup/tracking-setup", params: { autoVoice: "true" } });
  };

  // Auto-start voice
  useEffect(() => {
    if (autoVoice === "true") {
      setTimeout(() => {
        openOrb();
        setTimeout(() => handleOrbTap(), 300);
      }, 500);
    }
  }, [autoVoice]);

  // --- AI Voice Handlers ---
  const handleStartListening = async () => {
    if (!isOrbActiveRef.current) return;
    
    liveTranscriptRef.current = "";
    
    try {
      voiceService.stopSpeaking();
      await voiceService.startRecording({
        onSilence: () => {
          if (isOrbActiveRef.current) stopAndProcess();
        },
        onLiveTranscript: (text) => {
          if (isOrbActiveRef.current) {
            setOrbSubtitle(`"${text}"`);
            liveTranscriptRef.current = text;
          }
        }
      });
      if (isOrbActiveRef.current) setOrbState("listening");

      const s = stateRef.current;
      if (!s.isConfirmed) setOrbSubtitle("Listening for notification preferences...");
    } catch (e) {
      console.error("Failed to start recording:", e);
      if (isOrbActiveRef.current) setOrbState("idle");
    }
  };

  const stopAndProcess = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    setOrbState("processing");
    setOrbSubtitle("Analyzing...");
    
    try {
      await voiceService.stopRecording();
      const transcribedText = liveTranscriptRef.current.trim();
      
      if (transcribedText.length > 0) {
        const extracted = await handleAiExtract(transcribedText);
        setOrbState("speaking");
        
        if (!extracted.isConfirmed) {
          setOrbSubtitle("Are these settings correct?");
          
          const onPrefs = [];
          if (extracted.newPreferences.hydrationReminders) onPrefs.push("hydration");
          if (extracted.newPreferences.sleepReminders) onPrefs.push("sleep");
          if (extracted.newPreferences.habitReminders) onPrefs.push("habits");
          if (extracted.newPreferences.dailyInsights) onPrefs.push("daily insights");
          
          let prefText = "";
          if (onPrefs.length === 0) prefText = "no notifications at all";
          else if (onPrefs.length === 4) prefText = "all notifications turned on";
          else prefText = onPrefs.join(", ");

          voiceService.speak(`Okay, I have set your notifications to: ${prefText}. Is this correct, or would you like to change something?`, { onDone: () => handleStartListening() });
        } else {
          setOrbSubtitle("Perfect! Navigating...");
          voiceService.speak("Perfect, let's move to the final step.", {
            onDone: () => {
              setIsOrbVisible(false);
              handleNext();
            }
          });
        }
      } else {
        setOrbState("speaking");
        setOrbSubtitle("I didn't catch that. Please try again.");
        voiceService.speak("I didn't quite catch that. Could you try again?", {
          onDone: () => handleStartListening()
        });
      }
    } catch (e) {
      console.error("Voice processing error:", e);
      setOrbState("speaking");
      setOrbSubtitle("Something went wrong.");
      voiceService.speak("Sorry, I had trouble processing that.", { onDone: () => handleStartListening() });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleAiExtract = async (text: string) => {
    try {
      const s = stateRef.current;
      let newPreferences = { ...s.preferences };
      let isConfirmed = s.isConfirmed;

      const prompt = `You are an AI extracting data from a user's speech. 
The user is choosing which notifications to enable.
Current state: Hydration (${s.preferences.hydrationReminders}), Sleep (${s.preferences.sleepReminders}), Habits (${s.preferences.habitReminders}), Daily Insights (${s.preferences.dailyInsights}). By default they are all true.
Analyze the user's spoken text and return ONLY a valid JSON object.
Fields to extract:
- hydrationReminders (boolean: true or false based on if they want it on or off)
- sleepReminders (boolean: true or false)
- habitReminders (boolean: true or false)
- dailyInsights (boolean: true or false)
- isConfirmed (boolean: true if the user's text implies agreement, approval, or says 'correct', 'yes', 'looks good', 'no changes'. false if they are telling you to turn something off/on or disagreeing.)
Text: "${text}"`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.EXPO_PUBLIC_WHISPER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1
        })
      });

      if (!res.ok) throw new Error("Groq API extraction failed");

      const data = await res.json();
      const content = data.choices[0].message.content.trim();

      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON object found in response");
      
      const parsed = JSON.parse(content.substring(jsonStart, jsonEnd + 1));

      if (typeof parsed.hydrationReminders === 'boolean') newPreferences.hydrationReminders = parsed.hydrationReminders;
      if (typeof parsed.sleepReminders === 'boolean') newPreferences.sleepReminders = parsed.sleepReminders;
      if (typeof parsed.habitReminders === 'boolean') newPreferences.habitReminders = parsed.habitReminders;
      if (typeof parsed.dailyInsights === 'boolean') newPreferences.dailyInsights = parsed.dailyInsights;
      
      setPreferences(newPreferences);
      s.preferences = newPreferences;
      
      const confirmStr = String(parsed.isConfirmed).toLowerCase().trim();
      if (confirmStr === 'true') { isConfirmed = true; s.isConfirmed = true; } 
      else if (confirmStr === 'false') { isConfirmed = false; s.isConfirmed = false; }

      return { newPreferences, isConfirmed };
    } catch (e) {
      console.error("AI extraction error", e);
      const s = stateRef.current;
      return { newPreferences: s.preferences, isConfirmed: s.isConfirmed };
    }
  };

  const handleOrbTap = async () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setOrbState("speaking");
      setOrbSubtitle("What notifications do you want?");
      voiceService.speak("By default, all notifications are turned on. Tell me if you want to turn anything off, like hydration or daily insights. Otherwise, just say 'looks good'.", {
        rate: 0.95,
        onDone: () => handleStartListening()
      });
      return;
    }

    if (orbState === "listening") {
      await stopAndProcess();
    } else {
      await handleStartListening();
    }
  };

  const openOrb = () => {
    isOrbActiveRef.current = true;
    setIsOrbVisible(true);
    setOrbState("idle");
    setOrbSubtitle("Tap me to start");
    hasStartedRef.current = false;
  };

  const handleCloseOrb = () => {
    isOrbActiveRef.current = false;
    setIsOrbVisible(false);
    voiceService.stopSpeaking();
    if (voiceService.getIsRecording()) voiceService.stopRecording();
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <SectionHeader
            index="04"
            label="NOTIFICATIONS"
            title="Stay on track."
            subtitle="Choose what you'd like to be reminded about."
          />
          <TouchableOpacity style={styles.aiTriggerButton} onPress={openOrb}>
            <Microphone size={24} color={colors.white} weight="fill" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Hydration</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>Gentle reminders to drink water</Text>
            </View>
            <Switch
              value={preferences.hydrationReminders}
              onValueChange={() => toggleSwitch("hydrationReminders")}
              trackColor={{ false: colors.line, true: colors.accentTerracottaLight }}
              thumbColor={preferences.hydrationReminders ? colors.accentTerracotta : colors.bgPaper}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Sleep</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>Wind-down reminders before bedtime</Text>
            </View>
            <Switch
              value={preferences.sleepReminders}
              onValueChange={() => toggleSwitch("sleepReminders")}
              trackColor={{ false: colors.line, true: colors.accentSlateLight }}
              thumbColor={preferences.sleepReminders ? colors.accentSlate : colors.bgPaper}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Habits</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>Reminders for your custom habits</Text>
            </View>
            <Switch
              value={preferences.habitReminders}
              onValueChange={() => toggleSwitch("habitReminders")}
              trackColor={{ false: colors.line, true: colors.accentMustardLight }}
              thumbColor={preferences.habitReminders ? colors.accentMustard : colors.bgPaper}
            />
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={textStyles.bodySemiBold}>Daily Insights</Text>
              <Text style={[textStyles.bodySmall, styles.desc]}>A summary of your day</Text>
            </View>
            <Switch
              value={preferences.dailyInsights}
              onValueChange={() => toggleSwitch("dailyInsights")}
              trackColor={{ false: colors.line, true: colors.accentOliveLight }}
              thumbColor={preferences.dailyInsights ? colors.accentOlive : colors.bgPaper}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" onPress={handleNext} />
      </View>

      <AIVoiceOrb 
        isVisible={isOrbVisible}
        state={orbState}
        onTap={handleOrbTap}
        onClose={handleCloseOrb}
        text={orbSubtitle}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  aiTriggerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentMustard,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accentMustard,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  form: {
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.bgPaperAlt,
    ...borders.hairline,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  desc: {
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: colors.line,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
