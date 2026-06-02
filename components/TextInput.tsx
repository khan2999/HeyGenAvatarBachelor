"use client";

// ============================================================
// components/TextInput.tsx — Keyboard Fallback Input
// ============================================================
// Provides a text input for users who cannot use microphone,
// or who prefer typing. Submits on Enter or button click.
// ============================================================

import React, { useState, useRef } from "react";
import type { AppStatus } from "@/types";

interface TextInputProps {
  status: AppStatus;
  onSubmit: (text: string) => void;
}

/**
 * Fallback text input component.
 * Submits the message when Enter is pressed or the send button is clicked.
 * Disabled during listening, thinking, or speaking states.
 */
export default function TextInput({ status, onSubmit }: TextInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisabled =
    status === "idle" ||
    status === "initializing" ||
    status === "listening" ||
    status === "thinking" ||
    status === "speaking" ||
    status === "error";

  const canSubmit = !isDisabled && value.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const text = value.trim();
    setValue("");
    onSubmit(text);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholders: Partial<Record<AppStatus, string>> = {
    idle: "Start a session first…",
    initializing: "Initializing avatar…",
    ready: "Type a message or use the mic…",
    listening: "Listening to your voice…",
    thinking: "Processing your message…",
    speaking: "Avatar is speaking…",
    error: "Session error — restart to continue",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Text input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder={placeholders[status] || "Type a message…"}
        maxLength={500}
        aria-label="Type a message to the avatar"
        className={`
          flex-1 bg-slate border rounded-xl px-4 py-3
          font-body text-sm text-ivory placeholder-silver/30
          transition-all duration-200 focus:outline-none
          ${isDisabled
            ? "opacity-40 cursor-not-allowed border-ghost/30"
            : "border-ghost/50 focus:border-aurora/50 focus:ring-1 focus:ring-aurora/30"
          }
        `}
      />

      {/* Send button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Send message"
        className={`
          flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
          transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora
          ${canSubmit
            ? "bg-aurora text-obsidian hover:bg-aurora/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-aurora/20 cursor-pointer"
            : "bg-ghost/30 text-ghost cursor-not-allowed opacity-40"
          }
        `}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </div>
  );
}
