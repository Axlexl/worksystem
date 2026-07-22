const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // ── Auth ────────────────────────────────────────────────────────────────────
  login:           (a) => ipcRenderer.invoke("auth:login", a),
  register:        (a) => ipcRenderer.invoke("auth:register", a),
  changePassword:  (a) => ipcRenderer.invoke("auth:changePassword", a),
  updateProfile:   (a) => ipcRenderer.invoke("auth:updateProfile", a),
  forgotPassword:  (a) => ipcRenderer.invoke("auth:forgotPassword", a),
  resetPassword:   (a) => ipcRenderer.invoke("auth:resetPassword", a),
  saveEmailConfig: (a) => ipcRenderer.invoke("auth:saveEmailConfig", a),
  getEmailConfig:  ()  => ipcRenderer.invoke("auth:getEmailConfig"),

  // ── Workers ─────────────────────────────────────────────────────────────────
  getWorkers:   (a) => ipcRenderer.invoke("workers:getAll", a),
  addWorker:    (a) => ipcRenderer.invoke("workers:add", a),
  updateWorker: (a) => ipcRenderer.invoke("workers:update", a),
  deleteWorker: (a) => ipcRenderer.invoke("workers:delete", a),

  // ── Attendance ───────────────────────────────────────────────────────────────
  getAttendance: (a) => ipcRenderer.invoke("attendance:getAll", a),
  setAttendance: (a) => ipcRenderer.invoke("attendance:set", a),
  setManyAttendance: (a) => ipcRenderer.invoke("attendance:setMany", a),

  // ── Payroll ──────────────────────────────────────────────────────────────────
  getPayrollRecords:    (a) => ipcRenderer.invoke("payroll:getAll", a),
  addPayrollRecord:     (a) => ipcRenderer.invoke("payroll:add", a),
  updatePayrollRecord:  (a) => ipcRenderer.invoke("payroll:update", a),
  getPayrollWorkerRows: (a) => ipcRenderer.invoke("payroll:getWorkerRows", a),
  deletePayrollRecord:  (a) => ipcRenderer.invoke("payroll:delete", a),

  // ── App lifecycle ─────────────────────────────────────────────────────────
  onAppClose: (cb) => ipcRenderer.on("app:closing", cb),

  // ── Cash Advance ─────────────────────────────────────────────────────────────
  getCashAdvanceHistory:  (a) => ipcRenderer.invoke("cashadvance:getHistory", a),
  addCashAdvanceEntry:    (a) => ipcRenderer.invoke("cashadvance:add", a),
  deleteCashAdvanceEntry: (a) => ipcRenderer.invoke("cashadvance:deleteEntry", a),

  // ── Materials ────────────────────────────────────────────────────────────────
  getMaterials:          (a) => ipcRenderer.invoke("materials:getAll", a),
  addMaterial:           (a) => ipcRenderer.invoke("materials:add", a),
  updateMaterial:        (a) => ipcRenderer.invoke("materials:update", a),
  deleteMaterial:        (a) => ipcRenderer.invoke("materials:delete", a),
  resetWeeklyMaterials:  (a) => ipcRenderer.invoke("materials:resetWeekly", a),

  // ── Material History ─────────────────────────────────────────────────────────
  getMaterialHistory:    (a) => ipcRenderer.invoke("materialHistory:getAll", a),
  addMaterialHistory:    (a) => ipcRenderer.invoke("materialHistory:add", a),
  deleteMaterialHistory: (a) => ipcRenderer.invoke("materialHistory:delete", a),

  // ── Backup & Restore ─────────────────────────────────────────────────────────
  createBackup:        (a) => ipcRenderer.invoke("backup:create", a),
  listBackups:         ()  => ipcRenderer.invoke("backup:listFiles"),
  restoreBackup:       (a) => ipcRenderer.invoke("backup:restore", a),
  exportBackup:        ()  => ipcRenderer.invoke("backup:saveDialog"),
  importBackup:        ()  => ipcRenderer.invoke("backup:openDialog"),
  openBackupFolder:    ()  => ipcRenderer.invoke("shell:openBackupFolder"),
  getDbPath:           ()  => ipcRenderer.invoke("backup:getDbPath"),
});
