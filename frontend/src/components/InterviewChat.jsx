import React, { useEffect, useRef } from "react";
import { Brain, User, Star } from "lucide-react";
import { AIThinkingIndicator } from "./LoadingSpinner";

/**
 * InterviewChat – scrollable Q&A conversation panel.
 */
export default function InterviewChat({ messages, isLoading, phase }) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/30">
        <Brain size={32} />
        <p className="text-sm">The AI interviewer will start soon...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-y-auto max-h-[420px] pr-1">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <AIThinkingIndicator />
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function ChatBubble({ message }) {
  const isAI = message.role === "ai";
  const isFeedback = message.type === "feedback";

  if (isFeedback) {
    return (
      <div className="mx-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Star size={13} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-semibold">AI Feedback</span>
          {message.score != null && (
            <span className="ml-auto text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
              {Math.round(message.score * 10)}/100
            </span>
          )}
        </div>
        <p className="text-white/70 text-sm leading-relaxed">{message.content}</p>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isAI ? "justify-start" : "justify-end flex-row-reverse"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isAI
            ? "bg-gradient-to-br from-primary-500 to-violet-600"
            : "bg-gradient-to-br from-cyan-500 to-blue-600"
        }`}
      >
        {isAI ? <Brain size={14} className="text-white" /> : <User size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isAI
            ? "bg-white/8 border border-white/10 text-white rounded-tl-sm"
            : "bg-primary-500/20 border border-primary-500/30 text-white rounded-tr-sm"
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-semibold ${isAI ? "text-primary-400" : "text-cyan-400"}`}>
            {isAI ? "AI Interviewer" : "You"}
          </span>
          {message.type === "question" && (
            <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded-md">Question</span>
          )}
        </div>
        <p className="text-sm leading-relaxed text-white/90">{message.content}</p>
      </div>
    </div>
  );
}
