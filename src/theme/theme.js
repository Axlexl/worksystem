import { createTheme } from "@mui/material/styles";

const shared = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h4: { fontWeight: 700, fontSize: "1.5rem",   letterSpacing: "-0.025em" },
    h5: { fontWeight: 700, fontSize: "1.25rem",  letterSpacing: "-0.02em"  },
    h6: { fontWeight: 600, fontSize: "1rem",     letterSpacing: "-0.015em" },
    body1: { fontSize: "0.875rem",   lineHeight: 1.6 },
    body2: { fontSize: "0.8125rem",  lineHeight: 1.5 },
    caption: { fontSize: "0.75rem" },
  },
};

// ─── shared component overrides factory ────────────────────────────────────
function makeComponents(dark) {
  const border  = dark ? "#334155" : "#E2E8F0";
  const bgPaper = dark ? "#1E293B" : "#FFFFFF";
  const bgInput = dark ? "#0F172A" : "#FAFAFA";
  const textPrimary   = dark ? "#F1F5F9" : "#0F172A";
  const textSecondary = dark ? "#94A3B8" : "#64748B";
  const tableHeadBg   = dark ? "#0F172A" : "#F8FAFC";
  const tableRowHover = dark ? "#1E293B" : "#F8FAFC";
  const tableRowBorder = dark ? "#1E293B" : "#F1F5F9";

  return {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${border}`,
          boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
          backgroundImage: "none",
          backgroundColor: bgPaper,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          letterSpacing: "0",
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        contained: {
          background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
          "&:hover": { background: "linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)" },
        },
        outlined: {
          borderColor: border,
          color: dark ? "#CBD5E1" : "#374151",
          "&:hover": {
            borderColor: dark ? "#475569" : "#CBD5E1",
            backgroundColor: dark ? "#1E293B" : "#F8FAFC",
          },
        },
        sizeLarge: { padding: "10px 24px", fontSize: "0.9375rem" },
        sizeSmall: { padding: "5px 12px",  fontSize: "0.8125rem" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: bgInput,
            color: textPrimary,
            "& fieldset": { borderColor: border },
            "&:hover fieldset": { borderColor: dark ? "#475569" : "#CBD5E1" },
            "&.Mui-focused fieldset": { borderColor: "#2563EB", borderWidth: "1.5px" },
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.875rem",
            color: textSecondary,
          },
          "& .MuiInputBase-input": { color: textPrimary },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: tableHeadBg,
            color: textSecondary,
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: `1px solid ${border}`,
            padding: "10px 16px",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            fontSize: "0.875rem",
            color: textPrimary,
            borderBottom: `1px solid ${tableRowBorder}`,
            padding: "12px 16px",
          },
          "& .MuiTableRow-root:last-child .MuiTableCell-root": { borderBottom: "none" },
          "& .MuiTableRow-root:hover": { backgroundColor: tableRowHover },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: `1px solid ${border}`,
          boxShadow: "none",
          backgroundColor: bgPaper,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none", backgroundColor: bgPaper },
        elevation0: { boxShadow: "none" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.75rem", height: "24px", borderRadius: "6px" },
        colorSuccess: { backgroundColor: "#DCFCE7", color: "#15803D" },
        colorError:   { backgroundColor: "#FEE2E2", color: "#B91C1C" },
        colorWarning: { backgroundColor: "#FEF3C7", color: "#B45309" },
        colorDefault: {
          backgroundColor: dark ? "#334155" : "#F1F5F9",
          color: dark ? "#CBD5E1" : "#475569",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", backgroundColor: bgPaper },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: "1.0625rem", fontWeight: 700, padding: "20px 24px 12px", color: textPrimary },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: "12px 24px" } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: "12px 24px 20px", gap: "8px" } },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.8125rem",
          borderRadius: "6px !important",
          border: `1px solid ${border} !important`,
          color: textSecondary,
          padding: "4px 12px",
          "&.Mui-selected": {
            backgroundColor: "#2563EB",
            color: "#ffffff",
            "&:hover": { backgroundColor: "#1D4ED8" },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: "4px",
          "& .MuiToggleButtonGroup-grouped": { margin: 0 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 8, fontSize: "0.875rem" } },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: border } },
    },
    MuiSwitch: {
      styleOverrides: {
        root: { padding: 8 },
        track: { borderRadius: 11, backgroundColor: dark ? "#475569" : "#CBD5E1", opacity: 1 },
        thumb: { boxShadow: "0 1px 3px rgba(0,0,0,0.2)" },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: { borderRadius: 8, color: textPrimary, backgroundColor: bgInput },
        icon: { color: textSecondary },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: textPrimary,
          fontSize: "0.875rem",
          "&:hover": { backgroundColor: dark ? "#334155" : "#F1F5F9" },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: { root: { color: textSecondary } },
    },
  };
}

// ─── exported factory ───────────────────────────────────────────────────────
export function buildTheme(dark = false) {
  return createTheme({
    ...shared,
    palette: {
      mode: dark ? "dark" : "light",
      primary:    { main: "#2563EB", light: "#3B82F6", dark: "#1D4ED8", contrastText: "#fff" },
      secondary:  { main: "#7C3AED", light: "#8B5CF6", dark: "#6D28D9" },
      success:    { main: "#059669", light: "#10B981", dark: "#047857" },
      warning:    { main: "#D97706", light: "#F59E0B", dark: "#B45309" },
      error:      { main: "#DC2626", light: "#EF4444", dark: "#B91C1C" },
      info:       { main: "#0284C7", light: "#0EA5E9" },
      background: {
        default: dark ? "#0F172A" : "#F1F5F9",
        paper:   dark ? "#1E293B" : "#FFFFFF",
      },
      text: {
        primary:   dark ? "#F1F5F9" : "#0F172A",
        secondary: dark ? "#94A3B8" : "#64748B",
      },
      divider: dark ? "#334155" : "#E2E8F0",
    },
    components: makeComponents(dark),
  });
}

// default light theme (kept for backward compat if anything imports it directly)
export default buildTheme(false);
