import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const DEMO_USER = {
  email: 'admin@company.com',
  password: 'SecurePass123!',
  displayName: 'Admin User',
}
const DEMO_OTP = '483921'
const SESSION_TIMEOUT_MS = 5 * 60 * 1000
const USERS_STORAGE_KEY = 'iso_registered_users'

function loadRegisteredUsers() {
  try {
    const saved = localStorage.getItem(USERS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveRegisteredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
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

function findAccount(email, password) {
  const normalized = email.trim().toLowerCase()
  if (normalized === DEMO_USER.email && password === DEMO_USER.password) {
    return { email: DEMO_USER.email, displayName: DEMO_USER.displayName }
  }
  const users = loadRegisteredUsers()
  const account = users[normalized]
  if (account && account.password === password) {
    return { email: account.email, displayName: account.displayName }
  }
  return null
}

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

  const signup = useCallback((email, password, confirmPassword, displayName) => {
    const normalized = email.trim().toLowerCase()

    if (!validateEmail(normalized)) {
      return { success: false, error: 'Please enter a valid email address.' }
    }

    const passwordError = validatePassword(password)
    if (passwordError) return { success: false, error: passwordError }

    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' }
    }

    if (normalized === DEMO_USER.email) {
      return { success: false, error: 'This email is reserved for the demo account.' }
    }

    const users = loadRegisteredUsers()
    if (users[normalized]) {
      return { success: false, error: 'An account with this email already exists. Please sign in.' }
    }

    const name = displayName.trim() || normalized.split('@')[0]
    users[normalized] = {
      email: normalized,
      password,
      displayName: name,
      createdAt: new Date().toISOString(),
    }
    saveRegisteredUsers(users)

    return { success: true, message: 'Account created! You can now sign in with MFA.' }
  }, [])

  const login = useCallback((email, password) => {
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      return { success: false, error: `Account locked. Try again in ${remaining}s.` }
    }

    const account = findAccount(email, password)
    if (account) {
      setPendingUser({
        email: account.email,
        displayName: account.displayName,
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
      signup,
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
