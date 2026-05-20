import React from "react";
import { Link } from "react-router-dom";
import {
  Brain, Eye, Mic, BarChart3, FileText,
  ChevronRight, Zap, Award, ArrowRight,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Brain size={24} />,
    title: "AI-Powered Questions",
    description: "Mistral AI generates dynamic, role-specific interview questions that adapt to your answers.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: <Eye size={24} />,
    title: "Eye Contact Tracking",
    description: "Real-time gaze analysis measures your engagement and eye contact score throughout the interview.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: <Mic size={24} />,
    title: "Speech Analysis",
    description: "Detect filler words, measure speaking pace, and get instant communication clarity scores.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: <Zap size={24} />,
    title: "Emotion Detection",
    description: "Live confidence and emotion tracking helps you understand and improve your presence.",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Smart Analytics",
    description: "Detailed performance dashboards with score trends, radar charts, and improvement insights.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: <FileText size={24} />,
    title: "PDF Reports",
    description: "Download comprehensive interview reports with scores, transcripts, and AI recommendations.",
    color: "from-indigo-500 to-blue-600",
  },
];

const STATS = [
  { value: "3", unit: "Interview Types", icon: "🎯" },
  { value: "7", unit: "Questions Per Session", icon: "💬" },
  { value: "6", unit: "Performance Metrics", icon: "📊" },
  { value: "100%", unit: "Free & Local AI", icon: "🔒" },
];

const STEPS = [
  { step: "01", title: "Sign Up & Upload Resume", desc: "Create your account and upload your PDF resume. AI extracts your skills instantly." },
  { step: "02", title: "Choose Interview Type", desc: "Select HR, Technical, or Behavioral. Pick your role, topic, and difficulty level." },
  { step: "03", title: "Start AI Interview", desc: "Webcam and microphone activate. The AI interviewer asks dynamic questions." },
  { step: "04", title: "Get Full Analytics", desc: "View scores, feedback, emotion data, and download your PDF report." },
];


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">VisionHire</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-white/60 hover:text-white text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-5">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Zap size={14} className="text-primary-400" />
            Powered by Mistral AI + MediaPipe
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6">
            Ace Every Interview
            <br />
            <span className="text-gradient">with AI Intelligence</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            VisionHire uses real-time AI to analyze your speech, eye contact, and emotions—
            giving you actionable feedback to land your dream job.
          </p>

          {/* CTAs */}
          <div className="flex justify-center mb-16">
            <Link to="/signup" className="btn-primary text-base py-4 px-8 flex items-center gap-2 justify-center">
              Start Interview <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ value, unit, icon }) => (
              <div key={unit} className="glass-card p-4 text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold text-primary-400">{value}</div>
                <div className="text-white/40 text-xs">{unit}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to <span className="gradient-text">nail interviews</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Professional-grade interview intelligence, powered by local AI—completely private.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon, title, description, color }) => (
              <div key={title} className="glass-card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it <span className="gradient-text">works</span></h2>
          </div>
          <div className="flex flex-col gap-8">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                  {step}
                </div>
                <div className="glass-card flex-1 p-5">
                  <h3 className="text-white font-semibold text-lg mb-1">{title}</h3>
                  <p className="text-white/50 text-sm">{desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:flex items-center self-center text-primary-500/40 ml-2">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-violet-600/10 pointer-events-none" />
            <Award size={48} className="text-primary-400 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">transform</span> your interviews?
            </h2>
            <p className="text-white/50 mb-8">
              Join thousands of candidates using AI to prepare smarter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-base py-4 px-8 flex items-center gap-2 justify-center">
                Create Free Account <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-secondary text-base py-4 px-8">
                Sign In
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-white/40 text-sm">
              {["No credit card required", "100% private & local AI", "Free forever"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-emerald-400" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-white/30 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain size={16} className="text-primary-400" />
          <span className="font-bold text-white/50">VisionHire</span>
        </div>
        <p>AI-Powered Interview Intelligence Platform · Built with FastAPI, React & Mistral AI</p>
      </footer>
    </div>
  );
}
