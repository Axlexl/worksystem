import { useState } from "react";
import {
  MdArrowBack, MdVisibility, MdVisibilityOff,
  MdBusiness, MdPerson, MdEmail, MdLock, MdBadge,
  MdLightMode, MdDarkMode, MdCheckCircle,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { registerCompany } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

const STEPS = ["Company Info", "Admin Account"];

const STEP_ICONS  = ["🏢", "🔐"];
const STEP_DESCS  = ["Tell us about your company", "Create your admin login"];

export default function RegisterCompany({ onBack }) {
  const { login }  = useAuth();
  const { darkMode, toggleDark } = useThemeMode();

  const [step,    setStep]    = useState(0);
  const [form,    setForm]    = useState({ companyName: "", ownerName: "", email: "", username: "", password: "", confirmPassword: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const bg      = darkMode ? "#0F172A" : "#EFF6FF";
  const card    = darkMode ? "#1E293B" : "#FFFFFF";
  const border  = darkMode ? "#334155" : "#E2E8F0";
  const text    = darkMode ? "#F1F5F9" : "#0F172A";
  const sub     = darkMode ? "#94A3B8" : "#64748B";
  const inputBg = darkMode ? "#0F172A" : "#F8FAFC";

  const change = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError(""); };

  const validateStep0 = () => {
    if (!form.companyName.trim()) return "Company name is required.";
    if (!form.ownerName.trim())   return "Owner name is required.";
    if (!form.email.trim() || !form.email.includes("@")) return "A valid email is required.";
    return null;
  };
  const validateStep1 = () => {
    if (!form.username.trim())    return "Username is required.";
    if (form.username.length < 3) return "Username must be at least 3 characters.";
    if (!form.password)           return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleNext = () => {
    const err = validateStep0();
    if (err) { setError(err); return; }
    setError(""); setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setLoading(true); setError("");
    try {
      const res = await registerCompany({ companyName: form.companyName, ownerName: form.ownerName, email: form.email, username: form.username, password: form.password });
      if (!res.ok) { setError(res.error); return; }
      login(res.user);
    } catch { setError("Registration failed. Please try again."); }
    finally { setLoading(false); }
  };

  const inp = {
    width: "100%", padding: "11px 14px 11px 42px", borderRadius: "10px",
    border: `1.5px solid ${border}`, background: inputBg, color: text,
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const ico = { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: sub, pointerEvents: "none" };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", transition: "background 0.2s" }}>

      <button onClick={toggleDark} style={{ position: "fixed", top: "20px", right: "20px", width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${border}`, background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: sub, zIndex: 10 }}>
        {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
      </button>

      <div style={{ display: "flex", width: "100%", maxWidth: "900px", borderRadius: "24px", overflow: "hidden", boxShadow: darkMode ? "0 32px 80px rgba(0,0,0,0.6)" : "0 32px 80px rgba(37,99,235,0.12)", border: `1px solid ${border}` }}>

        {/* ── Left branding panel ───────────────────────────────────────── */}
        <div style={{ flex: "0 0 40%", background: "linear-gradient(160deg, #1D4ED8 0%, #2563EB 50%, #7C3AED 100%)", padding: "48px 36px", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
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

            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: "12px", letterSpacing: "-0.02em" }}>
              Set up your company in 2 steps.
            </div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "36px" }}>
              Register once, manage everything — workers, payroll, attendance, and materials.
            </div>

            {/* Step indicators */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: i < step ? "rgba(255,255,255,0.9)" : i === step ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s" }}>
                    {i < step
                      ? <MdCheckCircle size={18} color="#2563EB" />
                      : <span style={{ fontSize: "0.875rem", fontWeight: 700, color: i === step ? "#fff" : "rgba(255,255,255,0.5)" }}>{i + 1}</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: i <= step ? "#fff" : "rgba(255,255,255,0.45)" }}>{s}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}>{STEP_DESCS[i]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>© 2025 WorkSystem</div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div style={{ flex: 1, background: card, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* Back */}
          <button onClick={step === 0 ? onBack : () => { setStep(0); setError(""); }}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: sub, fontSize: "0.8125rem", fontWeight: 600, padding: 0, marginBottom: "32px", width: "fit-content" }}>
            <MdArrowBack size={15} /> {step === 0 ? "Back" : "Previous Step"}
          </button>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1, height: "4px", borderRadius: "3px", background: i <= step ? "#2563EB" : (darkMode ? "#334155" : "#E2E8F0"), transition: "background 0.3s" }} />
            ))}
          </div>

          <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            Step {step + 1} of {STEPS.length}
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>
            {STEP_ICONS[step]} {STEPS[step]}
          </div>
          <div style={{ fontSize: "0.875rem", color: sub, marginBottom: "28px" }}>{STEP_DESCS[step]}</div>

          {/* ── Step 0 ── */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Field icon={<MdBusiness size={16} />} label="Company Name"         name="companyName"  value={form.companyName} onChange={change} placeholder="e.g. Dela Cruz Construction" inp={inp} ico={ico} border={border} sub={sub} />
              <Field icon={<MdPerson   size={16} />} label="Owner / Manager Name" name="ownerName"    value={form.ownerName}   onChange={change} placeholder="Full name"                  inp={inp} ico={ico} border={border} sub={sub} />
              <Field icon={<MdEmail    size={16} />} label="Email Address"        name="email"        value={form.email}       onChange={change} placeholder="company@email.com" type="email" inp={inp} ico={ico} border={border} sub={sub} />
              {error && <ErrBox msg={error} darkMode={darkMode} />}
              <button onClick={handleNext}
                style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", background: "linear-gradient(135deg, #2563EB, #7C3AED)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", marginTop: "4px", boxShadow: "0 4px 16px rgba(37,99,235,0.35)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Summary chip */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: darkMode ? "#0F172A" : "#EFF6FF", border: `1px solid ${darkMode ? "#1E3A5F" : "#BFDBFE"}`, borderRadius: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg,#2563EB,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>🏢</div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: text }}>{form.companyName}</div>
                  <div style={{ fontSize: "0.75rem", color: sub }}>{form.ownerName} · {form.email}</div>
                </div>
              </div>

              <Field icon={<MdBadge size={16} />} label="Username" name="username" value={form.username} onChange={change} placeholder="Choose a username (min. 3 chars)" inp={inp} ico={ico} border={border} sub={sub} autoComplete="username" />

              {/* Password */}
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>Password</label>
                <div style={{ position: "relative" }}>
                  <span style={ico}><MdLock size={16} /></span>
                  <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={change} placeholder="Min. 6 characters" autoComplete="new-password"
                    style={{ ...inp, paddingRight: "42px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                    onBlur={(e)  => (e.target.style.borderColor = border)}
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: sub, display: "flex" }}>
                    {showPw ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <span style={ico}><MdLock size={16} /></span>
                  <input name="confirmPassword" type={showPw ? "text" : "password"} value={form.confirmPassword} onChange={change} placeholder="Re-enter password" autoComplete="new-password"
                    style={inp}
                    onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                    onBlur={(e)  => (e.target.style.borderColor = border)}
                  />
                </div>
              </div>

              {error && <ErrBox msg={error} darkMode={darkMode} />}

              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : "linear-gradient(135deg, #2563EB, #7C3AED)", color: loading ? sub : "#fff", fontWeight: 700, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "4px", boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.35)" }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {loading ? "Creating account…" : "Create Company Account"}
              </button>
            </form>
          )}

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "0.8125rem", color: sub }}>
            Already have an account?{" "}
            <button onClick={onBack} style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem", padding: 0 }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, label, name, value, onChange, placeholder, type = "text", inp, ico, border, sub, autoComplete }) {
  return (
    <div>
      <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={ico}>{icon}</span>
        <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete}
          style={inp}
          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
          onBlur={(e)  => (e.target.style.borderColor = border)}
        />
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
