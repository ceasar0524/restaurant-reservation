require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025', 10),
  secure: false,
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
});

async function sendMail({ to, subject, text, html }) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '如如的創意料理 <noreply@restaurant.com>',
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
