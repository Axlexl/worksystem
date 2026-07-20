import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { validateSession } from "../services/auth.service";

const AuthContext = createContext(null);
const SESSION_KEY = "ws_session";

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!validateSession(user.token)) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user,       setUser]       = useState(loadSession);
  // "idle" | "logging-in" | "logging-out"
  const [transition, setTransition] = useState("idle");

  // ── Login with loading animation ──────────────────────────────────────────
  const login = useCallback((userData) => {
    setTransition("logging-in");
    setTimeout(() => {
      setUser(userData);
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      setTransition("idle");
    }, 1200);
  }, []);

  // ── Logout with loading animation ─────────────────────────────────────────
  const logout = useCallback(() => {
    setTransition("logging-out");
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem(SESSION_KEY);
      setTransition("idle");
    }, 1000);
  }, []);

  // ── Auto-logout when Electron window closes ───────────────────────────────
  useEffect(() => {
    const isElectron = typeof window !== "undefined" && Boolean(window?.api?.onAppClose);
    if (!isElectron) return;
    window.api.onAppClose(() => {
      localStorage.removeItem(SESSION_KEY);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, transition, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
