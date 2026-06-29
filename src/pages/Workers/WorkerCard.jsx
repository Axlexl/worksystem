import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";

function WorkerCard({ worker, onView, onEdit, onDelete }) {
  const { darkMode } = useThemeMode();

  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textMuted   = darkMode ? "#64748B"  : "#64748B";
  const textSub     = darkMode ? "#94A3B8"  : "#94A3B8";
  const statBg      = darkMode ? "#0F172A"  : "#F8FAFC";
  const dividerColor = darkMode ? "#1E293B" : "#F1F5F9";
  const shadowNormal = darkMode ? "0 1px 4px rgba(0,0,0,0.4)"  : "0 1px 3px rgba(0,0,0,0.06)";
  const shadowHover  = darkMode ? "0 6px 20px rgba(0,0,0,0.45)" : "0 6px 20px rgba(0,0,0,0.1)";

  const initials = worker.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatarColor = `hsl(${(worker.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`;

  // Button tokens
  const viewBg      = darkMode ? "rgba(37,99,235,0.15)"  : "#EFF6FF";
  const viewBgHov   = darkMode ? "rgba(37,99,235,0.25)"  : "#DBEAFE";
  const viewColor   = darkMode ? "#60A5FA"  : "#2563EB";
  const editBg      = darkMode ? "rgba(217,119,6,0.15)"  : "#FFFBEB";
  const editBgHov   = darkMode ? "rgba(217,119,6,0.25)"  : "#FEF3C7";
  const editColor   = darkMode ? "#FBBF24"  : "#D97706";
  const delBg       = darkMode ? "rgba(220,38,38,0.15)"  : "#FFF1F2";
  const delBgHov    = darkMode ? "rgba(220,38,38,0.25)"  : "#FFE4E6";
  const delColor    = darkMode ? "#F87171"  : "#DC2626";

  const cashAdvanceBg    = worker.cashAdvance > 0
    ? (darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2")
    : statBg;
  const cashAdvanceColor = worker.cashAdvance > 0
    ? (darkMode ? "#F87171" : "#DC2626")
    : textPrimary;

  return (
    <div
      style={{
        background: cardBg,
        borderRadius: "14px",
        border: `1px solid ${cardBorder}`,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: shadowNormal,
        transition: "box-shadow 0.2s, transform 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = shadowHover;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadowNormal;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "12px",
            background: avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9375rem",
              color: textPrimary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {worker.name}
          </div>
          <div style={{ fontSize: "0.8125rem", color: textMuted, marginTop: "2px" }}>
            {worker.position}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div style={{ background: statBg, borderRadius: "8px", padding: "10px 12px" }}>
          <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Daily Rate
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: textPrimary, marginTop: "2px" }}>
            ₱{worker.dailyRate.toLocaleString()}
          </div>
        </div>
        <div style={{ background: cashAdvanceBg, borderRadius: "8px", padding: "10px 12px" }}>
          <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Cash Advance
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: cashAdvanceColor, marginTop: "2px" }}>
            ₱{worker.cashAdvance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", borderTop: `1px solid ${dividerColor}`, paddingTop: "14px" }}>
        <button
          onClick={() => onView?.(worker)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: viewBg,
            color: viewColor,
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = viewBgHov)}
          onMouseLeave={(e) => (e.currentTarget.style.background = viewBg)}
        >
          <MdVisibility size={15} /> View
        </button>
        <button
          onClick={() => onEdit?.(worker)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: editBg,
            color: editColor,
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = editBgHov)}
          onMouseLeave={(e) => (e.currentTarget.style.background = editBg)}
        >
          <MdEdit size={15} /> Edit
        </button>
        <button
          onClick={() => onDelete?.(worker)}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            padding: "8px",
            borderRadius: "8px",
            border: "none",
            background: delBg,
            color: delColor,
            fontSize: "0.8125rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = delBgHov)}
          onMouseLeave={(e) => (e.currentTarget.style.background = delBg)}
        >
          <MdDelete size={15} /> Delete
        </button>
      </div>
    </div>
  );
}

export default WorkerCard;
