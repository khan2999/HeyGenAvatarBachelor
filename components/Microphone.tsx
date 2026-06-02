"use client";

// ============================================================
// components/Microphone.tsx — Voice Input Button
// ============================================================
// A large, animated microphone button that starts/stops speech
// recognition. Shows visual feedback when recording.
// ============================================================

import React from "react";
import type { AppStatus } from "@/types";

interface MicrophoneProps {
  /** Whether the microphone is currently active */
  isListening: boolean;
  /** Whether the button should be disabled (e.g. during thinking/speaking) */
  disabled: boolean;
  /** Current app status — affects button appearance */
  status: AppStatus;
  /** Partial transcript shown while speaking */
  interimTranscript?: string;
  /** Callback when the button is toggled */
  onToggle: () => void;
}

/**
 * Animated microphone button for voice input.
 *
 * - Idle: Glowing aurora button with mic icon
 * - Listening: Pulsing red ring with animated waveform
 * - Disabled: Dimmed, not interactive
 */
export default function Microphone({
  isListening,
  disabled,
  status,
  interimTranscript,
  onToggle,
}: MicrophoneProps) {
  const isThinking = status === "thinking";
  const isSpeaking = status === "speaking";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* ---- Interim transcript display ---- */}
      <div className="h-8 flex items-center justify-center">
        {interimTranscript && (
          <p
            className="text-silver/70 font-body text-sm italic max-w-xs text-center truncate animate-fade-in"
          >
            &ldquo;{interimTranscript}&rdquo;
          </p>
        )}
        {isThinking && (
          <div className="flex items-center gap-2">
            <span className="text-aurora/60 font-mono text-xs uppercase tracking-widest">
              Processing
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-aurora/60"
                  style={{
                    animation: `breathe-glow 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        {isSpeaking && (
          <p className="text-sage/60 font-mono text-xs uppercase tracking-widest">
            Avatar is responding…
          </p>
        )}
      </div>

      {/* ---- Main microphone button ---- */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span
              className="absolute w-24 h-24 rounded-full bg-pulse/20"
              style={{
                animation: "ping-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite",
              }}
            />
            <span
              className="absolute w-28 h-28 rounded-full bg-pulse/10"
              style={{
                animation:
                  "ping-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.4s",
              }}
            />
          </>
        )}

        <button
          onClick={onToggle}
          disabled={disabled}
          aria-label={isListening ? "Stop recording" : "Start recording"}
          aria-pressed={isListening}
          className={`
            relative z-10 w-20 h-20 rounded-full flex items-center justify-center
            transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora
            ${disabled
              ? "opacity-40 cursor-not-allowed bg-ghost border border-ghost"
              : isListening
              ? "bg-pulse border-2 border-pulse pulse-glow scale-110 cursor-pointer"
              : "bg-transparent border-2 border-aurora/60 aurora-glow hover:border-aurora hover:scale-105 cursor-pointer"
            }
          `}
          style={
            !disabled && !isListening
              ? { animation: "glow-pulse 3s ease-in-out infinite" }
              : undefined
          }
        >
          {/* Mic icon or Stop icon */}
          {isListening ? (
            /* Stop icon */
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            /* Microphone icon */
            <svg
              className={`w-8 h-8 ${disabled ? "text-ghost" : "text-aurora"}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* ---- Button label ---- */}
      <p
        className={`
          font-mono text-xs uppercase tracking-widest transition-colors duration-200
          ${disabled
            ? "text-ghost"
            : isListening
            ? "text-pulse"
            : "text-silver"
          }
        `}
      >
        {disabled && isThinking
          ? "Thinking…"
          : disabled && isSpeaking
          ? "Wait…"
          : disabled
          ? "Unavailable"
          : isListening
          ? "Tap to stop"
          : "Tap to speak"}
      </p>
    </div>
  );
}
