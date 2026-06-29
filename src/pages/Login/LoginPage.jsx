import { useState } from "react";
import { MdArrowBack, MdVisibility, MdVisibilityOff, MdBadge, MdLock, MdLightMode, MdDarkMode } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { loginUser } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage({ onBack, onForgot }) {
  const { login } = useAuth();
  const { darkMode, toggleDark } = useThemeMode();
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const bg     = darkMode ? "#0F172A" : "#EFF6FF";
  const card   = darkMode ? "#1E293B" : "#FFFFFF";
  const border = darkMode ? "#334155" : "#E2E8F0";
  const text   = darkMode ? "#F1F5F9" : "#0F172A";
  const sub    = darkMode ? "#94A3B8" : "#64748B";
  const inputBg = darkMode ? "#0F172A" : "#F8FAFC";

  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError("Both fields are required."); return; }
    setLoading(true); setError("");
    try {
      const res = await loginUser({ username: form.username, password: form.password });
      if (!res.ok) { setError(res.error); return; }
      login(res.user);
    } catch { setError("Login failed. Please try again."); }
    finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "11px 14px 11px 42px", borderRadius: "10px",
    border: `1.5px solid ${border}`, background: inputBg, color: text,
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const ico = { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: sub, pointerEvents: "none" };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", transition: "background 0.2s", position: "relative" }}>

      <button onClick={toggleDark} style={{ position: "fixed", top: "20px", right: "20px", width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${border}`, background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: sub, zIndex: 10 }}>
        {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
      </button>

      <div style={{ display: "flex", width: "100%", maxWidth: "860px", borderRadius: "24px", overflow: "hidden", boxShadow: darkMode ? "0 32px 80px rgba(0,0,0,0.6)" : "0 32px 80px rgba(37,99,235,0.12)", border: `1px solid ${border}` }}>

        {/* ── Left branding panel ───────────────────────────────────────── */}
        <div style={{ flex: "0 0 42%", background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #7C3AED 100%)", padding: "48px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: "-30px", left: "-30px", width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏗</div>
              <div>
                <div style={{ fontSize: "1.0625rem", fontWeight: 800, color: "#fff" }}>WorkSystem</div>
                <div style={{ fontSize: "0.625rem", color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Construction Mgmt</div>
              </div>
            </div>

            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: "12px", letterSpacing: "-0.02em" }}>Welcome back.</div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "32px" }}>
              Sign in to continue managing your construction team, payroll, and daily operations.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Weekly payroll & payslips", "Cash advance tracking", "Attendance monitoring", "Material inventory"].map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(255,255,255,0.7)", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.75)" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>© 2025 WorkSystem</div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div style={{ flex: 1, background: card, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Back */}
          <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: sub, fontSize: "0.8125rem", fontWeight: 600, padding: 0, marginBottom: "32px", width: "fit-content" }}>
            <MdArrowBack size={15} /> Back
          </button>

          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Sign In</div>
          <div style={{ fontSize: "1.625rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Welcome Back</div>
          <div style={{ fontSize: "0.875rem", color: sub, marginBottom: "32px" }}>Sign in to your WorkSystem account</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <div>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>Username</label>
              <div style={{ position: "relative" }}>
                <span style={ico}><MdBadge size={16} /></span>
                <input name="username" value={form.username} onChange={change} placeholder="Enter your username" autoComplete="username"
                  style={inp}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e)  => (e.target.style.borderColor = border)}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub }}>Password</label>
                <button type="button" onClick={onForgot} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, color: "#3B82F6", padding: 0 }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative" }}>
                <span style={ico}><MdLock size={16} /></span>
                <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={change} placeholder="Enter your password" autoComplete="current-password"
                  style={{ ...inp, paddingRight: "42px" }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e)  => (e.target.style.borderColor = border)}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: sub, display: "flex" }}>
                  {showPw ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                </button>
              </div>
            </div>

            {error && <ErrBox msg={error} darkMode={darkMode} />}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : "linear-gradient(135deg, #2563EB, #7C3AED)", color: loading ? sub : "#fff", fontWeight: 700, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px", boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.35)", transition: "opacity 0.15s" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: "28px", textAlign: "center", fontSize: "0.8125rem", color: sub }}>
            No account yet?{" "}
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem", padding: 0 }}>
              Register your company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrBox({ msg, darkMode }) {
  return (
    <div style={{ background: darkMode ? "rgba(220,38,38,0.12)" : "#FEF2F2", border: `1px solid ${darkMode ? "rgba(220,38,38,0.35)" : "#FECACA"}`, borderRadius: "9px", padding: "10px 14px", fontSize: "0.8125rem", color: darkMode ? "#F87171" : "#DC2626", fontWeight: 500 }}>
      {msg}
    </div>
  );
}
