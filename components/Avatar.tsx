"use client";

// ============================================================
// components/Avatar.tsx — HeyGen Streaming Avatar Display
// ============================================================
// Renders the video feed from the HeyGen streaming avatar SDK.
// Handles loading state, error display, and the video element ref.
// ============================================================

import React from "react";
import type { AppStatus } from "@/types";

interface AvatarProps {
  /** Ref to the <video> element — passed to HeyGen SDK */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Current app status to drive visual states */
  status: AppStatus;
  /** Whether the avatar stream is currently active */
  isConnected: boolean;
}

/**
 * The Avatar component displays the HeyGen streaming video.
 *
 * States:
 * - idle/error: Shows decorative placeholder with orb animation
 * - initializing: Shows a loading shimmer
 * - ready/listening/thinking/speaking: Shows the live video
 */
export default function Avatar({ videoRef, status, isConnected }: AvatarProps) {
  const showVideo = isConnected && status !== "idle" && status !== "initializing" && status !== "error";
  const showLoader = status === "initializing";
  const showPlaceholder = !showVideo && !showLoader;

  return (
    <div
      id="avatar-video-container"
      className="relative w-full aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0C0C12 0%, #13131C 50%, #1A1A28 100%)",
      }}
    >
      {/* ---- Decorative background grid ---- */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ---- Vignette overlay (always visible) ---- */}
      <div
        className="absolute inset-0 z-10 pointer-events-none rounded-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(5,5,8,0.7) 100%)",
        }}
      />

      {/* ---- Live Video Feed ---- */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className={`
          absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-700
          ${showVideo ? "opacity-100" : "opacity-0"}
        `}
      />

      {/* ---- Loading Shimmer ---- */}
      {showLoader && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6">
          {/* Pulsing orb */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-32 h-32 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, var(--color-aurora) 0%, transparent 70%)",
                animation: "breathe-glow 2s ease-in-out infinite",
              }}
            />
            <div
              className="w-20 h-20 rounded-full border-2 border-aurora/40 flex items-center justify-center"
              style={{ animation: "breathe-glow 2s ease-in-out infinite 0.5s" }}
            >
              {/* SVG Spinner */}
              <svg
                className="w-10 h-10"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="rgba(0,212,255,0.2)"
                  strokeWidth="2"
                />
                <path
                  d="M20 4 A16 16 0 0 1 36 20"
                  stroke="#00D4FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              </svg>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p
              className="text-aurora font-display text-sm uppercase tracking-[0.3em]"
              style={{ animation: "breathe-glow 2s ease-in-out infinite" }}
            >
              Initializing Avatar
            </p>
            <p className="text-silver/50 font-mono text-xs">
              Establishing WebRTC connection…
            </p>
          </div>
        </div>
      )}

      {/* ---- Idle / Error Placeholder ---- */}
      {showPlaceholder && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8">
          {/* Decorative orb cluster */}
          <div className="relative w-48 h-48">
            {/* Outer ring */}
            <div
              className="absolute inset-0 rounded-full border border-aurora/10"
              style={{ animation: "breathe-glow 4s ease-in-out infinite" }}
            />
            {/* Mid ring */}
            <div
              className="absolute inset-6 rounded-full border border-aurora/15"
              style={{ animation: "breathe-glow 4s ease-in-out infinite 0.5s" }}
            />
            {/* Inner orb */}
            <div
              className="absolute inset-12 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,212,255,0.05) 60%, transparent 100%)",
                animation: "breathe-glow 3s ease-in-out infinite 1s",
              }}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full bg-aurora/60"
                style={{ animation: "breathe-glow 2s ease-in-out infinite" }}
              />
            </div>

            {/* Orbiting particles */}
            {[0, 120, 240].map((deg, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div
                  className="w-2 h-2 rounded-full bg-aurora/40"
                  style={{
                    transform: "translateX(70px)",
                    animation: `orbit ${3 + i * 0.7}s linear infinite`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Placeholder text */}
          <div className="text-center space-y-2">
            {status === "error" ? (
              <>
                <p className="text-pulse font-display text-lg uppercase tracking-[0.2em]">
                  Connection Failed
                </p>
                <p className="text-silver/60 font-body text-sm max-w-[200px]">
                  Check your API keys and try again
                </p>
              </>
            ) : (
              <>
                <p className="text-aurora/60 font-display text-lg uppercase tracking-[0.2em]">
                  AURA
                </p>
                <p className="text-silver/40 font-body text-sm max-w-[180px] leading-relaxed">
                  Start session to meet your AI avatar
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- Speaking indicator (bottom overlay when speaking) ---- */}
      {status === "speaking" && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30 flex justify-center pb-4 pointer-events-none"
          style={{ animation: "fade-in 0.3s ease-out" }}
        >
          <div className="glass-card px-4 py-2 flex items-center gap-3 rounded-full border-sage/30">
            {/* Waveform bars */}
            <div className="flex items-center gap-0.5 h-5">
              {[0.6, 1, 0.8, 1, 0.6].map((scale, i) => (
                <div
                  key={i}
                  className="wave-bar w-1"
                  style={{
                    height: `${14 * scale}px`,
                    animationDelay: `${i * 0.08}s`,
                    background: "var(--color-sage)",
                  }}
                />
              ))}
            </div>
            <span className="text-sage font-mono text-xs uppercase tracking-widest">
              Speaking
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
