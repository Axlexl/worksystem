import { useThemeMode } from "../../context/ThemeContext";

// Same accent color → different icon bg in light vs dark
const PALETTES = {
  light: {
    "#2563EB": { iconBg: "#DBEAFE", iconColor: "#2563EB" },
    "#059669": { iconBg: "#DCFCE7", iconColor: "#059669" },
    "#DC2626": { iconBg: "#FFE4E6", iconColor: "#DC2626" },
    "#D97706": { iconBg: "#FEF3C7", iconColor: "#D97706" },
    "#7C3AED": { iconBg: "#EDE9FE", iconColor: "#7C3AED" },
    "#0284C7": { iconBg: "#E0F2FE", iconColor: "#0284C7" },
  },
  dark: {
    "#2563EB": { iconBg: "rgba(37,99,235,0.15)",  iconColor: "#60A5FA" },
    "#059669": { iconBg: "rgba(5,150,105,0.15)",  iconColor: "#34D399" },
    "#DC2626": { iconBg: "rgba(220,38,38,0.15)",  iconColor: "#F87171" },
    "#D97706": { iconBg: "rgba(217,119,6,0.15)",  iconColor: "#FBBF24" },
    "#7C3AED": { iconBg: "rgba(124,58,237,0.15)", iconColor: "#A78BFA" },
    "#0284C7": { iconBg: "rgba(2,132,199,0.15)",  iconColor: "#38BDF8" },
  },
};

function DashboardCard({ title, value, icon: Icon, color = "#2563EB" }) {
  const { darkMode } = useThemeMode();

  const palette = (darkMode ? PALETTES.dark : PALETTES.light)[color] || PALETTES.light["#2563EB"];
  const cardBg    = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder = darkMode ? "#334155" : "#E2E8F0";
  const titleColor = darkMode ? "#94A3B8" : "#64748B";
  const valueColor = darkMode ? "#F1F5F9" : "#0F172A";

  return (
    <div
      style={{
        background: cardBg,
        borderRadius: "12px",
        border: `1px solid ${cardBorder}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: darkMode ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = darkMode
          ? "0 4px 14px rgba(0,0,0,0.4)"
          : "0 4px 12px rgba(0,0,0,0.1)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = darkMode
          ? "0 1px 3px rgba(0,0,0,0.3)"
          : "0 1px 3px rgba(0,0,0,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              color: titleColor,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: valueColor,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: palette.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={19} color={palette.iconColor} />
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard;
