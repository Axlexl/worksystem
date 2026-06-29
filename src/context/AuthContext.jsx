import { createContext, useContext, useState } from "react";
import { validateSession } from "../services/auth.service";

const AuthContext = createContext(null);

const SESSION_KEY = "ws_session";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    // Validate the token hasn't expired
    if (!validateSession(user.token)) {
      sessionStorage.removeItem(SESSION_KEY);
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
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
