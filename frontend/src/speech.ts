// Multi-lingual Text-to-Speech & Speech-to-Text Engine
// Supports Kannada (kn-IN), Telugu (te-IN), Tamil (ta-IN), Malayalam (ml-IN), Hindi (hi-IN), English (en-IN)

import { getLanguageLocale } from "./i18n";

let availableVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  availableVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
  };
}

export function getBestVoice(language: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
  const locale = getLanguageLocale(language);
  const langPrefix = locale.slice(0, 2).toLowerCase();

  // Exact match first (e.g. kn-IN)
  const exact = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase());
  if (exact) return exact;

  // Prefix match (e.g. kn)
  const prefix = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
  if (prefix) return prefix;

  // Indian accent English fallback for Indian languages if native voice not installed on OS
  const indianEn = voices.find(v => v.lang.toLowerCase() === "en-in");
  if (indianEn) return indianEn;

  return voices[0] || null;
}

export function speakText(
  text: string,
  language: string = "English",
  onEnd?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    alert("Speech synthesis is not supported on this browser.");
    return false;
  }

  window.speechSynthesis.cancel();

  // Strip markdown formatting symbols for clean audio readout
  const clean = text
    .replace(/[#*`_\[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return false;

  const utterance = new SpeechSynthesisUtterance(clean);
  const locale = getLanguageLocale(language);
  utterance.lang = locale;

  const voice = getBestVoice(language);
  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = 0.92; // Slightly measured rate for clear agricultural guidance
  utterance.pitch = 1.0;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis notice:", e);
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

