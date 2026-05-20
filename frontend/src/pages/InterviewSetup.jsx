import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, ChevronRight, ChevronLeft, CheckCircle, Loader } from "lucide-react";
import { INTERVIEW_TYPES, DIFFICULTY_LEVELS, POPULAR_ROLES, POPULAR_TOPICS } from "../utils/constants";
import { getActiveResume } from "../services/interviewService";
import { useInterview } from "../hooks/useInterview";
import ResumeUpload from "../components/ResumeUpload";
import toast from "react-hot-toast";

const TOTAL_STEPS = 4;

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { startInterview, isLoading } = useInterview();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    interview_type: "",
    role: "",
    topic: "",
    difficulty: "",
    resume_id: null,
  });
  const [activeResume, setActiveResume] = useState(null);

  useEffect(() => {
    getActiveResume().then(setActiveResume).catch(() => {});
  }, []);

  const canProceed = () => {
    if (step === 1) return !!config.interview_type;
    if (step === 2) return !!config.role && !!config.topic;
    if (step === 3) return !!config.difficulty;
    return true;
  };

  const handleStart = async () => {
    try {
      const interview = await startInterview({
        ...config,
        resume_id: activeResume?.id || null,
      });
      navigate(`/interview/session/${interview.id}`);
    } catch {
      toast.error("Failed to start interview. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 mb-4">
          <Brain size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Setup Your Interview</h1>
        <p className="text-white/50">Configure your personalized AI interview session</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[...Array(TOTAL_STEPS)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              i + 1 <= step ? "bg-primary-500" : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="text-white/40 text-sm text-center mb-6">Step {step} of {TOTAL_STEPS}</p>

      {/* Step 1: Interview Type */}
      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-semibold text-white mb-6">Choose Interview Type</h2>
          <div className="flex flex-col gap-4">
            {INTERVIEW_TYPES.map(({ value, label, description, icon, color }) => (
              <button
                key={value}
                onClick={() => setConfig({ ...config, interview_type: value })}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                  config.interview_type === value
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shrink-0`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{label}</div>
                  <div className="text-white/50 text-sm mt-0.5">{description}</div>
                </div>
                {config.interview_type === value && (
                  <CheckCircle size={20} className="text-primary-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Role & Topic */}
      {step === 2 && (
        <div className="animate-slide-up flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Role & Topic</h2>
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Target Role</label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                placeholder="e.g. Software Engineer"
                className="input-field"
                list="roles-list"
              />
              <datalist id="roles-list">
                {POPULAR_ROLES.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>
          </div>
          <div>
            <label className="text-white/70 text-sm font-medium block mb-2">Interview Topic</label>
            <input
              type="text"
              value={config.topic}
              onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              placeholder="e.g. Data Structures & Algorithms"
              className="input-field"
              list="topics-list"
            />
            <datalist id="topics-list">
              {POPULAR_TOPICS.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          {/* Quick pick chips */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Popular Roles</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.slice(0, 6).map((r) => (
                <button
                  key={r}
                  onClick={() => setConfig({ ...config, role: r })}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    config.role === r
                      ? "border-primary-500 bg-primary-500/20 text-primary-300"
                      : "border-white/15 text-white/50 hover:border-white/30"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Difficulty */}
      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-semibold text-white mb-6">Select Difficulty</h2>
          <div className="flex flex-col gap-4">
            {DIFFICULTY_LEVELS.map(({ value, label, description, color, bg }) => (
              <button
                key={value}
                onClick={() => setConfig({ ...config, difficulty: value })}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                  config.difficulty === value
                    ? "border-primary-500 bg-primary-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg ${bg}`}>
                  {value === "easy" ? "🟢" : value === "medium" ? "🟡" : "🔴"}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${color}`}>{label}</div>
                  <div className="text-white/50 text-sm">{description}</div>
                </div>
                {config.difficulty === value && (
                  <CheckCircle size={20} className="text-primary-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Resume & Confirm */}
      {step === 4 && (
        <div className="animate-slide-up flex flex-col gap-6">
          <h2 className="text-xl font-semibold text-white">Review & Upload Resume</h2>

          {/* Summary */}
          <div className="glass-card p-5 flex flex-col gap-3">
            <h3 className="text-white/60 text-xs uppercase tracking-wide font-semibold">Interview Summary</h3>
            {[
              { label: "Type", value: config.interview_type?.toUpperCase() },
              { label: "Role", value: config.role },
              { label: "Topic", value: config.topic },
              { label: "Difficulty", value: config.difficulty?.charAt(0).toUpperCase() + config.difficulty?.slice(1) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-white/50 text-sm">{label}</span>
                <span className="text-white font-medium text-sm">{value}</span>
              </div>
            ))}
          </div>

          {/* Resume upload */}
          <div>
            <p className="text-white/70 text-sm font-medium mb-3">
              Resume (Optional – for tailored questions)
            </p>
            {activeResume ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle size={18} className="text-emerald-400" />
                <div>
                  <p className="text-white text-sm font-medium">{activeResume.filename}</p>
                  <p className="text-emerald-400 text-xs">Active resume will be used</p>
                </div>
              </div>
            ) : (
              <ResumeUpload onUploadSuccess={(r) => setActiveResume(r)} />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <ChevronLeft size={18} /> Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            Continue <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isLoading || !canProceed()}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {isLoading ? (
              <><Loader size={18} className="animate-spin" /> Starting...</>
            ) : (
              <><Brain size={18} /> Start Interview</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
