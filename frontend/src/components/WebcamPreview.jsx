import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, AlertCircle } from "lucide-react";

/**
 * WebcamPreview – shows live webcam feed with optional face detection overlay.
 * Accepts the videoRef and control state from useWebcam() hook.
 */
export default function WebcamPreview({
  videoRef,
  isActive,
  error,
  permissionStatus,
  onStart,
  showControls = true,
  compact = false,
}) {
  const canvasRef = useRef(null);
  const [faceDetected, setFaceDetected] = useState(false);

  // Simple face detection: check if video stream has meaningful pixel data
  useEffect(() => {
    if (!isActive || !videoRef.current) return;
    const interval = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 48;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoRef.current, 0, 0, 64, 48);
        const data = ctx.getImageData(0, 0, 64, 48).data;
        // Check if there's enough variation in pixel values (not a black frame)
        let sum = 0;
        for (let i = 0; i < data.length; i += 16) sum += data[i];
        setFaceDetected(sum > 1000);
      } catch {
        setFaceDetected(false);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive, videoRef]);

  const containerCls = compact
    ? "relative rounded-xl overflow-hidden bg-slate-900 aspect-video"
    : "relative rounded-2xl overflow-hidden bg-slate-900 aspect-video w-full";

  if (permissionStatus === "denied" || error) {
    return (
      <div className={`${containerCls} flex flex-col items-center justify-center gap-3 border border-red-500/30`}>
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-red-400 text-sm text-center px-4">
          {error || "Camera access denied. Please enable camera permissions."}
        </p>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className={`${containerCls} flex flex-col items-center justify-center gap-4 border border-white/10`}>
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
          <CameraOff size={28} className="text-white/30" />
        </div>
        <p className="text-white/40 text-sm">Camera inactive</p>
        {showControls && onStart && (
          <button onClick={onStart} className="btn-primary text-sm py-2 px-4">
            <Camera size={15} className="inline mr-2" />
            Enable Camera
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={containerCls}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover scale-x-[-1]"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Status badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-white text-xs font-medium">LIVE</span>
        </div>
        {faceDetected && (
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
            <div className="w-2 h-2 rounded-full bg-primary-400" />
            <span className="text-white/80 text-xs">Face detected</span>
          </div>
        )}
      </div>

      {/* Corner frame guides */}
      <div className="absolute inset-4 pointer-events-none">
        {[
          "top-0 left-0 border-t-2 border-l-2",
          "top-0 right-0 border-t-2 border-r-2",
          "bottom-0 left-0 border-b-2 border-l-2",
          "bottom-0 right-0 border-b-2 border-r-2",
        ].map((cls, i) => (
          <div key={i} className={`absolute w-6 h-6 border-primary-400/60 ${cls} rounded-sm`} />
        ))}
      </div>
    </div>
  );
}
