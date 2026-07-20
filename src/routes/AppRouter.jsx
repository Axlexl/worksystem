import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import MainLayout   from "../layouts/MainLayout";
import Dashboard    from "../pages/Dashboard/Dashboard";
import Workers      from "../pages/Workers/Workers";
import Attendance   from "../pages/Attendance/Attendance";
import Payroll      from "../pages/Payroll/Payroll";
import CashAdvance  from "../pages/CashAdvance/CashAdvance";
import Materials    from "../pages/Materials/Materials";
import Reports      from "../pages/Reports/Reports";
import Settings     from "../pages/Settings/Settings";

// Redirects to "/" if not authenticated (extra safety net)
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
}

function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/"            element={<Dashboard   />} />
          <Route path="/workers"     element={<Workers     />} />
          <Route path="/attendance"  element={<Attendance  />} />
          <Route path="/payroll"     element={<Payroll     />} />
          <Route path="/cashadvance" element={<CashAdvance />} />
          <Route path="/materials"   element={<Materials   />} />
          <Route path="/reports"     element={<Reports     />} />
          <Route path="/settings"    element={<Settings    />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;
