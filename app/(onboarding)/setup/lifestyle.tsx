import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { textStyles } from "../../../src/theme/styles";
import { colors, spacing, radii, borders } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";
import { Microphone } from "phosphor-react-native";
import { voiceService } from "../../../src/services/ai/voiceService";
import { AIVoiceOrb } from "../../../src/components/assistant/AIVoiceOrb";

export default function LifestyleScreen() {
  const router = useRouter();
  const { autoVoice } = useLocalSearchParams();
  const { updateProfile } = useAuthStore();
  const [wakeUp, setWakeUp] = useState("");
  const [bedtime, setBedtime] = useState("");
  const [activity, setActivity] = useState<string | null>(null);

  // --- Voice AI State ---
  const [isOrbVisible, setIsOrbVisible] = useState(false);
  const [orbState, setOrbState] = useState<"idle" | "listening" | "processing" | "speaking">("speaking");
  const [orbSubtitle, setOrbSubtitle] = useState("");

  const isOrbActiveRef = useRef(false);
  const isProcessingRef = useRef(false);
  const liveTranscriptRef = useRef("");
  const hasStartedRef = useRef(false);

  const stateRef = useRef({ wakeUp: "", bedtime: "", activity: "", isConfirmed: false });

  useEffect(() => {
    stateRef.current = { wakeUp, bedtime, activity: activity || "", isConfirmed: stateRef.current.isConfirmed };
  }, [wakeUp, bedtime, activity]);

  const activities = [
    { id: "sedentary", label: "Sedentary", desc: "Little to no exercise" },
    { id: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
    { id: "moderate", label: "Moderate", desc: "Exercise 3-5 days/week" },
    { id: "active", label: "Active", desc: "Hard exercise 6-7 days/week" },
  ];

  const handleNext = async () => {
    await updateProfile({
      wakeUpTime: wakeUp,
      bedtime,
      activityLevel: activity,
    });
    router.push({ pathname: "/(onboarding)/setup/goals", params: { autoVoice: "true" } });
  };

  const isFormValid = activity !== null && wakeUp !== "" && bedtime !== "";

  // Auto-start voice if navigating from personal-info with voice active
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
      if (!s.bedtime || !s.wakeUp) setOrbSubtitle("Listening for sleep schedule...");
      else if (!s.activity) setOrbSubtitle("Listening for activity level...");
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
        
        if (!extracted.newBedtime || !extracted.newWakeUp) {
          setOrbSubtitle("What are your usual sleep and wake times?");
          voiceService.speak("I didn't get your full schedule. What time do you usually sleep and wake up?", { onDone: () => handleStartListening() });
        } else if (!extracted.newActivity) {
          setOrbSubtitle("How active are you during the week?");
          voiceService.speak("Got your sleep schedule. Now, how active are you? Sedentary, light, moderate, or highly active?", { onDone: () => handleStartListening() });
        } else if (!extracted.isConfirmed) {
          setOrbSubtitle("Are these details correct?");
          voiceService.speak(`I have your bedtime at ${extracted.newBedtime}, wake up at ${extracted.newWakeUp}, and activity level as ${extracted.newActivity}. Is this correct, or would you like to change something?`, { onDone: () => handleStartListening() });
        } else {
          setOrbSubtitle("Perfect! Navigating...");
          voiceService.speak("Perfect, let's move on to your goals.", {
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
      let newBedtime = s.bedtime;
      let newWakeUp = s.wakeUp;
      let newActivity = s.activity;
      let isConfirmed = s.isConfirmed;

      const prompt = `You are an AI extracting data from a user's speech. 
The user is providing their sleep schedule and activity level.
Current details: Bedtime: ${s.bedtime}, Wake Up: ${s.wakeUp}, Activity: ${s.activity}.
Analyze the user's spoken text and return ONLY a valid JSON object.
Fields to extract:
- bedtime (string: user's bedtime. Empty string if not mentioned or if they are just confirming)
- wakeUp (string: user's wake up time. Empty string if not mentioned or if they are just confirming)
- activity (string: must be EXACTLY ONE of "sedentary", "light", "moderate", or "active". Empty string if not mentioned or if they are just confirming)
- isConfirmed (boolean: true if the user's text implies agreement, approval, or says 'correct', 'yes', 'looks good', 'no changes'. false if they are correcting a mistake, providing new data, or disagreeing.)
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

      const isValidString = (val: any) => typeof val === "string" && val.trim().length > 0 && val.toLowerCase() !== "null" && val.toLowerCase() !== "none";

      if (isValidString(parsed.bedtime)) { newBedtime = parsed.bedtime; setBedtime(newBedtime); s.bedtime = newBedtime; }
      if (isValidString(parsed.wakeUp)) { newWakeUp = parsed.wakeUp; setWakeUp(newWakeUp); s.wakeUp = newWakeUp; }
      if (isValidString(parsed.activity)) { newActivity = parsed.activity.toLowerCase(); setActivity(newActivity); s.activity = newActivity; }
      
      const confirmStr = String(parsed.isConfirmed).toLowerCase().trim();
      if (confirmStr === 'true') { isConfirmed = true; s.isConfirmed = true; } 
      else if (confirmStr === 'false') { isConfirmed = false; s.isConfirmed = false; }

      return { newBedtime, newWakeUp, newActivity, isConfirmed };
    } catch (e) {
      console.error("AI extraction error", e);
      const s = stateRef.current;
      return { newBedtime: s.bedtime, newWakeUp: s.wakeUp, newActivity: s.activity, isConfirmed: s.isConfirmed };
    }
  };

  const handleOrbTap = async () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setOrbState("speaking");
      setOrbSubtitle("What are your sleep times?");
      voiceService.speak("Great. Now, what time do you usually go to bed and wake up?", {
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
            index="02"
            label="LIFESTYLE"
            title="Your daily rhythm."
            subtitle="Help us understand your typical schedule."
          />
          <TouchableOpacity style={styles.aiTriggerButton} onPress={openOrb}>
            <Microphone size={24} color={colors.white} weight="fill" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <Input
            label="Wake-up Time"
            placeholder="07:00"
            value={wakeUp}
            onChangeText={setWakeUp}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Bedtime"
            placeholder="23:00"
            value={bedtime}
            onChangeText={setBedtime}
            containerStyle={styles.halfInput}
          />
        </View>

        <Text style={[textStyles.bodyMedium, styles.activityLabel]}>Activity Level</Text>
        <View style={styles.activityOptions}>
          {activities.map((item) => {
            const isSelected = activity === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => setActivity(item.id)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text style={[textStyles.bodySemiBold, isSelected && styles.optionTextSelected]}>
                  {item.label}
                </Text>
                <Text style={[textStyles.caption, isSelected && styles.optionTextSelected]}>
                  {item.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

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
    backgroundColor: colors.accentOlive,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accentOlive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  activityLabel: {
    fontSize: textStyles.bodySmall.fontSize,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  activityOptions: {
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.bgPaperAlt,
    ...borders.hairline,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  optionCardSelected: {
    backgroundColor: colors.accentOliveLight,
    borderColor: colors.accentOlive,
  },
  optionTextSelected: {
    color: colors.accentOlive,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
