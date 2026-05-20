import React from "react";

// ── Full-page loading overlay ──────────────────────────────────────────────
export function FullPageLoader({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-b-violet-500/40 animate-spin animate-spin-slow" />
      </div>
      <p className="mt-6 text-white/60 text-sm font-medium">{message}</p>
    </div>
  );
}

// ── Inline spinner ─────────────────────────────────────────────────────────
export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div
      className={`${sizes[size]} rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin ${className}`}
    />
  );
}

// ── AI thinking indicator ──────────────────────────────────────────────────
export function AIThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 glass-card w-fit">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <span className="text-white/60 text-sm">AI is thinking...</span>
    </div>
  );
}
