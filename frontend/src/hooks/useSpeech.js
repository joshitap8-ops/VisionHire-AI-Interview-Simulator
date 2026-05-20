import { useState, useRef, useCallback, useEffect } from "react";
import { FILLER_WORDS } from "../utils/constants";

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * useSpeech – wraps the Web Speech API for live transcription.
 * Also tracks filler words and speech analytics in real time.
 */
export function useSpeech() {
  const recognitionRef = useRef(null);
  const fullTranscriptRef = useRef("");
  const startTimeRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [fillerCount, setFillerCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isSupported] = useState(!!SpeechRecognition);
  const [error, setError] = useState(null);

  // ── Count filler words in a text chunk ────────────────────────────────────
  const countFillers = (text) => {
    const lower = text.toLowerCase();
    let count = 0;
    for (const word of FILLER_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      const matches = lower.match(regex);
      if (matches) count += matches.length;
    }
    return count;
  };

  // ── Start listening ────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let newFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += transcript + " ";
        } else {
          interim += transcript;
        }
      }

      if (newFinal) {
        fullTranscriptRef.current += newFinal;
        setFinalTranscript(fullTranscriptRef.current);
        setWordCount(fullTranscriptRef.current.trim().split(/\s+/).filter(Boolean).length);
        setFillerCount(countFillers(fullTranscriptRef.current));
      }
      setInterimText(interim);
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech") {
        setError(`Speech error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.start();
        } catch {
          /* already started */
        }
      }
    };

    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  // ── Stop listening ─────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText("");
  }, []);

  // ── Reset transcript ───────────────────────────────────────────────────────
  const resetTranscript = useCallback(() => {
    fullTranscriptRef.current = "";
    setFinalTranscript("");
    setInterimText("");
    setFillerCount(0);
    setWordCount(0);
    startTimeRef.current = Date.now();
  }, []);

  // ── Get speech analytics ───────────────────────────────────────────────────
  const getSpeechAnalytics = useCallback(() => {
    const duration = startTimeRef.current
      ? (Date.now() - startTimeRef.current) / 1000
      : 60;
    const wpm = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;
    const fillerPenalty = Math.min(fillerCount * 3, 30);
    const wpmPenalty = wpm < 80 ? (80 - wpm) * 0.3 : wpm > 180 ? (wpm - 180) * 0.2 : 0;
    const speechScore = Math.max(0, Math.min(100, 100 - fillerPenalty - wpmPenalty));

    return {
      transcript: fullTranscriptRef.current,
      wordCount,
      wordsPerMinute: wpm,
      fillerCount,
      durationSeconds: duration,
      speechScore: Math.round(speechScore),
    };
  }, [wordCount, fillerCount]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    interimText,
    finalTranscript,
    fillerCount,
    wordCount,
    error,
    startListening,
    stopListening,
    resetTranscript,
    getSpeechAnalytics,
  };
}
