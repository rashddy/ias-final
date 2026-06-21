import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { authApi, ApiError } from '../lib/api'

const AuthContext = createContext(null)

const SESSION_STORAGE_KEY = 'iso_session'
const SESSION_TIMEOUT_MS = 5 * 60 * 1000

function loadSession() {
  try {
    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePassword(password) {
  if (password.length < 12) return 'Password must be at least 12 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include a number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character.'
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadSession()?.user ?? null)
  const [tokens, setTokens] = useState(() => {
    const session = loadSession()
    return session
      ? { idToken: session.idToken, refreshToken: session.refreshToken, expiresAt: session.expiresAt }
      : null
  })
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionExpired, setSessionExpired] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [mfaPending, setMfaPending] = useState(false)
  const [mfaSessionId, setMfaSessionId] = useState(null)
  const [mfaEmail, setMfaEmail] = useState('')
  const [, setTick] = useState(0)
  const refreshTimerRef = useRef(null)

  const isAuthenticated = !!user && !!tokens?.idToken && !sessionExpired

  const persistSession = useCallback((sessionUser, sessionTokens) => {
    const session = {
      user: sessionUser,
      idToken: sessionTokens.idToken,
      refreshToken: sessionTokens.refreshToken,
      expiresAt: sessionTokens.expiresAt,
      sessionStart: new Date().toISOString(),
      sessionId: crypto.randomUUID(),
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    setUser(sessionUser)
    setTokens({
      idToken: sessionTokens.idToken,
      refreshToken: sessionTokens.refreshToken,
      expiresAt: sessionTokens.expiresAt,
    })
    setSessionExpired(false)
    setLastActivity(Date.now())
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    setTokens(null)
    setSessionExpired(false)
    setMfaPending(false)
    setMfaSessionId(null)
    setMfaEmail('')
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }
  }, [])

  const refreshTokens = useCallback(async () => {
    if (!tokens?.refreshToken) return false

    try {
      const data = await authApi.refresh(tokens.refreshToken)
      const expiresAt = Date.now() + data.expiresIn * 1000
      persistSession(user, {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt,
      })
      return true
    } catch {
      clearSession()
      return false
    }
  }, [tokens?.refreshToken, user, persistSession, clearSession])

  const signup = useCallback(async (email, password, confirmPassword, displayName) => {
    const normalized = email.trim().toLowerCase()

    if (!validateEmail(normalized)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    const passwordError = validatePassword(password)
    if (passwordError) return { success: false, error: passwordError }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' }
    }

    try {
      const data = await authApi.signup({
        email: normalized,
        password,
        displayName: displayName.trim() || undefined,
      })
      return { success: true, message: data.message }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to create account. Please try again.'
      return { success: false, error: message }
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const normalized = email.trim().toLowerCase()

    if (!validateEmail(normalized)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    try {
      const data = await authApi.login({ email: normalized, password })

      if (data.mfaRequired) {
        setMfaPending(true)
        setMfaSessionId(data.mfaSessionId)
        setMfaEmail(data.email)
        return { success: true, mfaRequired: true, message: data.message }
      }

      const expiresAt = Date.now() + data.expiresIn * 1000
      persistSession(data.user, {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt,
      })
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.'
      return { success: false, error: message }
    }
  }, [persistSession])

  const verifyMfa = useCallback(async (otp) => {
    if (!mfaSessionId) {
      return { success: false, error: 'Verification session expired. Please sign in again.' }
    }

    try {
      const data = await authApi.verifyOtp({ mfaSessionId, otp })
      const expiresAt = Date.now() + data.expiresIn * 1000
      persistSession(data.user, {
        idToken: data.idToken,
        refreshToken: data.refreshToken,
        expiresAt,
      })
      setMfaPending(false)
      setMfaSessionId(null)
      setMfaEmail('')
      return { success: true }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Invalid verification code.'
      return { success: false, error: message }
    }
  }, [mfaSessionId, persistSession])

  const resendOtp = useCallback(async () => {
    if (!mfaSessionId) {
      return { success: false, error: 'Verification session expired. Please sign in again.' }
    }

    try {
      const data = await authApi.resendOtp({ mfaSessionId })
      setMfaEmail(data.email)
      return { success: true, message: data.message }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to resend code.'
      return { success: false, error: message }
    }
  }, [mfaSessionId])

  const cancelMfa = useCallback(() => {
    setMfaPending(false)
    setMfaSessionId(null)
    setMfaEmail('')
  }, [])

  const logout = useCallback(async () => {
    if (tokens?.idToken) {
      try {
        await authApi.logout(tokens.idToken)
      } catch {
        // Clear local session even if server revoke fails
      }
    }
    clearSession()
  }, [tokens?.idToken, clearSession])

  const touchActivity = useCallback(() => {
    setLastActivity(Date.now())
    setSessionExpired(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const session = loadSession()
      if (!session?.idToken) {
        setAuthLoading(false)
        return
      }

      try {
        const profile = await authApi.me(session.idToken)
        if (cancelled) return
        setUser(profile)
        setTokens({
          idToken: session.idToken,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt,
        })
      } catch {
        if (cancelled) return
        if (session.refreshToken) {
          const refreshed = await refreshTokens()
          if (!refreshed) clearSession()
        } else {
          clearSession()
        }
      } finally {
        if (!cancelled) setAuthLoading(false)
      }
    }

    bootstrap()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tokens?.expiresAt || !tokens?.refreshToken) return

    const msUntilRefresh = tokens.expiresAt - Date.now() - 60_000
    if (msUntilRefresh <= 0) {
      refreshTokens()
      return
    }

    refreshTimerRef.current = setTimeout(() => {
      refreshTokens()
    }, msUntilRefresh)

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [tokens?.expiresAt, tokens?.refreshToken, refreshTokens])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      setTick((t) => t + 1)
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        setSessionExpired(true)
      }
    }, 1000)

    const handleActivity = () => touchActivity()
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
    }
  }, [user, lastActivity, touchActivity])

  const sessionRemaining = user
    ? Math.max(0, SESSION_TIMEOUT_MS - (Date.now() - lastActivity))
    : 0

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      authLoading,
      mfaPending,
      mfaEmail,
      signup,
      login,
      verifyMfa,
      resendOtp,
      cancelMfa,
      logout,
      sessionExpired,
      sessionRemaining,
      lastActivity,
      touchActivity,
      SESSION_TIMEOUT_MS,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
