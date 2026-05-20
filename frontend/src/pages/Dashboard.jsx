import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, TrendingUp, Clock, Target, BarChart3,
  ChevronRight, Award, Zap, RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDashboardAnalytics } from "../services/interviewService";
import { ScoreRing, StatBubble } from "../components/ScoreCard";
import { ScoreTrendChart, SkillsRadarChart } from "../components/AnalyticsChart";
import LoadingSpinner from "../components/LoadingSpinner";
import { timeAgo } from "../utils/helpers";
import ResumeUpload from "../components/ResumeUpload";

function InterviewTypeTag({ type }) {
  const styles = {
    hr: "bg-blue-500/20 text-blue-400",
    technical: "bg-violet-500/20 text-violet-400",
    behavioral: "bg-pink-500/20 text-pink-400",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[type] || "bg-white/10 text-white/50"}`}>
      {type?.toUpperCase()}
    </span>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getDashboardAnalytics();
      setAnalytics(data);
    } catch {
      // Analytics load failed silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const recent = analytics?.recent_interviews || [];
  const avgData = {
    technical_score: analytics?.average_score,
    communication_score: analytics?.average_communication,
    confidence_score: analytics?.average_confidence,
    eye_contact_score: analytics?.average_eye_contact,
    speech_score: analytics?.average_score ? analytics.average_score * 0.9 : 0,
    emotion_score: analytics?.average_confidence ? analytics.average_confidence * 0.95 : 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {user?.full_name || user?.username} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {analytics?.total_interviews === 0
              ? "Ready to start your first AI interview?"
              : `You've completed ${analytics?.total_interviews} interview${analytics?.total_interviews !== 1 ? "s" : ""}.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchAnalytics(true)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <Link to="/interview/setup" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Interview
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBubble
          label="Interviews"
          value={analytics?.total_interviews || 0}
          icon="🎯"
          color="text-primary-400"
        />
        <StatBubble
          label="Avg Score"
          value={Math.round(analytics?.average_score || 0)}
          unit="/100"
          icon="⭐"
          color="text-yellow-400"
        />
        <StatBubble
          label="Confidence"
          value={Math.round(analytics?.average_confidence || 0)}
          unit="%"
          icon="💪"
          color="text-violet-400"
        />
        <StatBubble
          label="Eye Contact"
          value={Math.round(analytics?.average_eye_contact || 0)}
          unit="%"
          icon="👁️"
          color="text-cyan-400"
        />
      </div>

      {/* Charts + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score trend */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-400" />
              <h2 className="text-white font-semibold">Score Trend</h2>
            </div>
            <span className="text-white/30 text-xs">Last 10 interviews</span>
          </div>
          <ScoreTrendChart data={analytics?.score_trend || []} />
        </div>

        {/* Skills radar */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-violet-400" />
            <h2 className="text-white font-semibold">Skills Breakdown</h2>
          </div>
          <SkillsRadarChart scores={avgData} />
        </div>
      </div>

      {/* Resume upload + recent interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resume */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-cyan-400" />
            <h2 className="text-white font-semibold">Resume</h2>
          </div>
          <ResumeUpload />
        </div>

        {/* Recent interviews */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary-400" />
              <h2 className="text-white font-semibold">Recent Interviews</h2>
            </div>
            <Link to="/history" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10">
              <Award size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No interviews yet</p>
              <Link to="/interview/setup" className="btn-primary text-sm py-2 px-4 mt-4 inline-flex items-center gap-2">
                <Plus size={14} /> Start First Interview
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recent.slice(0, 5).map((interview) => (
                <Link
                  key={interview.id}
                  to={`/interview/report/${interview.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all group"
                >
                  <ScoreRing score={interview.overall_score} size={56} label="" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm truncate">{interview.title}</p>
                      <InterviewTypeTag type={interview.interview_type} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{interview.role}</span>
                      <span>·</span>
                      <span>{timeAgo(interview.created_at)}</span>
                      {interview.duration_minutes && (
                        <><span>·</span><span>{Math.round(interview.duration_minutes)}m</span></>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/30 group-hover:text-primary-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick start CTA */}
      {analytics?.total_interviews === 0 && (
        <div className="glass-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-violet-600/5 pointer-events-none" />
          <Zap size={36} className="text-primary-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Start your first AI interview</h3>
          <p className="text-white/50 mb-6 max-w-md mx-auto">
            Choose your role and interview type. The AI will generate tailored questions and give you detailed feedback.
          </p>
          <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} /> Begin Interview
          </Link>
        </div>
      )}
    </div>
  );
}
