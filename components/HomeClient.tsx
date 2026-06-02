"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from "@heygen/liveavatar-web-sdk";
import ChatHistory from "@/components/ChatHistory";
import TextInput from "@/components/TextInput";
import { createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import type { AppStatus, ChatMessage } from "@/types";

type SpeechRecognition = any;

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const SESSION_DURATION = 90;
type Page = "language" | "disclosure" | "info" | "session" | "questionnaire";
type Lang = "en" | "de";

interface UserInfo {
  firstName: string;
  lastName: string;
  occupation: string;
  age: string;
  gender: string;
}

const TASKS = {
  en: [
    { id: 1, text: "Introduce yourself to AURA" },
    { id: 2, text: 'Ask: "What can you help me with?"' },
    { id: 3, text: 'Ask: "How do you feel about being an AI?"' },
    { id: 4, text: "Ask AURA about a topic you are curious about" },
    { id: 5, text: 'Ask: "What are your limitations?"' },
    { id: 6, text: "Have a free conversation about anything you like" },
  ],
  de: [
    { id: 1, text: "Stelle dich AURA vor" },
    { id: 2, text: 'Frage: „Wobei kannst du mir helfen?"' },
    { id: 3, text: 'Frage: „Wie fühlt es sich an, eine KI zu sein?"' },
    { id: 4, text: "Frage AURA zu einem Thema, das dich interessiert" },
    { id: 5, text: 'Frage: „Was sind deine Grenzen?"' },
    { id: 6, text: "Führe ein freies Gespräch über ein beliebiges Thema" },
  ],
};

const T = {
  en: {
    appSub: "Human-AI Avatar Interaction Study",
    disclosureTag: "Participant Information & Disclosure",
    disclosureTitle: "Before you begin, please read carefully",
    disclosureItems: [
      ["Purpose", "This study is conducted as part of a Bachelor thesis research project investigating human interaction with AI-based avatars."],
      ["How it works", "You will have a 90-second conversation with AURA, an AI avatar. You can speak using your microphone or type your messages."],
      ["Session duration", "Your session will automatically end after 90 seconds. After the session, you will be asked to fill out a short questionnaire."],
      ["Data & Privacy", "Data is used solely for academic research. No personal data will be shared with third parties. Participation is voluntary."],
      ["Microphone access", "This app requires microphone access for voice input. You may also type if preferred."],
    ],
    consentText: "I have read and understood the above information. I consent to participate in this study.",
    agreeBtn: "I Agree — Continue",
    step: "Step 1 of 3",
    infoTitle: "Your Information",
    infoSub: "This information is collected for research purposes only",
    firstName: "First Name", lastName: "Last Name",
    occupation: "Occupation / Field of Study", age: "Age", gender: "Gender",
    genderOptions: ["Male", "Female", "Non-binary", "Prefer not to say"],
    required: "Required", validAge: "Enter a valid age",
    continueBtn: "Continue to Session →",
    startSession: "Start Session", connecting: "Connecting…", retry: "Retry",
    timeRemaining: "Time remaining",
    listening: "Listening…", thinking: "Thinking…", speaking: "Speaking…", holdToSpeak: "Tap to speak",
    chatTitle: "Chatting with AURA", live: "Live", offline: "Offline",
    pressEnter: "Press Enter · Or use mic",
    tasksTitle: "Your Tasks", tasksSub: "Try to complete each task in 90 seconds",
    avatarGreeting: "Hello! I am AURA, your AI avatar. You have 90 seconds to chat with me. Feel free to speak or type!",
    qTitle: "Research Questionnaire",
    qSub: "Please answer all questions honestly. Your responses are anonymous.",
    qScale: "1 = Strongly Disagree · 2 = Disagree · 3 = Neutral · 4 = Agree · 5 = Strongly Agree",
    sections: [
      { title: "Section 2: First Impression", emoji: "👁", questions: ["The avatar looked visually realistic","The avatar's facial expressions appeared natural","The avatar's voice sounded human-like","The avatar's lip movements matched the speech","The avatar's overall appearance was appealing","I found the avatar professional-looking","The avatar made a positive first impression on me","The avatar seemed lifelike at first glance","The avatar's gestures felt natural","I felt curious to interact with the avatar"] },
      { title: "Section 3: Interaction Experience", emoji: "💬", questions: ["The interaction with the avatar was smooth","The avatar responded in a timely manner","The avatar's responses were clear and understandable","I felt comfortable during the interaction","The conversation felt engaging","The avatar maintained my attention","The interaction was easy to understand and use","I did not feel confused while interacting with the avatar","The avatar's communication style was appropriate","Overall, the interaction experience was satisfying"] },
      { title: "Section 4: Trust & Acceptance", emoji: "🤝", questions: ["I trust the information provided by the avatar","The avatar seemed reliable","I would use this avatar again in the future","I would recommend this system to others","I feel confident interacting with this avatar","The avatar behaved in a predictable way","I would rely on this avatar for simple tasks","I would accept this avatar in real-world applications","The avatar appeared credible","I would feel safe sharing basic information with the avatar"] },
      { title: "Section 5: Emotional Reaction", emoji: "😊", questions: ["I felt relaxed while interacting with the avatar","I felt comfortable speaking to the avatar","I felt awkward interacting with the avatar","I enjoyed the interaction","The avatar made me feel at ease","I felt engaged during the interaction","I felt bored during the interaction","The interaction felt natural to me","I felt confident communicating with the avatar","The avatar created a positive emotional experience"] },
    ],
    openSection: { title: "Section 6: Open Questions", emoji: "✍️", questions: ["What did you like most about the avatar?","What did you dislike or find unnatural?","What would you improve in this system?","In which situations would you use this avatar?","Any additional comments or suggestions?"] },
    submitBtn: "Submit Responses", submitting: "Submitting…",
    submitted: "Thank you! Your responses have been recorded.",
    saveError: "Could not save your responses — please notify the researcher.",
  },
  de: {
    appSub: "Studie zur Mensch-KI-Avatar-Interaktion",
    disclosureTag: "Teilnehmerinformation & Einwilligung",
    disclosureTitle: "Bitte lesen Sie folgendes sorgfältig durch",
    disclosureItems: [
      ["Zweck", "Diese Studie ist Teil einer Bachelorarbeit zur Interaktion zwischen Menschen und KI-basierten Avataren."],
      ["Ablauf", "Sie haben ein 90-sekündiges Gespräch mit AURA, einem KI-Avatar. Sie können sprechen oder tippen."],
      ["Sitzungsdauer", "Ihre Sitzung endet automatisch nach 90 Sekunden. Danach folgt ein kurzer Fragebogen."],
      ["Daten & Datenschutz", "Daten werden ausschließlich für akademische Forschung verwendet. Keine Weitergabe an Dritte. Freiwillig."],
      ["Mikrofonzugang", "Diese App benötigt Mikrofonzugang. Sie können auch tippen."],
    ],
    consentText: "Ich habe die obigen Informationen gelesen und erkläre mich mit der Teilnahme einverstanden.",
    agreeBtn: "Ich stimme zu — Weiter",
    step: "Schritt 1 von 3",
    infoTitle: "Ihre Angaben", infoSub: "Diese Informationen werden nur für Forschungszwecke erhoben",
    firstName: "Vorname", lastName: "Nachname",
    occupation: "Beruf / Studienrichtung", age: "Alter", gender: "Geschlecht",
    genderOptions: ["Männlich", "Weiblich", "Nicht-binär", "Keine Angabe"],
    required: "Pflichtfeld", validAge: "Bitte geben Sie ein gültiges Alter ein",
    continueBtn: "Weiter zur Sitzung →",
    startSession: "Sitzung starten", connecting: "Verbinde…", retry: "Erneut versuchen",
    timeRemaining: "Verbleibende Zeit",
    listening: "Zuhören…", thinking: "Verarbeite…", speaking: "Spricht…", holdToSpeak: "Tippen zum Sprechen",
    chatTitle: "Gespräch mit AURA", live: "Live", offline: "Offline",
    pressEnter: "Enter zum Senden · Oder Mikrofon",
    tasksTitle: "Ihre Aufgaben", tasksSub: "Versuchen Sie, jede Aufgabe in 90 Sekunden zu erledigen",
    avatarGreeting: "Hallo! Ich bin AURA, Ihr KI-Avatar. Sie haben 90 Sekunden. Sprechen oder tippen Sie!",
    qTitle: "Forschungsfragebogen",
    qSub: "Bitte beantworten Sie alle Fragen ehrlich. Ihre Antworten sind anonym.",
    qScale: "1 = Stimme nicht zu · 2 = Eher nicht · 3 = Neutral · 4 = Eher zu · 5 = Stimme voll zu",
    sections: [
      { title: "Abschnitt 2: Erster Eindruck", emoji: "👁", questions: ["Der Avatar wirkte visuell realistisch","Die Gesichtsausdrücke des Avatars wirkten natürlich","Die Stimme des Avatars klang menschlich","Die Lippenbewegungen passten zur Sprache","Das Erscheinungsbild des Avatars war ansprechend","Der Avatar wirkte professionell","Der Avatar hat einen positiven ersten Eindruck hinterlassen","Der Avatar wirkte auf den ersten Blick lebensecht","Die Gesten des Avatars wirkten natürlich","Ich war neugierig, mit dem Avatar zu interagieren"] },
      { title: "Abschnitt 3: Interaktionserlebnis", emoji: "💬", questions: ["Die Interaktion mit dem Avatar verlief reibungslos","Der Avatar reagierte schnell genug","Die Antworten des Avatars waren klar und verständlich","Ich fühlte mich während der Interaktion wohl","Das Gespräch war interessant und ansprechend","Der Avatar konnte meine Aufmerksamkeit halten","Die Interaktion war einfach zu verstehen und zu bedienen","Ich war während der Interaktion nicht verwirrt","Die Kommunikationsweise des Avatars war angemessen","Insgesamt war ich mit der Interaktion zufrieden"] },
      { title: "Abschnitt 4: Vertrauen & Akzeptanz", emoji: "🤝", questions: ["Ich vertraue den Informationen des Avatars","Der Avatar wirkte zuverlässig","Ich würde diesen Avatar in Zukunft wieder nutzen","Ich würde dieses System anderen empfehlen","Ich fühlte mich sicher im Umgang mit dem Avatar","Das Verhalten des Avatars war vorhersehbar","Ich würde mich bei einfachen Aufgaben auf den Avatar verlassen","Ich würde den Avatar in realen Anwendungen akzeptieren","Der Avatar wirkte glaubwürdig","Ich würde mich wohl fühlen, grundlegende Informationen mit dem Avatar zu teilen"] },
      { title: "Abschnitt 5: Emotionale Reaktion", emoji: "😊", questions: ["Ich fühlte mich während der Interaktion entspannt","Ich fühlte mich wohl, mit dem Avatar zu sprechen","Ich fühlte mich unwohl bei der Interaktion mit dem Avatar","Ich habe die Interaktion genossen","Der Avatar hat dazu beigetragen, dass ich mich wohl gefühlt habe","Ich war während der Interaktion engagiert","Ich habe mich während der Interaktion gelangweilt","Die Interaktion fühlte sich natürlich an","Ich fühlte mich sicher in der Kommunikation mit dem Avatar","Die Interaktion hat bei mir positive Gefühle ausgelöst"] },
    ],
    openSection: { title: "Abschnitt 6: Offene Fragen", emoji: "✍️", questions: ["Was hat Ihnen am Avatar am besten gefallen?","Was fanden Sie unnatürlich oder störend?","Was würden Sie an diesem System verbessern?","In welchen Situationen würden Sie einen solchen Avatar nutzen?","Haben Sie weitere Anmerkungen oder Vorschläge?"] },
    submitBtn: "Antworten einreichen", submitting: "Wird eingereicht…",
    submitted: "Danke! Ihre Antworten wurden gespeichert.",
    saveError: "Antworten konnten nicht gespeichert werden — bitte Forscher informieren.",
  },
};

async function saveToDatabase(payload: object): Promise<boolean> {
  try {
    const res = await fetch("/api/save-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    console.log("[AURA] Saved:", data);
    return res.ok;
  } catch (err) {
    console.error("[AURA] Save failed:", err);
    return false;
  }
}

function LanguagePage({ onSelect }: { onSelect: (lang: Lang) => void }) {
  return (
    <main className="min-h-screen bg-void flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-10 animate-fade-in text-center">
        <div className="space-y-3">
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(78,205,196,0.1))", border: "1px solid rgba(0,212,255,0.3)" }}>
              <div className="w-8 h-8 rounded-full bg-aurora" style={{ animation: "breathe-glow 3s ease-in-out infinite" }} />
            </div>
          </div>
          <h1 className="font-display text-5xl font-bold text-ivory uppercase tracking-[0.2em]">AURA</h1>
          <p className="font-mono text-xs text-silver/50 uppercase tracking-widest">Human-AI Avatar Interaction Study</p>
        </div>
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="space-y-1">
            <h2 className="font-display text-xl text-ivory">Choose Your Language</h2>
            <p className="font-mono text-xs text-silver/40 uppercase tracking-widest">Wählen Sie Ihre Sprache</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["en", "de"] as Lang[]).map((lang) => (
              <button key={lang} onClick={() => onSelect(lang)}
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-ghost/50 hover:border-aurora/50 hover:bg-aurora/5 transition-all duration-300">
                <span className="text-4xl">{lang === "en" ? "🇬🇧" : "🇩🇪"}</span>
                <span className="font-display font-semibold text-ivory text-sm uppercase tracking-widest group-hover:text-aurora transition-colors">
                  {lang === "en" ? "English" : "Deutsch"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-ghost/40 font-mono text-[10px] uppercase tracking-widest">Bachelor Thesis · Human-AI Avatar Interaction Study</p>
      </div>
    </main>
  );
}

function DisclosurePage({ lang, onNext }: { lang: Lang; onNext: () => void }) {
  const [agreed, setAgreed] = useState(false);
  const t = T[lang];
  return (
    <main className="min-h-screen bg-void flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(78,205,196,0.1))", border: "1px solid rgba(0,212,255,0.3)" }}>
              <div className="w-6 h-6 rounded-full bg-aurora" style={{ animation: "breathe-glow 3s ease-in-out infinite" }} />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-ivory uppercase tracking-[0.2em]">AURA</h1>
          <p className="font-mono text-xs text-silver/50 uppercase tracking-widest">{t.appSub}</p>
        </div>
        <div className="glass-card p-8 rounded-3xl space-y-6">
          <div className="space-y-1">
            <p className="font-mono text-xs text-aurora uppercase tracking-widest">{t.disclosureTag}</p>
            <h2 className="font-display text-xl text-ivory">{t.disclosureTitle}</h2>
          </div>
          <div className="space-y-4 text-silver/80 font-body text-sm leading-relaxed">
            {t.disclosureItems.map(([title, text], i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-aurora/10 border border-aurora/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-aurora text-xs font-bold">{i + 1}</span>
                </div>
                <p><span className="text-ivory font-medium">{title}:</span> {text}</p>
              </div>
            ))}
          </div>
          <div onClick={() => setAgreed(!agreed)}
            className="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200"
            style={{ borderColor: agreed ? "rgba(0,212,255,0.4)" : "rgba(58,58,88,0.6)", background: agreed ? "rgba(0,212,255,0.05)" : "transparent" }}>
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all duration-200 ${agreed ? "bg-aurora border-aurora" : "border-ghost"}`}>
              {agreed && <svg className="w-3 h-3 text-obsidian" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </div>
            <p className="text-sm text-silver/80 font-body leading-relaxed">{t.consentText}</p>
          </div>
          <button onClick={onNext} disabled={!agreed}
            className={`w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-widest transition-all duration-300 ${agreed ? "btn-primary" : "bg-ghost/20 text-ghost cursor-not-allowed"}`}>
            {t.agreeBtn}
          </button>
        </div>
        <p className="text-center text-ghost/40 font-mono text-[10px] uppercase tracking-widest">Bachelor Thesis · Human-AI Avatar Interaction Study</p>
      </div>
    </main>
  );
}

function InfoPage({ lang, onNext }: { lang: Lang; onNext: (info: UserInfo) => void }) {
  const t = T[lang];
  const [form, setForm] = useState<UserInfo>({ firstName: "", lastName: "", occupation: "", age: "", gender: "" });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  const validate = () => {
    const e: Partial<UserInfo> = {};
    if (!form.firstName.trim()) e.firstName = t.required;
    if (!form.lastName.trim()) e.lastName = t.required;
    if (!form.occupation.trim()) e.occupation = t.required;
    if (!form.age.trim() || isNaN(Number(form.age)) || Number(form.age) < 1) e.age = t.validAge;
    if (!form.gender) e.gender = t.required;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const field = (label: string, key: keyof UserInfo, placeholder: string, type = "text") => (
    <div className="space-y-1.5">
      <label className="font-mono text-xs text-silver/60 uppercase tracking-widest">{label}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
        className={`w-full bg-slate border rounded-xl px-4 py-3 font-body text-sm text-ivory placeholder-silver/30 focus:outline-none focus:ring-1 transition-all ${errors[key] ? "border-pulse/50 focus:border-pulse focus:ring-pulse/20" : "border-ghost/50 focus:border-aurora/50 focus:ring-aurora/20"}`} />
      {errors[key] && <p className="text-pulse text-xs font-mono">{errors[key]}</p>}
    </div>
  );

  return (
    <main className="min-h-screen bg-void flex items-center justify-center p-6">
      <div className="max-w-lg w-full space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <p className="font-mono text-xs text-aurora uppercase tracking-widest">{t.step}</p>
          <h2 className="font-display text-3xl font-bold text-ivory uppercase tracking-[0.15em]">{t.infoTitle}</h2>
          <p className="text-silver/60 font-body text-sm">{t.infoSub}</p>
        </div>
        <div className="flex justify-center gap-2">
          {[0,1,2].map((i) => <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === 0 ? "w-8 bg-aurora" : "w-4 bg-ghost"}`} />)}
        </div>
        <div className="glass-card p-8 rounded-3xl space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {field(t.firstName, "firstName", "Jane")}
            {field(t.lastName, "lastName", "Doe")}
          </div>
          {field(t.occupation, "occupation", lang === "en" ? "e.g. Computer Science Student" : "z.B. Informatikstudent/in")}
          {field(t.age, "age", "22", "number")}
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-silver/60 uppercase tracking-widest">{t.gender}</label>
            <div className="grid grid-cols-2 gap-2">
              {t.genderOptions.map((g) => (
                <div key={g} onClick={() => setForm({ ...form, gender: g })}
                  className={`px-4 py-3 rounded-xl border text-sm font-body cursor-pointer transition-all duration-200 text-center ${form.gender === g ? "border-aurora/50 bg-aurora/10 text-aurora" : "border-ghost/50 text-silver/60 hover:border-ghost"}`}>
                  {g}
                </div>
              ))}
            </div>
            {errors.gender && <p className="text-pulse text-xs font-mono">{errors.gender}</p>}
          </div>
          <button onClick={() => { if (validate()) onNext(form); }}
            className="w-full py-4 rounded-xl btn-primary font-display font-semibold text-sm uppercase tracking-widest">
            {t.continueBtn}
          </button>
        </div>
      </div>
    </main>
  );
}

function QuestionnairePage({ lang, userInfo, messageCount }: { lang: Lang; userInfo: UserInfo; messageCount: number }) {
  const t = T[lang];
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [missingCount, setMissingCount] = useState(0);

  const allRatingQuestions = t.sections.flatMap((s) => s.questions);

  const handleSubmit = async () => {
    const missing = allRatingQuestions.filter((q) => !ratings[q]);
    setMissingCount(missing.length);
    if (missing.length > 0) {
      document.getElementById("q-error")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    setSaveError(false);
    const ratingsFlat = t.sections.flatMap((s) => s.questions.map((q) => ratings[q] || 0));
    const openAnswersFlat = t.openSection.questions.map((q) => openAnswers[q] || "");
    const payload = {
      language: lang === "en" ? "English" : "German",
      participant: userInfo,
      messageCount,
      timestamp: new Date().toISOString(),
      ratingsFlat,
      openAnswersFlat,
    };
    const ok = await saveToDatabase(payload);
    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setSaveError(true);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-void flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-sage/50 flex items-center justify-center" style={{ background: "rgba(78,205,196,0.1)" }}>
              <svg className="w-12 h-12 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-ivory">{t.submitted}</h2>
          <p className="text-ghost/40 font-mono text-[10px] uppercase tracking-widest">Bachelor Thesis · Human-AI Avatar Interaction Study</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-10 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(78,205,196,0.1))", border: "1px solid rgba(0,212,255,0.3)" }}>
              <div className="w-4 h-4 rounded-full bg-aurora" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold text-ivory uppercase tracking-[0.15em]">{t.qTitle}</h1>
          <p className="text-silver/60 font-body text-sm">{t.qSub}</p>
          <p className="font-mono text-xs text-aurora/70">{t.qScale}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-ivory font-body text-sm font-medium">{userInfo.firstName} {userInfo.lastName}</p>
            <p className="text-silver/50 font-mono text-xs">{userInfo.occupation} · {userInfo.age} · {userInfo.gender}</p>
          </div>
          <div className="text-right">
            <p className="text-aurora font-mono text-sm font-bold">{messageCount}</p>
            <p className="text-silver/40 font-mono text-[10px]">messages</p>
          </div>
        </div>

        {missingCount > 0 && (
          <div id="q-error" className="glass-card p-4 rounded-2xl border border-pulse/30 bg-pulse/5">
            <p className="text-pulse font-mono text-xs uppercase tracking-widest">
              {lang === "en" ? `Please answer ${missingCount} more question(s)` : `Bitte noch ${missingCount} Frage(n) beantworten`}
            </p>
          </div>
        )}

        {saveError && (
          <div className="glass-card p-4 rounded-2xl border border-pulse/30 bg-pulse/5">
            <p className="text-pulse font-mono text-xs">{t.saveError}</p>
            <button onClick={handleSubmit} className="mt-2 text-aurora font-mono text-xs underline">{t.submitBtn}</button>
          </div>
        )}

        {t.sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{section.emoji}</span>
              <h2 className="font-display text-lg text-ivory uppercase tracking-[0.1em]">{section.title}</h2>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-ghost/20">
              {section.questions.map((q, qi) => (
                <div key={qi} className={`p-4 space-y-3 transition-colors ${!ratings[q] && missingCount > 0 ? "bg-pulse/5" : ""}`}>
                  <p className="text-silver/90 font-body text-sm leading-relaxed">
                    <span className="text-ghost font-mono text-xs mr-2">{qi + 1}.</span>{q}
                  </p>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map((val) => (
                      <button key={val}
                        onClick={() => { setRatings((prev) => ({ ...prev, [q]: val })); setMissingCount((c) => Math.max(0, c - 1)); }}
                        className="flex-1 h-10 rounded-lg font-mono text-sm font-bold transition-all duration-200"
                        style={{
                          background: ratings[q] === val ? "var(--color-aurora)" : "rgba(42,42,64,0.5)",
                          color: ratings[q] === val ? "var(--color-obsidian)" : "rgba(136,136,168,0.8)",
                          border: ratings[q] === val ? "1px solid var(--color-aurora)" : "1px solid rgba(58,58,88,0.5)",
                          transform: ratings[q] === val ? "scale(1.05)" : "scale(1)",
                        }}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{t.openSection.emoji}</span>
            <h2 className="font-display text-lg text-ivory uppercase tracking-[0.1em]">{t.openSection.title}</h2>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-ghost/20">
            {t.openSection.questions.map((q, qi) => (
              <div key={qi} className="p-4 space-y-2">
                <p className="text-silver/90 font-body text-sm">
                  <span className="text-ghost font-mono text-xs mr-2">{qi + 1}.</span>{q}
                </p>
                <textarea value={openAnswers[q] || ""} onChange={(e) => setOpenAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                  rows={3} placeholder={lang === "en" ? "Your answer…" : "Ihre Antwort…"}
                  className="w-full bg-slate border border-ghost/50 rounded-xl px-4 py-3 font-body text-sm text-ivory placeholder-silver/30 focus:outline-none focus:border-aurora/50 focus:ring-1 focus:ring-aurora/20 resize-none transition-all" />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className={`w-full py-4 rounded-xl font-display font-semibold text-sm uppercase tracking-widest transition-all duration-300 ${submitting ? "opacity-50 cursor-not-allowed bg-ghost text-silver" : "btn-primary"}`}>
          {submitting ? t.submitting : t.submitBtn}
        </button>
        <p className="text-center text-ghost/40 font-mono text-[10px] uppercase tracking-widest pb-8">Bachelor Thesis · Human-AI Avatar Interaction Study</p>
      </div>
    </main>
  );
}

export default function HomeClient() {
  const [page, setPage] = useState<Page>("language");
  const [lang, setLang] = useState<Lang>("en");
  const [userInfo, setUserInfo] = useState<UserInfo>({ firstName: "", lastName: "", occupation: "", age: "", gender: "" });
  const [status, setStatus] = useState<AppStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechSupported] = useState(() => isSpeechRecognitionSupported());
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showTasks, setShowTasks] = useState(true);

  const avatarRef = useRef<LiveAvatarSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isConnectedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = T[lang];
  const tasks = TASKS[lang];
  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const addMessage = useCallback((role: ChatMessage["role"], content: string, error = false) => {
    const msg: ChatMessage = { id: generateId(), role, content, timestamp: new Date(), error };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const stopSession = useCallback(async (expired = false) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (avatarRef.current) {
      try { await avatarRef.current.stop(); } catch (e) { console.warn(e); }
      avatarRef.current = null;
    }
    isConnectedRef.current = false;
    setStatus("idle");
    setSessionStarted(false);
    if (expired) setPage("questionnaire");
  }, []);

  const startTimer = useCallback(() => {
    setTimeLeft(SESSION_DURATION);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { stopSession(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, [stopSession]);

  const processUserMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;
    addMessage("user", userText);
    setStatus("thinking");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText.trim(),
          conversationHistory: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "API error");
      const reply = data.reply;
      addMessage("assistant", reply);
      setStatus("speaking");

      // Send reply to avatar to speak
      if (avatarRef.current) {
        try {
          avatarRef.current.repeat(reply);
        } catch (e) {
          console.warn("Avatar speak failed:", e);
          setStatus("ready");
        }
      } else {
        setStatus("ready");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addMessage("assistant", `Error: ${message}`, true);
      setStatus("ready");
      setErrorMessage(message);
    }
  }, [addMessage, messages, lang]);

  const startListening = useCallback(() => {
    if (!speechSupported) return;
    recognitionRef.current?.stop();
    setInterimTranscript("");
    const recognition = createSpeechRecognition({
      language: lang === "de" ? "de-DE" : "en-US",
      continuous: false,
      onResult: async (transcript) => { setInterimTranscript(""); setIsListening(false); if (transcript.trim()) await processUserMessage(transcript); },
      onInterimResult: (interim) => setInterimTranscript(interim),
      onEnd: () => { setIsListening(false); setInterimTranscript(""); setStatus((p) => p === "listening" ? "ready" : p); },
      onError: (msg) => { setIsListening(false); setInterimTranscript(""); setStatus("ready"); if (!msg.includes("No speech")) setErrorMessage(msg); },
    });
    if (!recognition) return;
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
    setStatus("listening");
    setErrorMessage("");
  }, [speechSupported, processUserMessage, lang]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
    setInterimTranscript("");
    setStatus("ready");
  }, []);

  const toggleMic = useCallback(() => {
    if (isListening) stopListening(); else startListening();
  }, [isListening, startListening, stopListening]);

  const startSession = useCallback(async () => {
    if (isConnectedRef.current) return;
    setStatus("initializing");
    setErrorMessage("");
    setMessages([]);
    setCompletedTasks([]);
    try {
      const tokenRes = await fetch("/api/heygen-token", { method: "POST", headers: { "Content-Type": "application/json" } });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.token) throw new Error(tokenData.error || "Failed to get token");

      const avatar = new LiveAvatarSession(tokenData.token);
      avatarRef.current = avatar;

      avatar.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => setStatus("speaking"));
      avatar.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => setStatus((p) => p === "speaking" ? "ready" : p));
      avatar.on(SessionEvent.SESSION_DISCONNECTED, () => {
        isConnectedRef.current = false;
        setStatus("error");
        setErrorMessage(lang === "de" ? "Avatar getrennt. Bitte neu starten." : "Avatar disconnected. Please restart.");
      });
      avatar.on(SessionEvent.SESSION_STREAM_READY, () => {
        if (videoRef.current) {
          avatar.attach(videoRef.current);
          videoRef.current.play().catch(console.warn);
        }
      });

      if (videoRef.current) avatar.attach(videoRef.current);
      await avatar.start();

      isConnectedRef.current = true;
      setSessionStarted(true);
      setStatus("ready");
      startTimer();
      addMessage("assistant", t.avatarGreeting);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start";
      setErrorMessage(msg);
      setStatus("error");
      isConnectedRef.current = false;
    }
  }, [addMessage, startTimer, t.avatarGreeting, lang]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      if (avatarRef.current) avatarRef.current.stop().catch(() => {});
    };
  }, []);

  if (page === "language") return <LanguagePage onSelect={(l) => { setLang(l); setPage("disclosure"); }} />;
  if (page === "disclosure") return <DisclosurePage lang={lang} onNext={() => setPage("info")} />;
  if (page === "info") return <InfoPage lang={lang} onNext={(info) => { setUserInfo(info); setPage("session"); }} />;
  if (page === "questionnaire") return <QuestionnairePage lang={lang} userInfo={userInfo} messageCount={messages.filter(m => m.role === "user").length} />;

  const isSessionActive = sessionStarted && status !== "idle" && status !== "error";
  const timerColor = timeLeft > 45 ? "#4ECDC4" : timeLeft > 20 ? "#FBBF24" : "#FF6B6B";
  const micDisabled = !isSessionActive || status === "thinking" || status === "speaking";
  const micLabel = isListening ? t.listening : status === "thinking" ? t.thinking : status === "speaking" ? t.speaking : t.holdToSpeak;

  return (
    <main className="min-h-screen bg-void flex overflow-hidden" style={{ height: "100vh" }}>
      <div className="relative flex-1 bg-obsidian overflow-hidden">
        <video ref={videoRef} autoPlay playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isSessionActive ? 1 : 0.15 }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(5,5,8,0.7) 0%, transparent 25%, transparent 70%, rgba(5,5,8,0.85) 100%)" }} />

        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)" }}>
              <div className="w-3 h-3 rounded-full bg-aurora" style={{ animation: "breathe-glow 3s ease-in-out infinite" }} />
            </div>
            <div>
              <p className="font-display font-bold text-ivory text-base" style={{ letterSpacing: "0.15em" }}>AURA</p>
              <p className="font-mono text-[9px] text-silver/50 uppercase tracking-widest -mt-0.5">AI Avatar</p>
            </div>
          </div>
          {isSessionActive && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: "rgba(5,5,8,0.7)", border: `1px solid ${timerColor}40`, animation: timeLeft <= 20 ? "breathe-glow 1s ease-in-out infinite" : "none" }}>
              <svg className="w-4 h-4" fill="none" stroke={timerColor} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-base font-bold" style={{ color: timerColor }}>
                {t.timeRemaining} {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        {!isSessionActive && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)", animation: "breathe-glow 3s ease-in-out infinite" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-aurora/40" style={{ animation: "breathe-glow 2s ease-in-out infinite" }} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="font-display text-aurora/70 text-xl uppercase tracking-[0.2em]">AURA</p>
              <p className="font-body text-silver/40 text-sm">
                {status === "error" ? errorMessage : status === "initializing" ? t.connecting : t.startSession}
              </p>
            </div>
          </div>
        )}

        {isSessionActive && (
          <div className="absolute bottom-24 left-4 z-30 w-72">
            <div className="glass-card rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.2)" }}>
              <button onClick={() => setShowTasks(!showTasks)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-ghost/20 hover:bg-aurora/5 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-aurora font-mono text-xs uppercase tracking-widest">{t.tasksTitle}</span>
                  <span className="text-ghost font-mono text-[10px]">{completedTasks.length}/{tasks.length}</span>
                </div>
                <svg className={`w-4 h-4 text-silver/40 transition-transform ${showTasks ? "" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showTasks && (
                <div className="p-3 space-y-2">
                  <p className="text-silver/40 font-mono text-[9px] uppercase tracking-widest px-1">{t.tasksSub}</p>
                  {tasks.map((task) => {
                    const done = completedTasks.includes(task.id);
                    return (
                      <button key={task.id}
                        onClick={() => setCompletedTasks((prev) => done ? prev.filter(id => id !== task.id) : [...prev, task.id])}
                        className="w-full flex items-start gap-3 p-2 rounded-xl text-left transition-all duration-200 hover:bg-aurora/5">
                        <div className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 flex items-center justify-center border transition-all duration-200 ${done ? "bg-sage border-sage" : "border-ghost/50"}`}>
                          {done && <svg className="w-3 h-3 text-obsidian" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <p className={`font-body text-xs leading-relaxed transition-colors ${done ? "text-silver/40 line-through" : "text-silver/80"}`}>{task.text}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-6 pt-8"
          style={{ background: "linear-gradient(to top, rgba(5,5,8,0.95) 0%, transparent 100%)" }}>
          {interimTranscript && (
            <div className="mb-3 text-center">
              <p className="text-silver/70 font-body text-sm italic animate-fade-in">"{interimTranscript}"</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-6">
            {!sessionStarted ? (
              <button onClick={startSession} disabled={status === "initializing"}
                className={`px-8 py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-widest transition-all duration-300 ${status === "initializing" ? "opacity-50 cursor-not-allowed bg-ghost text-silver" : "btn-primary"}`}
                style={{ minWidth: "200px" }}>
                {status === "initializing" ? t.connecting : status === "error" ? t.retry : t.startSession}
              </button>
            ) : (
              <>
                <div className="flex flex-col items-center gap-2">
                  <button onClick={toggleMic} disabled={micDisabled || !speechSupported}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isListening ? "#FF6B6B" : micDisabled ? "rgba(58,58,88,0.5)" : "rgba(0,212,255,0.15)",
                      border: `2px solid ${isListening ? "#FF6B6B" : micDisabled ? "rgba(58,58,88,0.5)" : "rgba(0,212,255,0.5)"}`,
                      boxShadow: isListening ? "0 0 30px rgba(255,107,107,0.5)" : "none",
                    }}>
                    {isListening && <span className="absolute inset-0 rounded-full bg-pulse/30" style={{ animation: "ping-ring 1.2s ease-out infinite" }} />}
                    {isListening ? (
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                    ) : (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" style={{ color: micDisabled ? "rgba(88,88,120,1)" : "#00D4FF" }}>
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                      </svg>
                    )}
                  </button>
                  <p className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: isListening ? "#FF6B6B" : micDisabled ? "rgba(58,58,88,1)" : "rgba(136,136,168,0.7)" }}>
                    {micLabel}
                  </p>
                </div>
                <button onClick={() => stopSession(false)}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200"
                  style={{ background: "rgba(255,107,107,0.1)", border: "2px solid rgba(255,107,107,0.4)" }}>
                  <svg className="w-6 h-6 text-pulse" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </>
            )}
          </div>
          {isSessionActive && (
            <div className="mt-4 w-full h-1 bg-ghost/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${(timeLeft / SESSION_DURATION) * 100}%`, background: timerColor }} />
            </div>
          )}
        </div>
      </div>

      <div className="w-96 flex flex-col border-l border-ghost/20 bg-obsidian/80" style={{ backdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ghost/20">
          <div>
            <h2 className="font-display text-sm uppercase tracking-[0.15em] text-ivory">{t.chatTitle}</h2>
            <p className="font-mono text-[10px] text-silver/40 uppercase tracking-widest mt-0.5">{userInfo.firstName} {userInfo.lastName}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {isSessionActive && <span className="absolute inline-flex h-full w-full rounded-full bg-sage opacity-75" style={{ animation: "ping-ring 1.2s ease-out infinite" }} />}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSessionActive ? "bg-sage" : "bg-ghost"}`} />
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-widest ${isSessionActive ? "text-sage" : "text-ghost"}`}>
              {isSessionActive ? t.live : t.offline}
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          <ChatHistory messages={messages} />
        </div>
        <div className="p-4 border-t border-ghost/20 space-y-2">
          <TextInput status={isSessionActive ? "ready" : "idle"} onSubmit={processUserMessage} />
          <p className="text-ghost/40 font-mono text-[9px] text-center uppercase tracking-widest">{t.pressEnter}</p>
        </div>
      </div>
    </main>
  );
}
