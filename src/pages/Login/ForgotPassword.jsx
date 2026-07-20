import { useState } from "react";
import { MdArrowBack, MdVisibility, MdVisibilityOff, MdCheckCircle, MdLightMode, MdDarkMode } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { forgotPassword, resetPassword } from "../../services/auth.service";

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

  const bg    = darkMode ? "#111827" : "#F9FAFB";
  const card  = darkMode ? "#1F2937" : "#FFFFFF"; // keep for potential use
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
    setError(""); setResendMsg("");
    const res = await forgotPassword({ email: email.trim() });
    if (res.ok) { setResendMsg("New code sent."); setTimeout(() => setResendMsg(""), 4000); }
    else setError(res.error || "Failed to resend.");
  };

  const handleReset = async (e) => {
    e?.preventDefault();
    if (otp.length !== 6)  { setError("Enter the 6-digit code."); return; }
    if (newPw.length < 6)  { setError("Password must be at least 6 characters."); return; }
    if (newPw !== confirm)  { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    const res = await resetPassword({ email: email.trim(), otp: otp.trim(), newPassword: newPw });
    setLoading(false);
    if (!res.ok) { setError(res.error || "Reset failed."); return; }
    setStep("done");
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", transition: "background 0.2s" }}>

      <button onClick={toggleDark} style={{ position: "fixed", top: "16px", right: "16px", width: "36px", height: "36px", borderRadius: "8px", border: `1px solid ${bdr}`, background: card, cursor: "pointer", color: muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {darkMode ? <MdLightMode size={17} /> : <MdDarkMode size={17} />}
      </button>

      <div style={{ width: "100%", maxWidth: "380px" }}>

        {/* ── Done ── */}
        {step === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: darkMode ? "rgba(34,197,94,0.15)" : "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <MdCheckCircle size={28} color={darkMode ? "#4ADE80" : "#16A34A"} />
            </div>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, color: text, marginBottom: "8px" }}>Password updated</div>
            <div style={{ fontSize: "0.875rem", color: muted, marginBottom: "28px", lineHeight: 1.6 }}>
              Your password has been changed. You can now sign in with your new password.
            </div>
            <button onClick={onDone}
              style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: blue, color: "#fff", fontWeight: 600, fontSize: "0.9375rem", cursor: "pointer", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" }}>
              Back to Sign In
            </button>
          </div>
        )}

        {/* ── Enter email ── */}
        {step === "email" && (
          <>
            <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: "0.875rem", padding: 0, marginBottom: "24px" }}>
              <MdArrowBack size={16} /> Back to Sign In
            </button>
            <div style={{ marginBottom: "28px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "6px" }}>Forgot password?</div>
              <div style={{ fontSize: "0.875rem", color: muted, lineHeight: 1.6 }}>
                Enter the email linked to your account and we'll send a 6-digit reset code.
              </div>
            </div>
            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={lbl}>Email Address</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="your@email.com" autoComplete="email"
                  style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
              </div>
              {error && <ErrBox msg={error} darkMode={darkMode} />}
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : blue, color: loading ? muted : "#fff", fontWeight: 600, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 8px rgba(59,130,246,0.3)" }}>
                {loading ? "Sending…" : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {/* ── Enter OTP + new password ── */}
        {step === "otp" && (
          <>
            <button onClick={() => { setStep("email"); setOtp(""); setNewPw(""); setConfirm(""); setError(""); }}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: "0.875rem", padding: 0, marginBottom: "24px" }}>
              <MdArrowBack size={16} /> Back
            </button>
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: text, letterSpacing: "-0.03em", marginBottom: "6px" }}>Check your email</div>
              <div style={{ fontSize: "0.875rem", color: muted, lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong style={{ color: text }}>{email}</strong>. Enter it below with your new password.
              </div>
            </div>
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={lbl}>6-Digit Code</label>
                <input type="text" inputMode="numeric" maxLength={6} value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                  placeholder="000000"
                  style={{ ...inp, textAlign: "center", fontSize: "1.75rem", fontWeight: 800, letterSpacing: "0.3em", padding: "12px" }}
                  onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
              </div>
              <div>
                <label style={lbl}>New Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => { setNewPw(e.target.value); setError(""); }} placeholder="At least 6 characters" autoComplete="new-password"
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
                <input type={showPw ? "text" : "password"} value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(""); }} placeholder="Re-enter new password" autoComplete="new-password"
                  style={inp} onFocus={(e) => (e.target.style.borderColor = blue)} onBlur={(e) => (e.target.style.borderColor = bdr)} />
              </div>
              {error    && <ErrBox msg={error} darkMode={darkMode} />}
              {resendMsg && (
                <div style={{ background: darkMode ? "rgba(34,197,94,0.1)" : "#F0FDF4", border: `1px solid ${darkMode ? "rgba(34,197,94,0.3)" : "#BBF7D0"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "0.8125rem", color: darkMode ? "#4ADE80" : "#16A34A" }}>
                  ✓ {resendMsg}
                </div>
              )}
              <button type="submit" disabled={loading}
                style={{ width: "100%", padding: "11px", borderRadius: "9px", border: "none", background: loading ? (darkMode ? "#1E3A5F" : "#BFDBFE") : blue, color: loading ? muted : "#fff", fontWeight: 600, fontSize: "0.9375rem", cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 8px rgba(59,130,246,0.3)" }}>
                {loading ? "Resetting…" : "Reset Password"}
              </button>
            </form>
            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.8125rem", color: muted }}>
              Didn't get it?{" "}
              <button onClick={handleResend} style={{ background: "none", border: "none", color: blue, fontWeight: 600, cursor: "pointer", fontSize: "0.8125rem", padding: 0 }}>Resend code</button>
            </div>
          </>
        )}
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
