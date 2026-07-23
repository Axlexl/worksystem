import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, FormControl, InputLabel, MenuItem, Paper, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
} from "@mui/material";
import {
  MdMoneyOff, MdPeople, MdAdd, MdWarning, MdHistory,
  MdDeleteOutline, MdDeleteForever, MdCheckCircle,
  MdExpandMore, MdExpandLess, MdEdit,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import {
  dbUpdateWorker, dbGetCashAdvanceHistory,
  dbAddCashAdvanceEntry, dbDeleteCashAdvanceEntry,
} from "../../services/db.service";

function CashAdvance() {
  const { userId, workers, setWorkers } = useOutletContext();
  const { darkMode } = useThemeMode();

  const [open,                 setOpen]                 = useState(false);
  const [selectedWorker,       setSelectedWorker]       = useState(workers[0]?.id || "");
  const [amount,               setAmount]               = useState("");
  const [history,              setHistory]              = useState([]);
  const [expandedDates,        setExpandedDates]        = useState({});   // { date: true/false }
  const [confirmDeleteHistory, setConfirmDeleteHistory] = useState(null); // single entry
  const [confirmDeleteGroup,   setConfirmDeleteGroup]   = useState(null); // date string
  const [confirmClearWorker,   setConfirmClearWorker]   = useState(null);
  const [editEntry,            setEditEntry]            = useState(null); // { entry, newAmount }

  useEffect(() => {
    if (!userId) return;
    dbGetCashAdvanceHistory(userId).then((rows) => {
      if (Array.isArray(rows)) setHistory(rows);
    });
  }, [userId]);

  // ── tokens ────────────────────────────────────────────────────────────────
  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const headBg      = darkMode ? "#0F172A" : "#F8FAFC";
  const rowDivider  = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8"  : "#94A3B8";
  const shadow      = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)";
  const redIconBg   = darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2";
  const redIconCol  = darkMode ? "#F87171" : "#DC2626";
  const amberIconBg = darkMode ? "rgba(217,119,6,0.15)" : "#FEF3C7";
  const amberIconCol = darkMode ? "#FBBF24" : "#D97706";
  const trashBg     = darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2";
  const trashHov    = darkMode ? "rgba(220,38,38,0.25)" : "#FFE4E6";
  const trashColor  = darkMode ? "#F87171" : "#DC2626";
  const editBg      = darkMode ? "rgba(37,99,235,0.12)" : "#EFF6FF";
  const editHov     = darkMode ? "rgba(37,99,235,0.25)" : "#DBEAFE";
  const editColor   = darkMode ? "#60A5FA" : "#2563EB";
  const openBg      = darkMode ? "rgba(37,99,235,0.06)" : "#F0F7FF";
  const chevOpenBg  = darkMode ? "rgba(37,99,235,0.2)" : "#DBEAFE";
  const chevCloseBg = darkMode ? "#1E293B" : "#F1F5F9";

  const tableSx = {
    background: cardBg,
    "& .MuiTableCell-root": { color: darkMode ? "#F1F5F9" : undefined, borderColor: darkMode ? "#334155" : undefined },
    "& .MuiTableHead-root .MuiTableCell-root": { background: headBg, color: darkMode ? "#94A3B8" : undefined },
    "& .MuiTableRow-root:hover": { background: darkMode ? "#1E293B" : "#F8FAFC" },
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const cashAdvanceWorkers = workers.filter((w) => w.cashAdvance > 0);
  const totalOutstanding   = cashAdvanceWorkers.reduce((s, w) => s + w.cashAdvance, 0);

  // Group history by date, sorted newest first
  const historyByDate = useMemo(() => {
    const map = {};
    history.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return Object.entries(map).sort(([a], [b]) => (a < b ? 1 : -1));
  }, [history]);

  const toggleDate = (date) => setExpandedDates((p) => ({ ...p, [date]: !p[date] }));

  // ── Add advance ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    const value = Number(amount);
    if (!selectedWorker || value <= 0) return;
    const worker = workers.find((w) => w.id === Number(selectedWorker));
    if (!worker) return;
    const newBalance = worker.cashAdvance + value;
    const today = dayjs().format("YYYY-MM-DD");
    await dbUpdateWorker(userId, { ...worker, cashAdvance: newBalance });
    setWorkers((p) => p.map((w) => w.id === worker.id ? { ...w, cashAdvance: newBalance } : w));
    const entry = await dbAddCashAdvanceEntry(userId, { workerId: worker.id, workerName: worker.name, amount: value, balance: newBalance, note: "Advance — to be deducted from weekly payroll", date: today });
    setHistory((p) => [entry, ...p]);
    setExpandedDates((p) => ({ ...p, [today]: true }));
    setOpen(false); setAmount("");
  };

  // ── Clear balance ─────────────────────────────────────────────────────────
  const handleClearAdvance = async () => {
    if (!confirmClearWorker) return;
    await dbUpdateWorker(userId, { ...confirmClearWorker, cashAdvance: 0 });
    setWorkers((p) => p.map((w) => w.id === confirmClearWorker.id ? { ...w, cashAdvance: 0 } : w));
    const today = dayjs().format("YYYY-MM-DD");
    const entry = await dbAddCashAdvanceEntry(userId, { workerId: confirmClearWorker.id, workerName: confirmClearWorker.name, amount: 0, balance: 0, note: "Balance manually cleared", date: today });
    setHistory((p) => [entry, ...p]);
    setConfirmClearWorker(null);
  };

  // ── Delete single entry ───────────────────────────────────────────────────
  const handleDeleteHistoryEntry = async () => {
    if (!confirmDeleteHistory) return;
    await dbDeleteCashAdvanceEntry(userId, confirmDeleteHistory.id);
    setHistory((p) => p.filter((e) => e.id !== confirmDeleteHistory.id));
    setConfirmDeleteHistory(null);
  };

  // ── Delete entire date group ──────────────────────────────────────────────
  const handleDeleteGroup = async () => {
    if (!confirmDeleteGroup) return;
    const group = history.filter((e) => e.date === confirmDeleteGroup);
    await Promise.all(group.map((e) => dbDeleteCashAdvanceEntry(userId, e.id)));
    setHistory((p) => p.filter((e) => e.date !== confirmDeleteGroup));
    setConfirmDeleteGroup(null);
  };

  // ── Edit entry amount ─────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editEntry) return;
    const newAmt = Number(editEntry.newAmount);
    if (isNaN(newAmt) || newAmt < 0) return;
    // Update entry in DB — we delete and re-add with the new amount
    await dbDeleteCashAdvanceEntry(userId, editEntry.entry.id);
    const updated = await dbAddCashAdvanceEntry(userId, {
      workerId: editEntry.entry.workerId || editEntry.entry.worker_id,
      workerName: editEntry.entry.workerName,
      amount: newAmt,
      balance: editEntry.entry.balance - editEntry.entry.amount + newAmt,
      note: editEntry.entry.note,
      date: editEntry.entry.date,
    });
    setHistory((p) => p.map((e) => e.id === editEntry.entry.id ? updated : e));
    setEditEntry(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Summary + Add */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", flex: 1 }}>
          {[
            { icon: MdMoneyOff, label: "Total Outstanding",     value: `₱${totalOutstanding.toLocaleString()}`, valueColor: darkMode ? "#F87171" : "#DC2626", bg: redIconBg,   color: redIconCol   },
            { icon: MdPeople,   label: "Workers with Advances", value: cashAdvanceWorkers.length,               valueColor: textPrimary,                       bg: amberIconBg, color: amberIconCol },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "14px", alignItems: "center", boxShadow: shadow, transition: "background 0.2s" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={20} color={card.color} /></div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</div>
                  <div style={{ fontSize: "1.375rem", fontWeight: 700, color: card.valueColor, marginTop: "2px", letterSpacing: "-0.03em" }}>{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Button variant="contained" startIcon={<MdAdd size={18} />} onClick={() => setOpen(true)} sx={{ height: "42px", flexShrink: 0 }}>Add Cash Advance</Button>
      </div>

      {/* Outstanding balances */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: shadow, transition: "background 0.2s" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}`, display: "flex", alignItems: "center", gap: "8px" }}>
          <MdWarning size={16} color={darkMode ? "#FBBF24" : "#D97706"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Workers with Outstanding Advances</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>Deducted on the next payroll run · Click Clear to zero out a balance</div>
          </div>
        </div>
        {cashAdvanceWorkers.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✅</div>
            <div style={{ fontWeight: 600, color: textPrimary }}>All cleared</div>
            <div style={{ fontSize: "0.875rem", color: textSub, marginTop: "4px" }}>No workers have outstanding cash advances.</div>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: "none", borderRadius: 0, ...tableSx }}>
            <Table>
              <TableHead><TableRow>
                <TableCell>Worker</TableCell><TableCell>Position</TableCell>
                <TableCell>Daily Rate</TableCell><TableCell>Outstanding</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {cashAdvanceWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${(worker.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{worker.name.charAt(0)}</div>
                        <span style={{ fontWeight: 600, color: textPrimary }}>{worker.name}</span>
                      </div>
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#94A3B8" : undefined }}>{worker.position}</TableCell>
                    <TableCell sx={{ color: textPrimary }}>₱{worker.dailyRate.toLocaleString()}</TableCell>
                    <TableCell><span style={{ fontWeight: 700, color: darkMode ? "#F87171" : "#DC2626", fontSize: "0.9375rem" }}>₱{worker.cashAdvance.toLocaleString()}</span></TableCell>
                    <TableCell align="center">
                      <button onClick={() => setConfirmClearWorker(worker)} style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 11px", borderRadius: "6px", border: "none", background: darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7", color: darkMode ? "#34D399" : "#15803D", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(5,150,105,0.3)" : "#BBF7D0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7")}>
                        <MdCheckCircle size={13} /> Clear
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* ── Advance History — grouped by date ────────────────────────────── */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: shadow, transition: "background 0.2s" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}`, display: "flex", alignItems: "center", gap: "8px" }}>
          <MdHistory size={16} color={darkMode ? "#64748B" : "#64748B"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Advance History</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>Grouped by date · click a date to expand · edit or delete individual entries</div>
          </div>
        </div>

        {historyByDate.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", fontSize: "0.9375rem" }}>No history yet</div>
            <div style={{ fontSize: "0.875rem", color: textSub, marginTop: "4px" }}>Add a cash advance to record it here.</div>
          </div>
        ) : (
          historyByDate.map(([date, entries], gIdx) => {
            const isOpen   = !!expandedDates[date];
            const total    = entries.reduce((s, e) => s + (e.amount || 0), 0);
            const isLast   = gIdx === historyByDate.length - 1;

            return (
              <div key={date} style={{ borderBottom: isLast ? "none" : `1px solid ${rowDivider}` }}>

                {/* ── Date header row — clickable ── */}
                <div
                  role="button" tabIndex={0}
                  onClick={() => toggleDate(date)}
                  onKeyDown={(e) => e.key === "Enter" && toggleDate(date)}
                  style={{ padding: "13px 20px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", background: isOpen ? openBg : cardBg, borderLeft: `4px solid ${isOpen ? "#2563EB" : "transparent"}`, userSelect: "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = darkMode ? "#1E293B" : "#F8FAFC"; }}
                  onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = cardBg; }}
                >
                  {/* Chevron */}
                  <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: isOpen ? chevOpenBg : chevCloseBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isOpen ? <MdExpandLess size={16} color="#2563EB" /> : <MdExpandMore size={16} color={darkMode ? "#64748B" : "#64748B"} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>{dayjs(date).format("MMMM D, YYYY")}</div>
                    <div style={{ fontSize: "0.75rem", color: textSub, marginTop: "1px" }}>{entries.length} entr{entries.length === 1 ? "y" : "ies"} · Total: <span style={{ color: darkMode ? "#F87171" : "#DC2626", fontWeight: 700 }}>₱{total.toLocaleString()}</span></div>
                  </div>

                  {/* Worker avatars preview */}
                  <div style={{ display: "flex", gap: "-4px" }}>
                    {entries.slice(0, 4).map((e, i) => (
                      <div key={e.id} title={e.workerName} style={{ width: "26px", height: "26px", borderRadius: "50%", background: `hsl(${((e.workerId || e.worker_id || i) * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, border: `2px solid ${cardBg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.625rem", fontWeight: 700, color: "#fff", marginLeft: i > 0 ? "-6px" : 0 }}>
                        {(e.workerName || "?").charAt(0)}
                      </div>
                    ))}
                    {entries.length > 4 && <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: darkMode ? "#334155" : "#E2E8F0", border: `2px solid ${cardBg}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: textSub, marginLeft: "-6px" }}>+{entries.length - 4}</div>}
                  </div>

                  {/* Delete All for this date */}
                  <button onClick={(ev) => { ev.stopPropagation(); setConfirmDeleteGroup(date); }} title="Delete all entries for this date"
                    style={{ width: "30px", height: "30px", borderRadius: "7px", border: "none", background: trashBg, color: trashColor, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = trashHov)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = trashBg)}>
                    <MdDeleteForever size={15} />
                  </button>
                </div>

                {/* ── Expanded entries ── */}
                {isOpen && (
                  <div style={{ background: darkMode ? "#0F172A" : "#F8FAFC", borderTop: `1px solid ${cardBorder}` }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: darkMode ? "#0F172A" : "#F1F5F9" }}>
                          {["Worker", "Amount", "Balance After", "Note", "Actions"].map((h) => (
                            <th key={h} style={{ padding: "8px 16px", textAlign: h === "Actions" ? "center" : "left", fontSize: "0.6875rem", fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${cardBorder}` }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry, i) => (
                          <tr key={entry.id} style={{ borderBottom: i < entries.length - 1 ? `1px solid ${cardBorder}` : "none", background: "transparent" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "#1E293B" : "#F1F5F9")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            <td style={{ padding: "10px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: `hsl(${((entry.workerId || entry.worker_id || i) * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6875rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>{(entry.workerName || "?").charAt(0)}</div>
                                <span style={{ fontWeight: 600, fontSize: "0.875rem", color: textPrimary }}>{entry.workerName}</span>
                              </div>
                            </td>
                            <td style={{ padding: "10px 16px", fontWeight: 700, color: entry.amount > 0 ? (darkMode ? "#F87171" : "#DC2626") : textSub, fontSize: "0.875rem" }}>
                              {entry.amount > 0 ? `₱${entry.amount.toLocaleString()}` : "—"}
                            </td>
                            <td style={{ padding: "10px 16px", fontSize: "0.875rem", color: textPrimary }}>₱{(entry.balance || 0).toLocaleString()}</td>
                            <td style={{ padding: "10px 16px", fontSize: "0.8125rem", color: darkMode ? "#64748B" : "#64748B" }}>{entry.note}</td>
                            <td style={{ padding: "10px 16px" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                {/* Edit */}
                                <button onClick={() => setEditEntry({ entry, newAmount: String(entry.amount) })} title="Edit amount"
                                  style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: editBg, color: editColor, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = editHov)}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = editBg)}>
                                  <MdEdit size={14} />
                                </button>
                                {/* Delete */}
                                <button onClick={() => setConfirmDeleteHistory(entry)} title="Delete entry"
                                  style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: trashBg, color: trashColor, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = trashHov)}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = trashBg)}>
                                  <MdDeleteOutline size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Group total */}
                    <div style={{ padding: "8px 16px", background: darkMode ? "rgba(37,99,235,0.06)" : "#EFF6FF", borderTop: `1px solid ${cardBorder}`, display: "flex", justifyContent: "flex-end", gap: "8px", alignItems: "center" }}>
                      <span style={{ fontSize: "0.8125rem", color: textSub }}>Total for {dayjs(date).format("MMM D")}:</span>
                      <span style={{ fontSize: "0.9375rem", fontWeight: 800, color: darkMode ? "#F87171" : "#DC2626" }}>₱{total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Add dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={open} onClose={() => { setOpen(false); setAmount(""); }} fullWidth maxWidth="xs" PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Add Cash Advance</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: darkMode ? "#94A3B8" : undefined }}>Worker</InputLabel>
              <Select value={selectedWorker} label="Worker" onChange={(e) => setSelectedWorker(e.target.value)}
                sx={{ background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined, "& .MuiOutlinedInput-notchedOutline": { borderColor: darkMode ? "#334155" : undefined } }}>
                {workers.map((w) => <MenuItem key={w.id} value={w.id}>{w.name} — ₱{w.cashAdvance.toLocaleString()} outstanding</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Amount (₱)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth size="small" inputProps={{ min: 0 }}
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }} />
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => { setOpen(false); setAmount(""); }} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!amount || Number(amount) <= 0}>Add Advance</Button>
        </DialogActions>
      </Dialog>

      {/* ── Edit entry dialog ─────────────────────────────────────────────── */}
      <Dialog open={Boolean(editEntry)} onClose={() => setEditEntry(null)} fullWidth maxWidth="xs" PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Edit Advance Entry</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ paddingTop: "8px", fontSize: "0.875rem", color: textSub, marginBottom: "12px" }}>
            {editEntry?.entry.workerName} · {editEntry && dayjs(editEntry.entry.date).format("MMM D, YYYY")}
          </div>
          <TextField label="Amount (₱)" type="number" value={editEntry?.newAmount || ""} onChange={(e) => setEditEntry((p) => p ? { ...p, newAmount: e.target.value } : p)}
            fullWidth size="small" inputProps={{ min: 0 }}
            InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
            InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }} />
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setEditEntry(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* ── Clear balance confirm ─────────────────────────────────────────── */}
      <Dialog open={Boolean(confirmClearWorker)} onClose={() => setConfirmClearWorker(null)} maxWidth="xs" fullWidth PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Clear Balance?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ paddingTop: "8px", fontSize: "0.9rem", color: textSub, lineHeight: 1.6 }}>
            Clear <strong style={{ color: textPrimary }}>₱{confirmClearWorker?.cashAdvance.toLocaleString()}</strong> for <strong style={{ color: textPrimary }}>{confirmClearWorker?.name}</strong>? This will zero out their balance and log a cleared entry.
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmClearWorker(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="success" onClick={handleClearAdvance} startIcon={<MdCheckCircle size={16} />}>Confirm Clear</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete single entry confirm ───────────────────────────────────── */}
      <Dialog open={Boolean(confirmDeleteHistory)} onClose={() => setConfirmDeleteHistory(null)} maxWidth="xs" fullWidth PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Delete Record?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ paddingTop: "8px", fontSize: "0.9rem", color: textSub, lineHeight: 1.6 }}>
            Remove <strong style={{ color: textPrimary }}>{confirmDeleteHistory?.workerName}</strong> · ₱{confirmDeleteHistory?.amount.toLocaleString()} · {confirmDeleteHistory && dayjs(confirmDeleteHistory.date).format("MMM D, YYYY")}?
            <div style={{ fontSize: "0.8125rem", marginTop: "6px" }}>This only removes the log entry. Worker's current balance is not changed.</div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmDeleteHistory(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteHistoryEntry} startIcon={<MdDeleteForever size={16} />}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete group confirm ──────────────────────────────────────────── */}
      <Dialog open={Boolean(confirmDeleteGroup)} onClose={() => setConfirmDeleteGroup(null)} maxWidth="xs" fullWidth PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Delete All for this Date?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ paddingTop: "8px", fontSize: "0.9rem", color: textSub, lineHeight: 1.6 }}>
            Delete <strong style={{ color: textPrimary }}>all {history.filter((e) => e.date === confirmDeleteGroup).length} entries</strong> for <strong style={{ color: textPrimary }}>{confirmDeleteGroup && dayjs(confirmDeleteGroup).format("MMMM D, YYYY")}</strong>?
            <div style={{ fontSize: "0.8125rem", marginTop: "6px" }}>Worker balances are not changed. Only the log entries are removed.</div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmDeleteGroup(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteGroup} startIcon={<MdDeleteForever size={16} />}>Delete All</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default CashAdvance;
