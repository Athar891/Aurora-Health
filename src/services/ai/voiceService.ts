import { Platform } from "react-native";
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
  private recorder: any = null; // Native recorder
  private isSpeaking = false;
  
  // Web specific recorder state
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private webBase64: string | null = null;

  private webSpeechRecognition: any = null;

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      // Web handles permissions intrinsically when getUserMedia is called.
      // We just ensure the API exists (fails if not localhost or HTTPS).
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        return true;
      }
      console.warn("navigator.mediaDevices is missing. Are you running on HTTPS or localhost?");
      return false;
    } else {
      const Audio = await loadAudio();
      const { granted } = await Audio.requestRecordingPermissionsAsync();
      return granted;
    }
  }

  /**
   * Start audio recording with optional Voice Activity Detection (VAD) and Live Transcripts
   */
  async startRecording(options?: { 
    onSilence?: () => void;
    onLiveTranscript?: (text: string) => void;
  }): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error("Microphone API unavailable or permission denied. Must use localhost or HTTPS.");
    }

    let silenceStart = Date.now();

    if (Platform.OS === 'web') {
      try {
        // This implicitly asks the user for permission the first time it is called.
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Some older browsers might require polyfills, but modern Chromium/WebKit handle this well.
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.webBase64 = null;

        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        // Live Captioning & Perfect VAD using Web Speech API
        if (options?.onLiveTranscript || options?.onSilence) {
           const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
           
           if (SpeechRecognition) {
              this.webSpeechRecognition = new SpeechRecognition();
              
              // By setting continuous to false, the browser uses its own highly-trained 
              // Voice Activity Detection to automatically stop when the user stops speaking.
              this.webSpeechRecognition.continuous = false; 
              this.webSpeechRecognition.interimResults = true;
              
              this.webSpeechRecognition.onresult = (event: any) => {
                 let interimTranscript = '';
                 for (let i = event.resultIndex; i < event.results.length; ++i) {
                     interimTranscript += event.results[i][0].transcript;
                 }
                 if (interimTranscript.trim() && options.onLiveTranscript) {
                    options.onLiveTranscript(interimTranscript);
                 }
              };
              
              this.webSpeechRecognition.onend = () => {
                 console.log("Browser VAD detected end of speech.");
                 if (options.onSilence) options.onSilence();
              };
              
              this.webSpeechRecognition.onerror = (e: any) => {
                 console.warn("Speech recognition error:", e.error);
                 // If it errors due to no-speech, onend will still fire and handle the stop.
              };
              
              this.webSpeechRecognition.start();
           } else if (options?.onSilence) {
              // Fallback VAD for browsers without SpeechRecognition
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              const source = audioContext.createMediaStreamSource(stream);
              const analyser = audioContext.createAnalyser();
              analyser.fftSize = 512;
              source.connect(analyser);
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              
              const checkSilence = () => {
                if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') return;
                analyser.getByteTimeDomainData(dataArray);
                let min = 255; let max = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  if (dataArray[i] < min) min = dataArray[i];
                  if (dataArray[i] > max) max = dataArray[i];
                }
                const p2p = max - min;
                
                // Using a very high threshold (30) to bypass aggressive laptop static
                if (p2p > 30) silenceStart = Date.now();
                else if (Date.now() - silenceStart > 2000) { 
                   options.onSilence!();
                   return;
                }
                requestAnimationFrame(checkSilence);
              };
              checkSilence();
           }
        }

        this.mediaRecorder.start();
      } catch (err: any) {
        console.error("Browser mic error:", err);
        throw new Error(`Browser microphone access denied: ${err.message}`);
      }
    } else {
      const Audio = await loadAudio();

      if (!this.recorder) {
        this.recorder = new Audio.Recording();
      }

      // Voice Activity Detection for Native
      if (options?.onSilence) {
         // Enable metering
         await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: true });
         
         this.recorder.setOnRecordingStatusUpdate((status: any) => {
             if (status.isRecording && status.metering !== undefined) {
                 // Native metering usually ranges from -160dB (silence) to 0dB (loud)
                 if (status.metering > -40) { 
                     silenceStart = Date.now();
                 } else if (Date.now() - silenceStart > 1800) {
                     options.onSilence();
                     // Clear callback to prevent multiple triggers
                     this.recorder.setOnRecordingStatusUpdate(null);
                 }
             }
         });
      }

      await this.recorder.prepareToRecordAsync();
      this.recorder.record();
    }
  }

  /**
   * Stop recording and return the URI of the recorded file
   */
  async stopRecording(): Promise<string | null> {
    if (this.webSpeechRecognition) {
       try { this.webSpeechRecognition.stop(); } catch(e) {}
       this.webSpeechRecognition = null;
    }

    if (Platform.OS === 'web') {
      if (!this.mediaRecorder) return null;

      return new Promise((resolve) => {
        this.mediaRecorder!.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            // The result includes "data:audio/webm;base64,..."
            // We just need the base64 part for Gemini
            this.webBase64 = base64data.split(',')[1];
            resolve("web-audio-base64");
          };
          
          // Stop all tracks to release mic
          this.mediaRecorder!.stream.getTracks().forEach(track => track.stop());
          this.mediaRecorder = null;
        };
        this.mediaRecorder!.stop();
      });
    } else {
      if (!this.recorder) return null;

      await this.recorder.stop();
      const uri = this.recorder.uri;
      
      // Clear recorder instance so a new one is created next time
      this.recorder = null;
      
      return uri;
    }
  }

  /**
   * Transcribe audio file
   * Exclusively routes to Whisper API (Groq)
   */
  async transcribe(audioUri: string): Promise<string> {
    const whisperKey = process.env.EXPO_PUBLIC_WHISPER_API_KEY;
    
    if (!whisperKey) {
       throw new Error("No Groq/Whisper API Key found in .env. Please add EXPO_PUBLIC_WHISPER_API_KEY.");
    }
    
    return this.transcribeWithWhisper(audioUri, whisperKey);
  }

  /**
   * Transcription using Open-Source Whisper via API (Groq/OpenAI compatible)
   */
  private async transcribeWithWhisper(audioUri: string, apiKey: string): Promise<string> {
    // Defaults to Groq's API which hosts the open-source Whisper-large-v3 model
    const apiUrl = process.env.EXPO_PUBLIC_WHISPER_API_URL || "https://api.groq.com/openai/v1/audio/transcriptions";
    const modelId = process.env.EXPO_PUBLIC_WHISPER_MODEL || "whisper-large-v3-turbo";

    const formData = new FormData();

    if (Platform.OS === 'web' && audioUri === "web-audio-base64") {
      // Convert base64 string back to a Blob for multipart/form-data upload
      const res = await fetch(`data:audio/webm;base64,${this.webBase64}`);
      const blob = await res.blob();
      formData.append("file", blob, "audio.webm");
    } else {
      // Native File upload via FormData
      formData.append("file", {
        uri: audioUri,
        name: "recording.m4a",
        type: "audio/mp4"
      } as any);
    }

    formData.append("model", modelId);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Whisper API Error:", errorText);
      throw new Error("Failed to transcribe via Whisper API.");
    }

    const data = await response.json();
    return data.text.trim();
  }

  // For Web Audio playback of TTS
  private currentWebAudio: HTMLAudioElement | null = null;

  /**
   * Use Hugging Face Free API with an open-source model
   */
  private async speakWithHuggingFace(text: string, token: string, onDone?: () => void): Promise<void> {
    const model = "facebook/mms-tts-eng";
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HF Error (${response.status}): ${errText}`);
    }

    const blob = await response.blob();

    if (Platform.OS === 'web') {
      const url = URL.createObjectURL(blob);
      this.currentWebAudio = new window.Audio(url);
      
      this.currentWebAudio.onended = () => {
        this.isSpeaking = false;
        if (onDone) onDone();
      };
      
      this.currentWebAudio.onerror = () => {
        this.isSpeaking = false;
        if (onDone) onDone();
      };

      await this.currentWebAudio.play();
    } else {
      console.warn("Open source API TTS playback only implemented for Web preview currently.");
      this.isSpeaking = false;
      if (onDone) onDone();
    }
  }

  /**
   * Speak text using default system voice to guarantee speed and consistency.
   */
  async speak(
    text: string,
    options?: { rate?: number; onDone?: () => void }
  ): Promise<void> {
    this.stopSpeaking();
    this.isSpeaking = true;

    return new Promise<void>(async (resolve) => {
      let premiumVoice;
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        // Filter English voices
        let enVoices = voices.filter(v => v.language.startsWith("en"));
        // Sort alphabetically to guarantee consistency (no switching)
        enVoices.sort((a, b) => a.name.localeCompare(b.name));
        
        premiumVoice = enVoices.find(v => 
          v.name.includes("Samantha") || 
          v.name.includes("Aria") || 
          v.name.includes("Siri Female") ||
          v.name.includes("Zira") || // Windows female
          v.name.includes("Google US English") // Often default female on Android
        )?.identifier;
      } catch(e) {}

      Speech.speak(text, {
        language: "en-US",
        rate: options?.rate ?? 0.95,
        pitch: 1.0,
        voice: premiumVoice,
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
      if (this.currentWebAudio) {
        this.currentWebAudio.pause();
        this.currentWebAudio.currentTime = 0;
        this.currentWebAudio = null;
      }
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
    if (Platform.OS === 'web') return this.mediaRecorder !== null;
    return this.recorder !== null;
  }
}

export const voiceService = new VoiceService();
