import React, { useState } from "react";
import { User, Mail, Edit3, Save, X, Brain, Award, BarChart3, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/authService";
import { formatDate } from "../utils/helpers";
import ResumeUpload from "../components/ResumeUpload";
import toast from "react-hot-toast";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile(fullName);
      updateUser(updated);
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.full_name || user?.username || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile Settings</h1>

      {/* Profile card */}
      <div className="glass-card p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-3xl font-black text-white shrink-0">
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 w-full">
            {editing ? (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-white/60 text-xs font-medium block mb-1">Full Name</label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    placeholder="Your full name"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
                  >
                    <Save size={14} /> {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setFullName(user?.full_name || ""); }}
                    className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                  >
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">
                    {user?.full_name || user?.username}
                  </h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-white/30 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <User size={13} /> @{user?.username}
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Mail size={13} /> {user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Calendar size={13} /> Joined {formatDate(user?.created_at)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account details */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Brain size={16} className="text-primary-400" /> Account Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Account Status", value: user?.is_active ? "Active" : "Inactive", color: user?.is_active ? "text-emerald-400" : "text-red-400" },
            { label: "User ID", value: `#${user?.id}`, color: "text-white/60" },
            { label: "Email", value: user?.email, color: "text-white/80" },
            { label: "Member Since", value: formatDate(user?.created_at), color: "text-white/80" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-1">{label}</p>
              <p className={`font-semibold text-sm ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Resume management */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-cyan-400" /> Resume Management
        </h3>
        <p className="text-white/50 text-sm mb-4">
          Upload your latest resume. AI will use it to generate personalized interview questions.
        </p>
        <ResumeUpload />
      </div>

      {/* Tips */}
      <div className="glass-card p-6 bg-gradient-to-br from-primary-500/5 to-violet-600/5">
        <div className="flex items-start gap-3">
          <Award size={20} className="text-primary-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold mb-1">Pro Tips for Better Results</h4>
            <ul className="text-white/50 text-sm space-y-1">
              <li>• Upload an updated resume to get role-specific questions</li>
              <li>• Use a well-lit environment for accurate emotion tracking</li>
              <li>• Practice in a quiet room for best speech recognition results</li>
              <li>• Review your interview reports to identify patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
