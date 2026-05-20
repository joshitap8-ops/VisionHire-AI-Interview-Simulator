import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, logout as logoutService } from "../services/authService";
import { loadFromStorage, saveToStorage } from "../utils/helpers";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadFromStorage("visionhire_user"));
  const [loading, setLoading] = useState(true);

  // Validate token and fetch fresh user data on mount
  useEffect(() => {
    const token = loadFromStorage("visionhire_token");
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((freshUser) => {
        setUser(freshUser);
        saveToStorage("visionhire_user", freshUser);
      })
      .catch(() => {
        // Token invalid – clear storage
        logoutService();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData) => {
    setUser(userData.user);
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    saveToStorage("visionhire_user", updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
