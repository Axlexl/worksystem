import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdPeople,
  MdAccessTime,
  MdAccountBalanceWallet,
  MdMoneyOff,
  MdInventory2,
  MdBarChart,
  MdSettings,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

const menus = [
  { name: "Dashboard",    path: "/",            icon: MdDashboard },
  { name: "Workers",      path: "/workers",     icon: MdPeople },
  { name: "Attendance",   path: "/attendance",  icon: MdAccessTime },
  { name: "Payroll",      path: "/payroll",     icon: MdAccountBalanceWallet },
  { name: "Cash Advance", path: "/cashadvance", icon: MdMoneyOff },
  { name: "Materials",    path: "/materials",   icon: MdInventory2 },
  { name: "Reports",      path: "/reports",     icon: MdBarChart },
  { name: "Settings",     path: "/settings",    icon: MdSettings },
];

function Sidebar() {
  const location = useLocation();
  const { darkMode } = useThemeMode();
  const { user } = useAuth();

  // In light mode use a slightly lighter dark sidebar; in dark mode go deeper
  const sideBg     = darkMode ? "#020617" : "#0F172A";
  const borderLine = darkMode ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)";
  const sectionLabel = darkMode ? "#334155" : "#475569";

  return (
    <aside
      style={{
        width: "240px",
        minWidth: "240px",
        background: sideBg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        overflowX: "hidden",
        transition: "background 0.2s",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: `1px solid ${borderLine}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MdDashboard size={18} color="#fff" />
          </div>
          <div>
            <div
              style={{
                color: "#F8FAFC",
                fontWeight: 700,
                fontSize: "0.9375rem",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              WorkSystem
            </div>
            <div style={{ color: "#64748B", fontSize: "0.6875rem", marginTop: "1px" }}>
              {user?.company || "Construction Manager"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "12px 12px", flex: 1 }}>
        <div style={{ color: sectionLabel, fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "8px 8px 6px", marginBottom: "4px" }}>
          Main Menu
        </div>
        {menus.map((menu) => {
          const isActive = location.pathname === menu.path;
          const Icon = menu.icon;

          return (
            <Link
              key={menu.path}
              to={menu.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 10px",
                marginBottom: "2px",
                textDecoration: "none",
                borderRadius: "8px",
                color: isActive ? "#F8FAFC" : "#94A3B8",
                background: isActive
                  ? "linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.15) 100%)"
                  : "transparent",
                borderLeft: isActive ? "3px solid #3B82F6" : "3px solid transparent",
                transition: "all 0.15s ease",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <Icon
                size={18}
                style={{
                  flexShrink: 0,
                  color: isActive ? "#60A5FA" : "#64748B",
                  transition: "color 0.15s ease",
                }}
              />
              <span style={{ lineHeight: 1 }}>{menu.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: `1px solid ${borderLine}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {(user?.username || "A").charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#E2E8F0", fontSize: "0.8125rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username || "Admin"}
            </div>
            <div style={{ color: "#475569", fontSize: "0.6875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.company || "WorkSystem"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
