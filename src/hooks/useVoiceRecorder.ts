import { useState, useCallback, useRef } from "react";
import { voiceService } from "../services/ai/voiceService";

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  transcribedText: string | null;
  error: string | null;
  startRecording: () => Promise<void>;
  stopAndTranscribe: () => Promise<string | null>;
  clearTranscription: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef(false);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscribedText(null);
      await voiceService.startRecording();
      setIsRecording(true);
      recordingRef.current = true;
    } catch (err: any) {
      setError(err.message || "Failed to start recording");
      setIsRecording(false);
      recordingRef.current = false;
    }
  }, []);

  const stopAndTranscribe = useCallback(async (): Promise<string | null> => {
    if (!recordingRef.current) return null;

    try {
      setIsRecording(false);
      recordingRef.current = false;

      const uri = await voiceService.stopRecording();
      if (!uri) {
        setError("No recording found");
        return null;
      }

      setIsTranscribing(true);
      const text = await voiceService.transcribe(uri);
      setTranscribedText(text);
      setIsTranscribing(false);
      return text;
    } catch (err: any) {
      setError(err.message || "Failed to transcribe");
      setIsTranscribing(false);
      return null;
    }
  }, []);

  const clearTranscription = useCallback(() => {
    setTranscribedText(null);
    setError(null);
  }, []);

  return {
    isRecording,
    isTranscribing,
    transcribedText,
    error,
    startRecording,
    stopAndTranscribe,
    clearTranscription,
  };
}
