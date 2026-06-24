import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Alert, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { textStyles } from "../../../src/theme/styles";
import { colors, spacing } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";
import { Microphone } from "phosphor-react-native";
import { voiceService } from "../../../src/services/ai/voiceService";
import { AIVoiceOrb } from "../../../src/components/assistant/AIVoiceOrb";

export default function TrackingSetupScreen() {
  const router = useRouter();
  const { autoVoice } = useLocalSearchParams();
  const { updateProfile, user } = useAuthStore();
  const [waterGoal, setWaterGoal] = useState("2000");
  const [sleepGoal, setSleepGoal] = useState("8");

  // --- Voice AI State ---
  const [isOrbVisible, setIsOrbVisible] = useState(false);
  const [orbState, setOrbState] = useState<"idle" | "listening" | "processing" | "speaking">("speaking");
  const [orbSubtitle, setOrbSubtitle] = useState("");

  const isOrbActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const liveTranscriptRef = useRef("");
  const hasStartedRef = useRef(false);

  const stateRef = useRef({ waterGoal, sleepGoal, isConfirmed: false });

  useEffect(() => {
    stateRef.current = { waterGoal, sleepGoal, isConfirmed: stateRef.current.isConfirmed };
  }, [waterGoal, sleepGoal]);

  const handleNext = async () => {
    const wGoal = parseInt(waterGoal, 10) || 2000;
    const sGoal = parseInt(sleepGoal, 10) || 8;
    
    // Save to user profile
    await updateProfile({
      waterGoal: wGoal,
      sleepGoal: sGoal,
    });

    // Save to preferences document (used by Daily Goals screen)
    const { setUserDoc } = await import("../../../src/services/firestoreService");
    await setUserDoc("preferences", {
      hydrationGoalMl: wGoal,
      sleepGoalHours: sGoal,
      // Default baseline values for other fields
      calorieGoal: 2000,
      proteinGoal: 120,
      activityLevel: (user as any)?.activityLevel || "moderate"
    });

    router.push("/(onboarding)/complete");
  };

  const handleSkip = () => {
    const message = "You can finish setting up when you are ready to start your first goal.";
    if (Platform.OS === 'web') {
      if (window.confirm(message + " Skip for now?")) {
        router.replace("/(tabs)/");
      }
    } else {
      Alert.alert("Skip Setup?", message, [
        { text: "Cancel", style: "cancel" },
        { text: "Skip", onPress: () => router.replace("/(tabs)/") }
      ]);
    }
  };

  const isFormValid = waterGoal.length > 0 && sleepGoal.length > 0;

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
      if (!s.isConfirmed) setOrbSubtitle("Listening for targets...");
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
          setOrbSubtitle("Are these targets correct?");
          voiceService.speak(`I've set your daily targets to ${extracted.newWaterGoal} milliliters of water and ${extracted.newSleepGoal} hours of sleep. Is this correct?`, { onDone: () => handleStartListening() });
        } else {
          setOrbSubtitle("Setup Complete!");
          voiceService.speak("Awesome! We are all set. Finishing up your profile now.", {
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
      let newWaterGoal = s.waterGoal;
      let newSleepGoal = s.sleepGoal;
      let isConfirmed = s.isConfirmed;

      const prompt = `You are an AI extracting data from a user's speech. 
The user is setting their daily health targets.
Current state: Water (${s.waterGoal} ml), Sleep (${s.sleepGoal} hours). By default they are 2000 and 8.
Analyze the user's spoken text and return ONLY a valid JSON object.
Fields to extract:
- waterGoal (string: number of ml they want to drink. Empty string if no change mentioned)
- sleepGoal (string: number of hours they want to sleep. Empty string if no change mentioned)
- isConfirmed (boolean: true if the user's text implies agreement, approval, or says 'correct', 'yes', 'looks good', 'no changes'. false if they are telling you to change a target or disagreeing.)
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

      if (parsed.waterGoal) { newWaterGoal = String(parsed.waterGoal).replace(/[^0-9]/g, ''); setWaterGoal(newWaterGoal); s.waterGoal = newWaterGoal; }
      if (parsed.sleepGoal) { newSleepGoal = String(parsed.sleepGoal).replace(/[^0-9]/g, ''); setSleepGoal(newSleepGoal); s.sleepGoal = newSleepGoal; }
      
      const confirmStr = String(parsed.isConfirmed).toLowerCase().trim();
      if (confirmStr === 'true') { isConfirmed = true; s.isConfirmed = true; } 
      else if (confirmStr === 'false') { isConfirmed = false; s.isConfirmed = false; }

      return { newWaterGoal, newSleepGoal, isConfirmed };
    } catch (e) {
      console.error("AI extraction error", e);
      const s = stateRef.current;
      return { newWaterGoal: s.waterGoal, newSleepGoal: s.sleepGoal, isConfirmed: s.isConfirmed };
    }
  };

  const handleOrbTap = async () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setOrbState("speaking");
      setOrbSubtitle("What are your daily targets?");
      voiceService.speak("Last step. I've set a baseline of 2000 milliliters of water and 8 hours of sleep. Tell me if you want to adjust these, or just say 'looks good'.", {
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
            index="05"
            label="TARGETS"
            title="Set your baselines."
            subtitle="You can always adjust these later."
          />
          <TouchableOpacity style={styles.aiTriggerButton} onPress={openOrb}>
            <Microphone size={24} color={colors.white} weight="fill" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Input
          label="Daily Hydration Goal (ml)"
          placeholder="e.g. 2000"
          value={waterGoal}
          onChangeText={setWaterGoal}
          keyboardType="number-pad"
        />
        
        <Input
          label="Daily Sleep Goal (hours)"
          placeholder="e.g. 8"
          value={sleepGoal}
          onChangeText={setSleepGoal}
          keyboardType="number-pad"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Finish Setup"
          onPress={handleNext}
          disabled={!isFormValid}
        />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={[textStyles.bodySemiBold, { color: colors.inkSoft }]}>Skip for now</Text>
        </TouchableOpacity>
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
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  skipButton: {
    marginTop: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
});
