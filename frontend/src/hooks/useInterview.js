import { useState, useCallback, useRef } from "react";
import {
  createInterview,
  getNextQuestion,
  evaluateAnswer,
  completeInterview,
} from "../services/interviewService";

/**
 * useInterview – orchestrates the interview state machine.
 *
 * States: idle → setup → loading_question → asking → answering →
 *         evaluating → completed
 */
export function useInterview() {
  const [interview, setInterview] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(0);
  const [messages, setMessages] = useState([]);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle|setup|loading|asking|answering|evaluating|completed
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_QUESTIONS = 7;
  const startTimeRef = useRef(null);

  // ── Start a new interview ──────────────────────────────────────────────────
  const startInterview = useCallback(async (config) => {
    setError(null);
    setIsLoading(true);
    setPhase("setup");
    setMessages([]);
    setQuestionNumber(0);
    try {
      const newInterview = await createInterview(config);
      setInterview(newInterview);
      startTimeRef.current = Date.now();
      return newInterview;
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to start interview.";
      setError(msg);
      setPhase("idle");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Fetch next question from AI ────────────────────────────────────────────
  const fetchNextQuestion = useCallback(async (interviewId) => {
    setIsLoading(true);
    setPhase("loading");
    setError(null);
    try {
      const question = await getNextQuestion(interviewId);
      setCurrentQuestion(question);
      setQuestionNumber((n) => n + 1);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: question, type: "question", id: Date.now() },
      ]);
      setPhase("asking");
      return question;
    } catch (err) {
      setError("Failed to get question from AI. Check that Ollama is running.");
      setPhase("asking");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Submit an answer ───────────────────────────────────────────────────────
  const submitAnswer = useCallback(
    async (interviewId, answer) => {
      if (!answer.trim()) return;
      setPhase("evaluating");
      setIsLoading(true);

      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        { role: "user", content: answer, type: "answer", id: Date.now() },
      ]);

      try {
        const result = await evaluateAnswer(interviewId, currentQuestion, answer);
        setLastEvaluation(result);

        const feedbackText = result.feedback || "Answer recorded. Moving to the next question.";
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: feedbackText,
            type: "feedback",
            score: result.score,
            id: Date.now() + 1,
          },
        ]);

        return result;
      } catch (err) {
        setError("Failed to evaluate answer.");
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: "Could not evaluate this answer — make sure Ollama is running with the mistral model.",
            type: "feedback",
            score: null,
            id: Date.now() + 1,
          },
        ]);
        return { score: null, feedback: "" };
      } finally {
        setIsLoading(false);
      }
    },
    [currentQuestion]
  );

  // ── Complete the interview ─────────────────────────────────────────────────
  const finishInterview = useCallback(async (interviewId, analyticsData) => {
    setIsLoading(true);
    setPhase("completed");
    setError(null);
    try {
      const durationMinutes = startTimeRef.current
        ? (Date.now() - startTimeRef.current) / 60000
        : 0;
      const finalData = await completeInterview(interviewId, {
        ...analyticsData,
        duration_minutes: parseFloat(durationMinutes.toFixed(2)),
      });
      setInterview(finalData);
      return finalData;
    } catch (err) {
      setError("Failed to complete interview. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Reset everything ───────────────────────────────────────────────────────
  const resetInterview = useCallback(() => {
    setInterview(null);
    setCurrentQuestion("");
    setQuestionNumber(0);
    setMessages([]);
    setLastEvaluation(null);
    setPhase("idle");
    setError(null);
    setIsLoading(false);
    startTimeRef.current = null;
  }, []);

  return {
    interview,
    currentQuestion,
    questionNumber,
    messages,
    lastEvaluation,
    phase,
    error,
    isLoading,
    maxQuestions: MAX_QUESTIONS,
    isCompleted: phase === "completed",
    startInterview,
    fetchNextQuestion,
    submitAnswer,
    finishInterview,
    resetInterview,
  };
}
