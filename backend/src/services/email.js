import nodemailer from 'nodemailer'

let transporter

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD

  if (!host || !user || !password) {
    throw new Error('SMTP email service is not configured.')
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: { user, pass: password },
  })

  return transporter
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  if (!from) throw new Error('SMTP_FROM or SMTP_USER must be configured.')

  return getTransporter().sendMail({
    from,
    to,
    subject: 'Reset your Soft-Gate password',
    text: `Hello ${name || 'there'},

We received a request to reset your Soft-Gate password.

Reset your password here:
${resetUrl}

This link expires in 30 minutes and can only be used once.

If you did not request this, you can safely ignore this email.

Soft-Gate
`,
  })
}
