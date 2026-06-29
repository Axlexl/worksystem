import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import dayjs from "dayjs";
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField,
} from "@mui/material";
import {
  MdInventory2, MdAttachMoney, MdAdd, MdRefresh,
  MdHistory, MdWarning, MdDeleteOutline, MdUndo, MdDeleteForever,
} from "react-icons/md";
import { useThemeMode } from "../../context/ThemeContext";

// ── Undo Toast ────────────────────────────────────────────────────────────────
function UndoToast({ item, onUndo, onConfirmDelete, darkMode }) {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef(null);
  const DURATION = 5000;

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct === 0) {
        clearInterval(intervalRef.current);
        onConfirmDelete();
      }
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, []);

  const bg     = darkMode ? "#1E293B" : "#1E293B";
  const border = darkMode ? "#334155" : "#334155";

  return (
    <div style={{
      position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, background: bg, border: `1px solid ${border}`,
      borderRadius: "12px", padding: "14px 18px", display: "flex",
      alignItems: "center", gap: "14px", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      minWidth: "340px", overflow: "hidden",
    }}>
      {/* Progress bar at bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, height: "3px", background: "#334155", width: "100%" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, height: "3px", background: "#EF4444", width: `${progress}%`, transition: "width 0.05s linear" }} />

      <MdDeleteOutline size={18} color="#F87171" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F1F5F9" }}>
          "{item.name}" moved to trash
        </div>
        <div style={{ fontSize: "0.75rem", color: "#94A3B8", marginTop: "1px" }}>
          Will be permanently deleted in {Math.ceil(progress / 20)}s
        </div>
      </div>
      <button
        onClick={onUndo}
        style={{
          display: "flex", alignItems: "center", gap: "5px",
          padding: "6px 12px", borderRadius: "7px", border: "1px solid #475569",
          background: "transparent", color: "#60A5FA", fontSize: "0.8125rem",
          fontWeight: 600, cursor: "pointer", flexShrink: 0,
        }}
      >
        <MdUndo size={15} /> Undo
      </button>
    </div>
  );
}

// ── Materials ─────────────────────────────────────────────────────────────────
function Materials() {
  const { materials, setMaterials, materialHistory, setMaterialHistory } = useOutletContext();
  const { darkMode } = useThemeMode();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", quantity: "", unitCost: "" });

  // Soft-delete state: { item, timerDone }
  const [trashedItem, setTrashedItem] = useState(null);
  // Permanent delete confirmation dialog
  const [confirmDelete, setConfirmDelete] = useState(null); // item to permanently delete
  // Reset confirmation
  const [confirmReset, setConfirmReset] = useState(false);
  // Record delete confirmation
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState(null);

  // Dark mode tokens
  const cardBg       = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder   = darkMode ? "#334155" : "#E2E8F0";
  const headBg       = darkMode ? "#0F172A" : "#F8FAFC";
  const rowDivider   = darkMode ? "#1E293B" : "#F1F5F9";
  const textPrimary  = darkMode ? "#F1F5F9" : "#0F172A";
  const textSub      = darkMode ? "#94A3B8" : "#94A3B8";
  const shadow       = darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 3px rgba(0,0,0,0.06)";
  const dateBtnSelBg  = "#2563EB";
  const dateBtnBg     = darkMode ? "#0F172A" : "#F8FAFC";
  const dateBtnBorder = darkMode ? "#334155" : "#E2E8F0";
  const dateBtnColor  = darkMode ? "#94A3B8" : "#475569";

  const STATUS_CHIP = darkMode
    ? { "In Stock": { bg: "rgba(5,150,105,0.15)", color: "#34D399" }, "Low Stock": { bg: "rgba(217,119,6,0.15)", color: "#FBBF24" }, "Ordered": { bg: "rgba(2,132,199,0.15)", color: "#38BDF8" } }
    : { "In Stock": { bg: "#DCFCE7", color: "#15803D" }, "Low Stock": { bg: "#FEF3C7", color: "#B45309" }, "Ordered": { bg: "#E0F2FE", color: "#0369A1" } };

  const tableSx = {
    background: cardBg,
    "& .MuiTableCell-root": { color: darkMode ? "#F1F5F9" : undefined, borderColor: darkMode ? "#334155" : undefined },
    "& .MuiTableHead-root .MuiTableCell-root": { background: headBg, color: darkMode ? "#94A3B8" : undefined },
    "& .MuiTableRow-root:hover": { background: darkMode ? "#1E293B" : "#F8FAFC" },
  };

  const uniqueRecordDates = useMemo(
    () => Array.from(new Set(materialHistory.map((r) => r.date))).sort((a, b) => dayjs(b).isAfter(dayjs(a)) ? 1 : -1),
    [materialHistory]
  );
  const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => {
    if (!selectedDate && uniqueRecordDates.length > 0) setSelectedDate(uniqueRecordDates[0]);
  }, [uniqueRecordDates, selectedDate]);

  const selectedDateRecords = useMemo(
    () => materialHistory.filter((r) => r.date === selectedDate),
    [materialHistory, selectedDate]
  );
  const totalValue = useMemo(
    () => materials.filter((m) => !m._trashed).reduce((s, i) => s + i.quantity * i.unitCost, 0),
    [materials]
  );
  const weekStart = dayjs().subtract(6, "day");
  const weeklyMaterialCost = materialHistory
    .filter((r) => dayjs(r.date).isSameOrAfter(weekStart, "day"))
    .reduce((s, r) => s + r.totalCost, 0);

  const visibleMaterials = materials.filter((m) => !m._trashed);

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.name || !form.quantity || !form.unitCost) return;
    const newMaterial = { id: Date.now(), ...form, unit: "pcs", quantity: Number(form.quantity), unitCost: Number(form.unitCost), status: "In Stock" };
    setMaterials((prev) => [...prev, newMaterial]);
    setMaterialHistory((prev) => [{
      id: Date.now(), date: new Date().toISOString().split("T")[0],
      materialName: form.name, action: "Added",
      quantity: Number(form.quantity), totalCost: Number(form.quantity) * Number(form.unitCost),
    }, ...prev]);
    setForm({ name: "", quantity: "", unitCost: "" });
    setOpen(false);
  };

  // Soft-delete: mark as trashed and show undo toast
  const handleTrash = (item) => {
    setMaterials((prev) => prev.map((m) => m.id === item.id ? { ...m, _trashed: true } : m));
    setTrashedItem(item);
  };

  // Undo: restore the trashed item
  const handleUndo = () => {
    if (!trashedItem) return;
    setMaterials((prev) => prev.map((m) => m.id === trashedItem.id ? { ...m, _trashed: false } : m));
    setTrashedItem(null);
  };

  // Toast timer done → show permanent delete confirm
  const handleToastExpired = () => {
    setConfirmDelete(trashedItem);
    setTrashedItem(null);
  };

  // Permanent delete
  const handlePermanentDelete = () => {
    if (!confirmDelete) return;
    setMaterials((prev) => prev.filter((m) => m.id !== confirmDelete.id));
    setMaterialHistory((prev) => [{
      id: Date.now(), date: dayjs().format("YYYY-MM-DD"),
      materialName: confirmDelete.name, action: "Deleted", quantity: 0, totalCost: 0,
    }, ...prev]);
    setConfirmDelete(null);
  };

  // Restore from confirm dialog
  const handleRestoreFromConfirm = () => {
    if (!confirmDelete) return;
    setMaterials((prev) => prev.map((m) => m.id === confirmDelete.id ? { ...m, _trashed: false } : m));
    setConfirmDelete(null);
  };

  const handleDeleteRecord = () => {
    if (!confirmDeleteRecord) return;
    setMaterialHistory((prev) => prev.filter((r) => r.id !== confirmDeleteRecord.id));
    setConfirmDeleteRecord(null);
  };

  const handleWeeklyReset = () => {    const resetDate = dayjs().format("YYYY-MM-DD");
    setMaterials([]);
    setMaterialHistory((prev) => [{
      id: `reset-${Date.now()}`, date: resetDate, materialName: "Weekly reset",
      action: "Reset weekly totals", quantity: 0, totalCost: 0,
    }, ...prev]);
    setSelectedDate(resetDate);
    setConfirmReset(false);
  };

  // icon palette
  const blueIconBg   = darkMode ? "rgba(37,99,235,0.15)"  : "#EFF6FF";
  const blueIconCol  = darkMode ? "#60A5FA" : "#2563EB";
  const greenIconBg  = darkMode ? "rgba(5,150,105,0.15)"  : "#DCFCE7";
  const greenIconCol = darkMode ? "#34D399"  : "#059669";
  const amberIconBg  = darkMode ? "rgba(217,119,6,0.15)"  : "#FEF3C7";
  const amberIconCol = darkMode ? "#FBBF24"  : "#D97706";
  const summaryCards = [
    { icon: MdInventory2,  label: "Material Types",        value: visibleMaterials.length,                   bg: blueIconBg,  color: blueIconCol  },
    { icon: MdAttachMoney, label: "Total Inventory Value", value: `₱${totalValue.toLocaleString()}`,          bg: greenIconBg, color: greenIconCol },
    { icon: MdAttachMoney, label: "Weekly Spend",          value: `₱${weeklyMaterialCost.toLocaleString()}`,  bg: amberIconBg, color: amberIconCol },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Summary + actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", flex: 1 }}>
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "16px", display: "flex", gap: "12px", alignItems: "center", boxShadow: shadow, transition: "background 0.2s" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={card.color} />
                </div>
                <div>
                  <div style={{ fontSize: "0.6875rem", color: textSub, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{card.label}</div>
                  <div style={{ fontSize: "1.125rem", fontWeight: 700, color: textPrimary, marginTop: "2px" }}>{card.value}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <Button variant="outlined" startIcon={<MdRefresh size={16} />} onClick={() => setConfirmReset(true)} size="small">
            Reset Weekly
          </Button>
          <Button variant="contained" startIcon={<MdAdd size={18} />} onClick={() => setOpen(true)}>
            Add Material
          </Button>
        </div>
      </div>

      {/* Inventory table */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: shadow, transition: "background 0.2s" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}` }}>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Current Inventory</div>
          <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>Track stock levels and material costs</div>
        </div>

        {visibleMaterials.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📦</div>
            <div style={{ fontWeight: 600, color: textPrimary }}>No materials yet</div>
            <div style={{ fontSize: "0.875rem", color: textSub, marginTop: "4px" }}>Click "Add Material" to start tracking inventory.</div>
          </div>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: "none", borderRadius: 0, ...tableSx }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Unit Cost</TableCell>
                  <TableCell>Total Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleMaterials.map((item) => {
                  const chipStyle = STATUS_CHIP[item.status] || STATUS_CHIP["In Stock"];
                  return (
                    <TableRow key={item.id}>
                      <TableCell style={{ fontWeight: 600, color: textPrimary }}>{item.name}</TableCell>
                      <TableCell sx={{ color: darkMode ? "#94A3B8" : undefined }}>{item.quantity.toLocaleString()} {item.unit}</TableCell>
                      <TableCell sx={{ color: textPrimary }}>₱{item.unitCost.toLocaleString()}</TableCell>
                      <TableCell style={{ fontWeight: 600, color: textPrimary }}>₱{(item.quantity * item.unitCost).toLocaleString()}</TableCell>
                      <TableCell>
                        <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, background: chipStyle.bg, color: chipStyle.color, alignItems: "center", gap: "4px" }}>
                          {item.status === "Low Stock" && <MdWarning size={12} />}
                          {item.status}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <button
                          onClick={() => handleTrash(item)}
                          title="Move to trash"
                          style={{ width: "30px", height: "30px", borderRadius: "7px", border: "none", background: darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2", color: darkMode ? "#F87171" : "#DC2626", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.25)" : "#FFE4E6")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2")}
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>

      {/* Material records */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "14px", overflow: "hidden", boxShadow: shadow, transition: "background 0.2s" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${rowDivider}`, display: "flex", alignItems: "center", gap: "8px" }}>
          <MdHistory size={16} color={darkMode ? "#64748B" : "#64748B"} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: textPrimary }}>Material Records</div>
            <div style={{ fontSize: "0.8125rem", color: textSub, marginTop: "1px" }}>Select a date to view records</div>
          </div>
        </div>

        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${rowDivider}`, display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {uniqueRecordDates.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              style={{
                padding: "5px 12px", borderRadius: "20px",
                border: date === selectedDate ? "none" : `1px solid ${dateBtnBorder}`,
                background: date === selectedDate ? dateBtnSelBg : dateBtnBg,
                color: date === selectedDate ? "#FFFFFF" : dateBtnColor,
                fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {dayjs(date).format("MMM D, YYYY")}
            </button>
          ))}
        </div>

        <TableContainer component={Paper} elevation={0} sx={{ border: "none", borderRadius: 0, ...tableSx }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total Cost</TableCell>
                <TableCell align="center">Remove</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedDateRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" style={{ color: textSub, fontStyle: "italic", padding: "24px" }}>
                    No records found for this date.
                  </TableCell>
                </TableRow>
              ) : (
                selectedDateRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell sx={{ color: darkMode ? "#94A3B8" : undefined }}>{dayjs(record.date).format("MMM D, YYYY")}</TableCell>
                    <TableCell style={{ fontWeight: 600, color: textPrimary }}>{record.materialName}</TableCell>
                    <TableCell>
                      <span style={{
                        padding: "3px 8px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: 600,
                        background: record.action === "Added" ? (darkMode ? "rgba(5,150,105,0.15)" : "#DCFCE7") : record.action === "Deleted" ? (darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2") : (darkMode ? "#1E293B" : "#F1F5F9"),
                        color: record.action === "Added" ? (darkMode ? "#34D399" : "#15803D") : record.action === "Deleted" ? (darkMode ? "#F87171" : "#DC2626") : (darkMode ? "#94A3B8" : "#475569"),
                      }}>
                        {record.action}
                      </span>
                    </TableCell>
                    <TableCell sx={{ color: darkMode ? "#94A3B8" : undefined }}>{record.quantity.toLocaleString()}</TableCell>
                    <TableCell style={{ fontWeight: 600, color: textPrimary }}>₱{record.totalCost.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <button
                        onClick={() => setConfirmDeleteRecord(record)}
                        title="Delete record"
                        style={{ width: "28px", height: "28px", borderRadius: "6px", border: "none", background: darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2", color: darkMode ? "#F87171" : "#DC2626", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.25)" : "#FFE4E6")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = darkMode ? "rgba(220,38,38,0.12)" : "#FFF1F2")}
                      >
                        <MdDeleteOutline size={15} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* ── Add material dialog ─────────────────────────────────────────────── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}`, color: darkMode ? "#F1F5F9" : undefined } }}
      >
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>Add Material</DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "8px" }}>
            <TextField label="Material Name" name="name" value={form.name} onChange={handleChange} fullWidth size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
            <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} fullWidth size="small" inputProps={{ min: 0 }}
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
            <TextField label="Unit Cost (₱)" name="unitCost" type="number" value={form.unitCost} onChange={handleChange} fullWidth size="small" inputProps={{ min: 0 }}
              InputProps={{ style: { background: darkMode ? "#0F172A" : undefined, color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
            {form.quantity && form.unitCost && (
              <div style={{ background: darkMode ? "rgba(5,150,105,0.12)" : "#F0FDF4", border: `1px solid ${darkMode ? "rgba(5,150,105,0.25)" : "#DCFCE7"}`, borderRadius: "8px", padding: "10px 14px", fontSize: "0.875rem", color: darkMode ? "#34D399" : "#15803D", fontWeight: 600 }}>
                Total Value: ₱{(Number(form.quantity) * Number(form.unitCost)).toLocaleString()}
              </div>
            )}
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Material</Button>
        </DialogActions>
      </Dialog>

      {/* ── Reset Weekly confirm dialog ─────────────────────────────────────── */}
      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}
      >
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>
          Reset Weekly Inventory?
        </DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: darkMode ? "rgba(217,119,6,0.15)" : "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdRefresh size={20} color={darkMode ? "#FBBF24" : "#D97706"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                This will clear all current inventory
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>
                All materials in the inventory list will be removed and a reset record will be logged. This action cannot be undone.
              </div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmReset(false)} variant="outlined">Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleWeeklyReset}
            startIcon={<MdRefresh size={16} />}
          >
            Yes, Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Permanent delete confirm dialog ────────────────────────────────── */}
      <Dialog open={Boolean(confirmDelete)} onClose={handleRestoreFromConfirm} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}
      >
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>
          Permanently Delete?
        </DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdDeleteForever size={20} color={darkMode ? "#F87171" : "#DC2626"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                Delete "{confirmDelete?.name}"?
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>
                This material will be permanently removed from the inventory. A deletion record will be logged.
              </div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={handleRestoreFromConfirm} variant="outlined" startIcon={<MdUndo size={15} />}>
            Restore
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handlePermanentDelete}
            startIcon={<MdDeleteForever size={16} />}
          >
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Record confirm dialog ────────────────────────────────── */}
      <Dialog open={Boolean(confirmDeleteRecord)} onClose={() => setConfirmDeleteRecord(null)} maxWidth="xs" fullWidth
        PaperProps={{ style: { background: cardBg, border: `1px solid ${cardBorder}` } }}
      >
        <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>
          Delete Record?
        </DialogTitle>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogContent sx={{ background: cardBg }}>
          <div style={{ display: "flex", gap: "14px", alignItems: "flex-start", paddingTop: "8px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: darkMode ? "rgba(220,38,38,0.15)" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <MdDeleteForever size={20} color={darkMode ? "#F87171" : "#DC2626"} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: textPrimary, marginBottom: "6px" }}>
                Remove "{confirmDeleteRecord?.materialName}" record?
              </div>
              <div style={{ fontSize: "0.875rem", color: textSub, lineHeight: 1.5 }}>
                This log entry will be permanently removed. The inventory item itself is not affected.
              </div>
            </div>
          </div>
        </DialogContent>
        <Divider sx={{ borderColor: cardBorder }} />
        <DialogActions sx={{ background: cardBg }}>
          <Button onClick={() => setConfirmDeleteRecord(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRecord} startIcon={<MdDeleteForever size={16} />}>
            Delete Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Undo Toast ──────────────────────────────────────────────────────── */}
      {trashedItem && (
        <UndoToast
          item={trashedItem}
          onUndo={handleUndo}
          onConfirmDelete={handleToastExpired}
          darkMode={darkMode}
        />
      )}

    </div>
  );
}

export default Materials;
