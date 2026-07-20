import { useState } from "react";
import { MdArrowBack, MdVisibility, MdVisibilityOff, MdLightMode, MdDarkMode } from "react-icons/md";
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

  const bg    = darkMode ? "#111827" : "#F9FAFB";
  const card  = darkMode ? "#1F2937" : "#FFFFFF";
  const soft  = darkMode ? "#374151" : "#F3F4F6";
  const bdr   = darkMode ? "#374151" : "#E5E7EB";
  const text  = darkMode ? "#F9FAFB" : "#111827";
  const muted = darkMode ? "#9CA3AF" : "#6B7280";
  const inBg  = darkMode ? "#111827" : "#F9FAFB";
  const blue  = "#3B82F6";

  const inp = {
    width: "100%", padding: "10px 12px", borderRadius: "8px",
    border: `1.5px solid ${bdr}`, background: inBg, color: text,
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };

  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError("Please fill in both fields."); return; }
    setLoading(true); setError("");
    try {
      const res = await loginUser({ username: form.username, password: form.password });
      if (!res.ok) { setError(res.error); return; }
      login(res.user);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", transition: "background 0.2s" }}>

      <button onClick={toggleDark} style={{ position: "fixed", top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${bdr}`, background: card, cursor: "pointer", color: muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {darkMode ? <MdLightMode size={17} /> : <MdDarkMode size={17} />}
      </button>

      <div style={{ width: "100%", maxWidth: "380px" }}>

        {/* Back */}
        <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: "0.875rem", padding: 0, marginBottom: "24px" }}>
          <MdArrowBack size={16} /> Back
        </button>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "6px" }}>Sign in</div>
          <div style={{ fontSize: "0.875rem", color: muted }}>Enter your username and password to continue.</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: muted, display: "block", marginBottom: "6px" }}>Username</label>
            <input name="username" value={form.username} onChange={change} placeholder="your username" autoComplete="username"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = blue)}
              onBlur={(e)  => (e.target.style.borderColor = bdr)}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: muted }}>Password</label>
              <button type="button" onClick={onForgot} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: blue, fontWeight: 500, padding: 0 }}>
                Forgot password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={change} placeholder="••••••••" autoComplete="current-password"
                style={{ ...inp, paddingRight: "38px" }}
                onFocus={(e) => (e.target.style.borderColor = blue)}
                onBlur={(e)  => (e.target.style.borderColor = bdr)}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, display: "flex" }}>
                {showPw ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: darkMode ? "rgba(239,68,68,0.1)" : "#FEF2F2", border: `1px solid ${darkMode ? "rgba(239,68,68,0.3)" : "#FECACA"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "0.8125rem", color: darkMode ? "#F87171" : "#DC2626" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : blue, color: loading ? muted : "#fff", fontWeight: 600, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 8px rgba(59,130,246,0.3)", marginTop: "4px" }}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.8125rem", color: muted }}>
          No account?{" "}
          <button onClick={onBack} style={{ background: "none", border: "none", color: blue, fontWeight: 600, cursor: "pointer", fontSize: "0.8125rem", padding: 0 }}>Register your company</button>
        </div>
      </div>
    </div>
  );
}
