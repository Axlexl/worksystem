import { MdLightMode, MdDarkMode } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";

export default function Welcome({ onLogin, onRegister }) {
  const { darkMode, toggleDark } = useThemeMode();

  const bg    = darkMode ? "#111827" : "#F9FAFB";
  const card  = darkMode ? "#1F2937" : "#FFFFFF";
  const soft  = darkMode ? "#374151" : "#F3F4F6";
  const bdr   = darkMode ? "#374151" : "#E5E7EB";
  const text  = darkMode ? "#F9FAFB" : "#111827";
  const muted = darkMode ? "#9CA3AF" : "#6B7280";
  const blue  = "#3B82F6";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", transition: "background 0.2s" }}>

      <button onClick={toggleDark} title="Toggle theme" style={{ position: "fixed", top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${bdr}`, background: card, cursor: "pointer", color: muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {darkMode ? <MdLightMode size={17} /> : <MdDarkMode size={17} />}
      </button>

      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Logo block */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", width: "56px", height: "56px", borderRadius: "14px", background: blue, alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "14px", boxShadow: "0 4px 14px rgba(59,130,246,0.3)" }}>🏗</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, letterSpacing: "-0.03em" }}>WorkSystem</div>
          <div style={{ fontSize: "0.875rem", color: muted, marginTop: "4px" }}>Construction crew management</div>
        </div>

        {/* Card */}
        <div style={{ background: card, border: `1px solid ${bdr}`, borderRadius: "16px", padding: "28px", boxShadow: darkMode ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.06)" }}>

          <div style={{ fontSize: "1.125rem", fontWeight: 700, color: text, marginBottom: "6px" }}>Welcome back</div>
          <div style={{ fontSize: "0.875rem", color: muted, marginBottom: "24px", lineHeight: 1.5 }}>Manage payroll, attendance, and your crew in one place.</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button onClick={onLogin}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "none", background: blue, color: "#fff", fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.3)", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              Sign In
            </button>
            <button onClick={onRegister}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: `1.5px solid ${bdr}`, background: "transparent", color: text, fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = soft)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              Register New Company
            </button>
          </div>

          {/* Feature chips */}
          <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: `1px solid ${bdr}`, display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["Payroll", "Attendance", "Cash Advance", "Payslips", "Materials", "SQLite"].map((f) => (
              <span key={f} style={{ fontSize: "0.6875rem", padding: "3px 9px", borderRadius: "20px", background: soft, color: muted, fontWeight: 500, border: `1px solid ${bdr}` }}>{f}</span>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.75rem", color: darkMode ? "#4B5563" : "#9CA3AF" }}>
          v1.0.0 · Built for construction teams
        </div>
      </div>
    </div>
  );
}
