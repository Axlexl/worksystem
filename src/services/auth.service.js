/**
 * auth.service.js
 *
 * Unified auth layer that works in:
 *  1. Electron (via window.api IPC → SQLite)
 *  2. Web browser (localStorage fallback)
 *
 * Returns consistent { ok, user, error } shapes.
 * user shape: { id, username, ownerName, email, company, companyId, role, token }
 */

const isElectron = typeof window !== "undefined" && Boolean(window?.api);

// ── helpers ──────────────────────────────────────────────────────────────────
function makeToken(user) {
  // Lightweight non-cryptographic token for the web fallback.
  // In production with a real backend, use proper JWT from the server.
  const payload = btoa(JSON.stringify({ id: user.id, companyId: user.companyId, role: user.role, exp: Date.now() + 8 * 3600 * 1000 }));
  return `ws.${payload}.local`;
}

function verifyToken(token) {
  try {
    if (!token?.startsWith("ws.")) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function getAccounts() {
  try { return JSON.parse(localStorage.getItem("ws_accounts") || "[]"); } catch { return []; }
}
function saveAccounts(accounts) {
  localStorage.setItem("ws_accounts", JSON.stringify(accounts));
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Register a new company + admin user.
 */
export async function registerCompany({ companyName, ownerName, email, username, password }) {
  if (!companyName || !ownerName || !email || !username || !password) {
    return { ok: false, error: "All fields are required." };
  }
  if (password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }

  if (isElectron) {
    const res = await window.api.register({ companyName, ownerName, email, username, password });
    if (!res.ok) return res;
    const token = makeToken(res.user);
    return { ok: true, user: { ...res.user, token } };
  }

  // Web fallback
  const accounts = getAccounts();
  if (accounts.find((a) => a.username === username)) {
    return { ok: false, error: "Username is already taken." };
  }
  if (accounts.find((a) => a.email === email)) {
    return { ok: false, error: "Email is already registered." };
  }

  const companyId = `co_${Date.now()}`;
  const newUser = {
    id: `usr_${Date.now()}`,
    companyId,
    companyName,
    ownerName,
    email,
    username,
    password, // plaintext in web fallback only — use bcrypt in real backend
    role: "administrator",
  };
  saveAccounts([...accounts, newUser]);

  const safeUser = { id: newUser.id, companyId, username, ownerName, email, company: companyName, role: "administrator" };
  return { ok: true, user: { ...safeUser, token: makeToken(safeUser) } };
}

/**
 * Login with username + password.
 */
export async function loginUser({ username, password }) {
  if (!username || !password) {
    return { ok: false, error: "Username and password are required." };
  }

  if (isElectron) {
    const res = await window.api.login({ username, password });
    if (!res.ok) return res;
    const token = makeToken(res.user);
    return { ok: true, user: { ...res.user, token } };
  }

  // Web fallback
  const accounts = getAccounts();
  const found = accounts.find((a) => a.username === username && a.password === password);
  if (!found) return { ok: false, error: "Invalid username or password." };

  const safeUser = {
    id: found.id,
    companyId: found.companyId,
    username: found.username,
    ownerName: found.ownerName,
    email: found.email,
    company: found.companyName,
    role: found.role || "administrator",
  };
  return { ok: true, user: { ...safeUser, token: makeToken(safeUser) } };
}

/**
 * Validate a stored token on app load.
 */
export function validateSession(token) {
  return verifyToken(token);
}

/**
 * Request a password reset OTP sent to the user's registered email.
 */
export async function forgotPassword({ email }) {
  if (!email) return { ok: false, error: "Email address is required." };

  if (isElectron) {
    return window.api.forgotPassword({ email });
  }

  // Web fallback — find account by email and store OTP in sessionStorage
  const accounts = getAccounts();
  const found = accounts.find((a) => a.email?.toLowerCase() === email.toLowerCase());
  // Don't reveal whether email exists
  if (!found) return { ok: true };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  sessionStorage.setItem("ws_reset_otp",   JSON.stringify({ email: email.toLowerCase(), otp, exp: Date.now() + 15 * 60 * 1000 }));
  // In browser fallback, we can't send real email — show OTP in console for dev
  console.warn("[WorkSystem] Password reset OTP (web fallback):", otp);
  return { ok: true };
}

/**
 * Verify OTP and set a new password.
 */
export async function resetPassword({ email, otp, newPassword }) {
  if (!email || !otp || !newPassword) return { ok: false, error: "All fields are required." };
  if (newPassword.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  if (isElectron) {
    return window.api.resetPassword({ email, otp, newPassword });
  }

  // Web fallback
  let stored;
  try { stored = JSON.parse(sessionStorage.getItem("ws_reset_otp")); } catch { stored = null; }
  if (!stored || stored.email !== email.toLowerCase() || stored.otp !== otp.trim()) {
    return { ok: false, error: "Invalid or expired code. Please request a new one." };
  }
  if (Date.now() > stored.exp) {
    sessionStorage.removeItem("ws_reset_otp");
    return { ok: false, error: "Code has expired. Please request a new one." };
  }

  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.email?.toLowerCase() === email.toLowerCase());
  if (idx === -1) return { ok: false, error: "Account not found." };
  accounts[idx].password = newPassword;
  saveAccounts(accounts);
  sessionStorage.removeItem("ws_reset_otp");
  return { ok: true };
}

/**
 * Change the current user's password.
 * Requires the correct current password before allowing the update.
 */
export async function changePassword({ userId, currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    return { ok: false, error: "Both current and new passwords are required." };
  }
  if (newPassword.length < 6) {
    return { ok: false, error: "New password must be at least 6 characters." };
  }

  if (isElectron) {
    return window.api.changePassword({ userId, currentPassword, newPassword });
  }

  // Web fallback
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx === -1) return { ok: false, error: "Account not found." };
  if (accounts[idx].password !== currentPassword) return { ok: false, error: "Current password is incorrect." };
  accounts[idx].password = newPassword;
  saveAccounts(accounts);
  return { ok: true };
}

/**
 * Update the current user's profile (name, email, company).
 */
export async function updateProfile({ userId, ownerName, email, company }) {
  if (isElectron) {
    const res = await window.api.updateProfile({ userId, ownerName, email, company });
    return res;
  }

  // Web fallback
  const accounts = getAccounts();
  const idx = accounts.findIndex((a) => a.id === userId);
  if (idx === -1) return { ok: false, error: "Account not found." };
  accounts[idx] = { ...accounts[idx], ownerName, email, companyName: company };
  saveAccounts(accounts);
  return { ok: true, user: accounts[idx] };
}

export { isElectron };
