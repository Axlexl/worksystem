import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import {
  MdPeople,
  MdAccountBalanceWallet,
  MdAdd,
  MdPhone,
  MdLocationOn,
  MdCalendarToday,
  MdDeleteForever,
  MdDeleteOutline,
} from "react-icons/md";

import { useThemeMode } from "../../context/ThemeContext";
import { dbAddWorker, dbUpdateWorker, dbDeleteWorker } from "../../services/db.service";
import WorkerList from "./WorkerList";
import AddWorkerDialog from "./AddWorkerDialog";
import EditWorkerDialog from "./EditWorkerDialog";

function StatBadge({ icon: Icon, label, value, bg, color, darkMode }) {
  const cardBg     = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8" : "#94A3B8";
  const shadow      = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.05)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: "10px",
        padding: "14px 16px",
        boxShadow: shadow,
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        <div style={{ fontSize: "1.125rem", fontWeight: 700, color: textPrimary, lineHeight: 1.2, marginTop: "2px" }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, darkMode }) {
  if (!value) return null;
  const iconBg      = darkMode ? "#0F172A" : "#F1F5F9";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub     = darkMode ? "#94A3B8" : "#94A3B8";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <Icon size={15} color="#64748B" />
      </div>
      <div>
        <div style={{ fontSize: "0.75rem", color: textSub, fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: "0.875rem", color: textPrimary, fontWeight: 500, marginTop: "2px" }}>{value}</div>
      </div>
    </div>
  );
}

function Workers() {
  const { userId, workers, setWorkers } = useOutletContext();
  const { darkMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const [viewWorker, setViewWorker] = useState(null);
  const [editWorker, setEditWorker] = useState(null);
  const [confirmDeleteWorker, setConfirmDeleteWorker] = useState(null);

  const cardBg      = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder  = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : "#0F172A";
  const textMuted   = darkMode ? "#64748B"  : "#64748B";
  const textSub     = darkMode ? "#94A3B8"  : "#94A3B8";
  const statBg      = darkMode ? "#0F172A"  : "#F8FAFC";

  // Icon pill backgrounds for StatBadge
  const workerIconBg  = darkMode ? "rgba(37,99,235,0.15)"  : "#EFF6FF";
  const workerIconCol = darkMode ? "#60A5FA"  : "#2563EB";
  const payrollIconBg = darkMode ? "rgba(217,119,6,0.15)"  : "#FEF3C7";
  const payrollIconCol = darkMode ? "#FBBF24" : "#D97706";

  const handleAddWorker = async (newWorker) => {
    const saved = await dbAddWorker(userId, {
      ...newWorker,
      cashAdvance: Number(newWorker.cashAdvance || 0),
      status: "Active",
    });
    setWorkers((prev) => [...prev, saved]);
    setOpen(false);
  };

  const handleDelete = async (workerId) => {
    await dbDeleteWorker(userId, workerId);
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    setConfirmDeleteWorker(null);
  };

  const handleSaveEdit = async (updated) => {
    await dbUpdateWorker(userId, updated);
    setWorkers((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
    setEditWorker(null);
  };

  const totalPayroll = workers.reduce((sum, w) => sum + w.dailyRate * 5, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
            flex: 1,
          }}
        >
          <StatBadge icon={MdPeople}               label="Total Workers"  value={workers.length}                      bg={workerIconBg}  color={workerIconCol}  darkMode={darkMode} />
          <StatBadge icon={MdAccountBalanceWallet}  label="Weekly Payroll" value={`₱${totalPayroll.toLocaleString()}`} bg={payrollIconBg} color={payrollIconCol} darkMode={darkMode} />
        </div>

        <Button
          variant="contained"
          size="large"
          startIcon={<MdAdd size={18} />}
          onClick={() => setOpen(true)}
          sx={{ flexShrink: 0, height: "42px", px: 3 }}
        >
          Add Worker
        </Button>
      </div>

      {/* List */}
      <WorkerList workers={workers} onView={setViewWorker} onEdit={setEditWorker} onDelete={(worker) => setConfirmDeleteWorker(worker)} />

      {/* Add dialog */}
      <AddWorkerDialog open={open} onClose={() => setOpen(false)} onSave={handleAddWorker} />

      {/* View dialog */}
      <Dialog open={Boolean(viewWorker)} onClose={() => setViewWorker(null)} maxWidth="sm" fullWidth
        PaperProps={{
          style: {
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            color: textPrimary,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, color: textPrimary, background: cardBg }}>
          {viewWorker && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "12px",
                  background: `hsl(${(viewWorker.id * 47) % 360}, 60%, ${darkMode ? "45%" : "50%"})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {viewWorker.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: textPrimary }}>{viewWorker.name}</div>
                <div style={{ fontSize: "0.8125rem", color: textMuted, fontWeight: 400 }}>{viewWorker.position}</div>
              </div>
            </div>
          )}
        </DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          {viewWorker && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "8px" }}>
              {/* Stat row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: statBg, borderRadius: "8px", padding: "12px" }}>
                  <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Daily Rate</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: textPrimary, marginTop: "2px" }}>₱{viewWorker.dailyRate.toLocaleString()}</div>
                </div>
                <div style={{
                  background: viewWorker.cashAdvance > 0
                    ? (darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2")
                    : statBg,
                  borderRadius: "8px",
                  padding: "12px",
                }}>
                  <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cash Advance</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: viewWorker.cashAdvance > 0 ? (darkMode ? "#F87171" : "#DC2626") : textPrimary, marginTop: "2px" }}>
                    ₱{viewWorker.cashAdvance.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Details */}
              <DetailRow icon={MdLocationOn}    label="Address"           value={viewWorker.address}          darkMode={darkMode} />
              <DetailRow icon={MdPhone}         label="Emergency Contact" value={viewWorker.emergencyContact} darkMode={darkMode} />
              <DetailRow icon={MdCalendarToday} label="Date Hired"        value={viewWorker.dateHired}        darkMode={darkMode} />
            </div>
          )}
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setViewWorker(null)} variant="outlined">Close</Button>
          <Button
            variant="contained"
            onClick={() => { setEditWorker(viewWorker); setViewWorker(null); }}
          >
            Edit Worker
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <EditWorkerDialog open={Boolean(editWorker)} worker={editWorker} onClose={() => setEditWorker(null)} onSave={handleSaveEdit} />

      {/* Delete confirm dialog */}
      <Dialog
        open={Boolean(confirmDeleteWorker)}
        onClose={() => setConfirmDeleteWorker(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}
      >
        <DialogTitle sx={{ color: textPrimary, background: cardBg }}>Remove Worker?</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdDeleteForever size={20} color={darkMode ? "#F87171" : "#DC2626"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                Remove {confirmDeleteWorker?.name}?
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>
                This worker and all their data will be permanently removed. This cannot be undone.
              </div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmDeleteWorker(null)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<MdDeleteForever size={16} />}
            onClick={() => handleDelete(confirmDeleteWorker?.id)}
          >
            Remove Worker
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Workers;
