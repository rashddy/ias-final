import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import { getAuth } from '../config/firebaseAdmin.js'
import { requireAuth } from '../middleware/auth.js'
import { authRateLimiter } from '../middleware/security.js'
import { validatePassword } from '../utils/passwordValidation.js'
import { sendOtpEmail } from '../services/email.js'
import {
  createMfaSession,
  verifyMfaOtp,
  regenerateOtp,
  deleteMfaSession,
  maskEmail,
} from '../utils/otpStore.js'

const router = Router()

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY
const FIREBASE_AUTH_URL = 'https://identitytoolkit.googleapis.com/v1'

function validationErrors(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg })
    return true
  }
  return false
}

async function firebaseSignIn(email, password) {
  const response = await fetch(
    `${FIREBASE_AUTH_URL}/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    const code = data?.error?.message
    if (code === 'INVALID_LOGIN_CREDENTIALS' || code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD') {
      return { error: 'Invalid email or password.' }
    }
    if (code === 'USER_DISABLED') {
      return { error: 'This account has been disabled.' }
    }
    if (code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
      return { error: 'Too many failed attempts. Please try again later.' }
    }
    return { error: 'Unable to sign in. Please try again.' }
  }

  return { data }
}

router.post(
  '/signup',
  authRateLimiter,
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').isString().withMessage('Password is required.'),
    body('displayName').optional({ values: 'null' }).trim().isLength({ max: 100 }).withMessage('Display name is too long.'),
  ],
  async (req, res) => {
    if (validationErrors(req, res)) return

    const { email, password, displayName } = req.body
    const passwordError = validatePassword(password)
    if (passwordError) {
      return res.status(400).json({ error: passwordError })
    }

    try {
      const name = displayName?.trim() || email.split('@')[0]
      const userRecord = await getAuth().createUser({
        email,
        password,
        displayName: name,
        emailVerified: false,
      })

      return res.status(201).json({
        message: 'Account created successfully. You can now sign in.',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
      })
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'An account with this email already exists.' })
      }
      if (err.code === 'auth/invalid-email') {
        return res.status(400).json({ error: 'Please enter a valid email address.' })
      }
      if (err.code === 'auth/weak-password') {
        return res.status(400).json({ error: 'Password does not meet security requirements.' })
      }
      console.error('Signup error:', err.code || err.message)
      return res.status(500).json({ error: 'Unable to create account. Please try again.' })
    }
  }
)

router.post(
  '/login',
  authRateLimiter,
  [
    body('email').trim().isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required.'),
  ],
  async (req, res) => {
    if (validationErrors(req, res)) return

    if (!FIREBASE_API_KEY) {
      console.error('FIREBASE_API_KEY is not configured')
      return res.status(500).json({ error: 'Authentication service is not configured.' })
    }

    const { email, password } = req.body
    const result = await firebaseSignIn(email, password)

    if (result.error) {
      return res.status(401).json({ error: result.error })
    }

    const { idToken, refreshToken, expiresIn, localId } = result.data

    let displayName = email.split('@')[0]
    try {
      const userRecord = await getAuth().getUser(localId)
      displayName = userRecord.displayName || displayName
    } catch {
      // Non-fatal: login still succeeds with fallback display name
    }

    const user = { uid: localId, email, displayName }
    const { mfaSessionId, otp } = createMfaSession({
      idToken,
      refreshToken,
      expiresIn: Number(expiresIn),
      user,
    })

    try {
      await sendOtpEmail({ to: email, displayName, otp })
    } catch (err) {
      deleteMfaSession(mfaSessionId)
      console.error('OTP email error:', err.message)
      return res.status(500).json({ error: 'Unable to send verification code. Check SMTP settings.' })
    }

    return res.json({
      mfaRequired: true,
      mfaSessionId,
      email: maskEmail(email),
      message: 'Verification code sent to your email.',
    })
  }
)

router.post(
  '/verify-otp',
  authRateLimiter,
  [
    body('mfaSessionId').isUUID().withMessage('Invalid verification session.'),
    body('otp').isString().matches(/^\d{6}$/).withMessage('Enter a valid 6-digit code.'),
  ],
  async (req, res) => {
    if (validationErrors(req, res)) return

    const result = verifyMfaOtp(req.body.mfaSessionId, req.body.otp)
    if (result.error) {
      return res.status(401).json({ error: result.error })
    }

    return res.json({
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: result.user,
    })
  }
)

router.post(
  '/resend-otp',
  authRateLimiter,
  [body('mfaSessionId').isUUID().withMessage('Invalid verification session.')],
  async (req, res) => {
    if (validationErrors(req, res)) return

    const result = regenerateOtp(req.body.mfaSessionId)
    if (result.error) {
      return res.status(400).json({ error: result.error })
    }

    try {
      await sendOtpEmail({
        to: result.user.email,
        displayName: result.user.displayName,
        otp: result.otp,
      })
    } catch (err) {
      console.error('OTP resend error:', err.message)
      return res.status(500).json({ error: 'Unable to resend verification code.' })
    }

    return res.json({
      message: 'A new verification code has been sent.',
      email: maskEmail(result.user.email),
    })
  }
)

router.post(
  '/refresh',
  authRateLimiter,
  [body('refreshToken').isString().notEmpty().withMessage('Refresh token is required.')],
  async (req, res) => {
    if (validationErrors(req, res)) return

    if (!FIREBASE_API_KEY) {
      return res.status(500).json({ error: 'Authentication service is not configured.' })
    }

    const response = await fetch(
      `${FIREBASE_AUTH_URL}/token?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: req.body.refreshToken,
        }),
      }
    )

    const data = await response.json()
    if (!response.ok) {
      return res.status(401).json({ error: 'Session expired. Please sign in again.' })
    }

    return res.json({
      idToken: data.id_token,
      refreshToken: data.refresh_token,
      expiresIn: Number(data.expires_in),
    })
  }
)

router.get('/me', requireAuth, async (req, res) => {
  try {
    const userRecord = await getAuth().getUser(req.user.uid)
    return res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || userRecord.email?.split('@')[0],
      emailVerified: userRecord.emailVerified,
    })
  } catch {
    return res.status(404).json({ error: 'User not found.' })
  }
})

router.post('/logout', requireAuth, async (req, res) => {
  try {
    await getAuth().revokeRefreshTokens(req.user.uid)
    return res.json({ message: 'Signed out successfully.' })
  } catch {
    return res.json({ message: 'Signed out.' })
  }
})

export default router
