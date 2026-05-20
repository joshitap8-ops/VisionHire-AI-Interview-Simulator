import React from "react";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PolarRadiusAxis, Legend,
} from "recharts";

// ── Tooltip style shared across all charts ─────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e1b4b",
    border: "1px solid rgba(99,102,241,0.3)",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "13px",
  },
  cursor: { stroke: "rgba(99,102,241,0.3)" },
};

// ── Score trend line chart ─────────────────────────────────────────────────
export function ScoreTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="Complete interviews to see your trend" />;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ color: "#ffffff80", fontSize: 12 }} />
        <Line type="monotone" dataKey="overall" name="Overall" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" dataKey="communication" name="Communication" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 3 }} />
        <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── Interview type bar chart ───────────────────────────────────────────────
export function InterviewTypeChart({ data }) {
  if (!data || data.length === 0) return <EmptyChart message="No interview data yet" />;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: "#ffffff60", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="score" name="Score" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Skills radar chart ─────────────────────────────────────────────────────
export function SkillsRadarChart({ scores }) {
  const data = [
    { skill: "Technical", value: scores?.technical_score || 0 },
    { skill: "Communication", value: scores?.communication_score || 0 },
    { skill: "Confidence", value: scores?.confidence_score || 0 },
    { skill: "Eye Contact", value: scores?.eye_contact_score || 0 },
    { skill: "Speech", value: scores?.speech_score || 0 },
    { skill: "Emotion", value: scores?.emotion_score || 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "#ffffff80", fontSize: 11 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Placeholder for empty charts ───────────────────────────────────────────
function EmptyChart({ message }) {
  return (
    <div className="flex items-center justify-center h-48 text-white/30 text-sm">
      {message}
    </div>
  );
}
