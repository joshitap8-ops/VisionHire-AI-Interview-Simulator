import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Mail, Lock, User, Eye, EyeOff, Loader, CheckCircle } from "lucide-react";
import { register } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8, label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p) => /[0-9]/.test(p), label: "One number" },
];

export default function SignupPage() {
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", full_name: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email";
    if (!form.username) errs.username = "Username is required";
    else if (form.username.length < 3) errs.username = "Minimum 3 characters";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8) errs.password = "Minimum 8 characters";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const data = await register(form);
      setAuth(data);
      toast.success("Account created! Welcome to VisionHire 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-primary-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">VisionHire</span>
          </Link>
          <h1 className="text-3xl font-bold mt-6 mb-2 text-white">Create your account</h1>
          <p className="text-white/50">Start your AI interview journey today</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Your full name"
                  className="input-field pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Username <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">@</span>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                  placeholder="yourusername"
                  className={`input-field pl-8 ${errors.username ? "border-red-500/50" : ""}`}
                  autoComplete="username"
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Email address <span className="text-red-400">*</span></label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className={`input-field pl-10 ${errors.email ? "border-red-500/50" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-white/70 text-sm font-medium block mb-2">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className={`input-field pl-10 pr-10 ${errors.password ? "border-red-500/50" : ""}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}

              {/* Password strength indicators */}
              {form.password && (
                <div className="flex flex-col gap-1 mt-2">
                  {PASSWORD_RULES.map(({ test, label }) => {
                    const passed = test(form.password);
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <CheckCircle size={11} className={passed ? "text-emerald-400" : "text-white/20"} />
                        <span className={`text-xs ${passed ? "text-emerald-400" : "text-white/30"}`}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 mt-1">
              {loading ? (
                <><Loader size={18} className="animate-spin" /> Creating account...</>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-white/50 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
