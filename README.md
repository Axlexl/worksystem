# WorkSystem — Construction Management Desktop App

A full-featured construction management system built with **React + Vite + Electron + SQLite**.

---

## 🚀 Quick Start

### Run in browser (dev)
```bash
npm run dev
# Open http://localhost:5173
# Default login: admin / admin123
```

### Run as Electron desktop app (dev)
> First, start the Vite dev server:
```bash
npm run dev
```
> Then in a second terminal:
```bash
set ELECTRON_DEV=1 && npx electron .
```

> **Note:** `better-sqlite3` must be rebuilt for Electron. If you get a NODE_MODULE_VERSION error, run:
```bash
npx @electron/rebuild -f -w better-sqlite3
```

---

## 📦 Build Windows Installer (.exe)

```bash
npm run electron:build
```
Output is in `/release/WorkSystem Setup 1.0.0.exe`

---

## 📋 Features

| Module         | Status | SQLite |
|----------------|--------|--------|
| Authentication | ✅     | ✅     |
| Workers        | ✅     | ✅     |
| Attendance     | ✅     | ✅     |
| Payroll        | ✅     | ✅     |
| Cash Advance   | ✅     | ✅     |
| Materials      | ✅     | ✅     |
| Reports        | ✅     | ✅     |
| Settings       | ✅     | ✅     |
| Backup/Restore | ✅     | ✅     |
| Dark Mode      | ✅     | —      |
| Print Payslips | ✅     | —      |

---

## 🔒 Data Isolation

Every company's data is fully isolated by `user_id` in every SQLite table.  
Multiple companies can register and each only sees their own workers, payroll, materials, etc.

---

## 💾 Backup & Restore

- **Auto-backup** runs every time the app launches (keeps last 7 snapshots)
- Backups stored at: `%APPDATA%\WorkSystem\backups\`
- Manual backup, export to custom path, and restore via **Settings → Backup & Restore**

---

## 🏗 Tech Stack

- **Frontend:** React 19, Vite 8, MUI v9, react-icons, dayjs
- **Desktop:** Electron 42
- **Database:** better-sqlite3 (SQLite)
- **Installer:** electron-builder (NSIS)
