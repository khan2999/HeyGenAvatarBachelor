// ============================================================
// types/index.ts — Shared TypeScript Interfaces & Types
// ============================================================

/**
 * Represents a single chat message in the conversation history.
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** Whether this message caused an error when processing */
  error?: boolean;
}

/**
 * The current application status, driving UI state.
 */
export type AppStatus =
  | "idle"          // Default state, session not started
  | "initializing"  // Starting HeyGen avatar session
  | "ready"         // Avatar is ready, waiting for user input
  | "listening"     // Microphone is active, capturing speech
  | "thinking"      // Waiting for OpenAI response
  | "speaking"      // Avatar is speaking the AI response
  | "error";        // An unrecoverable error occurred

/**
 * HeyGen session token response from /api/heygen-token
 */
export interface HeyGenTokenResponse {
  token: string;
  error?: string;
}

/**
 * Request body for the /api/chat endpoint
 */
export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

/**
 * Response from the /api/chat endpoint
 */
export interface ChatResponse {
  reply: string;
  error?: string;
}

/**
 * Speech recognition result from the Web Speech API
 */
export interface SpeechResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

/**
 * Configuration for the HeyGen avatar
 */
export interface AvatarConfig {
  avatarId: string;
  quality: "low" | "medium" | "high";
  language?: string;
}

/**
 * Represents the WebRTC connection state
 */
export type ConnectionState = "disconnected" | "connecting" | "connected" | "failed";
