import React, { useState, useRef, useEffect, useCallback } from "react";
import { StyleSheet } from "react-native";
import { voiceService } from "../../services/ai/voiceService";
import { aiOrchestrator } from "../../services/ai/orchestrator";
import { AIVoiceOrb } from "./AIVoiceOrb";

interface LiveAssistantOverlayProps {
  visible: boolean;
  onClose: () => void;
  onMessage?: (userText: string, aiText: string) => void;
}

export default function LiveAssistantOverlay({
  visible,
  onClose,
  onMessage,
}: LiveAssistantOverlayProps) {
  const [state, setState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [statusText, setStatusText] = useState("Tap to speak");
  const isClosingRef = useRef(false);
  const handleStopAndProcessRef = useRef<() => void>();

  const handleStartListening = useCallback(async () => {
    try {
      setState("listening");
      setStatusText("Listening...");
      await voiceService.startRecording({
        onLiveTranscript: (text) => setStatusText(`"${text}"`),
        onSilence: () => {
          if (handleStopAndProcessRef.current) {
            handleStopAndProcessRef.current();
          }
        }
      });
    } catch (err: any) {
      setStatusText(err.message || "Mic error");
      setState("idle");
    }
  }, []);

  const handleStopAndProcess = useCallback(async () => {
    if (isClosingRef.current) return;

    try {
      setState("processing");
      setStatusText("Thinking...");

      const uri = await voiceService.stopRecording();
      if (!uri) {
        setState("idle");
        setStatusText("No audio recorded");
        return;
      }

      const transcribedText = await voiceService.transcribe(uri);
      if (!transcribedText || transcribedText.length === 0) {
        setState("idle");
        setStatusText("Couldn't understand. Tap to try again.");
        return;
      }

      setStatusText(`"${transcribedText}"`);

      const aiResponse = await aiOrchestrator.sendMessage(
        transcribedText,
        (progress) => setStatusText(progress)
      );

      onMessage?.(transcribedText, aiResponse);

      if (!isClosingRef.current) {
        setState("speaking");
        setStatusText(aiResponse.substring(0, 50) + (aiResponse.length > 50 ? "..." : ""));
        await voiceService.speak(aiResponse, {
          onDone: () => {
            if (!isClosingRef.current) {
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
  }, [onMessage, handleStartListening]);

  useEffect(() => {
    handleStopAndProcessRef.current = handleStopAndProcess;
  }, [handleStopAndProcess]);

  useEffect(() => {
    if (visible) {
      isClosingRef.current = false;
      handleStartListening();
    }
  }, [visible, handleStartListening]);

  const handleClose = useCallback(() => {
    isClosingRef.current = true;
    voiceService.stopSpeaking();
    voiceService.stopRecording().catch(() => {});
    setState("idle");
    setStatusText("Tap to speak");
    onClose();
  }, [onClose]);

  const handleTap = useCallback(() => {
    if (state === "listening") {
      handleStopAndProcess();
    } else if (state === "idle") {
      handleStartListening();
    } else if (state === "speaking") {
      voiceService.stopSpeaking();
      handleStartListening();
    }
  }, [state, handleStopAndProcess, handleStartListening]);

  return (
    <AIVoiceOrb
      isVisible={visible}
      state={state}
      onTap={handleTap}
      onClose={handleClose}
      text={statusText}
    />
  );
}
