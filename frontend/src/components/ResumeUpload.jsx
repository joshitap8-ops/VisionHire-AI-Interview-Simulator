import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, CheckCircle, X, Loader } from "lucide-react";
import { uploadResume } from "../services/interviewService";
import toast from "react-hot-toast";

/**
 * ResumeUpload – drag-and-drop PDF upload with skill extraction feedback.
 */
export default function ResumeUpload({ onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedResume, setUploadedResume] = useState(null);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!file.name.endsWith(".pdf")) {
        toast.error("Only PDF files are supported.");
        return;
      }

      setUploading(true);
      try {
        const resume = await uploadResume(file);
        setUploadedResume(resume);
        toast.success("Resume uploaded and parsed successfully!");
        onUploadSuccess?.(resume);
      } catch (err) {
        toast.error(err.response?.data?.detail || "Upload failed. Try again.");
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  const parseSkills = (raw) => {
    try {
      return JSON.parse(raw || "[]");
    } catch {
      return [];
    }
  };

  if (uploadedResume) {
    const skills = parseSkills(uploadedResume.extracted_skills);
    return (
      <div className="glass-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-semibold">{uploadedResume.filename}</p>
            <p className="text-white/50 text-xs">Resume parsed successfully</p>
          </div>
          <button
            onClick={() => setUploadedResume(null)}
            className="ml-auto p-1.5 text-white/30 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={14} />
          </button>
        </div>

        {skills.length > 0 && (
          <div>
            <p className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">
              Extracted Skills ({skills.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 15).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 rounded-lg bg-primary-500/15 text-primary-300 text-xs font-medium border border-primary-500/20"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 15 && (
                <span className="px-2 py-1 text-white/40 text-xs">
                  +{skills.length - 15} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-primary-500 bg-primary-500/10"
          : "border-white/20 hover:border-primary-500/50 hover:bg-white/5"
      } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {uploading ? (
          <>
            <Loader size={32} className="text-primary-400 animate-spin" />
            <p className="text-white/70 font-medium">Parsing resume with AI...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center">
              {isDragActive ? (
                <FileText size={28} className="text-primary-400" />
              ) : (
                <Upload size={28} className="text-primary-400" />
              )}
            </div>
            <div>
              <p className="text-white font-semibold mb-1">
                {isDragActive ? "Drop your resume here" : "Upload your resume"}
              </p>
              <p className="text-white/40 text-sm">
                Drag & drop or click to browse · PDF only
              </p>
            </div>
            <p className="text-white/25 text-xs">
              AI will extract your skills and generate tailored questions
            </p>
          </>
        )}
      </div>
    </div>
  );
}
