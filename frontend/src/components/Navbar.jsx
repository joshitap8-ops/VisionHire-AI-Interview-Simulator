import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Brain, LayoutDashboard, History, User, LogOut,
  Menu, X, ChevronDown
} from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { to: "/history", label: "History", icon: <History size={16} /> },
    { to: "/profile", label: "Profile", icon: <User size={16} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">VisionHire</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === to
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {icon}
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Start interview CTA */}
                <Link
                  to="/interview/setup"
                  className="hidden sm:flex btn-primary text-sm py-2 px-4"
                >
                  + New Interview
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 glass-card px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                      {(user?.full_name || user?.username || "U")[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-white/80 max-w-[100px] truncate">
                      {user?.full_name || user?.username}
                    </span>
                    <ChevronDown size={14} className="text-white/50" />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-xl overflow-hidden z-20 border border-white/10 shadow-xl">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User size={15} /> Profile
                        </Link>
                        <hr className="border-white/10" />
                        <button
                          onClick={() => { setProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            {isAuthenticated && (
              <button
                className="md:hidden p-2 text-white/60 hover:text-white"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && isAuthenticated && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 pb-4">
          {navLinks.map(({ to, label, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white rounded-lg hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              {icon} {label}
            </Link>
          ))}
          <Link
            to="/interview/setup"
            className="btn-primary w-full mt-2 justify-center flex"
            onClick={() => setMobileOpen(false)}
          >
            + New Interview
          </Link>
        </div>
      )}
    </nav>
  );
}
