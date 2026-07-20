const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path       = require("path");
const fs         = require("fs");
const Database   = require("better-sqlite3");
const nodemailer = require("nodemailer");

const isDev = process.env.NODE_ENV === "development" || process.env.ELECTRON_DEV === "1";

// ── OTP store (in-memory, keyed by email, auto-expires) ───────────────────────
const otpStore = new Map(); // email → { otp, expiresAt }

function saveOtp(email, otp) {
  otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 15 * 60 * 1000 });
}
function verifyOtp(email, otp) {
  const entry = otpStore.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { otpStore.delete(email.toLowerCase()); return false; }
  return entry.otp === otp;
}
function clearOtp(email) { otpStore.delete(email.toLowerCase()); }

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Email transport (nodemailer) ──────────────────────────────────────────────
let _mailer = null;
async function getMailer() {
  if (_mailer) return _mailer;
  // Read from userData/email.config.json written by Settings page
  const cfgPath = path.join(app.getPath("userData"), "email.config.json");
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
      if (cfg.user && cfg.pass) {
        _mailer = nodemailer.createTransport({
          host:   cfg.host   || "smtp.gmail.com",
          port:   Number(cfg.port) || 587,
          secure: false,
          auth: { user: cfg.user, pass: cfg.pass },
        });
        return _mailer;
      }
    } catch {}
  }
  // Ethereal dev fallback
  const test = await nodemailer.createTestAccount();
  _mailer = nodemailer.createTransport({
    host: "smtp.ethereal.email", port: 587, secure: false,
    auth: { user: test.user, pass: test.pass },
  });
  console.log("[WorkSystem] Dev email account:", test.user);
  return _mailer;
}

// ── paths ─────────────────────────────────────────────────────────────────────
const userDataPath = app.getPath("userData");
const dbPath       = path.join(userDataPath, "worksystem.db");
const backupDir    = path.join(userDataPath, "backups");
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

// ── open DB ───────────────────────────────────────────────────────────────────
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── schema ────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    ownerName   TEXT DEFAULT '',
    email       TEXT DEFAULT '',
    company     TEXT NOT NULL DEFAULT 'WorkSystem Construction',
    role        TEXT NOT NULL DEFAULT 'administrator',
    createdAt   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workers (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL,
    name              TEXT NOT NULL,
    position          TEXT NOT NULL,
    dailyRate         REAL NOT NULL DEFAULT 0,
    contact           TEXT DEFAULT '',
    address           TEXT DEFAULT '',
    emergencyContact  TEXT DEFAULT '',
    dateHired         TEXT DEFAULT '',
    status            TEXT DEFAULT 'Active',
    cashAdvance       REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    worker_id  INTEGER NOT NULL,
    date       TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'Present',
    UNIQUE(user_id, worker_id, date),
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payroll_records (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL,
    payDate          TEXT NOT NULL,
    periodStart      TEXT NOT NULL,
    periodEnd        TEXT NOT NULL,
    workerCount      INTEGER NOT NULL DEFAULT 0,
    grossPay         REAL NOT NULL DEFAULT 0,
    cashAdvance      REAL NOT NULL DEFAULT 0,
    absentDeduction  REAL NOT NULL DEFAULT 0,
    netPay           REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payroll_worker_rows (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    payroll_id       INTEGER NOT NULL,
    user_id          INTEGER NOT NULL,
    worker_id        INTEGER NOT NULL,
    name             TEXT NOT NULL,
    position         TEXT NOT NULL DEFAULT '',
    dailyRate        REAL NOT NULL DEFAULT 0,
    grossPay         REAL NOT NULL DEFAULT 0,
    absentDays       INTEGER NOT NULL DEFAULT 0,
    absentDeduction  REAL NOT NULL DEFAULT 0,
    cashAdvance      REAL NOT NULL DEFAULT 0,
    netPay           REAL NOT NULL DEFAULT 0,
    daysRecorded     INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (payroll_id) REFERENCES payroll_records(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cash_advance_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    worker_id   INTEGER NOT NULL,
    workerName  TEXT NOT NULL,
    amount      REAL NOT NULL DEFAULT 0,
    balance     REAL NOT NULL DEFAULT 0,
    note        TEXT DEFAULT '',
    date        TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS materials (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id   INTEGER NOT NULL,
    name      TEXT NOT NULL,
    quantity  REAL NOT NULL DEFAULT 0,
    unit      TEXT DEFAULT 'pcs',
    unitCost  REAL NOT NULL DEFAULT 0,
    status    TEXT DEFAULT 'In Stock',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS material_history (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL,
    date          TEXT NOT NULL,
    materialName  TEXT NOT NULL,
    action        TEXT NOT NULL,
    quantity      REAL NOT NULL DEFAULT 0,
    totalCost     REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ── seed default admin ────────────────────────────────────────────────────────
const existing = db.prepare("SELECT id FROM users WHERE username = 'admin'").get();
if (!existing) {
  db.prepare(
    "INSERT INTO users (username, password, ownerName, email, company, role) VALUES (?, ?, ?, ?, ?, ?)"
  ).run("admin", "admin123", "Administrator", "admin@worksystem.ph", "WorkSystem Construction", "administrator");
}

// ── helpers ───────────────────────────────────────────────────────────────────
function userById(id) {
  return db.prepare("SELECT id, username, ownerName, email, company, role FROM users WHERE id = ?").get(id);
}

// ── IPC: Auth ─────────────────────────────────────────────────────────────────
ipcMain.handle("auth:login", (_, { username, password }) => {
  const u = db.prepare("SELECT id, username, ownerName, email, company, role FROM users WHERE username = ? AND password = ?").get(username, password);
  if (!u) return { ok: false, error: "Invalid username or password." };
  return { ok: true, user: { ...u, companyId: u.id } };
});

ipcMain.handle("auth:register", (_, { companyName, ownerName, email, username, password }) => {
  try {
    const info = db.prepare(
      "INSERT INTO users (username, password, ownerName, email, company, role) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(username, password, ownerName || "", email || "", companyName || "WorkSystem Construction", "administrator");
    const u = userById(info.lastInsertRowid);
    return { ok: true, user: { ...u, companyId: u.id } };
  } catch {
    return { ok: false, error: "Username already taken." };
  }
});

// ── IPC: Forgot Password — send OTP to registered email ──────────────────────
ipcMain.handle("auth:forgotPassword", async (_, { email }) => {
  if (!email) return { ok: false, error: "Email address is required." };
  const user = db.prepare("SELECT id, ownerName, email FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim());
  // Always respond ok to avoid user enumeration
  if (!user || !user.email) return { ok: true };

  const otp = generateOtp();
  saveOtp(user.email, otp);

  try {
    const mailer = await getMailer();
    const info = await mailer.sendMail({
      from:    process.env.EMAIL_FROM || "WorkSystem <noreply@worksystem.app>",
      to:      user.email,
      subject: "Reset your WorkSystem password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:28px;">🔐</div>
            <h2 style="color:#0f172a;margin:8px 0 4px;font-size:1.25rem;">Password Reset</h2>
            <p style="color:#64748b;margin:0;font-size:0.875rem;">WorkSystem Construction Management</p>
          </div>
          <div style="background:#fff;border-radius:10px;padding:28px 24px;border:1px solid #e2e8f0;">
            <h3 style="color:#0f172a;margin:0 0 12px;font-size:1rem;">Hi ${user.ownerName || "there"},</h3>
            <p style="color:#475569;font-size:0.875rem;line-height:1.6;margin:0 0 20px;">
              We received a request to reset your WorkSystem password. Use the code below:
            </p>
            <div style="text-align:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:20px;margin:0 0 20px;">
              <span style="font-size:2.25rem;font-weight:800;letter-spacing:0.2em;color:#ea580c;">${otp}</span>
            </div>
            <p style="color:#94a3b8;font-size:0.75rem;margin:0;text-align:center;">
              This code expires in <strong>15 minutes</strong>. Your password has <strong>not</strong> been changed yet.
            </p>
          </div>
          <p style="color:#cbd5e1;font-size:0.6875rem;text-align:center;margin-top:16px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>`,
    });
    // Log Ethereal preview URL in dev
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log("[WorkSystem] Password reset email preview:", preview);

    const resp = { ok: true };
    if (isDev || preview) resp.otp = otp;
    return resp;
  } catch (err) {
    console.error("[WorkSystem] Failed to send reset email:", err.message);
    if (isDev) return { ok: true, otp };
    return { ok: false, error: "Failed to send email. Check your email settings." };
  }
});

// ── IPC: Reset Password — verify OTP then set new password ───────────────────
ipcMain.handle("auth:resetPassword", (_, { email, otp, newPassword }) => {
  if (!email || !otp || !newPassword) return { ok: false, error: "All fields are required." };
  if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  if (!verifyOtp(email.trim(), otp.trim())) {
    return { ok: false, error: "Invalid or expired code. Please request a new one." };
  }

  const user = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email.trim());
  if (!user) return { ok: false, error: "Account not found." };

  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, user.id);
  clearOtp(email.trim());
  return { ok: true };
});

// ── IPC: Save Email Config ────────────────────────────────────────────────────
ipcMain.handle("auth:saveEmailConfig", (_, { host, port, user, pass }) => {
  try {
    const cfgPath = path.join(app.getPath("userData"), "email.config.json");
    fs.writeFileSync(cfgPath, JSON.stringify({ host, port, user, pass }, null, 2), "utf8");
    _mailer = null; // reset so next send picks up new config
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("auth:getEmailConfig", () => {
  try {
    const cfgPath = path.join(app.getPath("userData"), "email.config.json");
    if (!fs.existsSync(cfgPath)) return { ok: true, config: {} };
    return { ok: true, config: JSON.parse(fs.readFileSync(cfgPath, "utf8")) };
  } catch {
    return { ok: true, config: {} };
  }
});

// ── IPC: Workers ──────────────────────────────────────────────────────────────
ipcMain.handle("workers:getAll", (_, { userId }) =>
  db.prepare("SELECT * FROM workers WHERE user_id = ? ORDER BY name").all(userId)
);

ipcMain.handle("workers:add", (_, { userId, worker }) => {
  const info = db.prepare(`
    INSERT INTO workers (user_id, name, position, dailyRate, contact, address, emergencyContact, dateHired, status, cashAdvance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, worker.name, worker.position, worker.dailyRate,
        worker.contact || "", worker.address || "",
        worker.emergencyContact || "", worker.dateHired || "",
        worker.status || "Active", worker.cashAdvance || 0);
  return db.prepare("SELECT * FROM workers WHERE id = ?").get(info.lastInsertRowid);
});

ipcMain.handle("workers:update", (_, { worker }) => {
  db.prepare(`
    UPDATE workers SET name=?, position=?, dailyRate=?, contact=?,
    address=?, emergencyContact=?, dateHired=?, status=?, cashAdvance=?
    WHERE id=?
  `).run(worker.name, worker.position, worker.dailyRate,
        worker.contact || "", worker.address || "",
        worker.emergencyContact || "", worker.dateHired || "",
        worker.status, worker.cashAdvance, worker.id);
  return db.prepare("SELECT * FROM workers WHERE id = ?").get(worker.id);
});

ipcMain.handle("workers:delete", (_, { workerId }) => {
  db.prepare("DELETE FROM workers WHERE id = ?").run(workerId);
  return { ok: true };
});

// ── IPC: Attendance ───────────────────────────────────────────────────────────
ipcMain.handle("attendance:getAll", (_, { userId }) => {
  const rows = db.prepare("SELECT * FROM attendance WHERE user_id = ?").all(userId);
  const result = {};
  for (const row of rows) {
    if (!result[row.date]) result[row.date] = {};
    result[row.date][row.worker_id] = row.status;
  }
  return result;
});

ipcMain.handle("attendance:set", (_, { userId, workerId, date, status }) => {
  db.prepare(`
    INSERT INTO attendance (user_id, worker_id, date, status) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, worker_id, date) DO UPDATE SET status=excluded.status
  `).run(userId, workerId, date, status);
  return { ok: true };
});

ipcMain.handle("attendance:setMany", (_, { userId, date, records }) => {
  const upsert = db.prepare(`
    INSERT INTO attendance (user_id, worker_id, date, status) VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, worker_id, date) DO UPDATE SET status=excluded.status
  `);
  const tx = db.transaction((recs) => {
    for (const [workerId, status] of Object.entries(recs)) {
      upsert.run(userId, Number(workerId), date, status);
    }
  });
  tx(records);
  return { ok: true };
});

// ── IPC: Payroll ──────────────────────────────────────────────────────────────
ipcMain.handle("payroll:getAll", (_, { userId }) =>
  db.prepare("SELECT * FROM payroll_records WHERE user_id = ? ORDER BY payDate DESC").all(userId)
);

ipcMain.handle("payroll:add", (_, { userId, record }) => {
  const info = db.prepare(`
    INSERT INTO payroll_records (user_id, payDate, periodStart, periodEnd, workerCount, grossPay, cashAdvance, absentDeduction, netPay)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(userId, record.payDate, record.periodStart, record.periodEnd,
        record.workerCount, record.grossPay, record.cashAdvance,
        record.absentDeduction, record.netPay);
  const saved = db.prepare("SELECT * FROM payroll_records WHERE id = ?").get(info.lastInsertRowid);

  // Save worker row snapshots so history is accurate forever
  if (Array.isArray(record.workerRows) && record.workerRows.length > 0) {
    const insertRow = db.prepare(`
      INSERT INTO payroll_worker_rows
        (payroll_id, user_id, worker_id, name, position, dailyRate, grossPay, absentDays, absentDeduction, cashAdvance, netPay, daysRecorded)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const tx = db.transaction((rows) => {
      for (const r of rows) {
        insertRow.run(saved.id, userId, r.id, r.name, r.position || "", r.dailyRate,
          r.grossPay, r.absentDays, r.absentDeduction, r.cashAdvance, r.netPay, r.daysRecorded);
      }
    });
    tx(record.workerRows);
  }

  return saved;
});

ipcMain.handle("payroll:getWorkerRows", (_, { payrollId }) =>
  db.prepare("SELECT * FROM payroll_worker_rows WHERE payroll_id = ? ORDER BY name").all(payrollId)
);

ipcMain.handle("payroll:delete", (_, { recordId }) => {
  // worker rows cascade-delete automatically via FK
  db.prepare("DELETE FROM payroll_records WHERE id = ?").run(recordId);
  return { ok: true };
});

ipcMain.handle("payroll:update", (_, { recordId, record }) => {
  db.prepare(`
    UPDATE payroll_records SET
      payDate=?, periodStart=?, periodEnd=?, workerCount=?,
      grossPay=?, cashAdvance=?, absentDeduction=?, netPay=?
    WHERE id=?
  `).run(record.payDate, record.periodStart, record.periodEnd,
         record.workerCount, record.grossPay, record.cashAdvance,
         record.absentDeduction, record.netPay, recordId);
  return db.prepare("SELECT * FROM payroll_records WHERE id = ?").get(recordId);
});

// ── IPC: Cash Advance ─────────────────────────────────────────────────────────
ipcMain.handle("cashadvance:getHistory", (_, { userId }) =>
  db.prepare("SELECT * FROM cash_advance_history WHERE user_id = ? ORDER BY date DESC").all(userId)
);

ipcMain.handle("cashadvance:add", (_, { userId, workerId, workerName, amount, balance, note, date }) => {
  const info = db.prepare(`
    INSERT INTO cash_advance_history (user_id, worker_id, workerName, amount, balance, note, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, workerId, workerName, amount, balance, note || "", date);
  return db.prepare("SELECT * FROM cash_advance_history WHERE id = ?").get(info.lastInsertRowid);
});

ipcMain.handle("cashadvance:deleteEntry", (_, { entryId }) => {
  db.prepare("DELETE FROM cash_advance_history WHERE id = ?").run(entryId);
  return { ok: true };
});

// ── IPC: Materials ────────────────────────────────────────────────────────────
ipcMain.handle("materials:getAll", (_, { userId }) =>
  db.prepare("SELECT * FROM materials WHERE user_id = ?").all(userId)
);

ipcMain.handle("materials:add", (_, { userId, material }) => {
  const info = db.prepare(`
    INSERT INTO materials (user_id, name, quantity, unit, unitCost, status) VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, material.name, material.quantity, material.unit || "pcs", material.unitCost, material.status || "In Stock");
  return db.prepare("SELECT * FROM materials WHERE id = ?").get(info.lastInsertRowid);
});

ipcMain.handle("materials:delete", (_, { materialId }) => {
  db.prepare("DELETE FROM materials WHERE id = ?").run(materialId);
  return { ok: true };
});

ipcMain.handle("materials:resetWeekly", (_, { userId }) => {
  db.prepare("DELETE FROM materials WHERE user_id = ?").run(userId);
  return { ok: true };
});

// ── IPC: Material History ─────────────────────────────────────────────────────
ipcMain.handle("materialHistory:getAll", (_, { userId }) =>
  db.prepare("SELECT * FROM material_history WHERE user_id = ? ORDER BY date DESC, id DESC").all(userId)
);

ipcMain.handle("materialHistory:add", (_, { userId, entry }) => {
  const info = db.prepare(`
    INSERT INTO material_history (user_id, date, materialName, action, quantity, totalCost)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, entry.date, entry.materialName, entry.action, entry.quantity, entry.totalCost);
  return db.prepare("SELECT * FROM material_history WHERE id = ?").get(info.lastInsertRowid);
});

ipcMain.handle("materialHistory:delete", (_, { entryId }) => {
  db.prepare("DELETE FROM material_history WHERE id = ?").run(entryId);
  return { ok: true };
});

// ── IPC: Backup & Restore ─────────────────────────────────────────────────────
ipcMain.handle("backup:create", async () => {
  try {
    const ts   = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const dest = path.join(backupDir, `worksystem-backup-${ts}.db`);
    await db.backup(dest);
    return { ok: true, path: dest };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("backup:listFiles", () => {
  try {
    const files = fs.readdirSync(backupDir)
      .filter((f) => f.endsWith(".db"))
      .map((f) => {
        const fullPath = path.join(backupDir, f);
        const stat     = fs.statSync(fullPath);
        return { name: f, path: fullPath, size: stat.size, createdAt: stat.birthtime.toISOString() };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { ok: true, files };
  } catch (e) {
    return { ok: false, files: [], error: e.message };
  }
});

ipcMain.handle("backup:restore", async (_, { backupPath }) => {
  try {
    // Close current connections by copying backup over live db
    db.close();
    fs.copyFileSync(backupPath, dbPath);
    // Reopen
    app.relaunch();
    app.exit(0);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
});

ipcMain.handle("backup:saveDialog", async () => {
  const result = await dialog.showSaveDialog({
    title: "Export Backup",
    defaultPath: path.join(app.getPath("downloads"), `worksystem-backup-${Date.now()}.db`),
    filters: [{ name: "Database Backup", extensions: ["db"] }],
  });
  if (result.canceled) return { ok: false };
  const ts   = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const src  = path.join(backupDir, `worksystem-export-${ts}.db`);
  await db.backup(src);
  fs.copyFileSync(src, result.filePath);
  return { ok: true, path: result.filePath };
});

ipcMain.handle("backup:openDialog", async () => {
  const result = await dialog.showOpenDialog({
    title: "Restore from Backup",
    filters: [{ name: "Database Backup", extensions: ["db"] }],
    properties: ["openFile"],
  });
  if (result.canceled || !result.filePaths.length) return { ok: false };
  return { ok: true, backupPath: result.filePaths[0] };
});

ipcMain.handle("shell:openBackupFolder", () => {
  shell.openPath(backupDir);
  return { ok: true };
});

ipcMain.handle("backup:getDbPath", () => {
  return { ok: true, dbPath, backupDir, userDataPath };
});

// ── Auto-backup on start (keep last 7) ───────────────────────────────────────
function autoBackup() {
  try {
    const ts   = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const dest = path.join(backupDir, `auto-${ts}.db`);
    db.backup(dest).then(() => {
      // prune: keep only 7 most recent auto backups
      const autoFiles = fs.readdirSync(backupDir)
        .filter((f) => f.startsWith("auto-") && f.endsWith(".db"))
        .map((f) => ({ f, t: fs.statSync(path.join(backupDir, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t);
      autoFiles.slice(7).forEach(({ f }) => {
        try { fs.unlinkSync(path.join(backupDir, f)); } catch {}
      });
    });
  } catch {}
}

// ── Window ────────────────────────────────────────────────────────────────────
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    title: "WorkSystem",
    icon: path.join(__dirname, "../public/favicon.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setMenuBarVisibility(false);

  const isDev = process.env.NODE_ENV === "development" || process.env.ELECTRON_DEV === "1";
  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // ── Auto-logout on close: tell renderer to clear session before quitting ──
  win.on("close", (e) => {
    if (win && !win.isDestroyed()) {
      e.preventDefault();
      win.webContents.send("app:closing");
      // Give renderer 300ms to clear localStorage, then close
      setTimeout(() => {
        if (win && !win.isDestroyed()) win.destroy();
      }, 300);
    }
  });

  win.on("closed", () => { win = null; });
}

app.whenReady().then(() => {
  createWindow();
  autoBackup();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
