import { useState, useEffect } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Switch, TextField } from "@mui/material";
import {
  MdBusiness, MdTune, MdCheckCircle, MdStorage, MdSecurity,
  MdAccessTime, MdLogout, MdBackup, MdRestore, MdFolderOpen,
  MdComputer, MdInfo, MdContentCopy, MdLock, MdPerson,
  MdVisibility, MdVisibilityOff, MdEmail,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { isElectron } from "../../services/db.service";
import { changePassword, updateProfile } from "../../services/auth.service";

// ── Shared section card ───────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, subtitle, children, darkMode }) {
  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const rowDiv      = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8" : "#94A3B8";
  const iconBg      = darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF";
  const iconColor   = darkMode ? "#60A5FA" : "#2563EB";
  const shadow      = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)";
  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: shadow, transition: "background 0.2s" }}>
      <div style={{ padding: "18px 20px", borderBottom: `1px solid ${rowDiv}`, display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={18} color={iconColor} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>{title}</div>
          {subtitle && <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

// ── Status row ────────────────────────────────────────────────────────────────
function StatusRow({ icon: Icon, label, value, color, iconColor, darkMode }) {
  const rowDiv     = darkMode ? "#1E293B" : "#F1F5F9";
  const textLabel  = darkMode ? "#CBD5E1" : "#374151";
  const badgeBg    = color === "#059669"
    ? (darkMode ? "rgba(5,150,105,0.15)"   : "#DCFCE7")
    : color === "#2563EB"
    ? (darkMode ? "rgba(37,99,235,0.15)"   : "#EFF6FF")
    : (darkMode ? "rgba(100,116,139,0.15)" : "#F1F5F9");
  const badgeColor = color === "#059669"
    ? (darkMode ? "#34D399" : "#059669")
    : color === "#2563EB"
    ? (darkMode ? "#60A5FA" : "#2563EB")
    : (darkMode ? "#94A3B8" : "#64748B");
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${rowDiv}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon size={16} color={darkMode ? "#64748B" : iconColor} />
        <span style={{ fontSize: "0.875rem", color: textLabel }}>{label}</span>
      </div>
      <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: badgeColor, padding: "3px 10px", borderRadius: "6px", background: badgeBg }}>
        {value}
      </span>
    </div>
  );
}

// ── Password visibility toggle input ─────────────────────────────────────────
function PwField({ label, value, onChange, name, darkMode }) {
  const [show, setShow] = useState(false);
  const cardBorder = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  return (
    <div style={{ position: "relative" }}>
      <TextField
        fullWidth label={label} name={name} size="small"
        type={show ? "text" : "password"} value={value} onChange={onChange}
        InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: textPrimary, paddingRight: "40px" } }}
        InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: darkMode ? "#64748B" : "#94A3B8", display: "flex", alignItems: "center" }}
      >
        {show ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
      </button>
    </div>
  );
}

// ── Main Settings component ───────────────────────────────────────────────────
function Settings() {
  const { darkMode } = useThemeMode();
  const { user, login, logout } = useAuth();

  // ── Logout confirm ────────────────────────────────────────────────────────
  const [confirmLogout, setConfirmLogout] = useState(false);

  // ── Company / preferences state ───────────────────────────────────────────
  const [settings, setSettings] = useState({
    companyName:    user?.company  || "WorkSystem Construction",
    email:          user?.email    || "",
    currency:       "PHP",
    autoPayroll:    true,
    notifyAbsences: false,
  });
  const [saved, setSaved] = useState(false);

  // ── Account profile edit state ────────────────────────────────────────────
  const [profile, setProfile] = useState({
    ownerName: user?.ownerName || "",
    email:     user?.email     || "",
    company:   user?.company   || "",
  });
  const [profileMsg,    setProfileMsg]    = useState({ type: "", text: "" });
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Change password state ─────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwMsg,  setPwMsg]  = useState({ type: "", text: "" });
  const [pwSaving, setPwSaving] = useState(false);

  // ── Email config state (for forgot-password OTP delivery) ─────────────────
  const [emailCfg,     setEmailCfg]     = useState({ host: "smtp.gmail.com", port: "587", user: "", pass: "" });
  const [emailMsg,     setEmailMsg]     = useState({ type: "", text: "" });
  const [emailSaving,  setEmailSaving]  = useState(false);

  // Load saved email config on mount (Electron only)
  useEffect(() => {
    if (!isElectron) return;
    window.api.getEmailConfig().then((res) => {
      if (res.ok && res.config && res.config.user) {
        setEmailCfg((p) => ({ ...p, ...res.config, pass: "" })); // never pre-fill password
      }
    });
  }, []);

  // ── Backup state ──────────────────────────────────────────────────────────
  const [backupMsg,     setBackupMsg]     = useState({ type: "", text: "" });
  const [backupLoading, setBackupLoading] = useState(false);
  const [dbInfo,        setDbInfo]        = useState(null);

  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8" : "#94A3B8";
  const rowDiv      = darkMode ? "#1E293B" : "#F1F5F9";

  const flashMsg = (setter, type, text, ms = 5000) => {
    setter({ type, text });
    setTimeout(() => setter({ type: "", text: "" }), ms);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profile.ownerName.trim()) {
      return flashMsg(setProfileMsg, "error", "Owner name cannot be empty.");
    }
    setProfileSaving(true);
    const res = await updateProfile({
      userId:    user.id,
      ownerName: profile.ownerName.trim(),
      email:     profile.email.trim(),
      company:   profile.company.trim(),
    });
    setProfileSaving(false);
    if (res.ok) {
      // Refresh session with new profile data
      const updated = { ...user, ownerName: profile.ownerName.trim(), email: profile.email.trim(), company: profile.company.trim() };
      login(updated);
      flashMsg(setProfileMsg, "success", "Profile updated successfully.");
    } else {
      flashMsg(setProfileMsg, "error", res.error || "Failed to update profile.");
    }
  };

  // ── Change password ───────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!pwForm.current) return flashMsg(setPwMsg, "error", "Enter your current password.");
    if (pwForm.next.length < 6) return flashMsg(setPwMsg, "error", "New password must be at least 6 characters.");
    if (pwForm.next !== pwForm.confirm) return flashMsg(setPwMsg, "error", "New passwords do not match.");
    setPwSaving(true);
    const res = await changePassword({ userId: user.id, currentPassword: pwForm.current, newPassword: pwForm.next });
    setPwSaving(false);
    if (res.ok) {
      setPwForm({ current: "", next: "", confirm: "" });
      flashMsg(setPwMsg, "success", "Password changed successfully.");
    } else {
      flashMsg(setPwMsg, "error", res.error || "Failed to change password.");
    }
  };

  // ── Save email SMTP config ────────────────────────────────────────────────
  const handleSaveEmailConfig = async () => {
    if (!emailCfg.user.trim()) return flashMsg(setEmailMsg, "error", "SMTP username / email is required.");
    if (!emailCfg.pass.trim()) return flashMsg(setEmailMsg, "error", "App password is required.");
    setEmailSaving(true);
    const res = await window.api.saveEmailConfig({
      host: emailCfg.host.trim() || "smtp.gmail.com",
      port: Number(emailCfg.port) || 587,
      user: emailCfg.user.trim(),
      pass: emailCfg.pass.trim(),
    });
    setEmailSaving(false);
    if (res.ok) {
      setEmailCfg((p) => ({ ...p, pass: "" }));
      flashMsg(setEmailMsg, "success", "Email settings saved. Forgot-password emails will now be sent.");
    } else {
      flashMsg(setEmailMsg, "error", res.error || "Failed to save email config.");
    }
  };

  // ── Backup helpers ────────────────────────────────────────────────────────
  const showBackupMsg = (type, text) => flashMsg(setBackupMsg, type, text);

  const handleCreateBackup = async () => {
    if (!isElectron) { showBackupMsg("info", "Backup is available in the desktop (Electron) version."); return; }
    setBackupLoading(true);
    const res = await window.api.createBackup();
    setBackupLoading(false);
    res.ok ? showBackupMsg("success", `Backup saved: ${res.path}`) : showBackupMsg("error", res.error);
  };

  const handleExportBackup = async () => {
    if (!isElectron) { showBackupMsg("info", "Export is available in the desktop version."); return; }
    const res = await window.api.exportBackup();
    res.ok ? showBackupMsg("success", `Exported to: ${res.path}`) : showBackupMsg("info", "Export cancelled.");
  };

  const handleImportRestore = async () => {
    if (!isElectron) { showBackupMsg("info", "Restore is available in the desktop version."); return; }
    const pick = await window.api.importBackup();
    if (!pick.ok) return;
    const ok = window.confirm(`Restore from:\n${pick.backupPath}\n\nAll current data will be replaced and the app will restart.\n\nContinue?`);
    if (!ok) return;
    await window.api.restoreBackup({ backupPath: pick.backupPath });
  };

  const handleOpenFolder = async () => {
    if (!isElectron) { showBackupMsg("info", "Available in the desktop version."); return; }
    await window.api.openBackupFolder();
  };

  const handleShowDbPath = async () => {
    if (!isElectron) { showBackupMsg("info", "Available in the desktop version."); return; }
    const res = await window.api.getDbPath();
    if (res.ok) setDbInfo(res);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>

      {saved && (
        <Alert severity="success" icon={<MdCheckCircle size={18} />} sx={{ borderRadius: "10px", fontWeight: 500 }}>
          Settings saved successfully.
        </Alert>
      )}

      {/* ── Account ──────────────────────────────────────────────────────── */}
      <SectionCard icon={MdPerson} title="Account" subtitle="Your profile and login credentials" darkMode={darkMode}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px" }}>

          {/* Left — Profile info */}
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: darkMode ? "#64748B" : "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Profile
            </div>
            {profileMsg.text && (
              <Alert severity={profileMsg.type === "error" ? "error" : "success"} sx={{ mb: 2, borderRadius: "8px", fontSize: "0.8125rem" }}>
                {profileMsg.text}
              </Alert>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <TextField fullWidth label="Username" size="small" value={user?.username || ""} disabled
                InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#64748B" : "#94A3B8" } }}
                InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
                helperText="Username cannot be changed"
                FormHelperTextProps={{ style: { color: darkMode ? "#475569" : undefined } }}
              />
              <TextField fullWidth label="Owner / Full Name" size="small"
                value={profile.ownerName}
                onChange={(e) => setProfile((p) => ({ ...p, ownerName: e.target.value }))}
                InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
                InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              />
              <TextField fullWidth label="Email" size="small" type="email"
                value={profile.email}
                onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
                InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              />
              <TextField fullWidth label="Company Name" size="small"
                value={profile.company}
                onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
                InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
                InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              />
              <Button variant="outlined" onClick={handleSaveProfile} disabled={profileSaving} sx={{ alignSelf: "flex-start" }}>
                {profileSaving ? "Saving…" : "Save Profile"}
              </Button>
            </div>
          </div>

          {/* Right — Change password */}
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: darkMode ? "#64748B" : "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>
              Change Password
            </div>
            {pwMsg.text && (
              <Alert severity={pwMsg.type === "error" ? "error" : "success"} sx={{ mb: 2, borderRadius: "8px", fontSize: "0.8125rem" }}>
                {pwMsg.text}
              </Alert>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <PwField label="Current Password"  name="current" value={pwForm.current}  onChange={(e) => setPwForm((p) => ({ ...p, current: e.target.value }))}  darkMode={darkMode} />
              <PwField label="New Password"       name="next"    value={pwForm.next}     onChange={(e) => setPwForm((p) => ({ ...p, next: e.target.value }))}     darkMode={darkMode} />
              <PwField label="Confirm New Password" name="confirm" value={pwForm.confirm} onChange={(e) => setPwForm((p) => ({ ...p, confirm: e.target.value }))} darkMode={darkMode} />
              <div style={{ fontSize: "0.75rem", color: textSub, marginTop: "-4px" }}>Minimum 6 characters.</div>
              <Button
                variant="contained"
                startIcon={<MdLock size={16} />}
                onClick={handleChangePassword}
                disabled={pwSaving || !pwForm.current || !pwForm.next || !pwForm.confirm}
                sx={{ alignSelf: "flex-start" }}
              >
                {pwSaving ? "Updating…" : "Update Password"}
              </Button>
            </div>
          </div>

        </div>
      </SectionCard>

      {/* ── Email Settings (for Forgot Password OTP) ─────────────────────── */}
      <SectionCard icon={MdEmail} title="Email Settings" subtitle="Configure SMTP so forgot-password codes can be sent to users" darkMode={darkMode}>
        {!isElectron ? (
          <div style={{ fontSize: "0.875rem", color: textSub, fontStyle: "italic" }}>
            Email configuration is only available in the desktop (Electron) version.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {emailMsg.text && (
              <Alert severity={emailMsg.type === "error" ? "error" : "success"} sx={{ borderRadius: "8px", fontSize: "0.8125rem" }}>
                {emailMsg.text}
              </Alert>
            )}

            <div style={{ background: darkMode ? "#0F172A" : "#F0F9FF", border: `1px solid ${darkMode ? "#1E3A5F" : "#BFDBFE"}`, borderRadius: "8px", padding: "10px 14px", fontSize: "0.8125rem", color: darkMode ? "#60A5FA" : "#2563EB", lineHeight: 1.6 }}>
              💡 Use a <strong>Gmail App Password</strong> (not your regular password). Go to Google Account → Security → 2-Step Verification → App Passwords.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "12px" }}>
              <TextField fullWidth label="SMTP Host" size="small" value={emailCfg.host}
                onChange={(e) => setEmailCfg((p) => ({ ...p, host: e.target.value }))}
                InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
                InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              />
              <TextField fullWidth label="Port" size="small" type="number" value={emailCfg.port}
                onChange={(e) => setEmailCfg((p) => ({ ...p, port: e.target.value }))}
                InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
                InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              />
            </div>
            <TextField fullWidth label="SMTP Username (your email)" size="small" type="email" value={emailCfg.user}
              onChange={(e) => setEmailCfg((p) => ({ ...p, user: e.target.value }))}
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
            <TextField fullWidth label="App Password" size="small" type="password" value={emailCfg.pass}
              onChange={(e) => setEmailCfg((p) => ({ ...p, pass: e.target.value }))}
              placeholder="Paste your app password here"
              helperText="This is stored locally on this PC only."
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              FormHelperTextProps={{ style: { color: darkMode ? "#475569" : undefined } }}
            />
            <Button variant="contained" onClick={handleSaveEmailConfig} disabled={emailSaving} sx={{ alignSelf: "flex-start" }}>
              {emailSaving ? "Saving…" : "Save Email Settings"}
            </Button>
          </div>
        )}
      </SectionCard>

      {/* ── Company Profile + Preferences ────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <SectionCard icon={MdBusiness} title="Company Profile" subtitle="Your business identity and contact info" darkMode={darkMode}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <TextField fullWidth label="Company Name" name="companyName" value={settings.companyName} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
            <TextField fullWidth label="Contact Email" name="email" type="email" value={settings.email} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
            <TextField fullWidth label="Currency Code" name="currency" value={settings.currency} onChange={handleChange} size="small"
              helperText="e.g. PHP, USD, SGD"
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
              FormHelperTextProps={{ style: { color: darkMode ? "#64748B" : undefined } }}
            />
          </div>
        </SectionCard>

        <SectionCard icon={MdTune} title="Preferences" subtitle="System behavior and automation settings" darkMode={darkMode}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { name: "autoPayroll",    label: "Auto-calculate payroll with advances", desc: "Cash advances are automatically deducted each Saturday" },
              { name: "notifyAbsences", label: "Notify on absent workers",             desc: "Get a reminder when workers are marked absent" },
            ].map((pref) => (
              <div key={pref.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${rowDiv}` }}>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: textPrimary }}>{pref.label}</div>
                  <div style={{ fontSize: "0.75rem", color: textSub, marginTop: "2px" }}>{pref.desc}</div>
                </div>
                <Switch checked={settings[pref.name]} onChange={handleChange} name={pref.name} size="small" sx={{ flexShrink: 0, ml: 2 }} />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── System Health ─────────────────────────────────────────────────── */}
      <SectionCard icon={MdStorage} title="System Health" subtitle="Real-time status of all system modules" darkMode={darkMode}>
        <div>
          <StatusRow icon={MdCheckCircle} label="Reporting Engine"     value="Online"    color="#059669" iconColor="#059669" darkMode={darkMode} />
          <StatusRow icon={MdSecurity}    label="Payroll Calculations" value={settings.autoPayroll ? "Enabled" : "Disabled"} color={settings.autoPayroll ? "#059669" : "#64748B"} iconColor={settings.autoPayroll ? "#059669" : "#94A3B8"} darkMode={darkMode} />
          <StatusRow icon={MdAccessTime}  label="Attendance Tracking"  value="Active"    color="#059669" iconColor="#059669" darkMode={darkMode} />
          <StatusRow icon={MdStorage}     label="Data Persistence"     value={isElectron ? "SQLite (Local)" : "localStorage (Web)"} color="#2563EB" iconColor="#2563EB" darkMode={darkMode} />
          <StatusRow icon={MdSecurity}    label="Logged in as"         value={`${user?.username || "—"} · ${user?.role || "administrator"}`} color="#2563EB" iconColor="#2563EB" darkMode={darkMode} />
          <StatusRow icon={MdBusiness}    label="Company"              value={user?.company || "—"} color="#059669" iconColor="#059669" darkMode={darkMode} />
        </div>
      </SectionCard>

      {/* ── Backup & Restore ──────────────────────────────────────────────── */}
      <SectionCard icon={MdBackup} title="Backup & Restore" subtitle="Protect your data — automatic backups run on every launch" darkMode={darkMode}>
        {backupMsg.text && (
          <Alert severity={backupMsg.type === "error" ? "error" : backupMsg.type === "info" ? "info" : "success"} sx={{ mb: 2, borderRadius: "8px", fontSize: "0.8125rem" }}>
            {backupMsg.text}
          </Alert>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { icon: MdBackup,     label: "Create Backup Now",        desc: "Save a snapshot of all your data",       fn: handleCreateBackup,  color: "primary",   loading: backupLoading },
            { icon: MdFolderOpen, label: "Export Backup File",       desc: "Save backup to a custom location",       fn: handleExportBackup,  color: "secondary", loading: false },
            { icon: MdRestore,    label: "Restore from Backup File", desc: "Pick a .db file to restore from",        fn: handleImportRestore, color: "warning",   loading: false },
            { icon: MdFolderOpen, label: "Open Backup Folder",       desc: "Browse all automatic backup files",      fn: handleOpenFolder,    color: "inherit",   loading: false },
          ].map(({ icon: Icon, label, desc, fn, color, loading: btnLoading }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${darkMode ? "#1E293B" : "#F1F5F9"}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={darkMode ? "#60A5FA" : "#2563EB"} />
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: darkMode ? "#F1F5F9" : "#0F172A" }}>{label}</div>
                  <div style={{ fontSize: "0.75rem", color: darkMode ? "#94A3B8" : "#94A3B8", marginTop: "1px" }}>{desc}</div>
                </div>
              </div>
              <Button size="small" variant="outlined" color={color} onClick={fn} disabled={btnLoading} sx={{ flexShrink: 0, ml: 2 }}>
                {btnLoading ? "Working…" : "Run"}
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Transfer to New PC ────────────────────────────────────────────── */}
      <SectionCard icon={MdComputer} title="Transfer to New PC" subtitle="Move your account and all data to another computer" darkMode={darkMode}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { step: "1", label: "Export your backup",                  desc: 'Click "Export Backup File" above and save the .db file to a USB drive, cloud storage, or email it to yourself.' },
              { step: "2", label: "Install WorkSystem on the new PC",    desc: "Download and install WorkSystem on your new computer using the same installer." },
              { step: "3", label: "Restore on the new PC",               desc: 'Open WorkSystem on the new PC, go to Settings → Backup & Restore, click "Restore from Backup File" and select the .db file.' },
              { step: "4", label: "Log in as usual",                     desc: "All your accounts, workers, payroll, and history will be fully restored. Log in with your username and password." },
            ].map(({ step, label, desc }) => (
              <div key={step} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #1D4ED8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: "1px" }}>
                  {step}
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: darkMode ? "#F1F5F9" : "#0F172A" }}>{label}</div>
                  <div style={{ fontSize: "0.8125rem", color: darkMode ? "#94A3B8" : "#64748B", marginTop: "2px", lineHeight: 1.5 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Divider sx={{ borderColor: darkMode ? "#334155" : "#E2E8F0", my: 0.5 }} />

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <MdInfo size={15} color={darkMode ? "#60A5FA" : "#2563EB"} />
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: darkMode ? "#F1F5F9" : "#0F172A" }}>Your data file location</span>
              <Button size="small" variant="outlined" onClick={handleShowDbPath} sx={{ ml: "auto", fontSize: "0.75rem", py: 0.3 }}>Show Path</Button>
            </div>
            {dbInfo ? (
              <div style={{ background: darkMode ? "#0F172A" : "#F8FAFC", border: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, borderRadius: "8px", padding: "10px 12px" }}>
                {[{ label: "Database File", val: dbInfo.dbPath }, { label: "Auto-Backup Folder", val: dbInfo.backupDir }].map(({ label, val }) => (
                  <div key={label} style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "0.6875rem", color: darkMode ? "#64748B" : "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <code style={{ fontSize: "0.75rem", color: darkMode ? "#94A3B8" : "#475569", wordBreak: "break-all", flex: 1 }}>{val}</code>
                      <button onClick={() => { navigator.clipboard.writeText(val); showBackupMsg("success", "Path copied to clipboard"); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: darkMode ? "#60A5FA" : "#2563EB", flexShrink: 0, display: "flex", alignItems: "center" }} title="Copy path">
                        <MdContentCopy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "0.8125rem", color: darkMode ? "#64748B" : "#94A3B8", fontStyle: "italic" }}>
                Click "Show Path" to see where your data is stored on this PC.
              </div>
            )}
          </div>
          <Button variant="contained" startIcon={<MdBackup size={16} />} onClick={handleExportBackup} fullWidth>
            Export Backup Now (for Transfer)
          </Button>
        </div>
      </SectionCard>

      {/* ── Footer actions ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button variant="outlined" color="error" startIcon={<MdLogout size={16} />} onClick={() => setConfirmLogout(true)}>
          Sign Out
        </Button>
        <Button variant="contained" size="large" onClick={handleSave} sx={{ px: 4 }}>
          Save Settings
        </Button>
      </div>

      {/* ── Logout confirm dialog ─────────────────────────────────────────── */}
      <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: darkMode ? "#1E293B" : "#FFFFFF", border: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : "#0F172A", background: darkMode ? "#1E293B" : "#FFFFFF" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdLogout size={18} color={darkMode ? "#F87171" : "#DC2626"} />
            </div>
            <span style={{ fontWeight: 700 }}>Sign Out</span>
          </div>
        </DialogTitle>
        <Divider sx={{ borderColor: darkMode ? "#334155" : "#E2E8F0" }} />
        <DialogContent sx={{ background: darkMode ? "#1E293B" : "#FFFFFF", pt: "16px !important" }}>
          <div style={{ fontSize: "0.9375rem", color: darkMode ? "#CBD5E1" : "#374151", lineHeight: 1.6 }}>
            Are you sure you want to sign out?
          </div>
          <div style={{ fontSize: "0.8125rem", color: darkMode ? "#64748B" : "#94A3B8", marginTop: "6px" }}>
            You will need to sign in again to access WorkSystem.
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: darkMode ? "#334155" : "#E2E8F0" }} />
        <DialogActions sx={{ background: darkMode ? "#1E293B" : "#FFFFFF", px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setConfirmLogout(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained" color="error"
            startIcon={<MdLogout size={15} />}
            onClick={() => { setConfirmLogout(false); logout(); }}
          >
            Yes, Sign Out
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default Settings;
