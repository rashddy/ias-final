import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_USER = {
  email: 'admin@company.com',
  password: 'SecurePass123!',
  displayName: 'Admin User',
}
const DEMO_OTP = '483921'
const SESSION_TIMEOUT_MS = 5 * 60 * 1000

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('iso_session')
    return saved ? JSON.parse(saved) : null
  })
  const [mfaPending, setMfaPending] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [sessionExpired, setSessionExpired] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const [, setTick] = useState(0)

  const isAuthenticated = !!user && !sessionExpired

  const login = useCallback((email, password) => {
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      return { success: false, error: `Account locked. Try again in ${remaining}s.` }
    }

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      setPendingUser({
        email,
        displayName: DEMO_USER.displayName,
        loginTime: new Date().toISOString(),
      })
      setMfaPending(true)
      setLoginAttempts(0)
      return { success: true, mfaRequired: true }
    }

    const attempts = loginAttempts + 1
    setLoginAttempts(attempts)
    if (attempts >= 5) {
      setLockedUntil(Date.now() + 30000)
      setLoginAttempts(0)
      return { success: false, error: 'Too many failed attempts. Account locked for 30 seconds.' }
    }

    return { success: false, error: `Invalid credentials. ${5 - attempts} attempts remaining.` }
  }, [loginAttempts, lockedUntil])

  const verifyMfa = useCallback((otp) => {
    if (otp === DEMO_OTP) {
      const session = {
        ...pendingUser,
        mfaVerified: true,
        sessionStart: new Date().toISOString(),
        sessionId: crypto.randomUUID(),
      }
      setUser(session)
      setMfaPending(false)
      setPendingUser(null)
      setSessionExpired(false)
      setLastActivity(Date.now())
      sessionStorage.setItem('iso_session', JSON.stringify(session))
      return { success: true }
    }
    return { success: false, error: 'Invalid OTP code. Please try again.' }
  }, [pendingUser])

  const logout = useCallback(() => {
    setUser(null)
    setMfaPending(false)
    setPendingUser(null)
    setSessionExpired(false)
    sessionStorage.removeItem('iso_session')
  }, [])

  const touchActivity = useCallback(() => {
    setLastActivity(Date.now())
    setSessionExpired(false)
  }, [])

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
      mfaPending,
      login,
      verifyMfa,
      logout,
      sessionExpired,
      sessionRemaining,
      lastActivity,
      touchActivity,
      SESSION_TIMEOUT_MS,
      DEMO_OTP,
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
