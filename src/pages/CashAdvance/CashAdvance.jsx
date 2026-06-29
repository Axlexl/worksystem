import { useEffect, useState } from "react";
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
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";
import {
  dbUpdateWorker, dbGetCashAdvanceHistory,
  dbAddCashAdvanceEntry, dbDeleteCashAdvanceEntry,
} from "../../services/db.service";

function CashAdvance() {
  const { userId, workers, setWorkers } = useOutletContext();
  const { darkMode } = useThemeMode();

  const [open,                  setOpen]                  = useState(false);
  const [selectedWorker,        setSelectedWorker]        = useState(workers[0]?.id || "");
  const [amount,                setAmount]                = useState("");
  const [history,               setHistory]               = useState([]);
  const [confirmDeleteHistory,  setConfirmDeleteHistory]  = useState(null);
  const [confirmClearWorker,    setConfirmClearWorker]    = useState(null);

  // ── Load cash advance history from SQLite (or localStorage) on mount ────────
  useEffect(() => {
    if (!userId) return;
    dbGetCashAdvanceHistory(userId).then((rows) => {
      if (Array.isArray(rows)) setHistory(rows);
    });
  }, [userId]);

  // ── Design tokens ──────────────────────────────────────────────────────────
  const cardBg       = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder   = darkMode ? "#334155" : "#E2E8F0";
  const headBg       = darkMode ? "#0F172A" : "#F8FAFC";
  const rowDivider   = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary  = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub      = darkMode ? "#94A3B8"  : "#94A3B8";
  const shadow       = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)";
  const redIconBg    = darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2";
  const redIconCol   = darkMode ? "#F87171" : "#DC2626";
  const amberIconBg  = darkMode ? "rgba(217,119,6,0.15)" : "#FEF3C7";
  const amberIconCol = darkMode ? "#FBBF24" : "#D97706";
  const trashBg      = darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2";
  const trashBgHov   = darkMode ? "rgba(220,38,38,0.25)" : "#FFE4E6";
  const trashColor   = darkMode ? "#F87171" : "#DC2626";

  const tableSx = {
    background: cardBg,
    "& .MuiTableCell-root": { color: darkMode ? "#F1F5F9" : undefined, borderColor: darkMode ? "#334155" : undefined },
    "& .MuiTableHead-root .MuiTableCell-root": { background: headBg, color: darkMode ? "#94A3B8" : undefined },
    "& .MuiTableRow-root:hover": { background: darkMode ? "#1E293B" : "#F8FAFC" },
  };

  const cashAdvanceWorkers  = workers.filter((w) => w.cashAdvance > 0);
  const totalOutstanding    = cashAdvanceWorkers.reduce((s, w) => s + w.cashAdvance, 0);

  // ── Add a new cash advance ─────────────────────────────────────────────────
  const handleSave = async () => {
    const value = Number(amount);
    if (!selectedWorker || value <= 0) return;

    const worker = workers.find((w) => w.id === Number(selectedWorker));
    if (!worker) return;

    const newBalance  = worker.cashAdvance + value;
    const today       = dayjs().format("YYYY-MM-DD");

    // Persist worker's updated cash advance balance
    const updatedWorker = { ...worker, cashAdvance: newBalance };
    await dbUpdateWorker(userId, updatedWorker);
    setWorkers((prev) => prev.map((w) => w.id === worker.id ? updatedWorker : w));

    // Persist history entry
    const entry = await dbAddCashAdvanceEntry(userId, {
      workerId:   worker.id,
      workerName: worker.name,
      amount:     value,
      balance:    newBalance,
      note:       "Advance — to be deducted from weekly payroll",
      date:       today,
    });
    setHistory((prev) => [entry, ...prev]);

    setOpen(false);
    setAmount("");
  };

  // ── Clear a worker's advance balance ──────────────────────────────────────
  const handleClearAdvance = async () => {
    if (!confirmClearWorker) return;

    const updatedWorker = { ...confirmClearWorker, cashAdvance: 0 };
    await dbUpdateWorker(userId, updatedWorker);
    setWorkers((prev) => prev.map((w) => w.id === confirmClearWorker.id ? updatedWorker : w));

    const entry = await dbAddCashAdvanceEntry(userId, {
      workerId:   confirmClearWorker.id,
      workerName: confirmClearWorker.name,
      amount:     0,
      balance:    0,
      note:       "Balance manually cleared",
      date:       dayjs().format("YYYY-MM-DD"),
    });
    setHistory((prev) => [entry, ...prev]);

    setConfirmClearWorker(null);
  };

  // ── Delete a history entry ─────────────────────────────────────────────────
  const handleDeleteHistoryEntry = async () => {
    if (!confirmDeleteHistory) return;
    await dbDeleteCashAdvanceEntry(userId, confirmDeleteHistory.id);
    setHistory((prev) => prev.filter((e) => e.id !== confirmDeleteHistory.id));
    setConfirmDeleteHistory(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* ── Summary + Add button ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", flex: 1 }}>
          {[
            { icon: MdMoneyOff, label: "Total Outstanding",     value: `₱${totalOutstanding.toLocaleString()}`, valueColor: darkMode ? "#F87171" : "#DC2626", bg: redIconBg,   color: redIconCol   },
            { icon: MdPeople,   label: "Workers with Advances", value: cashAdvanceWorkers.length,               valueColor: textPrimary,                       bg: amberIconBg, color: amberIconCol },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "14px", alignItems: "center", boxShadow: shadow, transition: "background 0.2s" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color={card.color} />
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</div>
                  <div style={{ fontSize: "1.375rem", fontWeight: 700, color: card.valueColor, marginTop: "2px", letterSpacing: "-0.03em" }}>{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <Button variant="contained" startIcon={<MdAdd size={18} />} onClick={() => setOpen(true)} sx={{ height: "42px", flexShrink: 0 }}>
          Add Cash Advance
        </Button>
      </div>

      {/* ── Outstanding balances ─────────────────────────────────────────── */}
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
              <TableHead>
                <TableRow>
                  <TableCell>Worker</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Daily Rate</TableCell>
                  <TableCell>Outstanding Balance</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cashAdvanceWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${(worker.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8125rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {worker.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: textPrimary }}>{worker.name}</span>
                      </div>
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#94A3B8" : undefined }}>{worker.position}</TableCell>
                    <TableCell sx={{ color: textPrimary }}>₱{worker.dailyRate.toLocaleString()}</TableCell>
                    <TableCell>
                      <span style={{ fontWeight: 700, color: darkMode ? "#F87171" : "#DC2626", fontSize: "0.9375rem" }}>
                        ₱{worker.cashAdvance.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell align="center">
                      <button
                        onClick={() => setConfirmClearWorker(worker)}
                        title="Clear balance"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 11px", borderRadius: "6px", border: "none", background: darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7", color: darkMode ? "#34D399" : "#15803D", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(5,150,105,0.3)" : "#BBF7D0")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7")}
                      >
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

      {/* ── Advance History ───────────────────────────────────────────────── */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: shadow, transition: "background 0.2s" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}`, display: "flex", alignItems: "center", gap: "8px" }}>
          <MdHistory size={16} color={darkMode ? "#64748B" : "#64748B"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Advance History</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>All recorded cash advances and cleared balances</div>
          </div>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontWeight: 600, color: darkMode ? "#64748B" : "#64748B", fontSize: "0.9375rem" }}>No history yet</div>
            <div style={{ fontSize: "0.875rem", color: textSub, marginTop: "4px" }}>Add a cash advance to record it here.</div>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: "none", borderRadius: 0, ...tableSx }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Worker</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Balance After</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell align="center">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell sx={{ color: darkMode ? "#94A3B8" : undefined }}>{dayjs(entry.date).format("MMM D, YYYY")}</TableCell>
                    <TableCell style={{ fontWeight: 600, color: textPrimary }}>{entry.workerName}</TableCell>
                    <TableCell style={{ fontWeight: 600, color: darkMode ? "#F87171" : "#DC2626" }}>
                      {entry.amount > 0 ? `₱${entry.amount.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: textPrimary }}>₱{entry.balance.toLocaleString()}</TableCell>
                    <TableCell style={{ color: darkMode ? "#64748B" : "#64748B" }}>{entry.note}</TableCell>
                    <TableCell align="center">
                      <button
                        onClick={() => setConfirmDeleteHistory(entry)}
                        title="Delete record"
                        style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: trashBg, color: trashColor, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = trashBgHov)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = trashBg)}
                      >
                        <MdDeleteOutline size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* ── Add dialog ────────────────────────────────────────────────────── */}
      <Dialog open={open} onClose={() => { setOpen(false); setAmount(""); }} fullWidth maxWidth="xs"
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}`, color: darkMode ? "#F1F5F9" : undefined } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Add Cash Advance</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: darkMode ? "#94A3B8" : undefined }}>Worker</InputLabel>
              <Select
                value={selectedWorker}
                label="Worker"
                onChange={(e) => setSelectedWorker(e.target.value)}
                sx={{ background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined, "& .MuiOutlinedInput-notchedOutline": { borderColor: darkMode ? "#334155" : undefined } }}
              >
                {workers.map((w) => (
                  <MenuItem key={w.id} value={w.id}>{w.name} — ₱{w.cashAdvance.toLocaleString()} outstanding</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount (₱)" type="number" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth size="small" inputProps={{ min: 0 }}
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => { setOpen(false); setAmount(""); }} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!amount || Number(amount) <= 0}>Add Advance</Button>
        </DialogActions>
      </Dialog>

      {/* ── Clear balance confirm ────────────────────────────────────────── */}
      <Dialog open={Boolean(confirmClearWorker)} onClose={() => setConfirmClearWorker(null)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Clear Balance?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdCheckCircle size={20} color={darkMode ? "#34D399" : "#059669"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                Clear ₱{confirmClearWorker?.cashAdvance.toLocaleString()} for {confirmClearWorker?.name}?
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>
                This will zero out their cash advance balance and log a cleared entry in the history.
              </div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmClearWorker(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="success" onClick={handleClearAdvance} startIcon={<MdCheckCircle size={16} />}>Confirm Clear</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete history confirm ───────────────────────────────────────── */}
      <Dialog open={Boolean(confirmDeleteHistory)} onClose={() => setConfirmDeleteHistory(null)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}>
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Delete Record?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: redIconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdDeleteForever size={20} color={redIconCol} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                Remove this advance record?
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>
                {confirmDeleteHistory?.workerName} · ₱{confirmDeleteHistory?.amount.toLocaleString()} · {confirmDeleteHistory && dayjs(confirmDeleteHistory.date).format("MMM D, YYYY")}
              </div>
              <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "6px" }}>
                This only removes the log entry. The worker's current balance is not changed.
              </div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmDeleteHistory(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteHistoryEntry} startIcon={<MdDeleteForever size={16} />}>Delete Record</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}

export default CashAdvance;
