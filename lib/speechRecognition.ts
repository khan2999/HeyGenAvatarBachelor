// ============================================================
// lib/speechRecognition.ts — Web Speech API Utilities
// ============================================================

type SpeechRecognitionType = any;
type SpeechRecognitionEventType = any;
type SpeechRecognitionErrorEventType = any;

/**
 * Checks whether the Web Speech API is available in the current browser.
 */
export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

/**
 * Returns the SpeechRecognition constructor.
 */
export function getSpeechRecognitionClass(): any | null {
  if (typeof window === "undefined") return null;

  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  onResult: (transcript: string, confidence: number) => void;
  onInterimResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export function createSpeechRecognition(
  options: SpeechRecognitionOptions
): SpeechRecognitionType | null {
  const SpeechRecognitionClass = getSpeechRecognitionClass();
  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();

  recognition.lang = options.language || "en-US";
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = !!options.onInterimResult;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEventType) => {
    let finalTranscript = "";
    let interimTranscript = "";
    let finalConfidence = 0;

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        finalTranscript += transcript;
        finalConfidence = confidence;
      } else {
        interimTranscript += transcript;
      }
    }

    if (finalTranscript) {
      options.onResult(finalTranscript.trim(), finalConfidence);
    }

    if (interimTranscript && options.onInterimResult) {
      options.onInterimResult(interimTranscript.trim());
    }
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  recognition.onerror = (event: SpeechRecognitionErrorEventType) => {
    const errorMessages: Record<string, string> = {
      "not-allowed": "Microphone access denied. Please allow microphone permission.",
      "no-speech": "No speech detected. Please try again.",
      "network": "Network error during speech recognition.",
      "audio-capture": "Could not capture audio from your microphone.",
      "aborted": "Speech recognition was aborted.",
      "service-not-allowed": "Speech recognition service not allowed.",
    };

    const message =
      errorMessages[event.error] || `Speech recognition error: ${event.error}`;

    options.onError?.(message);
  };

  return recognition;
}