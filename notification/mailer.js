require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMail({ to, subject, text, html }) {
  const { data, error } = await resend.emails.send({
    from: process.env.SMTP_FROM || '如如的創意料理 <onboarding@resend.dev>',
    to,
    subject,
    text,
    html,
  });
  if (error) throw new Error(JSON.stringify(error));
  console.log('[mailer] sent:', data?.id, 'to:', to);
}

module.exports = { sendMail };
