import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Brain, Download, ArrowLeft, CheckCircle, AlertCircle,
  Lightbulb, Target, TrendingUp, MessageSquare, Clock,
  BarChart3, ChevronDown, ChevronUp,
} from "lucide-react";
import { getInterview, downloadPdfReport } from "../services/interviewService";
import { ScoreCard, ScoreRing, StatBubble } from "../components/ScoreCard";
import { SkillsRadarChart } from "../components/AnalyticsChart";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDateTime, parseJsonList, formatScore } from "../utils/helpers";
import toast from "react-hot-toast";

export default function InterviewReport() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getInterview(parseInt(interviewId));
        setInterview(data);
      } catch {
        toast.error("Could not load interview report.");
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId, navigate]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await downloadPdfReport(parseInt(interviewId));
      toast.success("PDF downloaded successfully!");
    } catch {
      toast.error("Could not generate PDF. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-white/50">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  const strengths = parseJsonList(interview.strengths);
  const weaknesses = parseJsonList(interview.weaknesses);
  const suggestions = parseJsonList(interview.improvement_suggestions);

  const scoreCards = [
    { label: "Technical / Content", score: interview.technical_score, icon: "💻" },
    { label: "Communication", score: interview.communication_score, icon: "💬" },
    { label: "Confidence", score: interview.confidence_score, icon: "💪" },
    { label: "Eye Contact", score: interview.eye_contact_score, icon: "👁️" },
    { label: "Speech Clarity", score: interview.speech_score, icon: "🎙️" },
    { label: "Emotion Score", score: interview.emotion_score, icon: "😊" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm mb-3 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">{interview.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-white/50 text-sm">
            <span>{interview.role}</span>
            <span>·</span>
            <span className="capitalize">{interview.difficulty}</span>
            <span>·</span>
            <span>{formatDateTime(interview.created_at)}</span>
            {interview.duration_minutes && (
              <><span>·</span><Clock size={13} /><span>{Math.round(interview.duration_minutes)}m</span></>
            )}
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading || interview.status !== "completed"}
          className="btn-primary flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          {downloading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Download size={16} />
          )}
          Download PDF
        </button>
      </div>

      {/* Overall score + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
        <div className="sm:col-span-1 flex justify-center">
          <ScoreRing score={interview.overall_score} size={140} label="Overall Score" />
        </div>
        <div className="sm:col-span-1 lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatBubble label="Questions" value={`${interview.answered_questions}/${interview.total_questions}`} icon="❓" />
          <StatBubble label="Eye Contact" value={formatScore(interview.eye_contact_score)} unit="%" icon="👁️" color="text-cyan-400" />
          <StatBubble label="Filler Words" value={interview.filler_words_count || 0} icon="🎙️" color={interview.filler_words_count > 10 ? "text-red-400" : "text-emerald-400"} />
          <StatBubble label="Duration" value={interview.duration_minutes ? Math.round(interview.duration_minutes) : "N/A"} unit={interview.duration_minutes ? "m" : ""} icon="⏱️" color="text-violet-400" />
        </div>
      </div>

      {/* Score cards grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary-400" /> Performance Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scoreCards.map(({ label, score, icon }) => (
            <ScoreCard key={label} label={label} score={score} icon={icon} />
          ))}
        </div>
      </div>

      {/* Radar + AI feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target size={18} className="text-violet-400" /> Skills Radar
          </h2>
          <SkillsRadarChart scores={interview} />
        </div>

        <div className="glass-card p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain size={18} className="text-primary-400" /> AI Overall Assessment
          </h2>
          {interview.ai_feedback ? (
            <p className="text-white/70 text-sm leading-relaxed">{interview.ai_feedback}</p>
          ) : (
            <p className="text-white/30 text-sm italic">No AI feedback generated yet.</p>
          )}
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {strengths.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" /> Strengths
              </h3>
              <ul className="flex flex-col gap-2">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weaknesses.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400" /> Areas to Improve
              </h3>
              <ul className="flex flex-col gap-2">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Improvement suggestions */}
      {suggestions.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={16} className="text-yellow-400" /> Improvement Suggestions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
                <span className="text-yellow-400 font-bold text-sm shrink-0">{i + 1}.</span>
                <p className="text-white/70 text-sm">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript (collapsible) */}
      {interview.transcript && (
        <div className="glass-card overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-all"
          >
            <span className="text-white font-semibold flex items-center gap-2">
              <MessageSquare size={16} className="text-primary-400" /> Interview Transcript
            </span>
            {showTranscript ? <ChevronUp size={18} className="text-white/50" /> : <ChevronDown size={18} className="text-white/50" />}
          </button>
          {showTranscript && (
            <div className="px-5 pb-5 border-t border-white/10">
              <div className="bg-white/3 rounded-xl p-4 mt-4 max-h-80 overflow-y-auto">
                {interview.transcript.split("\n\n").map((line, i) => {
                  const isInterviewer = line.startsWith("Interviewer:");
                  const isCandidate = line.startsWith("Candidate:");
                  return (
                    <div key={i} className={`mb-3 ${isInterviewer ? "text-primary-300" : isCandidate ? "text-white/80" : "text-white/50"}`}>
                      <p className="text-xs font-semibold opacity-60 mb-0.5">
                        {isInterviewer ? "🤖 AI Interviewer" : isCandidate ? "👤 You" : ""}
                      </p>
                      <p className="text-sm leading-relaxed">{line.replace(/^(Interviewer|Candidate):/, "").trim()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-4">
        <Link to="/interview/setup" className="btn-primary flex items-center gap-2">
          <TrendingUp size={16} /> Practice Again
        </Link>
        <Link to="/dashboard" className="btn-secondary flex items-center gap-2">
          <BarChart3 size={16} /> View Dashboard
        </Link>
        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="btn-secondary flex items-center gap-2"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>
    </div>
  );
}
