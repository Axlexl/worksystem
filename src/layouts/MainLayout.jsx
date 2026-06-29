import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import dayjs from "dayjs";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar  from "../components/Navbar/Navbar";
import { useThemeMode } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import {
  dbGetWorkers, dbGetAttendance,
  dbGetMaterials, dbGetMaterialHistory,
  dbGetPayrollRecords,
} from "../services/db.service";

function MainLayout() {
  const { darkMode } = useThemeMode();
  const { user }     = useAuth();
  const userId       = user?.id;

  // ── state ──────────────────────────────────────────────────────────────────
  const [workers,          setWorkers]          = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [materials,        setMaterials]        = useState([]);
  const [materialHistory,  setMaterialHistory]  = useState([]);
  const [payrollHistory,   setPayrollHistory]   = useState([]);
  const [loading,          setLoading]          = useState(true);

  // ── load all data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    async function load() {
      try {
        const [w, a, m, mh, pr] = await Promise.all([
          dbGetWorkers(userId),
          dbGetAttendance(userId),
          dbGetMaterials(userId),
          dbGetMaterialHistory(userId),
          dbGetPayrollRecords(userId),
        ]);
        if (!mounted) return;
        setWorkers(Array.isArray(w)  ? w  : []);
        setAttendanceRecords(a && typeof a === "object" ? a : {});
        setMaterials(Array.isArray(m)  ? m  : []);
        setMaterialHistory(Array.isArray(mh) ? mh : []);
        setPayrollHistory(Array.isArray(pr) ? pr : []);
      } catch (err) {
        console.error("MainLayout load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [userId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: darkMode ? "#0F172A" : "#F1F5F9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: "12px" }}>⚙️</div>
          <div style={{ fontWeight: 600, color: darkMode ? "#94A3B8" : "#64748B", fontSize: "0.9375rem" }}>Loading WorkSystem…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Navbar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px", background: darkMode ? "#0F172A" : "#F1F5F9", transition: "background 0.2s" }}>
          <Outlet
            context={{
              userId,
              workers,          setWorkers,
              attendanceRecords, setAttendanceRecords,
              materials,        setMaterials,
              materialHistory,  setMaterialHistory,
              payrollHistory,   setPayrollHistory,
            }}
          />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
