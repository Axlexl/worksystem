import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import { MdAccountBalanceWallet, MdInventory2, MdExpandMore, MdExpandLess } from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import { dbGetPayrollWorkerRows } from "../../services/db.service";

// ── AccordionSection ──────────────────────────────────────────────────────────
function AccordionSection({ icon: Icon, title, subtitle, iconBg, iconColor, accentColor, stats, children, isEmpty, emptyText, darkMode }) {
  const [open, setOpen] = useState(false);
  const cardBg        = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder    = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary   = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub       = darkMode ? "#94A3B8" : "#94A3B8";
  const statBg        = darkMode ? "#0F172A" : "#F8FAFC";
  const statBorder    = darkMode ? "#334155" : "#E2E8F0";
  const chevronCloseBg = darkMode ? "#1E293B" : "#F1F5F9";
  const openHeaderBg  = darkMode ? "#0F172A" : "#F8FAFC";

  return (
    <div style={{ background: cardBg, border: `1px solid ${open ? (darkMode ? cardBorder : accentColor + "40") : cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)", transition: "background 0.2s, box-shadow 0.2s" }}>
      <div
        role="button" tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
        style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px", cursor: "pointer", borderBottom: open ? `1px solid ${darkMode ? "#334155" : "#F1F5F9"}` : "none", background: open ? openHeaderBg : cardBg, userSelect: "none", transition: "background 0.15s" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = openHeaderBg; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = cardBg; }}
      >
        <div style={{ width: "42px", height: "42px", borderRadius: "11px", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={iconColor} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>{title}</div>
          <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>{subtitle}</div>
          <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
            {stats.map((s) => (
              <div key={s.label} style={{ display: "flex", gap: "5px", alignItems: "center", background: statBg, border: `1px solid ${statBorder}`, borderRadius: "6px", padding: "3px 10px" }}>
                <span style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500 }}>{s.label}:</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: textPrimary }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: open ? iconBg : chevronCloseBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}>
          {open ? <MdExpandLess size={18} color={iconColor} /> : <MdExpandMore size={18} color={darkMode ? "#64748B" : "#64748B"} />}
        </div>
      </div>
      {open && (
        <div>
          {isEmpty
            ? <div style={{ padding: "36px 24px", textAlign: "center", color: textSub, fontSize: "0.875rem", fontStyle: "italic" }}>{emptyText}</div>
            : children}
        </div>
      )}
    </div>
  );
}

// ── ExpandableRow ─────────────────────────────────────────────────────────────
function ExpandableRow({ summary, detail, accentColor, isLast, darkMode }) {
  const [open, setOpen] = useState(false);
  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const rowDivider  = darkMode ? "#1E293B" : "#F1F5F9";
  const chevronOpenBg  = darkMode ? "rgba(37,99,235,0.2)" : "#DBEAFE";
  const chevronCloseBg = darkMode ? "#1E293B" : "#F1F5F9";
  const openBg  = darkMode ? "rgba(37,99,235,0.06)" : "#F0F7FF";
  const hovBg   = darkMode ? "#1E293B" : "#F8FAFC";

  return (
    <div style={{ borderBottom: isLast ? "none" : `1px solid ${rowDivider}` }}>
      <div
        role="button" tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", padding: "13px 20px", cursor: "pointer", background: open ? openBg : cardBg, borderLeft: `4px solid ${open ? accentColor : "transparent"}`, userSelect: "none", transition: "background 0.15s, border-left-color 0.15s", gap: "12px" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = hovBg; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = open ? openBg : cardBg; }}
      >
        <div style={{ flex: 1 }}>{summary}</div>
        <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: open ? chevronOpenBg : chevronCloseBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {open ? <MdExpandLess size={16} color={accentColor} /> : <MdExpandMore size={16} color={darkMode ? "#64748B" : "#64748B"} />}
        </div>
      </div>
      {open && (
        <div style={{ background: darkMode ? "#0F172A" : "#F8FAFC", borderTop: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}` }}>
          {detail}
        </div>
      )}
    </div>
  );
}

// ── ColHeader ─────────────────────────────────────────────────────────────────
function ColHeader({ cols, darkMode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols.map((c) => c.width || "1fr").join(" "), background: darkMode ? "#0F172A" : "#F1F5F9", borderBottom: `1px solid ${darkMode ? "#334155" : "#E2E8F0"}` }}>
      {cols.map((col) => (
        <div key={col.label} style={{ padding: "8px 16px", fontSize: "0.6875rem", fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: col.right ? "right" : "left" }}>
          {col.label}
        </div>
      ))}
    </div>
  );
}

// ── Reports ───────────────────────────────────────────────────────────────────
function Reports() {
  const { materialHistory, payrollHistory, workers, attendanceRecords, userId } = useOutletContext();
  const { darkMode } = useThemeMode();

  // tokens
  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textMuted   = darkMode ? "#64748B"  : "#64748B";
  const textSub     = darkMode ? "#94A3B8"  : "#94A3B8";
  const detailHeadBlue    = darkMode ? "rgba(37,99,235,0.12)"  : "#EFF6FF";
  const detailBorderBlue  = darkMode ? "rgba(37,99,235,0.2)"   : "#DBEAFE";
  const detailHeadPurple   = darkMode ? "rgba(124,58,237,0.12)"  : "#F5F3FF";
  const detailBorderPurple = darkMode ? "rgba(124,58,237,0.2)"   : "#DDD6FE";
  const blueIconBg   = darkMode ? "rgba(37,99,235,0.15)"  : "#DBEAFE";
  const blueIconCol  = darkMode ? "#60A5FA" : "#2563EB";
  const purpleIconBg  = darkMode ? "rgba(124,58,237,0.15)" : "#EDE9FE";
  const purpleIconCol = darkMode ? "#A78BFA" : "#7C3AED";

  // ── Snapshot row cache ─────────────────────────────────────────────────────
  const [rowCache, setRowCache] = useState({});

  // Pre-load all payroll worker-row snapshots on mount
  useEffect(() => {
    if (!payrollHistory.length || !userId) return;
    payrollHistory.forEach(async (record) => {
      if (rowCache[record.id]) return;
      const rows = await dbGetPayrollWorkerRows(userId, record.id);
      if (Array.isArray(rows) && rows.length > 0) {
        setRowCache((prev) => ({ ...prev, [record.id]: rows }));
      }
    });
  }, [payrollHistory, userId]);

  // Fallback: live recalculate when no snapshot saved (old records)
  const getWeekRange = (payDate) => {
    const end = dayjs(payDate);
    const start = end.subtract(5, "day");
    return Array.from({ length: 6 }, (_, i) => start.add(i, "day"));
  };
  const absentInRange = (workerId, dates) =>
    dates.reduce((count, date) => {
      const status = attendanceRecords[date.format("YYYY-MM-DD")]?.[workerId];
      // Only count as absent when EXPLICITLY marked Absent — unrecorded days are NOT deducted
      return count + (status === "Absent" ? 1 : 0);
    }, 0);
  const recordedInRange = (workerId, dates) =>
    dates.reduce((count, date) => count + (attendanceRecords[date.format("YYYY-MM-DD")]?.[workerId] ? 1 : 0), 0);

  const getWorkerRowsForRecord = (record) => {
    const cached = rowCache[record.id];
    if (cached && cached.length > 0) return cached;
    // Fallback live recalc for old records
    const dates = getWeekRange(record.payDate);
    return workers.map((worker) => {
      const grossPay        = worker.dailyRate * 6;
      const absentDays      = absentInRange(worker.id, dates);
      const absentDeduction = absentDays * worker.dailyRate;
      const netPay          = Math.max(grossPay - absentDeduction - worker.cashAdvance, 0);
      return { ...worker, grossPay, absentDays, absentDeduction, netPay, daysRecorded: recordedInRange(worker.id, dates) };
    });
  };

  // ── Totals — ALL TIME ──────────────────────────────────────────────────────
  const allTimeGross    = useMemo(() => payrollHistory.reduce((s, r) => s + r.grossPay, 0),    [payrollHistory]);
  const allTimeNet      = useMemo(() => payrollHistory.reduce((s, r) => s + r.netPay, 0),      [payrollHistory]);
  const allTimeMaterial = useMemo(() => materialHistory.reduce((s, r) => s + r.totalCost, 0),  [materialHistory]);
  const allTimeCombined = allTimeNet + allTimeMaterial;

  // ── Material grouping ──────────────────────────────────────────────────────
  const materialByDate = useMemo(() => {
    const map = {};
    materialHistory.forEach((r) => { if (!map[r.date]) map[r.date] = []; map[r.date].push(r); });
    return Object.entries(map).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [materialHistory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── All-time banner ─────────────────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", borderRadius: "14px", padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "20px" }}>
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>All-time Gross Payroll</div>
          <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#60A5FA", letterSpacing: "-0.03em" }}>₱{allTimeGross.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>All-time Net Payroll</div>
          <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#34D399", letterSpacing: "-0.03em" }}>₱{allTimeNet.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>All-time Materials</div>
          <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#FBBF24", letterSpacing: "-0.03em" }}>₱{allTimeMaterial.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "4px" }}>Total Combined Cost</div>
          <div style={{ fontSize: "1.375rem", fontWeight: 700, color: "#F472B6", letterSpacing: "-0.03em" }}>₱{allTimeCombined.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Payroll accordion — ALL records ─────────────────────────────── */}
      <AccordionSection
        icon={MdAccountBalanceWallet} title="Payroll History"
        subtitle={`All ${payrollHistory.length} payroll run${payrollHistory.length !== 1 ? "s" : ""} — click a record to see worker breakdown`}
        iconBg={blueIconBg} iconColor={blueIconCol} accentColor="#2563EB"
        isEmpty={payrollHistory.length === 0} emptyText="No payroll runs yet." darkMode={darkMode}
        stats={[
          { label: "Total runs",  value: payrollHistory.length },
          { label: "Gross",       value: `₱${allTimeGross.toLocaleString()}` },
          { label: "Net payout",  value: `₱${allTimeNet.toLocaleString()}` },
        ]}
      >
        <ColHeader darkMode={darkMode} cols={[
          { label: "Pay Period", width: "1fr"   },
          { label: "Workers",   width: "70px"  },
          { label: "Gross",     width: "100px" },
          { label: "Absent",    width: "100px" },
          { label: "Advance",   width: "100px" },
          { label: "Net",       width: "110px" },
          { label: "",          width: "50px"  },
        ]} />

        {payrollHistory.map((record, idx) => (
          <ExpandableRow
            key={record.id} accentColor="#2563EB" darkMode={darkMode}
            isLast={idx === payrollHistory.length - 1}
            summary={
              <div style={{ display: "grid", gridTemplateColumns: "1fr 70px 100px 100px 100px 110px", gap: "12px", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: textPrimary }}>
                    {record.periodStart && record.periodEnd
                      ? `${dayjs(record.periodStart).format("MMM D")} – ${dayjs(record.periodEnd).format("MMM D, YYYY")}`
                      : record.payDate}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: textSub, marginTop: "1px" }}>Pay date: {dayjs(record.payDate).format("MMM D, YYYY")}</div>
                </div>
                <div style={{ textAlign: "center", fontWeight: 700, color: textPrimary }}>{record.workerCount}</div>
                <div style={{ textAlign: "right", fontWeight: 600, color: textPrimary, fontSize: "0.875rem" }}>₱{record.grossPay.toLocaleString()}</div>
                <div style={{ textAlign: "right", fontWeight: 600, color: record.absentDeduction > 0 ? (darkMode ? "#F87171" : "#DC2626") : textSub, fontSize: "0.875rem" }}>₱{record.absentDeduction.toLocaleString()}</div>
                <div style={{ textAlign: "right", fontWeight: 600, color: record.cashAdvance > 0 ? (darkMode ? "#FBBF24" : "#D97706") : textSub, fontSize: "0.875rem" }}>₱{record.cashAdvance.toLocaleString()}</div>
                <div style={{ textAlign: "right", fontWeight: 800, color: darkMode ? "#34D399" : "#059669", fontSize: "0.9375rem" }}>₱{record.netPay.toLocaleString()}</div>
              </div>
            }
            detail={
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 90px 90px 100px", background: detailHeadBlue, borderBottom: `1px solid ${detailBorderBlue}` }}>
                  {["Worker", "Position", "Gross Pay", "Deduction", "Advance", "Net Pay"].map((h) => (
                    <div key={h} style={{ padding: "8px 16px", fontSize: "0.6875rem", fontWeight: 600, color: blueIconCol, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                  ))}
                </div>
                {getWorkerRowsForRecord(record).map((row, i, arr) => (
                  <div key={row.id || row.worker_id || i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 100px 90px 90px 100px", borderBottom: i < arr.length - 1 ? `1px solid ${darkMode ? "#334155" : "#E2E8F0"}` : "none", background: i % 2 === 0 ? (darkMode ? "#0F172A" : "#FFFFFF") : (darkMode ? "#111827" : "#F8FAFC") }}>
                    <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: `hsl(${((row.id || row.worker_id || i) * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {(row.name || "?").charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem", color: textPrimary }}>{row.name}</span>
                    </div>
                    <div style={{ padding: "10px 16px", fontSize: "0.875rem", color: textMuted }}>{row.position}</div>
                    <div style={{ padding: "10px 16px", fontSize: "0.875rem", color: textPrimary }}>₱{(row.grossPay || 0).toLocaleString()}</div>
                    <div style={{ padding: "10px 16px", fontSize: "0.875rem", fontWeight: row.absentDeduction > 0 ? 600 : 400, color: row.absentDeduction > 0 ? (darkMode ? "#F87171" : "#DC2626") : textSub }}>₱{(row.absentDeduction || 0).toLocaleString()}</div>
                    <div style={{ padding: "10px 16px", fontSize: "0.875rem", fontWeight: row.cashAdvance > 0 ? 600 : 400, color: row.cashAdvance > 0 ? (darkMode ? "#FBBF24" : "#D97706") : textSub }}>₱{(row.cashAdvance || 0).toLocaleString()}</div>
                    <div style={{ padding: "10px 16px", fontSize: "0.875rem", fontWeight: 800, color: darkMode ? "#34D399" : "#059669" }}>₱{(row.netPay || 0).toLocaleString()}</div>
                  </div>
                ))}
                <div style={{ padding: "10px 16px", background: detailHeadBlue, borderTop: `1px solid ${detailBorderBlue}`, display: "flex", justifyContent: "flex-end", gap: "24px" }}>
                  <span style={{ fontSize: "0.8125rem", color: textMuted }}>Total Gross: <strong style={{ color: textPrimary }}>₱{record.grossPay.toLocaleString()}</strong></span>
                  <span style={{ fontSize: "0.8125rem", color: textMuted }}>Net Payout: <strong style={{ color: darkMode ? "#34D399" : "#059669" }}>₱{record.netPay.toLocaleString()}</strong></span>
                </div>
              </div>
            }
          />
        ))}
      </AccordionSection>

      {/* ── Materials accordion — ALL records ───────────────────────────── */}
      <AccordionSection
        icon={MdInventory2} title="Material Usage History"
        subtitle={`All ${materialHistory.length} material entr${materialHistory.length !== 1 ? "ies" : "y"} — click a date to expand`}
        iconBg={purpleIconBg} iconColor={purpleIconCol} accentColor="#7C3AED"
        isEmpty={materialByDate.length === 0} emptyText="No material records yet." darkMode={darkMode}
        stats={[
          { label: "Entries",     value: materialHistory.length },
          { label: "Total spent", value: `₱${allTimeMaterial.toLocaleString()}` },
        ]}
      >
        <ColHeader darkMode={darkMode} cols={[
          { label: "Date",       width: "180px" },
          { label: "Records",    width: "80px"  },
          { label: "Total Cost", width: "120px" },
          { label: "",           width: "50px"  },
        ]} />

        {materialByDate.map(([date, records], idx) => {
          const dateTotalCost = records.reduce((s, r) => s + r.totalCost, 0);
          return (
            <ExpandableRow
              key={date} accentColor="#7C3AED" darkMode={darkMode}
              isLast={idx === materialByDate.length - 1}
              summary={
                <div style={{ display: "grid", gridTemplateColumns: "180px 80px 120px", gap: "12px", alignItems: "center" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: textPrimary }}>{dayjs(date).format("MMM D, YYYY")}</div>
                  <div style={{ fontWeight: 700, color: purpleIconCol }}>{records.length}</div>
                  <div style={{ fontWeight: 700, color: textPrimary, fontSize: "0.9375rem" }}>₱{dateTotalCost.toLocaleString()}</div>
                </div>
              }
              detail={
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 120px", background: detailHeadPurple, borderBottom: `1px solid ${detailBorderPurple}` }}>
                    {["Material", "Action", "Quantity", "Total Cost"].map((h) => (
                      <div key={h} style={{ padding: "8px 16px", fontSize: "0.6875rem", fontWeight: 600, color: purpleIconCol, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                    ))}
                  </div>
                  {records.map((record, i) => (
                    <div key={record.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 120px", borderBottom: i < records.length - 1 ? `1px solid ${darkMode ? "#334155" : "#E2E8F0"}` : "none", background: i % 2 === 0 ? (darkMode ? "#0F172A" : "#FFFFFF") : (darkMode ? "#111827" : "#FAFAF9") }}>
                      <div style={{ padding: "10px 16px", fontWeight: 600, fontSize: "0.875rem", color: textPrimary }}>{record.materialName}</div>
                      <div style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: "5px", background: darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7", color: darkMode ? "#34D399" : "#15803D", fontSize: "0.75rem", fontWeight: 600 }}>{record.action}</span>
                      </div>
                      <div style={{ padding: "10px 16px", fontSize: "0.875rem", color: textMuted }}>{record.quantity.toLocaleString()}</div>
                      <div style={{ padding: "10px 16px", fontWeight: 700, fontSize: "0.875rem", color: textPrimary }}>₱{record.totalCost.toLocaleString()}</div>
                    </div>
                  ))}
                  <div style={{ padding: "10px 16px", background: detailHeadPurple, borderTop: `1px solid ${detailBorderPurple}`, display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: "0.8125rem", color: textMuted }}>Day Total: <strong style={{ color: purpleIconCol }}>₱{dateTotalCost.toLocaleString()}</strong></span>
                  </div>
                </div>
              }
            />
          );
        })}
      </AccordionSection>

      {/* ── Footer summary ───────────────────────────────────────────────── */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "14px 20px", display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center", boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.05)", transition: "background 0.2s" }}>
        <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          All-time Summary
        </div>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          {[
            { label: "Net Salary",  value: `₱${allTimeNet.toLocaleString()}`,      color: darkMode ? "#60A5FA" : "#2563EB" },
            { label: "Materials",   value: `₱${allTimeMaterial.toLocaleString()}`,  color: darkMode ? "#A78BFA" : "#7C3AED" },
            { label: "Total Cost",  value: `₱${allTimeCombined.toLocaleString()}`,  color: textPrimary, bold: true },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.8125rem", color: textSub }}>{item.label}:</span>
              <span style={{ fontSize: "0.9375rem", fontWeight: item.bold ? 800 : 700, color: item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Reports;
