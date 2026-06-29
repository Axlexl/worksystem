import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Grid,
  Divider,
  Typography,
} from "@mui/material";
import { useThemeMode } from "../../context/ThemeContext";

const POSITIONS = ["Mason", "Carpenter", "Helper", "Welder", "Foreman", "Electrician", "Plumber"];

const emptyForm = {
  name: "",
  position: "",
  dailyRate: "",
  contact: "",
  address: "",
  emergencyContact: "",
  dateHired: "",
  status: "Active",
};

function AddWorkerDialog({ open, onClose, onSave }) {
  const { darkMode } = useThemeMode();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const cardBg     = darkMode ? "#1E293B" : "#FFFFFF";
  const cardBorder = darkMode ? "#334155" : "#E2E8F0";
  const textPrimary = darkMode ? "#F1F5F9" : undefined; // undefined lets MUI theme handle it

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.name || !form.position || !form.dailyRate) {
      setError("Name, Position, and Daily Rate are required.");
      return;
    }
    setError("");
    onSave({ ...form, dailyRate: Number(form.dailyRate) });
    setForm(emptyForm);
  };

  const handleClose = () => {
    setForm(emptyForm);
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          color: textPrimary,
        },
      }}
    >
      <DialogTitle sx={{ color: darkMode ? "#F1F5F9" : undefined, background: cardBg }}>
        Add New Worker
      </DialogTitle>
      <Divider sx={{ borderColor: cardBorder }} />
      <DialogContent sx={{ background: cardBg }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
            {error}
          </Alert>
        )}

        <Typography
          variant="caption"
          sx={{
            color: darkMode ? "#94A3B8" : "text.secondary",
            display: "block",
            mb: 1,
            mt: 1,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Basic Information
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Full Name *" name="name" value={form.name} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Position *" name="position" value={form.position} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            >
              {POSITIONS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Daily Rate (₱) *" name="dailyRate" type="number" value={form.dailyRate} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          sx={{
            color: darkMode ? "#94A3B8" : "text.secondary",
            display: "block",
            mb: 1,
            mt: 2.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Contact Details
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Contact Number" name="contact" value={form.contact} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Emergency Contact" name="emergencyContact" value={form.emergencyContact} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Address" name="address" value={form.address} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            />
          </Grid>
        </Grid>

        <Typography
          variant="caption"
          sx={{
            color: darkMode ? "#94A3B8" : "text.secondary",
            display: "block",
            mb: 1,
            mt: 2.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Employment
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Date Hired" name="dateHired" type="date" value={form.dateHired} onChange={handleChange}
              InputLabelProps={{ shrink: true, style: { color: darkMode ? "#94A3B8" : undefined } }}
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Status" name="status" value={form.status} onChange={handleChange} size="small"
              InputProps={{ style: { background: darkMode ? "#0F172A" : "#FAFAFA", color: darkMode ? "#F1F5F9" : undefined } }}
              InputLabelProps={{ style: { color: darkMode ? "#94A3B8" : undefined } }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <Divider sx={{ borderColor: cardBorder }} />
      <DialogActions sx={{ background: cardBg }}>
        <Button onClick={handleClose} variant="outlined">Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save Worker</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddWorkerDialog;
