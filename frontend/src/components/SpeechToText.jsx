import React from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

/**
 * SpeechToText – live transcription display with analytics overlay.
 * Consumes state from useSpeech() hook.
 */
export default function SpeechToText({
  isListening,
  isSupported,
  finalTranscript,
  interimText,
  fillerCount,
  wordCount,
  error,
  onToggle,
  compact = false,
}) {
  if (!isSupported) {
    return (
      <div className="glass-card p-4 flex items-center gap-3 border-yellow-500/30">
        <AlertCircle size={16} className="text-yellow-400 shrink-0" />
        <p className="text-yellow-400 text-sm">
          Speech recognition is not supported. Please use Chrome or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isListening ? (
            <>
              <div className="relative">
                <Mic size={16} className="text-primary-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-semibold text-white">Recording</span>
            </>
          ) : (
            <>
              <MicOff size={16} className="text-white/40" />
              <span className="text-sm font-semibold text-white/60">Microphone</span>
            </>
          )}
        </div>
        <button
          onClick={onToggle}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            isListening
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
          }`}
        >
          {isListening ? "Stop" : "Start"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs">
          <AlertCircle size={12} /> {error}
        </div>
      )}

      {/* Transcript area */}
      {!compact && (
        <div className="bg-white/5 rounded-xl p-3 min-h-[80px] max-h-[150px] overflow-y-auto">
          {finalTranscript || interimText ? (
            <p className="text-sm text-white/80 leading-relaxed">
              {finalTranscript}
              {interimText && (
                <span className="text-white/40 italic"> {interimText}</span>
              )}
            </p>
          ) : (
            <p className="text-white/25 text-sm italic">
              {isListening ? "Listening... start speaking" : "Transcript will appear here"}
            </p>
          )}
        </div>
      )}

      {/* Live metrics */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-center">
          <div className="text-primary-400 font-bold text-lg">{wordCount}</div>
          <div className="text-white/40 text-xs">Words</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-center">
          <div className={`font-bold text-lg ${fillerCount > 5 ? "text-red-400" : fillerCount > 2 ? "text-yellow-400" : "text-green-400"}`}>
            {fillerCount}
          </div>
          <div className="text-white/40 text-xs">Fillers</div>
        </div>
        {isListening && (
          <div className="flex items-end gap-0.5 px-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary-400 rounded-full animate-bounce"
                style={{
                  height: `${Math.random() * 20 + 8}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
