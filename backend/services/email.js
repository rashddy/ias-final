import nodemailer from 'nodemailer'

let transporter

function getTransporter() {
  if (transporter) return transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env')
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  return transporter
}

export async function sendOtpEmail({ to, displayName, otp }) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  const name = displayName || to.split('@')[0]

  await getTransporter().sendMail({
    from,
    to,
    subject: 'Your ISOGuard verification code',
    text: [
      `Hello ${name},`,
      '',
      `Your one-time verification code is: ${otp}`,
      '',
      'This code expires in 10 minutes.',
      'If you did not attempt to sign in, ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #111;">ISOGuard verification</h2>
        <p>Hello ${name},</p>
        <p>Use this one-time code to complete your sign-in:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #ff6b00;">${otp}</p>
        <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you did not attempt to sign in, you can ignore this email.</p>
      </div>
    `,
  })
}
