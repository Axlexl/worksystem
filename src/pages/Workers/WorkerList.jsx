import WorkerCard from "./WorkerCard";
import { useThemeMode } from "../../context/ThemeContext";

function WorkerList({ workers, onView, onEdit, onDelete, onToggleStatus }) {
  const { darkMode } = useThemeMode();

  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8" : "#94A3B8";

  if (workers.length === 0) {
    return (
      <div
        style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: "14px",
          padding: "60px 24px",
          textAlign: "center",
          transition: "background 0.2s",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>👷</div>
        <div style={{ fontWeight: 700, fontSize: "1rem", color: textPrimary, marginBottom: "6px" }}>
          No workers yet
        </div>
        <div style={{ fontSize: "0.875rem", color: textSub }}>
          Click "Add Worker" to register your first crew member.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
      }}
    >
      {workers.map((worker) => (
        <WorkerCard
          key={worker.id}
          worker={worker}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}

export default WorkerList;
