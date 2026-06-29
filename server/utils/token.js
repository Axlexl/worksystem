const jwt  = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const SECRET  = process.env.JWT_SECRET  || "ws_dev_secret_change_in_production";
const EXPIRES = process.env.JWT_EXPIRES_IN || "8h";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

function verifyToken(token) {
  try { return jwt.verify(token, SECRET); }
  catch { return null; }
}

/** 6-digit numeric OTP */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Crypto-safe random ID */
function generateId() { return uuidv4(); }

/** OTP expiry — 15 minutes from now (ISO string) */
function otpExpiry() {
  return new Date(Date.now() + 15 * 60 * 1000).toISOString();
}

/** Check if ISO date string is still in the future */
function isExpired(isoDate) {
  return new Date(isoDate) < new Date();
}

module.exports = { signToken, verifyToken, generateOTP, generateId, otpExpiry, isExpired };
