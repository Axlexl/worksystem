import { useState } from "react";
import { MdArrowBack, MdVisibility, MdVisibilityOff, MdLightMode, MdDarkMode, MdCheckCircle } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { registerCompany } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

const STEPS = ["Company Info", "Your Account"];

export default function RegisterCompany({ onBack }) {
  const { login }  = useAuth();
  const { darkMode, toggleDark } = useThemeMode();
  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState({ companyName: "", ownerName: "", email: "", username: "", password: "", confirmPassword: "" });
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
  const lbl = { fontSize: "0.8125rem", fontWeight: 600, color: muted, display: "block", marginBottom: "6px" };

  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(""); };

  const v0 = () => {
    if (!form.companyName.trim()) return "Company name is required.";
    if (!form.ownerName.trim())   return "Owner name is required.";
    if (!form.email.includes("@")) return "Enter a valid email address.";
    return null;
  };
  const v1 = () => {
    if (form.username.length < 3)  return "Username must be at least 3 characters.";
    if (form.password.length < 6)  return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords don't match.";
    return null;
  };

  const handleNext = () => { const e = v0(); if (e) { setError(e); return; } setError(""); setStep(1); };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = v1(); if (e) { setError(e); return; }
    setLoading(true); setError("");
    try {
      const res = await registerCompany({ companyName: form.companyName, ownerName: form.ownerName, email: form.email, username: form.username, password: form.password });
      if (!res.ok) { setError(res.error); return; }
      login(res.user);
    } catch { setError("Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", transition: "background 0.2s" }}>

      <button onClick={toggleDark} style={{ position: "fixed", top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${bdr}`, background: card, cursor: "pointer", color: muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {darkMode ? <MdLightMode size={17} /> : <MdDarkMode size={17} />}
      </button>

      <div style={{ width: "100%", maxWidth: "400px" }}>

        {/* Back */}
        <button onClick={step === 0 ? onBack : () => { setStep(0); setError(""); }}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: "0.875rem", padding: 0, marginBottom: "24px" }}>
          <MdArrowBack size={16} /> {step === 0 ? "Back" : "Previous"}
        </button>

        {/* Step progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= step ? blue : (darkMode ? "#374151" : "#E5E7EB"), transition: "background 0.3s" }} />
          ))}
        </div>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Step {step + 1} of {STEPS.length}</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>{STEPS[step]}</div>
          <div style={{ fontSize: "0.875rem", color: muted }}>
            {step === 0 ? "Tell us about your construction company." : "Choose your login credentials."}
          </div>
        </div>

        {/* ── Step 0 ── */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={lbl}>Company Name</label>
              <input name="companyName" value={form.companyName} onChange={change} placeholder="e.g. Santos Construction"
                style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
            </div>
            <div>
              <label style={lbl}>Owner / Manager Name</label>
              <input name="ownerName" value={form.ownerName} onChange={change} placeholder="Full name"
                style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
            </div>
            <div>
              <label style={lbl}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={change} placeholder="company@email.com"
                style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
            </div>
            {error && <ErrBox msg={error} darkMode={darkMode} />}
            <button onClick={handleNext}
              style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: blue, color: "#fff", fontWeight: 600, fontSize: "0.9375rem", cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.3)", marginTop: "4px" }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            {/* Company summary */}
            <div style={{ background: soft, border: `1px solid ${bdr}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <MdCheckCircle size={16} color={blue} />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: text }}>{form.companyName}</div>
                <div style={{ fontSize: "0.75rem", color: muted }}>{form.ownerName} · {form.email}</div>
              </div>
            </div>

            <div>
              <label style={lbl}>Username</label>
              <input name="username" value={form.username} onChange={change} placeholder="Choose a username" autoComplete="username"
                style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
            </div>

            <div>
              <label style={lbl}>Password</label>
              <div style={{ position: "relative" }}>
                <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={change} placeholder="At least 6 characters" autoComplete="new-password"
                  style={{ ...inp, paddingRight: "38px" }}
                  onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, display: "flex" }}>
                  {showPw ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                </button>
              </div>
            </div>

            <div>
              <label style={lbl}>Confirm Password</label>
              <input name="confirmPassword" type={showPw ? "text" : "password"} value={form.confirmPassword} onChange={change} placeholder="Re-enter password" autoComplete="new-password"
                style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
            </div>

            {error && <ErrBox msg={error} darkMode={darkMode} />}

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : blue, color: loading ? muted : "#fff", fontWeight: 600, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 8px rgba(59,130,246,0.3)", marginTop: "4px" }}>
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "0.8125rem", color: muted }}>
          Already have an account?{" "}
          <button onClick={onBack} style={{ background: "none", border: "none", color: blue, fontWeight: 600, cursor: "pointer", fontSize: "0.8125rem", padding: 0 }}>Sign in</button>
        </div>
      </div>
    </div>
  );
}

function ErrBox({ msg, darkMode }) {
  return (
    <div style={{ background: darkMode ? "rgba(239,68,68,0.1)" : "#FEF2F2", border: `1px solid ${darkMode ? "rgba(239,68,68,0.3)" : "#FECACA"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "0.8125rem", color: darkMode ? "#F87171" : "#DC2626" }}>
      {msg}
    </div>
  );
}
