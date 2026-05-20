import React from "react";
import { getScoreLevel } from "../utils/helpers";

// ── Single score metric card ───────────────────────────────────────────────
export function ScoreCard({ label, score, icon, description, animate = true }) {
  const level = getScoreLevel(score);
  const pct = Math.min(Math.max(score || 0, 0), 100);

  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:border-white/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="text-white/70 text-sm font-medium">{label}</span>
        </div>
        <span
          className="text-2xl font-bold"
          style={{ color: level.color }}
        >
          {score != null ? Math.round(score) : "--"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animate ? `${pct}%` : "0%",
            backgroundColor: level.color,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${level.bg}`}>
          {level.label}
        </span>
        {description && (
          <span className="text-white/40 text-xs">{description}</span>
        )}
      </div>
    </div>
  );
}

// ── Compact stat bubble ────────────────────────────────────────────────────
export function StatBubble({ label, value, unit = "", color = "text-primary-400", icon }) {
  return (
    <div className="glass-card p-4 flex flex-col items-center text-center gap-1">
      {icon && <div className="text-2xl mb-1">{icon}</div>}
      <div className={`text-3xl font-bold ${color}`}>
        {value}
        {unit && <span className="text-lg ml-0.5">{unit}</span>}
      </div>
      <div className="text-white/50 text-xs font-medium uppercase tracking-wide">{label}</div>
    </div>
  );
}

// ── Overall score ring ─────────────────────────────────────────────────────
export function ScoreRing({ score, size = 120, label = "Overall Score" }) {
  const level = getScoreLevel(score);
  const pct = Math.min(Math.max(score || 0, 0), 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={level.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - strokeDash}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: level.color }}>
            {score != null ? Math.round(score) : "--"}
          </span>
          <span className="text-white/40 text-xs">/100</span>
        </div>
      </div>
      <span className="text-white/60 text-sm font-medium">{label}</span>
    </div>
  );
}
