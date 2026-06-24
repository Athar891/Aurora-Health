import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from "react-native";
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

export default function GoalsScreen() {
  const router = useRouter();
  const { autoVoice } = useLocalSearchParams();
  const { updateProfile } = useAuthStore();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // --- Voice AI State ---
  const [isOrbVisible, setIsOrbVisible] = useState(false);
  const [orbState, setOrbState] = useState<"idle" | "listening" | "processing" | "speaking">("speaking");
  const [orbSubtitle, setOrbSubtitle] = useState("");

  const isOrbActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const liveTranscriptRef = useRef("");
  const hasStartedRef = useRef(false);

  const stateRef = useRef({ selectedGoals: [] as string[], isConfirmed: false });

  useEffect(() => {
    stateRef.current = { selectedGoals, isConfirmed: stateRef.current.isConfirmed };
  }, [selectedGoals]);

  const goalsList = [
    { id: "improve-hydration", label: "Improve hydration" },
    { id: "sleep-better", label: "Sleep better" },
    { id: "build-habits", label: "Build new habits" },
    { id: "eat-healthier", label: "Eat healthier" },
    { id: "improve-energy", label: "Improve energy levels" },
    { id: "improve-consistency", label: "Improve consistency" },
  ];

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    await updateProfile({ goals: selectedGoals });
    router.push({ pathname: "/(onboarding)/setup/notifications", params: { autoVoice: "true" } });
  };

  const isFormValid = selectedGoals.length > 0;

  // Auto-start voice if navigating from previous page with voice active
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
      if (s.selectedGoals.length === 0) setOrbSubtitle("Listening for your goals...");
      else if (!s.isConfirmed) setOrbSubtitle("Waiting for confirmation...");
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
        
        if (extracted.newGoals.length === 0) {
          setOrbSubtitle("What are your main health goals?");
          voiceService.speak("I didn't quite catch any goals. Could you tell me what you want to focus on? Like sleeping better or eating healthier?", { onDone: () => handleStartListening() });
        } else if (!extracted.isConfirmed) {
          setOrbSubtitle("Are these goals correct?");
          
          // Map goal IDs back to human readable labels
          const readableGoals = extracted.newGoals.map(g => goalsList.find(x => x.id === g)?.label).filter(Boolean);
          const goalsText = readableGoals.length === 1 ? readableGoals[0] : readableGoals.slice(0, -1).join(", ") + " and " + readableGoals[readableGoals.length - 1];
          
          voiceService.speak(`I've set your goals to ${goalsText}. Is this correct, or do you want to add or change anything?`, { onDone: () => handleStartListening() });
        } else {
          setOrbSubtitle("Perfect! Navigating...");
          voiceService.speak("Perfect, let's wrap up with notifications.", {
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
      let newGoals = [...s.selectedGoals];
      let isConfirmed = s.isConfirmed;

      const prompt = `You are an AI extracting data from a user's speech. 
The user is currently being asked to confirm their goals.
Current goals: ${s.selectedGoals.join(", ")}.
Analyze the user's spoken text and return ONLY a valid JSON object.
Fields to extract:
- goals (array of strings: MUST only contain exact matches from this list: "improve-hydration", "sleep-better", "build-habits", "eat-healthier", "improve-energy", "improve-consistency". Return an empty array if no goals are mentioned.)
- isConfirmed (boolean: true if the user's text implies agreement, approval, or says 'correct', 'yes', 'looks good', 'no changes'. false if they are correcting a mistake, adding a new goal, or disagreeing.)
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

      if (parsed.goals && Array.isArray(parsed.goals) && parsed.goals.length > 0) { 
        newGoals = parsed.goals; 
        setSelectedGoals(newGoals); 
        s.selectedGoals = newGoals; 
      }
      
      const confirmStr = String(parsed.isConfirmed).toLowerCase().trim();
      if (confirmStr === 'true') { isConfirmed = true; s.isConfirmed = true; } 
      else if (confirmStr === 'false') { isConfirmed = false; s.isConfirmed = false; }

      return { newGoals, isConfirmed };
    } catch (e) {
      console.error("AI extraction error", e);
      const s = stateRef.current;
      return { newGoals: s.selectedGoals, isConfirmed: s.isConfirmed };
    }
  };

  const handleOrbTap = async () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setOrbState("speaking");
      setOrbSubtitle("What are your main goals?");
      voiceService.speak("We're almost done. What are your main health goals? You can say things like 'eating healthier' or 'sleeping better'.", {
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
            index="03"
            label="GOALS"
            title="What are you focusing on?"
            subtitle="Select all that apply."
          />
          <TouchableOpacity style={styles.aiTriggerButton} onPress={openOrb}>
            <Microphone size={24} color={colors.white} weight="fill" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {goalsList.map((item) => {
            const isSelected = selectedGoals.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => toggleGoal(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text style={[textStyles.bodySemiBold, isSelected && styles.optionTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleNext}
          disabled={!isFormValid}
        />
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
  optionsContainer: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.bgPaperAlt,
    ...borders.hairline,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.accentMustardLight,
    borderColor: colors.accentMustard,
  },
  optionTextSelected: {
    color: colors.accentMustard,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
