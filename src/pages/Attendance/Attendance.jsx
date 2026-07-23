import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button, Chip, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField,
  ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import { MdCheckCircle, MdCancel, MdEventNote, MdCalendarToday } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { dbSetAttendance, dbSetManyAttendance } from "../../services/db.service";

const STATUS_OPTIONS = ["Present", "Absent", "Leave"];

// Helper — safely get { status, hours } from whatever is stored
// (handles both old string format and new object format)
function parseRecord(val) {
  if (!val) return { status: "", hours: 8 };
  if (typeof val === "string") return { status: val, hours: 8 };
  return { status: val.status || "", hours: val.hours ?? 8 };
}

const STATUS_STYLES = {
  Present: { bg: "#DCFCE7", color: "#15803D", chip: "success" },
  Absent:  { bg: "#FEE2E2", color: "#B91C1C", chip: "error" },
  Leave:   { bg: "#FEE2E2", color: "#B91C1C", chip: "error" },
};
const STATUS_STYLES_DARK = {
  Present: { bg: "rgba(5,150,105,0.15)", color: "#34D399", chip: "success" },
  Absent:  { bg: "rgba(220,38,38,0.15)", color: "#F87171", chip: "error" },
  Leave:   { bg: "rgba(220,38,38,0.15)", color: "#F87171", chip: "error" },
};
const STATUS_ICONS = { Present: MdCheckCircle, Absent: MdCancel, Leave: MdEventNote };

function Attendance() {
  const { userId, workers, attendanceRecords, setAttendanceRecords } = useOutletContext();
  const { darkMode } = useThemeMode();
  const today = dayjs().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(today);

  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const headBg      = darkMode ? "#0F172A" : "#F8FAFC";
  const rowDivider  = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8" : "#94A3B8";
  const calBtnBg    = darkMode ? "#0F172A" : "#F8FAFC";
  const shadow      = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.05)";
  const statusStyles = darkMode ? STATUS_STYLES_DARK : STATUS_STYLES;

  const selectedRecords = attendanceRecords[selectedDate] || {};
  const attendanceList = workers.map((w) => {
    const rec = parseRecord(selectedRecords[w.id]);
    return { ...w, status: rec.status || "Absent", hours: rec.hours ?? 8 };
  });

  const counts = useMemo(() =>
    attendanceList.reduce((acc, w) => { acc[w.status] = (acc[w.status] || 0) + 1; return acc; }, { Present: 0, Absent: 0, Leave: 0 }),
    [attendanceList]
  );

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleStatusChange = async (workerId, status) => {
    if (!status) return;
    const prev = parseRecord(selectedRecords[workerId]);
    const hours = prev.hours ?? 8;
    await dbSetAttendance(userId, workerId, selectedDate, status, hours);
    setAttendanceRecords((p) => ({
      ...p, [selectedDate]: { ...(p[selectedDate] || {}), [workerId]: { status, hours } },
    }));
  };

  const handleHoursChange = async (workerId, hours) => {
    const h = Math.min(12, Math.max(0.5, Number(hours) || 8));
    const prev = parseRecord(selectedRecords[workerId]);
    const status = prev.status || "Present";
    await dbSetAttendance(userId, workerId, selectedDate, status, h);
    setAttendanceRecords((p) => ({
      ...p, [selectedDate]: { ...(p[selectedDate] || {}), [workerId]: { status, hours: h } },
    }));
  };

  const markAllPresent = async () => {
    const records = workers.reduce((acc, w) => ({ ...acc, [w.id]: { status: "Present", hours: 8 } }), {});
    await dbSetManyAttendance(userId, selectedDate, records);
    setAttendanceRecords((p) => ({ ...p, [selectedDate]: records }));
  };

  const clearAll = async () => {
    // Mark everyone Absent (removes them from pay — same as no record but explicit)
    const records = workers.reduce((acc, w) => ({ ...acc, [w.id]: { status: "Absent", hours: 0 } }), {});
    await dbSetManyAttendance(userId, selectedDate, records);
    setAttendanceRecords((p) => ({ ...p, [selectedDate]: records }));
  };

  const recentDates = Object.keys(attendanceRecords).sort((a, b) => (a < b ? 1 : -1)).slice(0, 7);

  // Calendar
  const currentMonth  = dayjs(selectedDate);
  const calStart = currentMonth.startOf("month").startOf("week");
  const calEnd   = currentMonth.endOf("month").endOf("week");
  const calDays  = [];
  let dp = calStart;
  while (dp.isBefore(calEnd) || dp.isSame(calEnd, "day")) { calDays.push(dp); dp = dp.add(1, "day"); }

  const dayStatus = (dk) => {
    const recs = attendanceRecords[dk] || {};
    const present = Object.values(recs).filter((v) => parseRecord(v).status === "Present").length;
    const absent  = Object.values(recs).filter((v) => parseRecord(v).status === "Absent").length;
    if (absent > 0 && absent >= present) return "absent";
    if (present > 0) return "present";
    return "none";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "14px" }}>
        {STATUS_OPTIONS.map((status) => {
          const Icon = STATUS_ICONS[status];
          const style = statusStyles[status];
          return (
            <div key={status} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: shadow, transition: "background 0.2s" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: style.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={style.color} />
              </div>
              <div>
                <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{status}</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: textPrimary, lineHeight: 1.1, marginTop: "2px" }}>{counts[status] || 0}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main card */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", boxShadow: shadow, overflow: "hidden", transition: "background 0.2s" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: `1px solid ${rowDivider}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Daily Crew Attendance</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "2px" }}>{dayjs(selectedDate).format("dddd, MMMM D, YYYY")}</div>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <TextField type="date" size="small" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              sx={{ width: 160 }} />
            <Button variant="contained" size="small" onClick={markAllPresent} startIcon={<MdCheckCircle size={15} />}>
              Mark All Present (8h)
            </Button>
            <Button variant="outlined" color="error" size="small" onClick={clearAll} startIcon={<MdCancel size={15} />}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Recent date chips */}
        <div style={{ padding: "12px 24px", borderBottom: `1px solid ${rowDivider}`, display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: textSub, fontWeight: 600, marginRight: "4px" }}>Recent:</span>
          {recentDates.map((date) => (
            <Chip key={date} label={dayjs(date).format("MMM D")} onClick={() => setSelectedDate(date)} size="small"
              variant={date === selectedDate ? "filled" : "outlined"} color={date === selectedDate ? "primary" : "default"} sx={{ cursor: "pointer" }} />
          ))}
        </div>

        {/* Mini calendar */}
        <div style={{ padding: "16px 24px", borderBottom: `1px solid ${rowDivider}` }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: textPrimary, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
            <MdCalendarToday size={14} color="#2563EB" /> {currentMonth.format("MMMM YYYY")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: "0.6875rem", fontWeight: 600, color: textSub, padding: "4px 0", textTransform: "uppercase" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {calDays.map((date) => {
              const dk = date.format("YYYY-MM-DD");
              const isCM = date.month() === currentMonth.month();
              const isSel = dk === selectedDate;
              const isT   = dk === today;
              const st    = dayStatus(dk);
              return (
                <button key={dk} onClick={() => setSelectedDate(dk)} style={{ padding: "6px 4px", borderRadius: "8px", border: isSel ? "2px solid #2563EB" : isT ? `1px solid ${darkMode ? "#1D4ED8" : "#BFDBFE"}` : "1px solid transparent", background: isSel ? "#2563EB" : st === "present" ? (darkMode ? "rgba(5,150,105,0.2)" : "#DCFCE7") : st === "absent" ? (darkMode ? "rgba(220,38,38,0.18)" : "#FEE2E2") : calBtnBg, cursor: "pointer", opacity: isCM ? 1 : 0.3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "44px", gap: "2px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: isSel || isT ? 700 : 400, color: isSel ? "#fff" : isCM ? textPrimary : textSub }}>{date.format("D")}</span>
                  {st !== "none" && isCM && <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: isSel ? "rgba(255,255,255,0.7)" : st === "present" ? (darkMode ? "#34D399" : "#059669") : (darkMode ? "#F87171" : "#DC2626") }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attendance table */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: "none", background: cardBg, "& .MuiTableCell-root": { color: darkMode ? "#F1F5F9" : undefined, borderColor: darkMode ? "#334155" : undefined }, "& .MuiTableHead-root .MuiTableCell-root": { background: headBg, color: darkMode ? "#94A3B8" : undefined }, "& .MuiTableRow-root:hover": { background: darkMode ? "#1E293B" : "#F8FAFC" } }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Worker</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Daily Rate</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Hours</TableCell>
                <TableCell>Pay Today</TableCell>
                <TableCell align="right">Mark Attendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceList.map((worker) => {
                const hourlyRate = worker.dailyRate / 8;
                const payToday   = worker.status === "Present" ? hourlyRate * worker.hours : 0;
                return (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${(worker.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{worker.name.charAt(0)}</div>
                        <span style={{ fontWeight: 600, color: textPrimary }}>{worker.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{worker.position}</TableCell>
                    <TableCell>₱{worker.dailyRate.toLocaleString()}<span style={{ fontSize: "0.7rem", color: textSub }}> /8h</span></TableCell>
                    <TableCell>
                      <Chip label={worker.status} color={statusStyles[worker.status]?.chip || "default"} size="small" />
                    </TableCell>

                    {/* Hours input — only editable when Present */}
                    <TableCell align="center">
                      {worker.status === "Present" ? (
                        <input
                          type="number" min="0.5" max="12" step="0.5"
                          value={worker.hours}
                          onChange={(e) => handleHoursChange(worker.id, e.target.value)}
                          style={{ width: "60px", padding: "4px 6px", borderRadius: "6px", border: `1px solid ${cardBorder}`, background: darkMode ? "#0F172A" : "#F8FAFC", color: textPrimary, fontSize: "0.875rem", textAlign: "center", outline: "none" }}
                          onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                          onBlur={(e) => (e.target.style.borderColor = cardBorder)}
                        />
                      ) : (
                        <span style={{ color: textSub, fontSize: "0.875rem" }}>—</span>
                      )}
                    </TableCell>

                    {/* Pay today */}
                    <TableCell>
                      <span style={{ fontWeight: 600, color: payToday > 0 ? (darkMode ? "#34D399" : "#059669") : textSub }}>
                        {payToday > 0 ? `₱${payToday.toLocaleString()}` : "₱0"}
                      </span>
                      {worker.status === "Present" && worker.hours !== 8 && (
                        <span style={{ fontSize: "0.7rem", color: darkMode ? "#FBBF24" : "#D97706", marginLeft: "4px" }}>({worker.hours}h)</span>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <ToggleButtonGroup value={worker.status} exclusive onChange={(_, val) => handleStatusChange(worker.id, val)} size="small"
                        sx={{ flexWrap: "wrap", justifyContent: "flex-end", "& .MuiToggleButton-root": { color: darkMode ? "#94A3B8" : undefined, borderColor: darkMode ? "#334155" : undefined, "&.Mui-selected": { background: darkMode ? "rgba(37,99,235,0.2)" : undefined, color: darkMode ? "#60A5FA" : undefined } } }}>
                        {STATUS_OPTIONS.map((opt) => (
                          <ToggleButton key={opt} value={opt} sx={{ px: "10px" }}>{opt}</ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}

export default Attendance;
