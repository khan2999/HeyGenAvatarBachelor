// ============================================================
// lib/speechRecognition.ts — Web Speech API Utilities
// ============================================================

/**
 * Checks whether the Web Speech API is available in the current browser.
 * Safari and older browsers may not support it.
 */
export function isSpeechRecognitionSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

/**
 * Returns the SpeechRecognition constructor, handling vendor prefixes.
 * Returns null in environments where it's not available (SSR, unsupported browsers).
 */
export function getSpeechRecognitionClass():
  | typeof SpeechRecognition
  | null {
  if (typeof window === "undefined") return null;

  return (
    (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
    (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ||
    null
  );
}

/**
 * Configuration options for a speech recognition session.
 */
export interface SpeechRecognitionOptions {
  /** BCP-47 language tag, e.g. "en-US". Defaults to "en-US". */
  language?: string;
  /** Whether to use continuous mode (keeps mic open). Default: false */
  continuous?: boolean;
  /** Called each time a final transcript is ready */
  onResult: (transcript: string, confidence: number) => void;
  /** Called with interim (partial) results while speaking */
  onInterimResult?: (transcript: string) => void;
  /** Called when recognition ends (user stopped or silence timeout) */
  onEnd?: () => void;
  /** Called if an error occurs during recognition */
  onError?: (error: string) => void;
}

/**
 * Creates a configured SpeechRecognition instance.
 * Returns null if the API is not supported.
 *
 * Usage:
 *   const rec = createSpeechRecognition({ onResult: (t) => console.log(t) });
 *   rec?.start();
 *   // later:
 *   rec?.stop();
 */
export function createSpeechRecognition(
  options: SpeechRecognitionOptions
): SpeechRecognition | null {
  const SpeechRecognitionClass = getSpeechRecognitionClass();
  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();

  // Core settings
  recognition.lang = options.language || "en-US";
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = !!options.onInterimResult;
  recognition.maxAlternatives = 1;

  // ---- Event Handlers ----

  recognition.onresult = (event: SpeechRecognitionEvent) => {
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

    if (finalTranscript && options.onResult) {
      options.onResult(finalTranscript.trim(), finalConfidence);
    }

    if (interimTranscript && options.onInterimResult) {
      options.onInterimResult(interimTranscript.trim());
    }
  };

  recognition.onend = () => {
    options.onEnd?.();
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    // Map Web Speech API error codes to human-readable messages
    const errorMessages: Record<string, string> = {
      "not-allowed": "Microphone access denied. Please allow microphone permission.",
      "no-speech": "No speech detected. Please try again.",
      "network": "Network error during speech recognition.",
      "audio-capture": "Could not capture audio from your microphone.",
      "aborted": "Speech recognition was aborted.",
      "service-not-allowed": "Speech recognition service not allowed.",
    };

    const message = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
    options.onError?.(message);
  };

  return recognition;
}
