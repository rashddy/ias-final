import crypto from 'crypto'

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5
const MAX_RESENDS = 3

/** @type {Map<string, object>} */
const sessions = new Map()

function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export function generateOtp() {
  return crypto.randomInt(100000, 999999).toString()
}

export function createMfaSession({ idToken, refreshToken, expiresIn, user }) {
  const mfaSessionId = crypto.randomUUID()
  const otp = generateOtp()

  sessions.set(mfaSessionId, {
    otpHash: hashOtp(otp),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    resendCount: 0,
    idToken,
    refreshToken,
    expiresIn,
    user,
  })

  return { mfaSessionId, otp }
}

export function verifyMfaOtp(mfaSessionId, otp) {
  const session = sessions.get(mfaSessionId)

  if (!session) {
    return { error: 'Verification session expired. Please sign in again.' }
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(mfaSessionId)
    return { error: 'Verification code expired. Please sign in again.' }
  }

  if (session.attempts >= MAX_ATTEMPTS) {
    sessions.delete(mfaSessionId)
    return { error: 'Too many failed attempts. Please sign in again.' }
  }

  if (hashOtp(otp) !== session.otpHash) {
    session.attempts += 1
    const remaining = MAX_ATTEMPTS - session.attempts
    if (remaining <= 0) {
      sessions.delete(mfaSessionId)
      return { error: 'Too many failed attempts. Please sign in again.' }
    }
    return { error: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` }
  }

  sessions.delete(mfaSessionId)
  return {
    idToken: session.idToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn,
    user: session.user,
  }
}

export function regenerateOtp(mfaSessionId) {
  const session = sessions.get(mfaSessionId)

  if (!session) {
    return { error: 'Verification session expired. Please sign in again.' }
  }

  if (Date.now() > session.expiresAt) {
    sessions.delete(mfaSessionId)
    return { error: 'Verification session expired. Please sign in again.' }
  }

  if (session.resendCount >= MAX_RESENDS) {
    return { error: 'Maximum resend limit reached. Please sign in again.' }
  }

  const otp = generateOtp()
  session.otpHash = hashOtp(otp)
  session.attempts = 0
  session.resendCount += 1
  session.expiresAt = Date.now() + OTP_TTL_MS

  return { otp, user: session.user }
}

export function getMfaSession(mfaSessionId) {
  return sessions.get(mfaSessionId) ?? null
}

export function deleteMfaSession(mfaSessionId) {
  sessions.delete(mfaSessionId)
}

function cleanupExpired() {
  const now = Date.now()
  for (const [id, session] of sessions) {
    if (now > session.expiresAt) sessions.delete(id)
  }
}

setInterval(cleanupExpired, 5 * 60 * 1000).unref()

export function maskEmail(email) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}${'*'.repeat(Math.max(local.length - 2, 1))}@${domain}`
}
