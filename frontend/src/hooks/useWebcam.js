import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useWebcam – manages webcam stream access and optional MediaRecorder.
 */
export function useWebcam() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [isActive, setIsActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState("idle"); // idle | requesting | granted | denied

  // ── Start webcam ───────────────────────────────────────────────────────────
  const startWebcam = useCallback(async () => {
    setPermissionStatus("requesting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false, // Audio handled separately by useSpeech
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      setPermissionStatus("granted");
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access."
          : `Camera error: ${err.message}`;
      setError(msg);
      setPermissionStatus("denied");
    }
  }, []);

  // ── Stop webcam ────────────────────────────────────────────────────────────
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsRecording(false);
  }, []);

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    try {
      recorderRef.current = new MediaRecorder(streamRef.current, {
        mimeType: "video/webm;codecs=vp9",
      });
      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current.start(500);
      setIsRecording(true);
    } catch {
      // Fall back to default mime type
      recorderRef.current = new MediaRecorder(streamRef.current);
      recorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorderRef.current.start(500);
      setIsRecording(true);
    }
  }, []);

  // ── Stop recording and return Blob ─────────────────────────────────────────
  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!recorderRef.current) {
        resolve(null);
        return;
      }
      recorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        resolve(blob);
      };
      recorderRef.current.stop();
      setIsRecording(false);
    });
  }, []);

  // ── Capture snapshot from video ────────────────────────────────────────────
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !isActive) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  }, [isActive]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => stopWebcam();
  }, [stopWebcam]);

  return {
    videoRef,
    isActive,
    isRecording,
    error,
    permissionStatus,
    startWebcam,
    stopWebcam,
    startRecording,
    stopRecording,
    captureSnapshot,
  };
}
