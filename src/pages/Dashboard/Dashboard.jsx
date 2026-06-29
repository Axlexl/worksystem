import { Link, useOutletContext } from "react-router-dom";
import {
  MdPeople,
  MdCheckCircle,
  MdCancel,
  MdAccountBalanceWallet,
  MdInventory2,
  MdMoneyOff,
  MdAccessTime,
  MdBarChart,
  MdArrowForward,
} from "react-icons/md";
import DashboardCard from "../../components/DashboardCard/DashboardCard";
import { useThemeMode } from "../../context/ThemeContext";

const QUICK_ACTIONS_LIGHT = [
  { label: "Workers",      to: "/workers",     icon: MdPeople,               color: "#2563EB", bg: "#EFF6FF",  border: "#DBEAFE" },
  { label: "Attendance",   to: "/attendance",  icon: MdAccessTime,           color: "#059669", bg: "#F0FDF4",  border: "#DCFCE7" },
  { label: "Payroll",      to: "/payroll",     icon: MdAccountBalanceWallet, color: "#D97706", bg: "#FFFBEB",  border: "#FEF3C7" },
  { label: "Cash Advance", to: "/cashadvance", icon: MdMoneyOff,             color: "#DC2626", bg: "#FFF1F2",  border: "#FFE4E6" },
  { label: "Materials",    to: "/materials",   icon: MdInventory2,           color: "#7C3AED", bg: "#F5F3FF",  border: "#EDE9FE" },
  { label: "Reports",      to: "/reports",     icon: MdBarChart,             color: "#0284C7", bg: "#F0F9FF",  border: "#E0F2FE" },
];

const QUICK_ACTIONS_DARK = [
  { label: "Workers",      to: "/workers",     icon: MdPeople,               color: "#60A5FA", bg: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.2)"  },
  { label: "Attendance",   to: "/attendance",  icon: MdAccessTime,           color: "#34D399", bg: "rgba(5,150,105,0.12)",  border: "rgba(5,150,105,0.2)"  },
  { label: "Payroll",      to: "/payroll",     icon: MdAccountBalanceWallet, color: "#FBBF24", bg: "rgba(217,119,6,0.12)",  border: "rgba(217,119,6,0.2)"  },
  { label: "Cash Advance", to: "/cashadvance", icon: MdMoneyOff,             color: "#F87171", bg: "rgba(220,38,38,0.12)",  border: "rgba(220,38,38,0.2)"  },
  { label: "Materials",    to: "/materials",   icon: MdInventory2,           color: "#A78BFA", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.2)" },
  { label: "Reports",      to: "/reports",     icon: MdBarChart,             color: "#38BDF8", bg: "rgba(2,132,199,0.12)",  border: "rgba(2,132,199,0.2)"  },
];

function Dashboard() {
  const { workers } = useOutletContext();
  const { darkMode } = useThemeMode();

  const workingDays = 5;
  const presentCount = workers.filter((w) => w.status === "Active").length;
  const absentCount = workers.length - presentCount;
  const totalGrossPay = workers.reduce((sum, w) => sum + w.dailyRate * workingDays, 0);
  const totalCashAdvance = workers.reduce((sum, w) => sum + w.cashAdvance, 0);

  // tokens
  const cardBg       = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder   = darkMode ? "#334155" : "#E2E8F0";
  const headBg       = darkMode ? "#0F172A" : "#F8FAFC";
  const rowDivider   = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary  = darkMode ? "#F1F5F9" : "#0F172A";
  const textMuted    = darkMode ? "#64748B" : "#64748B";
  const textSub      = darkMode ? "#94A3B8" : "#94A3B8";
  const rowHover     = darkMode ? "#1E293B" : "#F8FAFC";
  const iconBtnBg    = darkMode ? "#0F172A" : "#FFFFFF";

  const quickActions = darkMode ? QUICK_ACTIONS_DARK : QUICK_ACTIONS_LIGHT;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        <DashboardCard title="Total Workers"         value={workers.length}                           icon={MdPeople}               color="#2563EB" />
        <DashboardCard title="Active Today"          value={presentCount}                             icon={MdCheckCircle}          color="#059669" />
        <DashboardCard title="Absent Today"          value={absentCount}                              icon={MdCancel}               color="#DC2626" />
        <DashboardCard title="Weekly Payroll"        value={`₱${totalGrossPay.toLocaleString()}`}    icon={MdAccountBalanceWallet} color="#D97706" />
        <DashboardCard title="Materials This Week"   value="₱0"                                       icon={MdInventory2}           color="#7C3AED" />
        <DashboardCard title="Cash Advances Pending" value={`₱${totalCashAdvance.toLocaleString()}`} icon={MdMoneyOff}             color="#DC2626" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 700, color: textPrimary, margin: "0 0 14px" }}>
          Quick Actions
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.to} to={action.to} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    borderRadius: "12px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    cursor: "pointer",
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = darkMode
                      ? "0 4px 14px rgba(0,0,0,0.35)"
                      : "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "9px",
                      background: iconBtnBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={20} color={action.color} />
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: textPrimary, display: "flex", alignItems: "center", gap: "4px" }}>
                    {action.label}
                    <MdArrowForward size={13} color={textMuted} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Worker overview table */}
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: "12px",
          boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
          overflow: "hidden",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: `1px solid ${cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Worker Overview</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "2px" }}>Current roster and pay rates</div>
          </div>
          <Link to="/workers" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#2563EB", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
            View all <MdArrowForward size={14} />
          </Link>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: headBg }}>
              {["Name", "Position", "Daily Rate", "Cash Advance", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: `1px solid ${cardBorder}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.slice(0, 5).map((worker, i) => (
              <tr
                key={worker.id}
                style={{
                  borderBottom: i < Math.min(workers.length, 5) - 1 ? `1px solid ${rowDivider}` : "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = rowHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: `hsl(${(worker.id * 47) % 360}, 55%, ${darkMode ? "45%" : "52%"})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {worker.name.charAt(0)}
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: textPrimary }}>
                      {worker.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: textMuted }}>{worker.position}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", fontWeight: 600, color: textPrimary }}>₱{worker.dailyRate.toLocaleString()}</td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: worker.cashAdvance > 0 ? (darkMode ? "#F87171" : "#DC2626") : textMuted }}>
                  ₱{worker.cashAdvance.toLocaleString()}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: worker.status === "Active"
                        ? (darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7")
                        : (darkMode ? "rgba(100,116,139,0.15)" : "#F1F5F9"),
                      color: worker.status === "Active"
                        ? (darkMode ? "#34D399" : "#15803D")
                        : (darkMode ? "#94A3B8" : "#475569"),
                    }}
                  >
                    {worker.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
