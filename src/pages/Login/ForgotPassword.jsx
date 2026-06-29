import { useState } from "react";
import {
  MdArrowBack, MdEmail, MdLock, MdVisibility, MdVisibilityOff,
  MdCheckCircle, MdLightMode, MdDarkMode,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { forgotPassword, resetPassword } from "../../services/auth.service";

// step: "email" → "otp" → "done"
export default function ForgotPassword({ onBack, onDone }) {
  const { darkMode, toggleDark } = useThemeMode();

  const [step,      setStep]      = useState("email");
  const [email,     setEmail]     = useState("");
  const [otp,       setOtp]       = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const bg      = darkMode ? "#0F172A" : "#EFF6FF";
  const card    = darkMode ? "#1E293B" : "#FFFFFF";
  const border  = darkMode ? "#334155" : "#E2E8F0";
  const text    = darkMode ? "#F1F5F9" : "#0F172A";
  const sub     = darkMode ? "#94A3B8" : "#64748B";
  const inputBg = darkMode ? "#0F172A" : "#F8FAFC";

  const inp = {
    width: "100%", padding: "11px 14px 11px 42px", borderRadius: "10px",
    border: `1.5px solid ${border}`, background: inputBg, color: text,
    fontSize: "0.9rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
  };
  const ico = { position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", color: sub, pointerEvents: "none" };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !email.includes("@")) { setError("Enter a valid email address."); return; }
    setLoading(true); setError("");
    const res = await forgotPassword({ email: email.trim() });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Something went wrong."); return; }
    setStep("otp");
  };

  const handleResend = async () => {
    setResendMsg(""); setError("");
    const res = await forgotPassword({ email: email.trim() });
    if (res.ok) { setResendMsg("A new code was sent to your email."); setTimeout(() => setResendMsg(""), 5000); }
    else setError(res.error || "Failed to resend.");
  };

  const handleReset = async (e) => {
    e?.preventDefault();
    if (otp.trim().length !== 6) { setError("Enter the 6-digit code."); return; }
    if (newPw.length < 6)         { setError("Password must be at least 6 characters."); return; }
    if (newPw !== confirm)         { setError("Passwords do not match."); return; }
    setLoading(true); setError("");
    const res = await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword: newPw });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Reset failed. Try again."); return; }
    setStep("done");
  };

  const stepNum = step === "email" ? 1 : step === "otp" ? 2 : 3;

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", transition: "background 0.2s" }}>

      <button onClick={toggleDark} style={{ position: "fixed", top: "20px", right: "20px", width: "38px", height: "38px", borderRadius: "10px", border: `1px solid ${border}`, background: card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: sub, zIndex: 10 }}>
        {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
      </button>

      <div style={{ display: "flex", width: "100%", maxWidth: "860px", borderRadius: "24px", overflow: "hidden", boxShadow: darkMode ? "0 32px 80px rgba(0,0,0,0.6)" : "0 32px 80px rgba(37,99,235,0.12)", border: `1px solid ${border}` }}>

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
              Reset your password.
            </div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "36px" }}>
              We'll send a 6-digit code to your registered email. Enter it here to set a new password.
            </div>

            {/* Step list */}
            {[
              { n: 1, label: "Enter your email",           done: stepNum > 1 },
              { n: 2, label: "Enter code + new password",  done: stepNum > 2 },
              { n: 3, label: "All done — sign in",         done: step === "done" },
            ].map(({ n, label, done }) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0, background: done ? "rgba(255,255,255,0.9)" : stepNum === n ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s" }}>
                  {done
                    ? <MdCheckCircle size={16} color="#2563EB" />
                    : <span style={{ fontSize: "0.75rem", fontWeight: 700, color: stepNum === n ? "#fff" : "rgba(255,255,255,0.4)" }}>{n}</span>
                  }
                </div>
                <span style={{ fontSize: "0.8125rem", color: done || stepNum === n ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", fontWeight: stepNum === n ? 700 : 400, transition: "color 0.3s" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.35)" }}>© 2025 WorkSystem</div>
        </div>

        {/* ── Right form panel ──────────────────────────────────────────── */}
        <div style={{ flex: 1, background: card, padding: "48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* ── Done ──────────────────────────────────────────────────── */}
          {step === "done" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <MdCheckCircle size={36} color={darkMode ? "#34D399" : "#059669"} />
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, marginBottom: "10px", letterSpacing: "-0.02em" }}>Password updated!</div>
              <div style={{ fontSize: "0.9375rem", color: sub, marginBottom: "32px", lineHeight: 1.7 }}>
                Your password has been changed successfully.<br />You can now sign in with your new password.
              </div>
              <button onClick={onDone}
                style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", background: "linear-gradient(135deg, #2563EB, #7C3AED)", color: "#fff", fontWeight: 700, fontSize: "0.9375rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.35)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* ── Enter email ─────────────────────────────────────────── */}
          {step === "email" && (
            <>
              <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: sub, fontSize: "0.8125rem", fontWeight: 600, padding: 0, marginBottom: "32px", width: "fit-content" }}>
                <MdArrowBack size={15} /> Back to Sign In
              </button>

              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Account Recovery</div>
              <div style={{ fontSize: "1.625rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Forgot Password</div>
              <div style={{ fontSize: "0.875rem", color: sub, marginBottom: "32px" }}>Enter the email address linked to your account</div>

              <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>Email Address</label>
                  <div style={{ position: "relative" }}>
                    <span style={ico}><MdEmail size={16} /></span>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="your@email.com" autoComplete="email"
                      style={inp}
                      onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                      onBlur={(e)  => (e.target.style.borderColor = border)}
                    />
                  </div>
                </div>
                {error && <ErrBox msg={error} darkMode={darkMode} />}
                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : "linear-gradient(135deg, #2563EB, #7C3AED)", color: loading ? sub : "#fff", fontWeight: 700, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.35)" }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  {loading ? "Sending code…" : "Send Reset Code"}
                </button>
              </form>
            </>
          )}

          {/* ── Enter OTP + new password ─────────────────────────────── */}
          {step === "otp" && (
            <>
              <button onClick={() => { setStep("email"); setOtp(""); setNewPw(""); setConfirm(""); setError(""); }}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: sub, fontSize: "0.8125rem", fontWeight: 600, padding: 0, marginBottom: "32px", width: "fit-content" }}>
                <MdArrowBack size={15} /> Back
              </button>

              <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Enter Code</div>
              <div style={{ fontSize: "1.625rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "4px" }}>Check your email</div>
              <div style={{ fontSize: "0.875rem", color: sub, marginBottom: "28px" }}>
                We sent a 6-digit code to <strong style={{ color: text }}>{email}</strong>
              </div>

              <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* OTP big input */}
                <div>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>6-Digit Reset Code</label>
                  <input
                    type="text" inputMode="numeric" maxLength={6} value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                    placeholder="— — — — — —"
                    style={{ ...inp, paddingLeft: "14px", textAlign: "center", fontSize: "1.875rem", fontWeight: 800, letterSpacing: "0.35em", borderRadius: "12px", padding: "14px" }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                    onBlur={(e)  => (e.target.style.borderColor = border)}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>New Password</label>
                    <div style={{ position: "relative" }}>
                      <span style={ico}><MdLock size={16} /></span>
                      <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => { setNewPw(e.target.value); setError(""); }} placeholder="Min. 6 chars" autoComplete="new-password"
                        style={{ ...inp, paddingRight: "42px" }}
                        onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                        onBlur={(e)  => (e.target.style.borderColor = border)}
                      />
                      <button type="button" onClick={() => setShowPw((v) => !v)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: sub, display: "flex" }}>
                        {showPw ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: sub, display: "block", marginBottom: "7px" }}>Confirm</label>
                    <div style={{ position: "relative" }}>
                      <span style={ico}><MdLock size={16} /></span>
                      <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }} placeholder="Re-enter" autoComplete="new-password"
                        style={inp}
                        onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                        onBlur={(e)  => (e.target.style.borderColor = border)}
                      />
                    </div>
                  </div>
                </div>

                {error && <ErrBox msg={error} darkMode={darkMode} />}
                {resendMsg && (
                  <div style={{ background: darkMode ? "rgba(5,150,105,0.1)" : "#F0FDF4", border: `1px solid ${darkMode ? "rgba(5,150,105,0.3)" : "#BBF7D0"}`, borderRadius: "9px", padding: "10px 14px", fontSize: "0.8125rem", color: darkMode ? "#34D399" : "#15803D", fontWeight: 500 }}>
                    ✓ {resendMsg}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: "100%", padding: "13px", borderRadius: "11px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : "linear-gradient(135deg, #2563EB, #7C3AED)", color: loading ? sub : "#fff", fontWeight: 700, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 16px rgba(37,99,235,0.35)" }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  {loading ? "Resetting password…" : "Reset Password"}
                </button>
              </form>

              <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.8125rem", color: sub }}>
                Didn't receive the code?{" "}
                <button onClick={handleResend} style={{ background: "none", border: "none", color: "#3B82F6", fontWeight: 700, cursor: "pointer", fontSize: "0.8125rem", padding: 0 }}>
                  Resend code
                </button>
              </div>
            </>
          )}

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
