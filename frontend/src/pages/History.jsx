import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Search, ChevronRight, Plus } from "lucide-react";
import { listInterviews } from "../services/interviewService";
import { ScoreRing } from "../components/ScoreCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatDate, getScoreBg } from "../utils/helpers";

const TYPE_LABELS = { hr: "HR", technical: "Technical", behavioral: "Behavioral" };
const TYPE_COLORS = {
  hr: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  technical: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  behavioral: "bg-pink-500/15 text-pink-400 border-pink-500/20",
};

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    listInterviews()
      .then((data) => { setInterviews(data); setFiltered(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = interviews;
    if (typeFilter !== "all") result = result.filter((i) => i.interview_type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) => i.role.toLowerCase().includes(q) || i.topic.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, typeFilter, interviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HistoryIcon size={22} className="text-primary-400" /> Interview History
          </h1>
          <p className="text-white/50 text-sm mt-1">{interviews.length} total sessions</p>
        </div>
        <Link to="/interview/setup" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Interview
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role or topic..."
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {["all", "hr", "technical", "behavioral"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                typeFilter === type
                  ? "border-primary-500 bg-primary-500/20 text-primary-400"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white"
              }`}
            >
              {type === "all" ? "All" : TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Interview list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <HistoryIcon size={40} className="text-white/15 mx-auto mb-4" />
          <p className="text-white/40 font-medium">
            {interviews.length === 0 ? "No interviews yet" : "No results match your filters"}
          </p>
          {interviews.length === 0 && (
            <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
              <Plus size={14} /> Start First Interview
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((interview) => (
            <Link
              key={interview.id}
              to={`/interview/report/${interview.id}`}
              className="glass-card-hover flex items-center gap-5 p-5 group"
            >
              <ScoreRing score={interview.overall_score} size={64} label="" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-white font-semibold text-sm">{interview.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_COLORS[interview.interview_type] || "bg-white/10 text-white/50 border-white/10"}`}>
                    {TYPE_LABELS[interview.interview_type] || interview.interview_type}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    interview.status === "completed"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}>
                    {interview.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40 flex-wrap">
                  <span>{interview.role}</span>
                  <span>·</span>
                  <span>{interview.topic}</span>
                  <span>·</span>
                  <span className="capitalize">{interview.difficulty}</span>
                  <span>·</span>
                  <span>{formatDate(interview.created_at)}</span>
                  {interview.duration_minutes && (
                    <><span>·</span><span>{Math.round(interview.duration_minutes)} min</span></>
                  )}
                </div>
                {/* Mini score pills */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {[
                    ["Comm", interview.communication_score],
                    ["Confidence", interview.confidence_score],
                    ["Eye", interview.eye_contact_score],
                  ].map(([label, score]) => score != null && (
                    <span key={label} className={`text-xs px-2 py-0.5 rounded-full ${getScoreBg(score)}`}>
                      {label}: {Math.round(score)}
                    </span>
                  ))}
                </div>
              </div>

              <ChevronRight size={18} className="text-white/20 group-hover:text-primary-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
