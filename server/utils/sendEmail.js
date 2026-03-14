import nodemailer from "nodemailer";

const createTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true" || smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const smtpFrom = process.env.SMTP_FROM;
  const transporter = createTransporter();

  if (!transporter || !smtpFrom) {
    return { sent: false, skipped: true };
  }

  await transporter.sendMail({
    from: smtpFrom,
    to,
    subject,
    html,
    text,
  });

  return { sent: true, skipped: false };
};
