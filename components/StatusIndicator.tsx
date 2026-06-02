"use client";

// ============================================================
// components/StatusIndicator.tsx — App State Display
// ============================================================

import React from "react";
import type { AppStatus } from "@/types";

interface StatusIndicatorProps {
  status: AppStatus;
  /** Optional error message to show in error state */
  errorMessage?: string;
}

// Maps each status to display configuration
const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; color: string; dotColor: string; pulse: boolean }
> = {
  idle: {
    label: "OFFLINE",
    color: "text-silver",
    dotColor: "bg-ghost",
    pulse: false,
  },
  initializing: {
    label: "INITIALIZING",
    color: "text-aurora",
    dotColor: "bg-aurora",
    pulse: true,
  },
  ready: {
    label: "READY",
    color: "text-sage",
    dotColor: "bg-sage",
    pulse: false,
  },
  listening: {
    label: "LISTENING",
    color: "text-pulse",
    dotColor: "bg-pulse",
    pulse: true,
  },
  thinking: {
    label: "THINKING",
    color: "text-aurora",
    dotColor: "bg-aurora",
    pulse: true,
  },
  speaking: {
    label: "SPEAKING",
    color: "text-sage",
    dotColor: "bg-sage",
    pulse: true,
  },
  error: {
    label: "ERROR",
    color: "text-pulse",
    dotColor: "bg-pulse",
    pulse: false,
  },
};

/**
 * Displays the current application status with an animated indicator dot.
 * Shows a compact badge with state-appropriate colors and animations.
 */
export default function StatusIndicator({
  status,
  errorMessage,
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Main status badge */}
      <div
        className={`
          status-badge border
          ${config.color}
          ${status === "error"
            ? "border-pulse/30 bg-pulse/10"
            : status === "ready" || status === "speaking"
            ? "border-sage/30 bg-sage/10"
            : status === "listening"
            ? "border-pulse/30 bg-pulse/10"
            : "border-aurora/30 bg-aurora/10"
          }
        `}
      >
        {/* Animated dot */}
        <span className="relative flex h-2 w-2">
          {config.pulse && (
            <span
              className={`
                absolute inline-flex h-full w-full rounded-full opacity-75
                ${config.dotColor}
              `}
              style={{ animation: "ping-ring 1.2s cubic-bezier(0, 0, 0.2, 1) infinite" }}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`}
          />
        </span>

        {/* Label */}
        <span className="font-mono">{config.label}</span>
      </div>

      {/* Error message tooltip */}
      {status === "error" && errorMessage && (
        <p className="text-xs text-pulse/70 font-mono max-w-[200px] text-right leading-tight animate-fade-in">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
