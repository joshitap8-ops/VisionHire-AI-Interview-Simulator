import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Brain, Square, ChevronRight, Loader, AlertCircle,
  Clock, Volume2, VolumeX,
} from "lucide-react";
import { useWebcam } from "../hooks/useWebcam";
import { useSpeech } from "../hooks/useSpeech";
import { useInterview } from "../hooks/useInterview";
import WebcamPreview from "../components/WebcamPreview";
import SpeechToText from "../components/SpeechToText";
import EyeContactTracker from "../components/EyeContactTracker";
import EmotionDisplay from "../components/EmotionDisplay";
import InterviewChat from "../components/InterviewChat";
import toast from "react-hot-toast";

export default function InterviewSession() {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const id = parseInt(interviewId, 10);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const webcam = useWebcam();
  const speech = useSpeech();
  const interview = useInterview();

  // ── Local state ────────────────────────────────────────────────────────────
  const [eyeScore, setEyeScore] = useState(75);
  const [emotionScore, setEmotionScore] = useState(70);
  const [timer, setTimer] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);

  const timerRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTimer = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Text-to-speech for AI questions ───────────────────────────────────────
  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    synthRef.current.speak(utterance);
  }, [ttsEnabled]);

  // ── Initialization – start webcam + fetch first question ──────────────────
  useEffect(() => {
    if (initialized || !id) return;
    setInitialized(true);

    const init = async () => {
      // Start webcam
      await webcam.startWebcam();

      // Fetch first AI question
      try {
        const question = await interview.fetchNextQuestion(id);
        if (question) speak(question);
      } catch {
        toast.error("Could not connect to AI. Ensure Ollama is running.");
      }
    };

    init();
  }, [id, initialized]); // eslint-disable-line

  // ── Sync speech transcript to answer box ─────────────────────────────────
  useEffect(() => {
    if (speech.finalTranscript) {
      setCurrentAnswer(speech.finalTranscript);
    }
  }, [speech.finalTranscript]);

  // ── Submit answer ──────────────────────────────────────────────────────────
  const handleSubmitAnswer = useCallback(async () => {
    const answer = currentAnswer.trim() || speech.finalTranscript.trim();
    if (!answer) {
      toast.error("Please speak or type your answer first.");
      return;
    }

    speech.stopListening();
    speech.resetTranscript();
    setCurrentAnswer("");

    const result = await interview.submitAnswer(id, answer);

    // Show score toast so user clearly sees the evaluation
    if (result?.score != null) {
      const pct = Math.round(result.score * 10);
      const icon = pct >= 70 ? "✅" : pct >= 40 ? "⚠️" : "❌";
      toast(`Answer scored: ${pct}/100 ${icon}`, {
        duration: 3000,
        style: { background: pct >= 70 ? "#065f46" : pct >= 40 ? "#78350f" : "#7f1d1d" },
      });
    }

    // Give user 2.5s to read the feedback before next question loads
    await new Promise((res) => setTimeout(res, 2500));

    // Check if we've reached the max questions
    if (interview.questionNumber >= interview.maxQuestions) {
      toast("Final question answered! Great job 🎉", { icon: "✅" });
      return;
    }

    // Fetch next question
    const nextQ = await interview.fetchNextQuestion(id);
    if (nextQ) speak(nextQ);
  }, [currentAnswer, speech, interview, id, speak]);

  // ── End interview ──────────────────────────────────────────────────────────
  const handleEndInterview = useCallback(async () => {
    clearInterval(timerRef.current);
    speech.stopListening();
    synthRef.current?.cancel();
    webcam.stopWebcam();

    const speechData = speech.getSpeechAnalytics();

    try {
      await interview.finishInterview(id, {
        eye_contact_score: eyeScore,
        emotion_score: emotionScore,
        speech_score: speechData.speechScore,
        filler_words_count: speechData.fillerCount,
        duration_minutes: parseFloat((timer / 60).toFixed(2)),
        transcript: speechData.transcript,
      });
      toast.success("Interview completed! Generating your report...");
      navigate(`/interview/report/${id}`);
    } catch {
      toast.error("Failed to complete interview. Please try again.");
    }
  }, [speech, webcam, interview, id, eyeScore, emotionScore, timer, navigate]);

  // ── Prevent accidental page leave ─────────────────────────────────────────
  useEffect(() => {
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const isAnswering = interview.phase === "asking";
  const progress = Math.round((interview.questionNumber / interview.maxQuestions) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between glass-card px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-primary-400" />
            <span className="text-white font-semibold">AI Interview</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/50 text-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <Clock size={13} />
            <span>{formatTimer(timer)}</span>
          </div>
        </div>

        {/* Question progress */}
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm hidden sm:block">
            Question {interview.questionNumber}/{interview.maxQuestions}
          </span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-violet-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title={ttsEnabled ? "Disable voice" : "Enable voice"}
          >
            {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={() => setConfirmEnd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20 text-sm font-medium transition-all"
          >
            <Square size={13} /> End
          </button>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Left: Webcam + trackers */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <WebcamPreview
            videoRef={webcam.videoRef}
            isActive={webcam.isActive}
            error={webcam.error}
            permissionStatus={webcam.permissionStatus}
            onStart={webcam.startWebcam}
            showControls={true}
          />
          <EyeContactTracker
            videoRef={webcam.videoRef}
            isActive={webcam.isActive}
            onScoreUpdate={setEyeScore}
          />
          <EmotionDisplay
            fillerCount={speech.fillerCount}
            wordsPerMinute={Math.round((speech.wordCount / Math.max(timer / 60, 0.1)))}
            isActive={webcam.isActive}
            onScoreUpdate={setEmotionScore}
          />
        </div>

        {/* Center: Chat */}
        <div className="lg:col-span-5 glass-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Brain size={16} className="text-primary-400" />
            <span className="text-white font-semibold text-sm">Interview Conversation</span>
            {interview.isLoading && (
              <span className="ml-auto text-xs text-white/40">AI responding...</span>
            )}
          </div>

          <div className="flex-1">
            <InterviewChat
              messages={interview.messages}
              isLoading={interview.isLoading && interview.phase === "loading"}
              phase={interview.phase}
            />
          </div>

          {/* Error banner */}
          {interview.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-red-400 text-xs">{interview.error}</p>
            </div>
          )}

          {/* Answer input area */}
          <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder={
                speech.isListening
                  ? "Listening... your speech appears here automatically"
                  : "Type your answer or use the microphone below"
              }
              rows={3}
              className="input-field resize-none text-sm"
              disabled={!isAnswering}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={speech.isListening ? speech.stopListening : speech.startListening}
                disabled={!isAnswering}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 ${
                  speech.isListening
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
                }`}
              >
                {speech.isListening ? (
                  <><div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Stop mic</>
                ) : (
                  <><div className="w-2 h-2 rounded-full bg-primary-400" /> Start mic</>
                )}
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={!isAnswering || interview.isLoading || (!currentAnswer.trim() && !speech.finalTranscript.trim())}
                className="ml-auto btn-primary flex items-center gap-2 text-sm py-2 px-4 disabled:opacity-40"
              >
                {interview.isLoading ? (
                  <Loader size={14} className="animate-spin" />
                ) : (
                  <>Submit <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Speech analytics */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <SpeechToText
            isListening={speech.isListening}
            isSupported={speech.isSupported}
            finalTranscript={speech.finalTranscript}
            interimText={speech.interimText}
            fillerCount={speech.fillerCount}
            wordCount={speech.wordCount}
            error={speech.error}
            onToggle={speech.isListening ? speech.stopListening : speech.startListening}
          />

          {/* Live metrics panel */}
          <div className="glass-card p-4 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-primary-400">{speech.wordCount}</div>
              <div className="text-white/40 text-xs">Words spoken</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${speech.fillerCount > 5 ? "text-red-400" : "text-emerald-400"}`}>
                {speech.fillerCount}
              </div>
              <div className="text-white/40 text-xs">Filler words</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{Math.round(eyeScore)}%</div>
              <div className="text-white/40 text-xs">Eye contact</div>
            </div>
            <div className="bg-white/5 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-violet-400">{formatTimer(timer)}</div>
              <div className="text-white/40 text-xs">Duration</div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass-card p-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wide mb-3">Live Tips</p>
            <ul className="flex flex-col gap-2 text-xs text-white/50">
              {[
                "Maintain eye contact with the camera",
                "Speak clearly at a steady pace",
                "Use the STAR method for behavioral questions",
                "Avoid filler words like 'um' and 'uh'",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-primary-400 mt-0.5">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Confirm end modal */}
      {confirmEnd && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card p-8 max-w-sm w-full text-center">
            <Square size={32} className="text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">End Interview?</h3>
            <p className="text-white/50 text-sm mb-6">
              The AI will generate your feedback report based on answers given so far.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmEnd(false)} className="btn-secondary flex-1">
                Continue
              </button>
              <button
                onClick={() => { setConfirmEnd(false); handleEndInterview(); }}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-semibold hover:bg-red-500/30 transition-all"
              >
                End & Get Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
