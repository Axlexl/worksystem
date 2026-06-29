import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { useThemeMode } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import { buildTheme } from "./theme/theme";
import AppRouter from "./routes/AppRouter";
import Login from "./pages/Login/Login";

function AppContent() {
  const { user } = useAuth();
  const { darkMode } = useThemeMode();
  const theme = buildTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {user ? <AppRouter /> : <Login />}
    </ThemeProvider>
  );
}

export default function App() {
  return <AppContent />;
}
