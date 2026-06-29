import { MdLightMode, MdDarkMode, MdArrowForward, MdPeople, MdCreditCard, MdBarChart, MdInventory } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";

const features = [
  { icon: MdPeople,    color: "#3B82F6", label: "Worker Management",    desc: "Track crew, daily rates & profiles" },
  { icon: MdCreditCard,color: "#8B5CF6", label: "Payroll & Cash Advance",desc: "Weekly payroll with auto deductions"  },
  { icon: MdInventory, color: "#059669", label: "Materials Tracking",   desc: "Monitor inventory & usage logs"      },
  { icon: MdBarChart,  color: "#F59E0B", label: "Reports & Payslips",   desc: "Print payslips & view summaries"     },
];

export default function Welcome({ onLogin, onRegister }) {
  const { darkMode, toggleDark } = useThemeMode();

  const bg     = darkMode ? "#0F172A" : "#EFF6FF";
  const card   = darkMode ? "#1E293B" : "#FFFFFF";
  const border = darkMode ? "#334155" : "#E2E8F0";
  const text   = darkMode ? "#F1F5F9" : "#0F172A";
  const sub    = darkMode ? "#94A3B8" : "#64748B";

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", transition: "background 0.2s", position: "relative" }}>

      {/* Theme toggle */}
      <button onClick={toggleDark} style={{ position: "fixed", top: "20px", right: "20px", width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${border}`, background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: sub, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 10 }}>
        {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
      </button>

      <div style={{ display: "flex", width: "100%", maxWidth: "900px", minHeight: "580px", borderRadius: "24px", overflow: "hidden", boxShadow: darkMode ? "0 32px 80px rgba(0,0,0,0.6)" : "0 32px 80px rgba(37,99,235,0.12)", border: `1px solid ${border}` }}>

        {/* ── Left panel — branding ─────────────────────────────────────── */}
        <div style={{ flex: "0 0 45%", background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 40%, #7C3AED 100%)", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <div>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", backdropFilter: "blur(10px)" }}>🏗</div>
              <div>
                <div style={{ fontSize: "1.1875rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>WorkSystem</div>
                <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.65)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Construction Management</div>
              </div>
            </div>

            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: "12px", letterSpacing: "-0.03em" }}>
              Manage your<br />construction team
            </div>
            <div style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "36px" }}>
              Payroll, attendance, materials and workers — all in one place.
            </div>

            {/* Feature list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {features.map(({ icon: Icon, color, label, desc }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={17} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#fff" }}>{label}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.4)" }}>
            v1.0.0 · © 2025 WorkSystem
          </div>
        </div>

        {/* ── Right panel — actions ─────────────────────────────────────── */}
        <div style={{ flex: 1, background: card, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ marginBottom: "8px", fontSize: "0.75rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.1em" }}>Welcome</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "8px" }}>Get Started</div>
          <div style={{ fontSize: "0.9375rem", color: sub, marginBottom: "40px", lineHeight: 1.6 }}>
            Sign in to your account or register a new company to begin.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button onClick={onRegister} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #2563EB, #7C3AED)", color: "#fff", fontSize: "0.9375rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Register Your Company <MdArrowForward size={18} />
            </button>
            <button onClick={onLogin} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: `1.5px solid ${border}`, background: "transparent", color: text, fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.08)" : "#EFF6FF"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = border; e.currentTarget.style.background = "transparent"; }}
            >
              Sign In to Existing Account
            </button>
          </div>

          <div style={{ marginTop: "40px", padding: "16px", background: darkMode ? "#0F172A" : "#F8FAFC", border: `1px solid ${border}`, borderRadius: "12px" }}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: darkMode ? "#475569" : "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Platform Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {["Weekly Payroll", "Cash Advance", "Attendance", "Payslip Print", "SQLite Storage", "Dark Mode"].map((tag) => (
                <span key={tag} style={{ fontSize: "0.6875rem", padding: "3px 8px", borderRadius: "5px", background: darkMode ? "#1E293B" : "#EFF6FF", color: darkMode ? "#60A5FA" : "#2563EB", fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
