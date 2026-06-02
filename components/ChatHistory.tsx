"use client";

// ============================================================
// components/ChatHistory.tsx — Conversation Message Display
// ============================================================

import React, { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types";

interface ChatHistoryProps {
  messages: ChatMessage[];
}

/**
 * Renders the full conversation history between the user and AURA.
 * Automatically scrolls to the latest message.
 * Shows timestamps and role indicators.
 */
export default function ChatHistory({ messages }: ChatHistoryProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
        <div className="w-8 h-8 rounded-full border border-ghost/50 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-ghost"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <p className="text-ghost font-mono text-xs uppercase tracking-widest">
          No messages yet
        </p>
        <p className="text-ghost/60 text-xs font-body">
          Start the session and speak to begin
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}

// -------------------------------------------------------
// MessageBubble — Individual message
// -------------------------------------------------------

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`
        flex flex-col gap-1 message-enter
        ${isUser ? "items-end" : "items-start"}
      `}
    >
      {/* Role label */}
      <div className="flex items-center gap-1.5 px-1">
        <span
          className={`
            font-mono text-[10px] uppercase tracking-widest
            ${isUser ? "text-aurora/60" : "text-sage/60"}
          `}
        >
          {isUser ? "YOU" : "AURA"}
        </span>
        <span className="text-ghost font-mono text-[10px]">{time}</span>
      </div>

      {/* Bubble */}
      <div
        className={`
          max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${isUser
            ? "rounded-tr-sm bg-aurora/10 border border-aurora/20 text-ivory"
            : "rounded-tl-sm bg-sage/10 border border-sage/20 text-ivory"
          }
          ${message.error
            ? "border-pulse/30 bg-pulse/10 text-pulse/80"
            : ""
          }
        `}
      >
        {message.content}
        {message.error && (
          <span className="block text-xs text-pulse/60 mt-1 font-mono">
            ⚠ Error processing message
          </span>
        )}
      </div>
    </div>
  );
}
