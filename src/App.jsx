import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useThemeMode } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { buildTheme } from "./theme/theme";
import AppRouter from "./routes/AppRouter";
import Login from "./pages/Login/Login";

// ── Full-screen transition overlay ────────────────────────────────────────────
function TransitionOverlay({ type, darkMode }) {
  const bg   = darkMode ? "#0F172A" : "#EFF6FF";
  const text = darkMode ? "#F1F5F9" : "#0F172A";
  const sub  = darkMode ? "#64748B" : "#94A3B8";

  const message = type === "logging-in"
    ? { icon: "🏗", title: "Loading WorkSystem…", sub: "Setting up your workspace" }
    : { icon: "👋", title: "Signing out…",        sub: "See you next time" };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: "16px",
      animation: "ws-fade-in 0.2s ease",
    }}>
      <style>{`
        @keyframes ws-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ws-spin     { to   { transform: rotate(360deg) } }
        @keyframes ws-pulse    { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>

      {/* Logo */}
      <div style={{
        width: "68px", height: "68px", borderRadius: "20px",
        background: "linear-gradient(135deg, #2563EB, #7C3AED)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "32px",
        boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
        animation: "ws-pulse 1.6s ease infinite",
      }}>
        {message.icon}
      </div>

      {/* Spinner */}
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        border: `3px solid ${darkMode ? "#1E293B" : "#E2E8F0"}`,
        borderTopColor: "#2563EB",
        animation: "ws-spin 0.8s linear infinite",
      }} />

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1.125rem", fontWeight: 700, color: text, marginBottom: "4px" }}>
          {message.title}
        </div>
        <div style={{ fontSize: "0.875rem", color: sub }}>{message.sub}</div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, transition } = useAuth();
  const { darkMode } = useThemeMode();
  const theme = buildTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Transition overlay sits above everything */}
      {transition !== "idle" && (
        <TransitionOverlay type={transition} darkMode={darkMode} />
      )}

      {/* Render both layers so the destination is already mounted */}
      {user ? <AppRouter /> : <Login />}
    </ThemeProvider>
  );
}

export default function App() {
  return <AppContent />;
}
