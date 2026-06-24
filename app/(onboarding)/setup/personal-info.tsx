import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../../src/components/ui/ScreenWrapper";
import { SectionHeader } from "../../../src/components/shared/SectionHeader";
import { Input } from "../../../src/components/ui/Input";
import { Button } from "../../../src/components/ui/Button";
import { spacing, colors } from "../../../src/theme/tokens";
import { useAuthStore } from "../../../src/stores/authStore";
import { Microphone } from "phosphor-react-native";
import { voiceService } from "../../../src/services/ai/voiceService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIVoiceOrb } from "../../../src/components/assistant/AIVoiceOrb";

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { updateProfile } = useAuthStore();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [workoutFrequency, setWorkoutFrequency] = useState("");
  const [energyLevel, setEnergyLevel] = useState("");

  const [isOrbVisible, setIsOrbVisible] = useState(false);
  const [orbState, setOrbState] = useState<"idle" | "listening" | "processing" | "speaking">("speaking");
  const [orbSubtitle, setOrbSubtitle] = useState("");

  // Track if the orb is actively open to prevent rogue mic starts
  const isOrbActiveRef = useRef(false);

  // Track live text to instantly pass to Llama-3 without needing Whisper API again
  const liveTranscriptRef = useRef("");

  // Refs for state values to avoid React stale closure bugs inside async voice callbacks
  const stateRef = useRef({
    name: "", age: "", height: "", weight: "", isConfirmed: false
  });

  // Sync manual inputs to ref
  useEffect(() => {
    stateRef.current = { name, age, height, weight, isConfirmed: stateRef.current.isConfirmed };
  }, [name, age, height, weight]);

  const handleNext = async () => {
    await updateProfile({
      name,
      age: parseInt(age, 10) || 0,
      height: parseInt(height, 10) || 0,
      weight: parseInt(weight, 10) || 0,
    });
    router.push({ pathname: "/(onboarding)/setup/lifestyle", params: { autoVoice: "true" } });
  };

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

      // Contextual listening prompt using ref to avoid stale state
      const s = stateRef.current;
      if (!s.name) setOrbSubtitle("Listening for your name...");
      else if (!s.age) setOrbSubtitle("Listening for your age...");
      else if (!s.height) setOrbSubtitle("Listening for your height...");
      else if (!s.weight) setOrbSubtitle("Listening for your weight...");
      else if (!s.isConfirmed) setOrbSubtitle("Waiting for confirmation...");
    } catch (e) {
      console.error("Failed to start recording:", e);
      if (isOrbActiveRef.current) setOrbState("idle");
    }
  };

  const hasStartedRef = useRef(false);

  const handleOrbTap = async () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setOrbState("speaking");
      setOrbSubtitle("Hello! What should I call you?");
      voiceService.speak("Hello! I am Aurora, your personal health companion. To get started, what should I call you?", {
        rate: 0.95,
        onDone: () => {
          handleStartListening();
        }
      });
      return;
    }

    if (orbState === "listening") {
      await stopAndProcess();
    } else {
      await handleStartListening();
    }
  };

  useEffect(() => {
    isOrbActiveRef.current = true;
    setIsOrbVisible(true);
    setOrbState("idle");
    setOrbSubtitle("Tap me to start");

    return () => {
      isOrbActiveRef.current = false;
      voiceService.stopSpeaking();
      if (voiceService.getIsRecording()) voiceService.stopRecording();
    };
  }, []);

  const isProcessingRef = useRef(false);

  const handleAiExtract = async (text: string) => {
    try {
      const s = stateRef.current;
      let newName = s.name;
      let newAge = s.age;
      let newHeight = s.height;
      let newWeight = s.weight;
      let isConfirmed = s.isConfirmed;

      const prompt = `You are an AI extracting data from a user's speech. 
The user is currently being asked to confirm if their details are correct.
Current details: Name: ${s.name}, Age: ${s.age}, Height: ${s.height}, Weight: ${s.weight}.
Analyze the user's spoken text and return ONLY a valid JSON object.
Fields to extract:
- name (string: new name if they want to change it. Empty string if no change.)
- age (string: new age if they want to change it. Empty string if no change.)
- height (string: new height if they want to change it. Empty string if no change.)
- weight (string: new weight if they want to change it. Empty string if no change.)
- isConfirmed (boolean: true if the user's text implies agreement, approval, or says 'correct', 'yes', 'looks good', 'no changes'. false if they are correcting a mistake or disagreeing.)
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

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Groq API extraction failed:", res.status, errorText);
        throw new Error("Groq API extraction failed");
      }

      const data = await res.json();
      const content = data.choices[0].message.content.trim();

      // Extract just the JSON object from the response (handles conversational prefix/suffix text)
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("No JSON object found in response: " + content);
      }
      const cleaned = content.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(cleaned);

      if (parsed.name) { newName = parsed.name; setName(newName); s.name = newName; }
      if (parsed.age) { newAge = String(parsed.age).replace(/[^0-9]/g, ''); setAge(newAge); s.age = newAge; }
      if (parsed.height) { newHeight = String(parsed.height).replace(/[^0-9]/g, ''); setHeight(newHeight); s.height = newHeight; }
      if (parsed.weight) { newWeight = String(parsed.weight).replace(/[^0-9]/g, ''); setWeight(newWeight); s.weight = newWeight; }
      
      const confirmStr = String(parsed.isConfirmed).toLowerCase().trim();
      if (confirmStr === 'true') { isConfirmed = true; s.isConfirmed = true; } 
      else if (confirmStr === 'false') { isConfirmed = false; s.isConfirmed = false; }

      return { newName, newAge, newHeight, newWeight, isConfirmed };
    } catch (e) {
      console.error("AI extraction error", e);
      const s = stateRef.current;
      return { newName: s.name, newAge: s.age, newHeight: s.height, newWeight: s.weight, isConfirmed: s.isConfirmed };
    }
  };

  const stopAndProcess = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    setOrbState("processing");
    setOrbSubtitle("Analyzing...");

    try {
      const uri = await voiceService.stopRecording();
      
      const transcribedText = liveTranscriptRef.current.trim();
      
      if (transcribedText.length > 0) {
        const extracted = await handleAiExtract(transcribedText);
        setOrbState("speaking");

          // Determine next conversational step based on missing data
          if (!extracted.newName) {
            setOrbSubtitle("What should I call you?");
            voiceService.speak("I didn't quite catch your name. What should I call you?", { onDone: () => handleStartListening() });
          } else if (!extracted.newAge) {
            setOrbSubtitle(`Nice to meet you, ${extracted.newName}. How old are you?`);
            voiceService.speak(`Nice to meet you, ${extracted.newName}. How old are you?`, { onDone: () => handleStartListening() });
          } else if (!extracted.newHeight) {
            setOrbSubtitle("Got it. What is your height in cm?");
            voiceService.speak("Got it. What is your height in centimeters?", { onDone: () => handleStartListening() });
          } else if (!extracted.newWeight) {
            setOrbSubtitle("Almost done. What is your weight in kg?");
            voiceService.speak("What is your weight in kilograms?", { onDone: () => handleStartListening() });
          } else if (!extracted.isConfirmed) {
            setOrbSubtitle("Are these details correct?");
            voiceService.speak(`I have your name as ${extracted.newName}, age ${extracted.newAge}, height ${extracted.newHeight} centimeters, and weight ${extracted.newWeight} kilograms. Is this correct, or would you like to change something?`, { onDone: () => handleStartListening() });
          } else {
            setOrbSubtitle("Perfect! Navigating...");
            voiceService.speak("Perfect, let's move on to your lifestyle.", {
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
      voiceService.speak("Sorry, I had trouble processing your voice.", {
        onDone: () => handleStartListening()
      });
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleCloseOrb = () => {
    isOrbActiveRef.current = false;
    voiceService.stopSpeaking();
    if (orbState === "listening" || voiceService.getIsRecording()) {
      voiceService.stopRecording();
    }
    setIsOrbVisible(false);
  };

  const openOrb = () => {
    isOrbActiveRef.current = true;
    setIsOrbVisible(true);
    setOrbState("idle");
    setOrbSubtitle("Tap to start speaking");
  };
  const isFormValid = name.length > 0 && age.length > 0;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <SectionHeader
            index="01"
            label="ABOUT YOU"
            title="Let's get to know you."
            subtitle="Aurora uses this to personalize your insights."
          />
          <TouchableOpacity style={styles.aiTriggerButton} onPress={openOrb}>
            <Microphone size={24} color={colors.white} weight="fill" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Input
          label="What should we call you?"
          placeholder="First name"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Age"
          placeholder="Years"
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
        />

        <View style={styles.row}>
          <Input
            label="Height"
            placeholder="cm"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
            containerStyle={styles.halfInput}
          />
          <Input
            label="Weight"
            placeholder="kg"
            value={weight}
            onChangeText={setWeight}
            keyboardType="number-pad"
            containerStyle={styles.halfInput}
          />
        </View>

        <View style={styles.row}>
          <Input
            label="Sleep Time"
            placeholder="11:00 PM"
            value={sleepTime}
            onChangeText={setSleepTime}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Wake Time"
            placeholder="7:00 AM"
            value={wakeTime}
            onChangeText={setWakeTime}
            containerStyle={styles.halfInput}
          />
        </View>

        <View style={styles.row}>
          <Input
            label="Workout Freq."
            placeholder="Daily/Weekly..."
            value={workoutFrequency}
            onChangeText={setWorkoutFrequency}
            containerStyle={styles.halfInput}
          />
          <Input
            label="Energy Level"
            placeholder="Low/Moderate/High"
            value={energyLevel}
            onChangeText={setEnergyLevel}
            containerStyle={styles.halfInput}
          />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  aiTriggerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  form: {
    paddingBottom: spacing.xxl,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
});
