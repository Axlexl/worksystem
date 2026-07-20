import { useMemo, useRef, useState, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import {
  MdAccountBalanceWallet, MdPlayArrow, MdPeople, MdTrendingUp,
  MdRemoveCircle, MdExpandMore, MdExpandLess, MdDeleteOutline,
  MdDeleteForever, MdPrint, MdChevronLeft, MdChevronRight, MdEdit,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import {
  dbAddPayrollRecord, dbDeletePayrollRecord, dbGetPayrollWorkerRows,
  dbSetAttendance, dbUpdatePayrollRecord,
} from "../../services/db.service";

// Returns the Saturday that ends the pay week for a given dayjs date
function getSaturday(d) {
  const day = d.day(); // 0=Sun … 6=Sat
  return d.add((6 - day + 7) % 7 === 0 ? 0 : (6 - day + 7) % 7, "day");
}

function SummaryCard({ icon: Icon, label, value, iconBg, iconColor, highlight, darkMode }) {
  const cardBg     = highlight ? "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)" : (darkMode ? "#1E293B" : "#FFFFFF");
  const cardBorder = highlight ? "none" : (darkMode ? "1px solid #334155" : "1px solid #E2E8F0");
  const shadow     = highlight ? "0 4px 14px rgba(37,99,235,0.35)" : (darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)");
  const labelColor = highlight ? "rgba(255,255,255,0.7)" : (darkMode ? "#94A3B8" : "#94A3B8");
  const valueColor = highlight ? "#FFFFFF" : (darkMode ? "#F1F5F9" : "#0F172A");
  return (
    <div style={{ background: cardBg, border: cardBorder, borderRadius: "12px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px", boxShadow: shadow, transition: "background 0.2s" }}>
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: highlight ? "rgba(255,255,255,0.2)" : iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={20} color={highlight ? "#FFFFFF" : iconColor} />
      </div>
      <div>
        <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: labelColor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, color: valueColor, marginTop: "2px", letterSpacing: "-0.03em" }}>{value}</div>
      </div>
    </div>
  );
}

function Payroll() {
  const { workers, attendanceRecords, setAttendanceRecords, userId, payrollHistory, setPayrollHistory } = useOutletContext();
  const { darkMode } = useThemeMode();

  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const headBg      = darkMode ? "#0F172A" : "#F8FAFC";
  const rowDivider  = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textMuted   = darkMode ? "#64748B"  : "#64748B";
  const textSub     = darkMode ? "#94A3B8"  : "#94A3B8";
  const shadow      = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)";

  const accordionOpenBg  = darkMode ? "rgba(37,99,235,0.08)" : "#F0F7FF";
  const accordionBorder  = darkMode ? "#1E293B" : "#E2E8F0";
  const expandedBodyBg   = darkMode ? "#0F172A" : "#F8FAFC";
  const expandedHeadBg   = darkMode ? "#0F172A" : "#F1F5F9";
  const chevronOpenBg    = darkMode ? "rgba(37,99,235,0.2)" : "#DBEAFE";
  const chevronCloseBg   = darkMode ? "#1E293B" : "#F1F5F9";
  const workersIconBg    = darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF";
  const workersIconCol   = darkMode ? "#60A5FA" : "#2563EB";
  const grossIconBg      = darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7";
  const grossIconCol     = darkMode ? "#34D399" : "#059669";
  const dedIconBg        = darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2";
  const dedIconCol       = darkMode ? "#F87171" : "#DC2626";

  const tableSx = {
    background: cardBg,
    "& .MuiTableCell-root": { color: darkMode ? "#F1F5F9" : undefined, borderColor: darkMode ? "#334155" : undefined },
    "& .MuiTableHead-root .MuiTableCell-root": { background: headBg, color: darkMode ? "#94A3B8" : undefined },
    "& .MuiTableRow-root:hover": { background: darkMode ? "#1E293B" : "#F8FAFC" },
  };

  // ── Week navigation ────────────────────────────────────────────────────────
  // weekOffset 0 = current week, -1 = last week, -2 = two weeks ago, etc.
  const [weekOffset, setWeekOffset] = useState(0);

  const today        = dayjs();
  const thisSaturday = getSaturday(today);                          // Saturday of current week
  const selectedSat  = thisSaturday.add(weekOffset * 7, "day");    // Saturday of selected week
  const lastSaturday   = selectedSat;
  const payPeriodStart = selectedSat.subtract(5, "day");           // Mon before that Saturday
  const periodDates    = Array.from({ length: 6 }, (_, i) => payPeriodStart.add(i, "day"));
  const isCurrentWeek  = weekOffset === 0;

  const getWeekRange = (payDate) => {
    const end = dayjs(payDate);
    const start = end.subtract(5, "day");
    return Array.from({ length: 6 }, (_, i) => start.add(i, "day"));
  };

  const absentInRange = (workerId, dates) =>
    dates.reduce((count, date) => {
      const s = attendanceRecords[date.format("YYYY-MM-DD")]?.[workerId];
      // Only count as absent when EXPLICITLY marked Absent — unrecorded days are NOT deducted
      return count + (s === "Absent" ? 1 : 0);
    }, 0);

  const recordedInRange = (workerId, dates) =>
    dates.reduce((count, date) => {
      return count + (attendanceRecords[date.format("YYYY-MM-DD")]?.[workerId] ? 1 : 0);
    }, 0);

  const payrollRows = useMemo(() =>
    workers.map((worker) => {
      const grossPay = worker.dailyRate * 6;
      const absentDays = absentInRange(worker.id, periodDates);
      const absentDeduction = absentDays * worker.dailyRate;
      const netPay = Math.max(grossPay - absentDeduction - worker.cashAdvance, 0);
      return { ...worker, grossPay, absentDays, absentDeduction, netPay, daysRecorded: recordedInRange(worker.id, periodDates) };
    }), [workers, attendanceRecords]);

  const totalGross   = payrollRows.reduce((s, r) => s + r.grossPay, 0);
  const totalAdvance = payrollRows.reduce((s, r) => s + r.cashAdvance, 0);
  const totalAbsent  = payrollRows.reduce((s, r) => s + r.absentDeduction, 0);
  const totalNet     = payrollRows.reduce((s, r) => s + r.netPay, 0);

  const [expandedRecord,       setExpandedRecord]       = useState(null);
  const [confirmDeletePayroll, setConfirmDeletePayroll] = useState(null);
  const [printDialogOpen,      setPrintDialogOpen]      = useState(false);
  const [printRecord,          setPrintRecord]          = useState(null);
  // Cache of saved worker-row snapshots keyed by payroll record id
  const [recordRows,           setRecordRows]           = useState({});
  // Edit payroll record
  const [editPayrollRecord,    setEditPayrollRecord]    = useState(null); // { record, fields }
  const [editPayrollSaving,    setEditPayrollSaving]    = useState(false);
  const [receiptEdits,         setReceiptEdits]         = useState({
    companyName: "WorkSystem Construction",
    companySubtitle: "PAYSLIP / SALARY VOUCHER",
    preparedBy: "",
    note: "",
  });

  const printRef = useRef(null);

  // ── Attendance edit state ──────────────────────────────────────────────────
  // editWorker: { worker, localStatus: { "YYYY-MM-DD": status } }
  const [editWorker, setEditWorker] = useState(null);

  const openEditWorker = (worker) => {
    // Pre-fill local status from current attendanceRecords for the selected week
    const local = {};
    periodDates.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      local[key] = attendanceRecords[key]?.[worker.id] || "";
    });
    setEditWorker({ worker, localStatus: local });
  };

  const handleEditStatusChange = (dateKey, val) => {
    if (!val) return;
    setEditWorker((prev) => ({ ...prev, localStatus: { ...prev.localStatus, [dateKey]: val } }));
  };

  const handleSaveEditWorker = async () => {
    if (!editWorker) return;
    const { worker, localStatus } = editWorker;
    for (const [dateKey, status] of Object.entries(localStatus)) {
      if (status) {
        await dbSetAttendance(userId, worker.id, dateKey, status);
        setAttendanceRecords((prev) => ({
          ...prev,
          [dateKey]: { ...(prev[dateKey] || {}), [worker.id]: status },
        }));
      }
    }
    setEditWorker(null);
  };

  // ── Edit a saved payroll record ────────────────────────────────────────────
  const openEditPayrollRecord = (record) => {
    setEditPayrollRecord({
      record,
      fields: {
        payDate:         record.payDate,
        periodStart:     record.periodStart,
        periodEnd:       record.periodEnd,
        grossPay:        String(record.grossPay),
        cashAdvance:     String(record.cashAdvance),
        absentDeduction: String(record.absentDeduction),
        netPay:          String(record.netPay),
      },
    });
  };

  const handleSaveEditPayrollRecord = async () => {
    if (!editPayrollRecord) return;
    setEditPayrollSaving(true);
    const { record, fields } = editPayrollRecord;
    const updated = {
      payDate:         fields.payDate,
      periodStart:     fields.periodStart,
      periodEnd:       fields.periodEnd,
      workerCount:     record.workerCount,
      grossPay:        Number(fields.grossPay)        || 0,
      cashAdvance:     Number(fields.cashAdvance)     || 0,
      absentDeduction: Number(fields.absentDeduction) || 0,
      netPay:          Number(fields.netPay)          || 0,
    };
    const saved = await dbUpdatePayrollRecord(userId, record.id, updated);
    setPayrollHistory((prev) => prev.map((r) => r.id === record.id ? { ...r, ...updated } : r));
    setEditPayrollSaving(false);
    setEditPayrollRecord(null);
  };
  const toggleRecord = useCallback(async (id) => {
    setExpandedRecord((prev) => {
      if (prev === id) return null;
      return id;
    });
    // Load snapshot rows if not yet cached
    if (!recordRows[id]) {
      const rows = await dbGetPayrollWorkerRows(userId, id);
      if (Array.isArray(rows) && rows.length > 0) {
        setRecordRows((prev) => ({ ...prev, [id]: rows }));
      }
    }
  }, [recordRows, userId]);

  const handleDeletePayrollRecord = async () => {
    if (!confirmDeletePayroll) return;
    await dbDeletePayrollRecord(userId, confirmDeletePayroll.id);
    setPayrollHistory((prev) => prev.filter((r) => r.id !== confirmDeletePayroll.id));
    if (expandedRecord === confirmDeletePayroll.id) setExpandedRecord(null);
    setConfirmDeletePayroll(null);
  };

  const handleRunPayroll = async () => {
    const rec = {
      payDate:          lastSaturday.format("YYYY-MM-DD"),
      periodStart:      payPeriodStart.format("YYYY-MM-DD"),
      periodEnd:        lastSaturday.format("YYYY-MM-DD"),
      workerCount:      workers.length,
      grossPay:         totalGross,
      cashAdvance:      totalAdvance,
      absentDeduction:  totalAbsent,
      netPay:           totalNet,
      // Snapshot every worker's current figures at the time of payroll
      workerRows:       payrollRows,
    };
    const saved = await dbAddPayrollRecord(userId, rec);
    setPayrollHistory((prev) => [saved, ...prev]);
    // Cache the snapshot rows immediately so accordion shows them right away
    setRecordRows((prev) => ({ ...prev, [saved.id]: payrollRows }));
    setExpandedRecord(saved.id);
    // Jump back to current week after running payroll for a past week
    setWeekOffset(0);
  };

  // Returns saved snapshot rows if available, otherwise falls back to live recalculation
  const getWorkerRowsForRecord = useCallback((record) => {
    const cached = recordRows[record.id];
    if (cached && cached.length > 0) return cached;
    // Fallback: live recalculate (for old records saved before this fix)
    const dates = getWeekRange(record.payDate);
    return workers.map((worker) => {
      const grossPay        = worker.dailyRate * 6;
      const absentDays      = absentInRange(worker.id, dates);
      const absentDeduction = absentDays * worker.dailyRate;
      const netPay          = Math.max(grossPay - absentDeduction - worker.cashAdvance, 0);
      return { ...worker, grossPay, absentDays, absentDeduction, netPay, daysRecorded: recordedInRange(worker.id, dates) };
    });
  }, [recordRows, workers, attendanceRecords]);

  const handleOpenPrint = async (record) => {
    // Make sure rows are loaded
    let rows = recordRows[record.id];
    if (!rows || rows.length === 0) {
      const fetched = await dbGetPayrollWorkerRows(userId, record.id);
      if (Array.isArray(fetched) && fetched.length > 0) {
        rows = fetched;
        setRecordRows((prev) => ({ ...prev, [record.id]: fetched }));
      } else {
        rows = getWorkerRowsForRecord(record);
      }
    }
    setPrintRecord({ record, rows });
    setPrintDialogOpen(true);
  };

  const handleDoPrint = () => {
    setPrintDialogOpen(false);
    setTimeout(() => window.print(), 100);
  };

  return (
    <>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          <SummaryCard icon={MdPeople}               label="Workers"       value={workers.length}                                       iconBg={workersIconBg} iconColor={workersIconCol} darkMode={darkMode} />
          <SummaryCard icon={MdTrendingUp}           label="Gross Payroll" value={`₱${totalGross.toLocaleString()}`}                   iconBg={grossIconBg}   iconColor={grossIconCol}   darkMode={darkMode} />
          <SummaryCard icon={MdRemoveCircle}         label="Deductions"    value={`₱${(totalAbsent + totalAdvance).toLocaleString()}`}  iconBg={dedIconBg}     iconColor={dedIconCol}     darkMode={darkMode} />
          <SummaryCard icon={MdAccountBalanceWallet} label="Net Payroll"   value={`₱${totalNet.toLocaleString()}`}                     highlight darkMode={darkMode} />
        </div>

        {/* Pay Period selector + Run Payroll */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: "16px", boxShadow: shadow, flexWrap: "wrap", transition: "background 0.2s" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            {/* Week navigator */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <button
                onClick={() => setWeekOffset((w) => w - 1)}
                style={{ width: "30px", height: "30px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: "transparent", color: textPrimary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                title="Previous week"
              ><MdChevronLeft size={18} /></button>

              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>
                {isCurrentWeek
                  ? `Current Week: ${payPeriodStart.format("MMM D")} – ${lastSaturday.format("MMM D, YYYY")}`
                  : `Week of ${payPeriodStart.format("MMM D")} – ${lastSaturday.format("MMM D, YYYY")}`}
              </div>

              <button
                onClick={() => setWeekOffset((w) => Math.min(w + 1, 0))}
                disabled={isCurrentWeek}
                style={{ width: "30px", height: "30px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: "transparent", color: isCurrentWeek ? (darkMode ? "#334155" : "#CBD5E1") : textPrimary, display: "flex", alignItems: "center", justifyContent: "center", cursor: isCurrentWeek ? "not-allowed" : "pointer" }}
                title="Next week"
              ><MdChevronRight size={18} /></button>

              {!isCurrentWeek && (
                <button
                  onClick={() => setWeekOffset(0)}
                  style={{ padding: "3px 10px", borderRadius: "6px", border: `1px solid ${cardBorder}`, background: "transparent", color: darkMode ? "#60A5FA" : "#2563EB", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                >
                  Back to Current
                </button>
              )}
            </div>

            <ul style={{ margin: 0, paddingLeft: "18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: "4px" }}>
              {["Only days explicitly marked Absent are deducted from salary.", "Present, Late, and Leave do not cause any deduction.", "Unrecorded days are not counted as absent."].map((tip, i) => (
                <li key={i} style={{ fontSize: "0.8125rem", color: textMuted }}>{tip}</li>
              ))}
            </ul>
          </div>
          <Button variant="contained" startIcon={<MdPlayArrow size={18} />} onClick={handleRunPayroll} sx={{ flexShrink: 0 }}>
            Run Payroll for This Week
          </Button>
        </div>

        {/* Period Breakdown — per-worker attendance dashboard */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", boxShadow: shadow, overflow: "hidden", transition: "background 0.2s" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>
                {isCurrentWeek ? "Current Pay Period Breakdown" : `Pay Period Breakdown · ${payPeriodStart.format("MMM D")} – ${lastSaturday.format("MMM D, YYYY")}`}
              </div>
              <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "2px" }}>
                {payPeriodStart.format("MMM D")} – {lastSaturday.format("MMM D, YYYY")} · 6 working days · Click <strong>Edit</strong> to fix attendance
              </div>
            </div>
          </div>

          {/* Day header row */}
          <div style={{ display: "grid", gridTemplateColumns: "200px repeat(6, 1fr) 80px 80px 90px 100px 36px", gap: "0", background: headBg, borderBottom: `1px solid ${cardBorder}` }}>
            <div style={{ padding: "8px 14px", fontSize: "0.6875rem", fontWeight: 700, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Worker</div>
            {periodDates.map((d) => (
              <div key={d.format()} style={{ padding: "8px 4px", fontSize: "0.625rem", fontWeight: 700, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>
                <div>{d.format("ddd")}</div>
                <div style={{ fontWeight: 400, color: darkMode ? "#475569" : "#94A3B8" }}>{d.format("M/D")}</div>
              </div>
            ))}
            <div style={{ padding: "8px 6px", fontSize: "0.6875rem", fontWeight: 700, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", textAlign: "center", letterSpacing: "0.04em" }}>Absent</div>
            <div style={{ padding: "8px 6px", fontSize: "0.6875rem", fontWeight: 700, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", textAlign: "right", letterSpacing: "0.04em" }}>Deduction</div>
            <div style={{ padding: "8px 6px", fontSize: "0.6875rem", fontWeight: 700, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", textAlign: "right", letterSpacing: "0.04em" }}>Advance</div>
            <div style={{ padding: "8px 14px", fontSize: "0.6875rem", fontWeight: 700, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", textAlign: "right", letterSpacing: "0.04em" }}>Net Pay</div>
            <div />
          </div>

          {payrollRows.map((row, idx) => {
            // Status colors per day
            const STATUS_COLOR = {
              Present: { bg: darkMode ? "rgba(5,150,105,0.2)"  : "#DCFCE7", text: darkMode ? "#34D399" : "#15803D" },
              Late:    { bg: darkMode ? "rgba(217,119,6,0.2)"  : "#FEF3C7", text: darkMode ? "#FBBF24" : "#B45309" },
              Leave:   { bg: darkMode ? "rgba(100,116,139,0.2)": "#F1F5F9", text: darkMode ? "#94A3B8" : "#475569" },
              Absent:  { bg: darkMode ? "rgba(220,38,38,0.2)"  : "#FEE2E2", text: darkMode ? "#F87171" : "#B91C1C" },
              "":      { bg: darkMode ? "#1E293B"               : "#F8FAFC", text: darkMode ? "#334155" : "#CBD5E1" },
            };

            return (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "200px repeat(6, 1fr) 80px 80px 90px 100px 36px", gap: "0", borderBottom: idx < payrollRows.length - 1 ? `1px solid ${rowDivider}` : "none", background: cardBg, alignItems: "center" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "#1E293B" : "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.background = cardBg)}
              >
                {/* Worker name */}
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `hsl(${(row.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {row.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem", color: textPrimary, lineHeight: 1.2 }}>{row.name}</div>
                    <div style={{ fontSize: "0.6875rem", color: textSub }}>{row.position} · ₱{row.dailyRate.toLocaleString()}/day</div>
                  </div>
                </div>

                {/* Per-day attendance pills */}
                {periodDates.map((d) => {
                  const key    = d.format("YYYY-MM-DD");
                  const status = attendanceRecords[key]?.[row.id] || "";
                  const colors = STATUS_COLOR[status] || STATUS_COLOR[""];
                  return (
                    <div key={key} style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "6px 2px" }}>
                      <div style={{ padding: "3px 7px", borderRadius: "6px", background: colors.bg, color: colors.text, fontSize: "0.625rem", fontWeight: 700, textAlign: "center", minWidth: "44px", lineHeight: 1.4, letterSpacing: "0.02em" }}>
                        {status || "—"}
                      </div>
                    </div>
                  );
                })}

                {/* Absent count */}
                <div style={{ textAlign: "center", padding: "10px 6px" }}>
                  {row.absentDays > 0
                    ? <Chip label={row.absentDays} color="error" size="small" />
                    : <Chip label="0" color="success" size="small" />}
                </div>

                {/* Deduction */}
                <div style={{ padding: "10px 6px", fontSize: "0.875rem", fontWeight: row.absentDeduction > 0 ? 600 : 400, color: row.absentDeduction > 0 ? (darkMode ? "#F87171" : "#DC2626") : textSub, textAlign: "right" }}>
                  ₱{row.absentDeduction.toLocaleString()}
                </div>

                {/* Advance */}
                <div style={{ padding: "10px 6px", fontSize: "0.875rem", fontWeight: row.cashAdvance > 0 ? 600 : 400, color: row.cashAdvance > 0 ? (darkMode ? "#FBBF24" : "#D97706") : textSub, textAlign: "right" }}>
                  ₱{row.cashAdvance.toLocaleString()}
                </div>

                {/* Net pay */}
                <div style={{ padding: "10px 14px", fontSize: "0.9375rem", fontWeight: 800, color: darkMode ? "#34D399" : "#059669", textAlign: "right" }}>
                  ₱{row.netPay.toLocaleString()}
                </div>

                {/* Edit button */}
                <div style={{ padding: "10px 8px", display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => openEditWorker(row)}
                    title="Edit attendance for this worker"
                    style={{ width: "28px", height: "28px", borderRadius: "7px", border: "none", background: darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: darkMode ? "#60A5FA" : "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.3)" : "#DBEAFE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF")}
                  >
                    <MdEdit size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Totals footer */}
          <div style={{ display: "grid", gridTemplateColumns: "200px repeat(6, 1fr) 80px 80px 90px 100px 36px", background: headBg, borderTop: `1px solid ${cardBorder}` }}>
            <div style={{ padding: "10px 14px", fontSize: "0.8125rem", fontWeight: 700, color: textPrimary }}>Totals</div>
            {periodDates.map((d) => <div key={d.format()} />)}
            <div />
            <div style={{ padding: "10px 6px", fontSize: "0.8125rem", fontWeight: 700, color: darkMode ? "#F87171" : "#DC2626", textAlign: "right" }}>₱{totalAbsent.toLocaleString()}</div>
            <div style={{ padding: "10px 6px", fontSize: "0.8125rem", fontWeight: 700, color: darkMode ? "#FBBF24" : "#D97706", textAlign: "right" }}>₱{totalAdvance.toLocaleString()}</div>
            <div style={{ padding: "10px 14px", fontSize: "0.9375rem", fontWeight: 800, color: darkMode ? "#34D399" : "#059669", textAlign: "right" }}>₱{totalNet.toLocaleString()}</div>
            <div />
          </div>
        </div>

        {/* Payroll Records accordion */}
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", boxShadow: shadow, overflow: "hidden", transition: "background 0.2s" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}` }}>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Payroll Records</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "2px" }}>Click to expand · 🖨 to print · 🗑 to delete</div>
          </div>

          {payrollHistory.map((record, idx) => {
            const isOpen    = expandedRecord === record.id;
            const workerRows = isOpen ? getWorkerRowsForRecord(record) : [];
            const isLast    = idx === payrollHistory.length - 1;

            return (
              <div key={record.id} style={{ borderBottom: isLast ? "none" : `1px solid ${rowDivider}` }}>
                {/* Summary row */}
                <div
                  role="button" tabIndex={0}
                  onClick={() => toggleRecord(record.id)}
                  onKeyDown={(e) => e.key === "Enter" && toggleRecord(record.id)}
                  style={{ background: isOpen ? accordionOpenBg : cardBg, cursor: "pointer", padding: "14px 20px", display: "grid", gridTemplateColumns: "1fr 80px 90px 90px 90px 90px 40px 36px 36px 36px", gap: "12px", alignItems: "center", borderLeft: `4px solid ${isOpen ? "#2563EB" : "transparent"}`, transition: "background 0.15s", userSelect: "none" }}
                  onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = darkMode ? "#1E293B" : "#F8FAFC"; }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = cardBg; }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: textPrimary }}>{dayjs(record.periodStart).format("MMM D")} – {dayjs(record.periodEnd).format("MMM D, YYYY")}</div>
                    <div style={{ fontSize: "0.75rem", color: textSub, marginTop: "1px" }}>Pay date: {dayjs(record.payDate).format("MMM D, YYYY")}</div>
                  </div>
                  <div style={{ textAlign: "center" }}><div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>Workers</div><div style={{ fontWeight: 700, color: textPrimary }}>{record.workerCount}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>Gross</div><div style={{ fontWeight: 600, color: textPrimary, fontSize: "0.875rem" }}>₱{record.grossPay.toLocaleString()}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>Absent</div><div style={{ fontWeight: 600, color: record.absentDeduction > 0 ? (darkMode ? "#F87171" : "#DC2626") : textSub, fontSize: "0.875rem" }}>₱{record.absentDeduction.toLocaleString()}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>Advance</div><div style={{ fontWeight: 600, color: record.cashAdvance > 0 ? (darkMode ? "#FBBF24" : "#D97706") : textSub, fontSize: "0.875rem" }}>₱{record.cashAdvance.toLocaleString()}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase" }}>Net</div><div style={{ fontWeight: 800, color: darkMode ? "#34D399" : "#059669", fontSize: "0.9375rem" }}>₱{record.netPay.toLocaleString()}</div></div>
                  {/* Chevron */}
                  <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: isOpen ? chevronOpenBg : chevronCloseBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isOpen ? <MdExpandLess size={18} color="#2563EB" /> : <MdExpandMore size={18} color={darkMode ? "#64748B" : "#64748B"} />}
                  </div>
                  {/* Edit */}
                  <button onClick={(e) => { e.stopPropagation(); openEditPayrollRecord(record); }} title="Edit record" style={{ width: "30px", height: "30px", borderRadius: "7px", border: "none", background: darkMode ? "rgba(37,99,235,0.12)" : "#EFF6FF", color: darkMode ? "#60A5FA" : "#2563EB", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.25)" : "#DBEAFE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.12)" : "#EFF6FF")}
                  ><MdEdit size={14} /></button>
                  {/* Delete */}
                  <button onClick={(e) => { e.stopPropagation(); setConfirmDeletePayroll(record); }} title="Delete" style={{ width: "30px", height: "30px", borderRadius: "7px", border: "none", background: darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2", color: darkMode ? "#F87171" : "#DC2626", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.25)" : "#FFE4E6")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2")}
                  ><MdDeleteOutline size={15} /></button>
                  {/* Print */}
                  <button onClick={(e) => { e.stopPropagation(); handleOpenPrint(record); }} title="Print payslips" style={{ width: "30px", height: "30px", borderRadius: "7px", border: "none", background: darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF", color: darkMode ? "#60A5FA" : "#2563EB", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.3)" : "#DBEAFE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF")}
                  ><MdPrint size={15} /></button>
                </div>

                {/* Expanded rows */}
                {isOpen && (
                  <div style={{ background: expandedBodyBg, borderTop: `1px solid ${accordionBorder}` }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: expandedHeadBg }}>
                          {["Worker","Position","Daily Rate","Gross Pay","Recorded","Absent","Deduction","Advance","Net Pay"].map((h) => (
                            <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: "0.6875rem", fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${cardBorder}`, whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {workerRows.map((row, i) => (
                          <tr key={row.id} style={{ borderBottom: i < workerRows.length - 1 ? `1px solid ${cardBorder}` : "none", background: expandedBodyBg }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "#1E293B" : "#F1F5F9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = expandedBodyBg)}
                          >
                            <td style={{ padding: "10px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `hsl(${(row.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{row.name.charAt(0)}</div>
                                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: textPrimary }}>{row.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: textMuted }}>{row.position}</td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: textPrimary }}>₱{row.dailyRate.toLocaleString()}</td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: textPrimary }}>₱{row.grossPay.toLocaleString()}</td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: textMuted }}>{row.daysRecorded}/6</td>
                            <td style={{ padding: "10px 16px" }}><span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: 700, background: row.absentDays > 0 ? (darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2") : (darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7"), color: row.absentDays > 0 ? (darkMode ? "#F87171" : "#B91C1C") : (darkMode ? "#34D399" : "#15803D") }}>{row.absentDays}</span></td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: row.absentDeduction > 0 ? (darkMode ? "#F87171" : "#DC2626") : textSub, fontWeight: row.absentDeduction > 0 ? 600 : 400 }}>₱{row.absentDeduction.toLocaleString()}</td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: row.cashAdvance > 0 ? (darkMode ? "#FBBF24" : "#D97706") : textSub, fontWeight: row.cashAdvance > 0 ? 600 : 400 }}>₱{row.cashAdvance.toLocaleString()}</td>
                            <td style={{ padding: "10px 16px", fontSize: "0.9375rem", fontWeight: 800, color: darkMode ? "#34D399" : "#059669" }}>₱{row.netPay.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Print Preview Dialog ───────────────────────────────────────────── */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, background: cardBg, borderBottom: `1px solid ${cardBorder}`, pb: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MdPrint size={18} color={darkMode ? "#60A5FA" : "#2563EB"} />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>Print Payslips</div>
              <div style={{ fontSize: "0.75rem", color: textSub, fontWeight: 400 }}>Edit details then print · {printRecord?.rows?.length || 0} worker{printRecord?.rows?.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent sx={{ background: cardBg, pt: "16px !important" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left: editable fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Receipt Settings</div>
              {[
                { label: "Company Name",     key: "companyName",     ph: "WorkSystem Construction" },
                { label: "Receipt Subtitle", key: "companySubtitle", ph: "PAYSLIP / SALARY VOUCHER" },
                { label: "Prepared By",      key: "preparedBy",      ph: "Foreman / Manager name" },
                { label: "Additional Note",  key: "note",            ph: "e.g. Payment via cash" },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: darkMode ? "#94A3B8" : "#64748B", display: "block", marginBottom: "5px" }}>{label}</label>
                  <input
                    value={receiptEdits[key]}
                    onChange={(e) => setReceiptEdits((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph}
                    style={{ width: "100%", padding: "9px 11px", borderRadius: "7px", border: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}`, background: darkMode ? "#0F172A" : "#F8FAFC", color: textPrimary, fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div style={{ background: darkMode ? "#0F172A" : "#F0F9FF", border: `1px solid ${darkMode ? "#1E3A5F" : "#BFDBFE"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "0.75rem", color: darkMode ? "#60A5FA" : "#2563EB", lineHeight: 1.5 }}>
                💡 Changes apply to all slips in this batch. Each worker gets their own printed page.
              </div>
            </div>
            {/* Right: live preview */}
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Preview (first worker)</div>
              {printRecord?.rows?.[0] && (() => {
                const row = printRecord.rows[0];
                const rec = printRecord.record;
                return (
                  <div style={{ background: "#fff", color: "#000", borderRadius: "8px", padding: "18px", border: "1px solid #CBD5E1", fontSize: "12px", lineHeight: 1.5, maxHeight: "400px", overflowY: "auto" }}>
                    <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "8px", marginBottom: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, textTransform: "uppercase" }}>{receiptEdits.companyName || "WorkSystem Construction"}</div>
                      <div style={{ fontSize: "10px", color: "#555", marginTop: "2px" }}>{receiptEdits.companySubtitle || "PAYSLIP / SALARY VOUCHER"}</div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div><div style={{ color: "#666", fontSize: "10px" }}>Employee</div><div style={{ fontWeight: 700 }}>{row.name}</div><div style={{ color: "#555", fontSize: "10px" }}>{row.position}</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ color: "#666", fontSize: "10px" }}>Pay Period</div><div style={{ fontWeight: 600, fontSize: "10px" }}>{dayjs(rec.periodStart).format("MMM D")} – {dayjs(rec.periodEnd).format("MMM D, YYYY")}</div><div style={{ color: "#555", fontSize: "10px" }}>Pay date: {dayjs(rec.payDate).format("MMM D, YYYY")}</div></div>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", marginBottom: "8px" }}>
                      <thead><tr style={{ background: "#f3f4f6" }}><th style={{ padding: "4px 6px", textAlign: "left", borderBottom: "1px solid #ccc" }}>Description</th><th style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #ccc" }}>Amount</th></tr></thead>
                      <tbody>
                        <tr><td style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>Daily Rate</td><td style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #eee" }}>₱{row.dailyRate.toLocaleString()}</td></tr>
                        <tr><td style={{ padding: "4px 6px", borderBottom: "1px solid #eee" }}>Days Worked</td><td style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #eee" }}>{row.daysRecorded}/6</td></tr>
                        <tr><td style={{ padding: "4px 6px", borderBottom: "1px solid #eee", fontWeight: 600 }}>Gross Pay</td><td style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #eee", fontWeight: 600 }}>₱{row.grossPay.toLocaleString()}</td></tr>
                        {row.absentDays > 0 && <tr><td style={{ padding: "4px 6px", borderBottom: "1px solid #eee", color: "#c00" }}>Absent ({row.absentDays}d)</td><td style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #eee", color: "#c00" }}>-₱{row.absentDeduction.toLocaleString()}</td></tr>}
                        {row.cashAdvance > 0 && <tr><td style={{ padding: "4px 6px", borderBottom: "1px solid #eee", color: "#c00" }}>Cash Advance</td><td style={{ padding: "4px 6px", textAlign: "right", borderBottom: "1px solid #eee", color: "#c00" }}>-₱{row.cashAdvance.toLocaleString()}</td></tr>}
                      </tbody>
                    </table>
                    <div style={{ display: "flex", justifyContent: "space-between", background: "#000", color: "#fff", padding: "6px 8px", borderRadius: "3px", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "11px" }}>NET PAY</span>
                      <span style={{ fontWeight: 800, fontSize: "14px" }}>₱{row.netPay.toLocaleString()}</span>
                    </div>
                    {receiptEdits.note && <div style={{ color: "#555", fontSize: "10px", marginBottom: "8px", fontStyle: "italic" }}>{receiptEdits.note}</div>}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
                      <div style={{ textAlign: "center", flex: 1 }}><div style={{ borderTop: "1px solid #000", paddingTop: "4px", fontSize: "10px", color: "#666" }}>{receiptEdits.preparedBy || "Prepared by"}</div></div>
                      <div style={{ width: "20px" }} />
                      <div style={{ textAlign: "center", flex: 1 }}><div style={{ borderTop: "1px solid #000", paddingTop: "4px", fontSize: "10px", color: "#666" }}>Received by ({row.name})</div></div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg, px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setPrintDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" startIcon={<MdPrint size={17} />} onClick={handleDoPrint}>
            Print All {printRecord?.rows?.length || ""} Payslips
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Hidden print content ────────────────────────────────────────────── */}
      <div ref={printRef} id="payroll-print-area" style={{ visibility: "hidden", position: "absolute", top: 0, left: 0, width: "100%", zIndex: -1 }}>
        {printRecord && (() => {
          const { record, rows } = printRecord;
          return (
            <div style={{ fontFamily: "Arial, sans-serif", color: "#000" }}>
              {rows.map((row, i) => (
                <div key={row.id} style={{ pageBreakAfter: i < rows.length - 1 ? "always" : "auto", padding: "32px 40px", maxWidth: "420px", margin: "0 auto", border: "1px solid #ccc" }}>
                  <div style={{ textAlign: "center", borderBottom: "2px solid #000", paddingBottom: "14px", marginBottom: "18px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>{receiptEdits.companyName || "WorkSystem Construction"}</div>
                    <div style={{ fontSize: "11px", color: "#555", marginTop: "4px" }}>{receiptEdits.companySubtitle || "PAYSLIP / SALARY VOUCHER"}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div><div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>Employee</div><div style={{ fontSize: "15px", fontWeight: 700 }}>{row.name}</div><div style={{ fontSize: "12px", color: "#555" }}>{row.position}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: "13px", color: "#666", marginBottom: "2px" }}>Pay Period</div><div style={{ fontSize: "13px", fontWeight: 600 }}>{dayjs(record.periodStart).format("MMM D")} – {dayjs(record.periodEnd).format("MMM D, YYYY")}</div><div style={{ fontSize: "12px", color: "#555" }}>Pay date: {dayjs(record.payDate).format("MMM D, YYYY")}</div></div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", marginBottom: "14px" }}>
                    <thead><tr style={{ background: "#f3f4f6" }}><th style={{ padding: "7px 10px", textAlign: "left", borderBottom: "1px solid #ccc", fontWeight: 600 }}>Description</th><th style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #ccc", fontWeight: 600 }}>Amount</th></tr></thead>
                    <tbody>
                      <tr><td style={{ padding: "7px 10px", borderBottom: "1px solid #eee" }}>Daily Rate</td><td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee" }}>₱{row.dailyRate.toLocaleString()}</td></tr>
                      <tr><td style={{ padding: "7px 10px", borderBottom: "1px solid #eee" }}>Days Worked (6-day week)</td><td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee" }}>{row.daysRecorded}/6</td></tr>
                      <tr><td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", fontWeight: 600 }}>Gross Pay</td><td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", fontWeight: 600 }}>₱{row.grossPay.toLocaleString()}</td></tr>
                      {row.absentDays > 0 && <tr><td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", color: "#c00" }}>Absent Deduction ({row.absentDays} day{row.absentDays > 1 ? "s" : ""})</td><td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", color: "#c00" }}>- ₱{row.absentDeduction.toLocaleString()}</td></tr>}
                      {row.cashAdvance > 0 && <tr><td style={{ padding: "7px 10px", borderBottom: "1px solid #eee", color: "#c00" }}>Cash Advance Deduction</td><td style={{ padding: "7px 10px", textAlign: "right", borderBottom: "1px solid #eee", color: "#c00" }}>- ₱{row.cashAdvance.toLocaleString()}</td></tr>}
                    </tbody>
                  </table>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#000", color: "#fff", padding: "12px 10px", borderRadius: "4px", marginBottom: receiptEdits.note ? "10px" : "22px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 700 }}>NET PAY</span>
                    <span style={{ fontSize: "20px", fontWeight: 800 }}>₱{row.netPay.toLocaleString()}</span>
                  </div>
                  {receiptEdits.note && <div style={{ fontSize: "11px", color: "#555", marginBottom: "16px", fontStyle: "italic", padding: "6px 0", borderBottom: "1px dashed #ccc" }}>{receiptEdits.note}</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
                    <div style={{ textAlign: "center", flex: 1 }}><div style={{ borderTop: "1px solid #000", paddingTop: "6px", fontSize: "11px", color: "#666" }}>{receiptEdits.preparedBy || "Prepared by"}</div></div>
                    <div style={{ width: "32px" }} />
                    <div style={{ textAlign: "center", flex: 1 }}><div style={{ borderTop: "1px solid #000", paddingTop: "6px", fontSize: "11px", color: "#666" }}>Received by ({row.name})</div></div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", color: "#aaa", borderTop: "1px solid #eee", paddingTop: "8px" }}>Generated by WorkSystem · {dayjs().format("MMM D, YYYY h:mm A")}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* ── Edit Payroll Record Dialog ─────────────────────────────────────── */}
      <Dialog open={Boolean(editPayrollRecord)} onClose={() => setEditPayrollRecord(null)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, background: cardBg, borderBottom: `1px solid ${cardBorder}`, pb: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MdEdit size={17} color={darkMode ? "#60A5FA" : "#2563EB"} />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>Edit Payroll Record</div>
              <div style={{ fontSize: "0.75rem", color: textSub, fontWeight: 400 }}>
                {editPayrollRecord && `${dayjs(editPayrollRecord.record.periodStart).format("MMM D")} – ${dayjs(editPayrollRecord.record.periodEnd).format("MMM D, YYYY")}`}
              </div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent sx={{ background: cardBg, pt: "20px !important" }}>
          {editPayrollRecord && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Period Start", key: "periodStart" },
                  { label: "Period End",   key: "periodEnd"   },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: textSub, display: "block", marginBottom: "5px" }}>{label}</label>
                    <input type="date" value={editPayrollRecord.fields[key]}
                      onChange={(e) => setEditPayrollRecord((p) => ({ ...p, fields: { ...p.fields, [key]: e.target.value } }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: darkMode ? "#0F172A" : "#F8FAFC", color: textPrimary, fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: textSub, display: "block", marginBottom: "5px" }}>Pay Date</label>
                <input type="date" value={editPayrollRecord.fields.payDate}
                  onChange={(e) => setEditPayrollRecord((p) => ({ ...p, fields: { ...p.fields, payDate: e.target.value } }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: darkMode ? "#0F172A" : "#F8FAFC", color: textPrimary, fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ height: "1px", background: cardBorder }} />
              {/* Amounts */}
              {[
                { label: "Gross Pay (₱)",        key: "grossPay" },
                { label: "Cash Advance (₱)",     key: "cashAdvance" },
                { label: "Absent Deduction (₱)", key: "absentDeduction" },
                { label: "Net Pay (₱)",          key: "netPay" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: textSub, display: "block", marginBottom: "5px" }}>{label}</label>
                  <input type="number" min="0" value={editPayrollRecord.fields[key]}
                    onChange={(e) => setEditPayrollRecord((p) => ({ ...p, fields: { ...p.fields, [key]: e.target.value } }))}
                    style={{ width: "100%", padding: "8px 10px", borderRadius: "7px", border: `1px solid ${cardBorder}`, background: darkMode ? "#0F172A" : "#F8FAFC", color: textPrimary, fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div style={{ background: darkMode ? "#0F172A" : "#FFF7ED", border: `1px solid ${darkMode ? "#334155" : "#FED7AA"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "0.75rem", color: darkMode ? "#FBBF24" : "#B45309", lineHeight: 1.5 }}>
                ⚠️ Editing these values only updates the saved record totals. Worker row snapshots are not affected.
              </div>
            </div>
          )}
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg, px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setEditPayrollRecord(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSaveEditPayrollRecord} disabled={editPayrollSaving}>
            {editPayrollSaving ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit Attendance Dialog ─────────────────────────────────────────── */}
      <Dialog open={Boolean(editWorker)} onClose={() => setEditWorker(null)} maxWidth="sm" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, background: cardBg, borderBottom: `1px solid ${cardBorder}`, pb: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: darkMode ? "rgba(37,99,235,0.15)" : "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MdEdit size={17} color={darkMode ? "#60A5FA" : "#2563EB"} />
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 700 }}>Edit Attendance</div>
              <div style={{ fontSize: "0.75rem", color: textSub, fontWeight: 400 }}>
                {editWorker?.worker.name} · {payPeriodStart.format("MMM D")} – {lastSaturday.format("MMM D, YYYY")}
              </div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent sx={{ background: cardBg, pt: "20px !important" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {periodDates.map((d) => {
              const key     = d.format("YYYY-MM-DD");
              const current = editWorker?.localStatus[key] || "";
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ minWidth: "90px" }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: textPrimary }}>{d.format("ddd")}</div>
                    <div style={{ fontSize: "0.75rem", color: textSub }}>{d.format("MMM D, YYYY")}</div>
                  </div>
                  <ToggleButtonGroup
                    value={current}
                    exclusive
                    onChange={(_, val) => { if (val) handleEditStatusChange(key, val); }}
                    size="small"
                    sx={{
                      flexWrap: "wrap",
                      "& .MuiToggleButton-root": {
                        fontSize: "0.75rem", px: "10px",
                        color: darkMode ? "#94A3B8" : undefined,
                        borderColor: darkMode ? "#334155" : undefined,
                        "&.Mui-selected": { background: darkMode ? "rgba(37,99,235,0.2)" : undefined, color: darkMode ? "#60A5FA" : undefined },
                      },
                    }}
                  >
                    {["Present", "Absent", "Late", "Leave"].map((opt) => (
                      <ToggleButton key={opt} value={opt}>{opt}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </div>
              );
            })}
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg, px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setEditWorker(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSaveEditWorker}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirm ─────────────────────────────────────────────────── */}
      <Dialog open={Boolean(confirmDeletePayroll)} onClose={() => setConfirmDeletePayroll(null)} maxWidth="xs" fullWidth PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: textPrimary, background: cardBg }}>Delete Payroll Record?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdDeleteForever size={20} color={darkMode ? "#F87171" : "#DC2626"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                {confirmDeletePayroll && `${dayjs(confirmDeletePayroll.periodStart).format("MMM D")} – ${dayjs(confirmDeletePayroll.periodEnd).format("MMM D, YYYY")}`}
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>This payroll record will be permanently removed. This cannot be undone.</div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmDeletePayroll(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeletePayrollRecord} startIcon={<MdDeleteForever size={16} />}>Delete Record</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Payroll;
