/**
 * db.service.js
 * Unified data layer — works in Electron (SQLite via IPC) and browser (localStorage).
 * All functions return the same shape so React pages don't need to care about the platform.
 */

export const isElectron = typeof window !== "undefined" && Boolean(window?.api);

// ── local storage helpers ─────────────────────────────────────────────────────
function lsGet(key, def = []) {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? def; }
  catch { return def; }
}
function lsSet(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function lsKey(userId, table) { return `ws_${table}_${userId}`; }

// ── Workers ───────────────────────────────────────────────────────────────────
export async function dbGetWorkers(userId) {
  if (isElectron) return window.api.getWorkers({ userId });
  return lsGet(lsKey(userId, "workers"), []);
}

export async function dbAddWorker(userId, worker) {
  if (isElectron) return window.api.addWorker({ userId, worker });
  const all = lsGet(lsKey(userId, "workers"), []);
  const created = { id: Date.now(), user_id: userId, cashAdvance: 0, status: "Active", ...worker };
  lsSet(lsKey(userId, "workers"), [...all, created]);
  return created;
}

export async function dbUpdateWorker(userId, worker) {
  if (isElectron) return window.api.updateWorker({ worker });
  const all = lsGet(lsKey(userId, "workers"), []);
  const updated = all.map((w) => w.id === worker.id ? { ...w, ...worker } : w);
  lsSet(lsKey(userId, "workers"), updated);
  return worker;
}

export async function dbDeleteWorker(userId, workerId) {
  if (isElectron) return window.api.deleteWorker({ workerId });
  const all = lsGet(lsKey(userId, "workers"), []);
  lsSet(lsKey(userId, "workers"), all.filter((w) => w.id !== workerId));
  return { ok: true };
}

// ── Attendance ────────────────────────────────────────────────────────────────
export async function dbGetAttendance(userId) {
  if (isElectron) return window.api.getAttendance({ userId });
  return lsGet(lsKey(userId, "attendance"), {});
}

export async function dbSetAttendance(userId, workerId, date, status) {
  if (isElectron) return window.api.setAttendance({ userId, workerId, date, status });
  const all = lsGet(lsKey(userId, "attendance"), {});
  const next = { ...all, [date]: { ...(all[date] || {}), [workerId]: status } };
  lsSet(lsKey(userId, "attendance"), next);
  return { ok: true };
}

export async function dbSetManyAttendance(userId, date, records) {
  if (isElectron) return window.api.setManyAttendance({ userId, date, records });
  const all = lsGet(lsKey(userId, "attendance"), {});
  const next = { ...all, [date]: { ...(all[date] || {}), ...records } };
  lsSet(lsKey(userId, "attendance"), next);
  return { ok: true };
}

// ── Payroll ───────────────────────────────────────────────────────────────────
export async function dbGetPayrollRecords(userId) {
  if (isElectron) return window.api.getPayrollRecords({ userId });
  return lsGet(lsKey(userId, "payroll"), []);
}

export async function dbAddPayrollRecord(userId, record) {
  // record.workerRows is the per-worker snapshot array
  if (isElectron) return window.api.addPayrollRecord({ userId, record });
  const all  = lsGet(lsKey(userId, "payroll"), []);
  const created = { id: Date.now(), user_id: userId, ...record };
  lsSet(lsKey(userId, "payroll"), [created, ...all]);
  // Persist worker row snapshots in localStorage too
  if (Array.isArray(record.workerRows)) {
    const key = lsKey(userId, `payroll_rows_${created.id}`);
    lsSet(key, record.workerRows);
  }
  return created;
}

export async function dbGetPayrollWorkerRows(userId, payrollId) {
  if (isElectron) return window.api.getPayrollWorkerRows({ payrollId });
  return lsGet(lsKey(userId, `payroll_rows_${payrollId}`), []);
}

export async function dbDeletePayrollRecord(userId, recordId) {
  if (isElectron) return window.api.deletePayrollRecord({ recordId });
  const all = lsGet(lsKey(userId, "payroll"), []);
  lsSet(lsKey(userId, "payroll"), all.filter((r) => r.id !== recordId));
  localStorage.removeItem(lsKey(userId, `payroll_rows_${recordId}`));
  return { ok: true };
}

export async function dbUpdatePayrollRecord(userId, recordId, record) {
  if (isElectron) return window.api.updatePayrollRecord({ recordId, record });
  const all = lsGet(lsKey(userId, "payroll"), []);
  const updated = all.map((r) => r.id === recordId ? { ...r, ...record } : r);
  lsSet(lsKey(userId, "payroll"), updated);
  return updated.find((r) => r.id === recordId);
}

// ── Cash Advance ──────────────────────────────────────────────────────────────
export async function dbGetCashAdvanceHistory(userId) {
  if (isElectron) return window.api.getCashAdvanceHistory({ userId });
  return lsGet(lsKey(userId, "cashadvance_history"), []);
}

export async function dbAddCashAdvanceEntry(userId, { workerId, workerName, amount, balance, note, date }) {
  // IPC handler expects flat args: { userId, workerId, workerName, amount, balance, note, date }
  if (isElectron) return window.api.addCashAdvanceEntry({ userId, workerId, workerName, amount, balance, note: note || "", date });
  const all = lsGet(lsKey(userId, "cashadvance_history"), []);
  const entry = { id: Date.now(), user_id: userId, workerId, workerName, amount, balance, note: note || "", date };
  lsSet(lsKey(userId, "cashadvance_history"), [entry, ...all]);
  return entry;
}

export async function dbDeleteCashAdvanceEntry(userId, entryId) {
  if (isElectron) return window.api.deleteCashAdvanceEntry({ entryId });
  const all = lsGet(lsKey(userId, "cashadvance_history"), []);
  lsSet(lsKey(userId, "cashadvance_history"), all.filter((e) => e.id !== entryId));
  return { ok: true };
}

// ── Materials ─────────────────────────────────────────────────────────────────
export async function dbGetMaterials(userId) {
  if (isElectron) return window.api.getMaterials({ userId });
  return lsGet(lsKey(userId, "materials"), []);
}

export async function dbAddMaterial(userId, material) {
  if (isElectron) return window.api.addMaterial({ userId, material });
  const all = lsGet(lsKey(userId, "materials"), []);
  const created = { id: Date.now(), user_id: userId, unit: "pcs", status: "In Stock", ...material };
  lsSet(lsKey(userId, "materials"), [...all, created]);
  return created;
}

export async function dbDeleteMaterial(userId, materialId) {
  if (isElectron) return window.api.deleteMaterial({ materialId });
  const all = lsGet(lsKey(userId, "materials"), []);
  lsSet(lsKey(userId, "materials"), all.filter((m) => m.id !== materialId));
  return { ok: true };
}

export async function dbResetWeeklyMaterials(userId) {
  if (isElectron) return window.api.resetWeeklyMaterials({ userId });
  lsSet(lsKey(userId, "materials"), []);
  return { ok: true };
}

// ── Material History ──────────────────────────────────────────────────────────
export async function dbGetMaterialHistory(userId) {
  if (isElectron) return window.api.getMaterialHistory({ userId });
  return lsGet(lsKey(userId, "material_history"), []);
}

export async function dbAddMaterialHistory(userId, entry) {
  if (isElectron) return window.api.addMaterialHistory({ userId, entry });
  const all = lsGet(lsKey(userId, "material_history"), []);
  const created = { id: Date.now(), user_id: userId, ...entry };
  lsSet(lsKey(userId, "material_history"), [created, ...all]);
  return created;
}

export async function dbDeleteMaterialHistory(userId, entryId) {
  if (isElectron) return window.api.deleteMaterialHistory({ entryId });
  const all = lsGet(lsKey(userId, "material_history"), []);
  lsSet(lsKey(userId, "material_history"), all.filter((e) => e.id !== entryId));
  return { ok: true };
}
