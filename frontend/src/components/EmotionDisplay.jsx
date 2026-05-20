import React, { useEffect, useState, useRef } from "react";
import { Zap } from "lucide-react";

const EMOTIONS = [
  { key: "confident", label: "Confident", color: "#10b981", icon: "😊", weight: 1 },
  { key: "neutral", label: "Neutral", color: "#6366f1", icon: "😐", weight: 0.8 },
  { key: "nervous", label: "Nervous", color: "#f59e0b", icon: "😟", weight: 0.4 },
  { key: "stressed", label: "Stressed", color: "#ef4444", icon: "😰", weight: 0.2 },
];

/**
 * EmotionDisplay – estimates and displays emotion metrics during interview.
 * Uses speech analytics (filler count, WPM) to infer emotional state.
 */
export default function EmotionDisplay({
  fillerCount = 0,
  wordsPerMinute = 0,
  isActive = false,
  onScoreUpdate,
}) {
  const [dominantEmotion, setDominantEmotion] = useState("neutral");
  const [emotionScores, setEmotionScores] = useState({
    confident: 60,
    neutral: 40,
    nervous: 20,
    stressed: 10,
  });
  const [confidenceScore, setConfidenceScore] = useState(65);
  const prevFillerRef = useRef(fillerCount);
  const prevWpmRef = useRef(wordsPerMinute);

  // ── Infer emotion from speech metrics ────────────────────────────────────
  useEffect(() => {
    if (!isActive) return;

    // Compute scores based on speech analysis heuristics
    const fillerRate = fillerCount / Math.max(wordsPerMinute / 10, 1);

    // Ideal WPM range: 110-160
    const wpmDeviation = Math.abs(wordsPerMinute - 135) / 135;

    // Nervousness increases with fillers and extreme WPM
    const nervousnessRaw = Math.min(fillerRate * 30 + wpmDeviation * 40, 100);

    // Add randomness to simulate live detection variation
    const rand = () => (Math.random() - 0.5) * 10;

    const nervous = Math.max(5, Math.min(95, nervousnessRaw + rand()));
    const stressed = Math.max(5, Math.min(95, nervousnessRaw * 0.6 + rand()));
    const confident = Math.max(5, Math.min(95, 100 - nervousnessRaw * 0.8 + rand()));
    const neutral = Math.max(5, Math.min(95, 60 - Math.abs(nervous - 50) * 0.5 + rand()));

    const newScores = { confident, neutral, nervous, stressed };
    setEmotionScores(newScores);

    // Dominant emotion
    const dominant = Object.entries(newScores).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    setDominantEmotion(dominant);

    // Overall confidence score
    const score = Math.round(confident * 0.7 + neutral * 0.2 + (100 - nervous) * 0.1);
    const clamped = Math.min(100, Math.max(10, score));
    setConfidenceScore(clamped);
    onScoreUpdate?.(clamped);

    prevFillerRef.current = fillerCount;
    prevWpmRef.current = wordsPerMinute;
  }, [fillerCount, wordsPerMinute, isActive, onScoreUpdate]);

  const dominant = EMOTIONS.find((e) => e.key === dominantEmotion) || EMOTIONS[1];

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-violet-400" />
          <span className="text-sm font-semibold text-white">Emotion Analysis</span>
        </div>
        {isActive && <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
      </div>

      {/* Dominant emotion badge */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${dominant.color}20` }}
        >
          {dominant.icon}
        </div>
        <div>
          <div className="text-white font-semibold">{dominant.label}</div>
          <div className="text-white/50 text-xs">Dominant emotion</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold" style={{ color: dominant.color }}>
            {confidenceScore}
          </div>
          <div className="text-white/40 text-xs">Confidence</div>
        </div>
      </div>

      {/* Emotion breakdown bars */}
      <div className="flex flex-col gap-2">
        {EMOTIONS.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-xs text-white/50 w-16 shrink-0">{label}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.round(emotionScores[key] || 0)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="text-xs text-white/40 w-8 text-right">
              {Math.round(emotionScores[key] || 0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
