'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

// ── Speech Recognition (input) ──────────────────────────────────────────────

interface UseVoiceInputOptions {
  onResult: (transcript: string) => void;
  onError?: (err: string) => void;
}

export function useVoiceInput({ onResult, onError }: UseVoiceInputOptions) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );
  }, []);

  const start = useCallback(() => {
    const SR: typeof SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) onResult(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setListening(false);
      onError?.(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, onError]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  return { listening, supported, toggle, start, stop };
}

// ── Speech Synthesis (output) ───────────────────────────────────────────────

export function useVoiceOutput() {
  const [speaking, setSpeaking] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const speak = useCallback((text: string) => {
    if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Strip markdown before speaking
    const clean = text
      .replace(/```[\s\S]*?```/g, 'code block.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/#{1,3} /g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^[-*] /gm, '')
      .trim();

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.05;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick a natural-sounding English voice if available
    const tryVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find(v => v.lang.startsWith('en') && (
          v.name.includes('Natural') ||
          v.name.includes('Premium') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google US') ||
          v.name.includes('Alex')
        )) ?? voices.find(v => v.lang.startsWith('en'));
      if (preferred) utterance.voice = preferred;
    };

    if (window.speechSynthesis.getVoices().length) {
      tryVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = tryVoice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [enabled]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const toggleEnabled = useCallback(() => setEnabled(e => !e), []);

  return { speaking, enabled, speak, stop, toggleEnabled };
}
