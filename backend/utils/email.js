const nodemailer = require('nodemailer');

function getOpt(name, fallback = '') {
  const v = process.env[name];
  return v != null && String(v).trim() !== '' ? v : fallback;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function isSmtpConfigured() {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function getTransporter() {
  const host = getOpt('SMTP_HOST', 'smtp.gmail.com');
  const port = Number(getOpt('SMTP_PORT', '587'));
  const secure = String(getOpt('SMTP_SECURE', 'false')) === 'true';
  const user = requireEnv('SMTP_USER');
  const pass = requireEnv('SMTP_PASS');

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

/**
 * Builds the URL the approver must open. Defaults to local API if APPROVAL_BASE_URL is unset.
 */
function buildApprovalLink(token) {
  const frontend = getOpt('FRONTEND_URL', 'http://localhost:5173');
  if (frontend) {
    return `${frontend.replace(/\/+$/, '')}/approve?token=${encodeURIComponent(token)}`;
  }
  const base = getOpt('APPROVAL_BASE_URL', 'http://localhost:5000').replace(/\/+$/, '');
  return `${base}/api/approvals/approve/${encodeURIComponent(token)}`;
}

/**
 * Sends approval email when SMTP is configured. Otherwise logs the link (dev / no-email mode).
 * @returns {{ link: string, emailSent: boolean }}
 */
async function sendApprovalEmail({ to, subject, token, intro }) {
  const link = buildApprovalLink(token);

  if (!isSmtpConfigured()) {
    console.warn(
      '[email] SMTP_USER / SMTP_PASS not set — approval email not sent. Copy this link for the approver:',
      link
    );
    return { link, emailSent: false };
  }

  const transporter = getTransporter();
  const from = getOpt('SMTP_FROM', process.env.SMTP_USER);

  const text = [
    intro || 'Approval requested.',
    '',
    `Approve here: ${link}`,
    '',
    'If you did not request this, ignore this email.',
  ].join('\n');

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
  });

  return { link, emailSent: true };
}

async function sendAppointmentEmail({ to, subject, details }) {
  if (!isSmtpConfigured()) return { emailSent: false };
  const transporter = getTransporter();
  const from = getOpt('SMTP_FROM', process.env.SMTP_USER);

  await transporter.sendMail({
    from,
    to,
    subject,
    text: details,
  });
  return { emailSent: true };
}

module.exports = {
  sendApprovalEmail,
  buildApprovalLink,
  isSmtpConfigured,
  sendAppointmentEmail
};
