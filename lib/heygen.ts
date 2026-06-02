import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from "@heygen/liveavatar-web-sdk";

export async function fetchLiveAvatarToken(): Promise<string> {
  const response = await fetch("/api/heygen-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Failed to fetch token");
  if (!data.token) throw new Error("No token returned");
  return data.token;
}

export async function createAvatarSession(): Promise<LiveAvatarSession> {
  const token = await fetchLiveAvatarToken();
  return new LiveAvatarSession(token);
}

export async function startAvatarStream(
  avatar: LiveAvatarSession,
  videoEl: HTMLVideoElement
): Promise<void> {
  // Listen for stream ready before attaching
  avatar.on(SessionEvent.SESSION_STREAM_READY, () => {
    console.log("[LiveAvatar] Stream ready, attaching to video element");
    avatar.attach(videoEl);
    videoEl.play().catch(console.warn);
  });

  await avatar.start();
}

export async function speakText(
  avatar: LiveAvatarSession,
  text: string
): Promise<void> {
  if (!text.trim()) return;
  avatar.repeat(text.trim());
}

export async function stopAvatarSession(avatar: LiveAvatarSession): Promise<void> {
  try { await avatar.stop(); } catch (e) { console.warn(e); }
}

export async function interruptAvatar(avatar: LiveAvatarSession): Promise<void> {
  try { avatar.interrupt(); } catch (e) { console.warn(e); }
}

export { LiveAvatarSession, SessionEvent, AgentEventsEnum };
