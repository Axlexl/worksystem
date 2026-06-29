import { useLocation } from "react-router-dom";
import { MdLightMode, MdDarkMode, MdLogout } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const pageMeta = {
  "/":            { title: "Dashboard",    sub: "Overview of your construction operations" },
  "/workers":     { title: "Workers",      sub: "Manage your construction crew" },
  "/attendance":  { title: "Attendance",   sub: "Track daily crew presence" },
  "/payroll":     { title: "Payroll",      sub: "Weekly salary processing" },
  "/cashadvance": { title: "Cash Advance", sub: "Track and manage worker advances" },
  "/materials":   { title: "Materials",    sub: "Inventory and stock management" },
  "/reports":     { title: "Reports",      sub: "Performance summaries and insights" },
  "/settings":    { title: "Settings",     sub: "System configuration and preferences" },
};

function Navbar() {
  const location = useLocation();
  const { darkMode, toggleDark } = useThemeMode();
  const { user, logout } = useAuth();
  const meta = pageMeta[location.pathname] || { title: "WorkSystem", sub: "" };

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

  const bg      = darkMode ? "#1E293B" : "#FFFFFF";
  const border  = darkMode ? "#334155" : "#E2E8F0";
  const text    = darkMode ? "#F1F5F9" : "#0F172A";
  const badgeBg = darkMode ? "#0F172A" : "#F8FAFC";
  const iconCol = darkMode ? "#94A3B8" : "#64748B";

  const iconBtn = (extra = {}) => ({
    width: "36px", height: "36px", borderRadius: "8px",
    border: `1px solid ${border}`, background: badgeBg,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: iconCol, flexShrink: 0,
    transition: "background 0.15s, color 0.15s",
    ...extra,
  });

  return (
    <header
      style={{
        height: "64px", background: bg,
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        borderBottom: `1px solid ${border}`,
        position: "sticky", top: 0, zIndex: 100,
        gap: "16px", transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Page title */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
          {meta.title}
        </h1>
        <span style={{ fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1 }}>{meta.sub}</span>
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Date badge */}
        <div style={{ padding: "6px 12px", background: badgeBg, border: `1px solid ${border}`, borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 500, color: darkMode ? "#94A3B8" : "#475569", whiteSpace: "nowrap" }}>
          {today}
        </div>

        {/* Dark/Light toggle */}
        <button
          onClick={toggleDark}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={iconBtn()}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? "#334155" : "#F1F5F9"; e.currentTarget.style.color = darkMode ? "#F1F5F9" : "#0F172A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = badgeBg; e.currentTarget.style.color = iconCol; }}
        >
          {darkMode ? <MdLightMode size={18} /> : <MdDarkMode size={18} />}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          title={`Sign out (${user?.username || ""})`}
          style={iconBtn()}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.15)" : "#FEF2F2"; e.currentTarget.style.color = darkMode ? "#F87171" : "#DC2626"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = badgeBg; e.currentTarget.style.color = iconCol; }}
        >
          <MdLogout size={17} />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "0.875rem", fontWeight: 700, color: "#fff",
            flexShrink: 0, border: `2px solid ${border}`,
          }}
          title={user?.username || ""}
        >
          {(user?.username || "A").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
