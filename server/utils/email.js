const nodemailer = require("nodemailer");

// ── Transport ─────────────────────────────────────────────────────────────────
function createTransport() {
  // If SMTP credentials are set, use real email.
  // Otherwise use Ethereal (fake SMTP — logs link to console for dev).
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST || "smtp.gmail.com",
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Dev fallback — create an Ethereal test account once
  return null; // handled below
}

let _transport = null;

async function getTransport() {
  if (_transport) return _transport;
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    _transport = createTransport();
    return _transport;
  }
  // Ethereal auto test account
  const testAccount = await nodemailer.createTestAccount();
  _transport = nodemailer.createTransport({
    host:   "smtp.ethereal.email",
    port:   587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log("📧 Dev email account:", testAccount.user);
  return _transport;
}

const FROM = process.env.EMAIL_FROM || "WorkSystem <noreply@worksystem.app>";
const APP_URL = process.env.APP_URL || "http://localhost:5173";

// ── Templates ─────────────────────────────────────────────────────────────────
function emailVerifyTemplate(name, otp) {
  return {
    subject: "Verify your WorkSystem email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:28px;">🏗</div>
          <h2 style="color:#0f172a;margin:8px 0 4px;font-size:1.25rem;">WorkSystem</h2>
          <p style="color:#64748b;margin:0;font-size:0.875rem;">Construction Management</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:28px 24px;border:1px solid #e2e8f0;">
          <h3 style="color:#0f172a;margin:0 0 12px;font-size:1rem;">Hi ${name},</h3>
          <p style="color:#475569;font-size:0.875rem;line-height:1.6;margin:0 0 20px;">
            Thank you for registering. Use this verification code to activate your account:
          </p>
          <div style="text-align:center;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:0 0 20px;">
            <span style="font-size:2.25rem;font-weight:800;letter-spacing:0.15em;color:#2563eb;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:0.75rem;margin:0;text-align:center;">
            This code expires in <strong>15 minutes</strong>. Do not share it with anyone.
          </p>
        </div>
        <p style="color:#cbd5e1;font-size:0.6875rem;text-align:center;margin-top:16px;">
          If you didn't create a WorkSystem account, ignore this email.
        </p>
      </div>`,
  };
}

function passwordResetTemplate(name, otp) {
  return {
    subject: "Reset your WorkSystem password",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="font-size:28px;">🔐</div>
          <h2 style="color:#0f172a;margin:8px 0 4px;font-size:1.25rem;">Password Reset</h2>
          <p style="color:#64748b;margin:0;font-size:0.875rem;">WorkSystem Construction Management</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:28px 24px;border:1px solid #e2e8f0;">
          <h3 style="color:#0f172a;margin:0 0 12px;font-size:1rem;">Hi ${name},</h3>
          <p style="color:#475569;font-size:0.875rem;line-height:1.6;margin:0 0 20px;">
            We received a request to reset your password. Use this code:
          </p>
          <div style="text-align:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:20px;margin:0 0 20px;">
            <span style="font-size:2.25rem;font-weight:800;letter-spacing:0.15em;color:#ea580c;">${otp}</span>
          </div>
          <p style="color:#94a3b8;font-size:0.75rem;margin:0;text-align:center;">
            Expires in <strong>15 minutes</strong>. Your password has <strong>not</strong> been changed yet.
          </p>
        </div>
        <p style="color:#cbd5e1;font-size:0.6875rem;text-align:center;margin-top:16px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>`,
  };
}

// ── Send helpers ──────────────────────────────────────────────────────────────
async function sendVerificationEmail(toEmail, name, otp) {
  const transport = await getTransport();
  const tmpl      = emailVerifyTemplate(name, otp);
  const info = await transport.sendMail({ from: FROM, to: toEmail, ...tmpl });
  // Log Ethereal preview URL in dev
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log("📧 Email preview:", preview);
  return info;
}

async function sendPasswordResetEmail(toEmail, name, otp) {
  const transport = await getTransport();
  const tmpl      = passwordResetTemplate(name, otp);
  const info = await transport.sendMail({ from: FROM, to: toEmail, ...tmpl });
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log("📧 Password reset preview:", preview);
  return info;
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
