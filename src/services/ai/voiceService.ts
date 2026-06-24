import * as Speech from "expo-speech";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Lazy-load expo-audio and expo-file-system to avoid crash if native module
// isn't compiled into the current dev build. These are only needed when
// the user actually triggers voice recording.
let AudioModule: typeof import("expo-audio") | null = null;
let FileSystem: typeof import("expo-file-system") | null = null;

async function loadAudio() {
  if (!AudioModule) {
    try {
      // Use synchronous require to catch the module initialization error
      const mod = require("expo-audio");
      if (!mod || !mod.AudioRecorder) {
        throw new Error("expo-audio module is missing or undefined");
      }
      AudioModule = mod;
    } catch (e) {
      console.warn("expo-audio not available — voice recording disabled", e);
      throw new Error(
        "Voice recording requires a native rebuild. Run: npx eas build"
      );
    }
  }
  return AudioModule!;
}

async function loadFileSystem() {
  if (!FileSystem) {
    try {
      FileSystem = await import("expo-file-system");
    } catch (e) {
      console.warn("expo-file-system not available", e);
      throw new Error("File system module unavailable");
    }
  }
  return FileSystem;
}

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export class VoiceService {
  private recorder: any = null;
  private isSpeaking = false;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    const Audio = await loadAudio();
    const { granted } = await Audio.requestRecordingPermissionsAsync();
    return granted;
  }

  /**
   * Start audio recording
   */
  async startRecording(): Promise<void> {
    const Audio = await loadAudio();

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error("Microphone permission not granted");
    }

    if (!this.recorder) {
      this.recorder = new Audio.AudioRecorder(Audio.RecordingPresets.HIGH_QUALITY);
    }

    await this.recorder.prepareToRecordAsync();
    this.recorder.record();
  }

  /**
   * Stop recording and return the URI of the recorded file
   */
  async stopRecording(): Promise<string | null> {
    if (!this.recorder) return null;

    await this.recorder.stop();
    const uri = this.recorder.uri;
    
    // Clear recorder instance so a new one is created next time
    this.recorder = null;
    
    return uri;
  }

  /**
   * Transcribe audio file using Gemini API
   */
  async transcribe(audioUri: string): Promise<string> {
    if (!apiKey) throw new Error("Gemini API key not configured");

    const FS = await loadFileSystem();

    // Read file as base64
    const base64Audio = await FS.readAsStringAsync(audioUri, {
      encoding: FS.EncodingType.Base64,
    });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "audio/mp4",
          data: base64Audio,
        },
      },
      {
        text: "Transcribe this audio to text. Return ONLY the transcribed text, nothing else. If the audio is unclear or empty, return an empty string.",
      },
    ]);

    const response = result.response;
    return response.text().trim();
  }

  /**
   * Speak text using expo-speech TTS
   */
  async speak(
    text: string,
    options?: { rate?: number; onDone?: () => void }
  ): Promise<void> {
    // Stop any ongoing speech
    this.stopSpeaking();

    this.isSpeaking = true;

    return new Promise<void>((resolve) => {
      Speech.speak(text, {
        language: "en-US",
        rate: options?.rate ?? 0.95,
        pitch: 1.0,
        onDone: () => {
          this.isSpeaking = false;
          options?.onDone?.();
          resolve();
        },
        onError: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  /**
   * Stop any ongoing TTS speech
   */
  stopSpeaking(): void {
    if (this.isSpeaking) {
      Speech.stop();
      this.isSpeaking = false;
    }
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.recorder !== null;
  }
}

export const voiceService = new VoiceService();
