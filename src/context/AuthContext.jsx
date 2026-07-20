import { createContext, useContext, useEffect, useState } from "react";
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
  const [user, setUser] = useState(loadSession);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // ── Auto-logout when Electron window closes ───────────────────────────────
  useEffect(() => {
    const isElectron = typeof window !== "undefined" && Boolean(window?.api?.onAppClose);
    if (!isElectron) return;

    window.api.onAppClose(() => {
      // Clear session so next launch requires login
      localStorage.removeItem(SESSION_KEY);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
