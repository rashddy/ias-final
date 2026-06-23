import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import SecurityLearningPanel from '../components/SecurityLearningPanel'
import './LoginSimulator.css'

const DEMO_USERNAME = 'admin@company.com'
const DEMO_PASSWORD = 'SecurePass123!'
const SESSION_TIMEOUT_SEC = 60
const LOCKOUT_DURATION_SEC = 30
const MAX_FAILED_ATTEMPTS = 3
const VERIFY_DELAY_MS = 1800

const PROGRESS_STEPS = [
  { key: 'login', label: 'Login', icon: 'fa-right-to-bracket' },
  { key: 'mfa', label: 'MFA', icon: 'fa-shield-halved' },
  { key: 'authenticated', label: 'Authenticated', icon: 'fa-circle-check' },
  { key: 'session', label: 'Session Management', icon: 'fa-hourglass-half' },
]

const LEARNING_SUMMARY = [
  { icon: 'fa-user-lock', title: 'Password Authentication', text: 'The first layer verifies identity using a username and password before granting access.' },
  { icon: 'fa-hashtag', title: 'Password Hashing', text: 'Passwords are stored using one-way hashing so database breaches do not reveal actual passwords.' },
  { icon: 'fa-shield-halved', title: 'Multi-Factor Authentication', text: 'MFA requires a second verification factor beyond the password.' },
  { icon: 'fa-mobile-screen', title: 'OTP Verification', text: 'One-time passwords are generated for a single use and expire quickly.' },
  { icon: 'fa-clock', title: 'Session Management', text: 'After authentication, the server issues a session token that expires after inactivity.' },
  { icon: 'fa-ban', title: 'Account Lockout Protection', text: 'Failed login attempts are tracked and accounts are temporarily locked against brute-force attacks.' },
]

const PANEL_CONTENT = {
  idle: {
    title: 'How Authentication Works',
    icon: 'fa-graduation-cap',
    variant: 'default',
    points: [
      'A demo account is pre-filled — click Login to walk through each security step.',
      'Explanations appear here in real time as the system processes your request.',
      'Change the password to experience failed-login monitoring and account lockout.',
    ],
  },
  verifying: {
    title: 'Step 1: Credential Verification',
    icon: 'fa-key',
    variant: 'info',
    points: [
      'Your password is being verified.',
      'The system checks if the username exists and whether the password matches the stored credentials.',
      'Modern systems store passwords securely using hashing techniques.',
    ],
  },
  failed: {
    title: 'Security Protection: Failed Login Attempt',
    icon: 'fa-triangle-exclamation',
    variant: 'warning',
    points: [
      'Incorrect credentials were detected.',
      'Repeated failures may indicate a brute-force attack.',
      'Security systems monitor failed login attempts.',
    ],
  },
  mfa: {
    title: 'Multi-Factor Authentication (MFA)',
    icon: 'fa-shield-halved',
    variant: 'info',
    points: [
      'Multi-Factor Authentication adds a second layer of protection.',
      'Even if an attacker steals your password, they still need the OTP.',
      'OTPs expire quickly and can only be used once.',
    ],
  },
  success: {
    title: 'Authentication Successful',
    icon: 'fa-circle-check',
    variant: 'success',
    points: [
      'Authentication successful.',
      'A secure session has been created.',
      'The server issues a session token that identifies the authenticated user.',
    ],
  },
  dashboard: {
    title: 'Session Management',
    icon: 'fa-clock',
    variant: 'info',
    points: [
      'Session timeout protects accounts from unauthorized access.',
      'If a user leaves a device unattended, the session automatically ends.',
    ],
  },
  'session-expired': {
    title: 'Session Ended',
    icon: 'fa-hourglass-end',
    variant: 'warning',
    points: [
      'Session timeout protects accounts from unauthorized access.',
      'If a user leaves a device unattended, the session automatically ends.',
    ],
  },
  locked: {
    title: 'Security Protection: Account Lockout',
    icon: 'fa-ban',
    variant: 'danger',
    points: [
      'Too many failed login attempts detected.',
      'Temporary account lockout activated.',
      'This protection helps prevent password guessing attacks.',
    ],
  },
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function getActiveStep(phase) {
  if (phase === 'login' || phase === 'verifying' || phase === 'locked') return 'login'
  if (phase === 'mfa') return 'mfa'
  if (phase === 'success') return 'authenticated'
  if (phase === 'dashboard' || phase === 'session-expired') return 'session'
  return 'login'
}

function getPanelKey(phase, failedAttempts) {
  if (phase === 'login' && failedAttempts > 0) return 'failed'
  if (phase === 'login') return 'idle'
  return phase
}

function AuditLog({ log }) {
  const logEndRef = useRef(null)
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  return (
    <div className="login-sim-audit-log">
      <div className="login-sim-audit-log__header">
        <i className="fa-solid fa-list-ul"></i>
        <h3>Audit Log</h3>
      </div>
      <div className="login-sim-audit-log__entries">
        {log.map((entry) => (
          <div key={entry.id} className={`log-entry log-entry--${entry.type}`}>
            <span className="log-entry__time">{entry.time}</span>
            <span className="log-entry__message">{entry.message}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

export default function LoginSimulator() {
  const [phase, setPhase] = useState('login')
  const [username, setUsername] = useState(DEMO_USERNAME)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockRemaining, setLockRemaining] = useState(0)
  const [sessionRemaining, setSessionRemaining] = useState(SESSION_TIMEOUT_SEC)
  const [error, setError] = useState('')
  const [simulationComplete, setSimulationComplete] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [auditLog, setAuditLog] = useState([])
  const verifyTimerRef = useRef(null)

  const logEvent = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setAuditLog((prevLog) => [...prevLog, { id: prevLog.length, time, message, type }])
  }

  const activeStep = getActiveStep(phase)
  const stepIndex = PROGRESS_STEPS.findIndex((s) => s.key === activeStep)
  const panelKey = getPanelKey(phase, failedAttempts)
  const panel = PANEL_CONTENT[panelKey] || PANEL_CONTENT.idle

  useEffect(() => {
    logEvent('Login simulation initialized.', 'system')
  }, [])

  useEffect(() => () => { if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current) }, [])

  useEffect(() => {
    if (phase !== 'locked' || lockRemaining <= 0) return
    const interval = setInterval(() => {
      setLockRemaining((prev) => {
        if (prev <= 1) {
          logEvent('Account unlocked after temporary lockout.', 'info')
          setPhase('login')
          setError('')
          setFailedAttempts(0)
          setUsername(DEMO_USERNAME)
          setPassword(DEMO_PASSWORD)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, lockRemaining])

  useEffect(() => {
    if (phase !== 'dashboard' || sessionRemaining <= 0) return
    const interval = setInterval(() => {
      setSessionRemaining((prev) => {
        if (prev <= 1) {
          logEvent('User session expired due to inactivity.', 'warning')
          setPhase('session-expired')
          setSimulationComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, sessionRemaining])

  const handleLogin = (e) => {
    e.preventDefault()
    if (phase === 'locked') return
    setError('')
    setPhase('verifying')
    logEvent(`Login attempt for user: ${username}`, 'info')

    verifyTimerRef.current = setTimeout(() => {
      const userMatch = username.trim().toLowerCase() === DEMO_USERNAME.toLowerCase()
      const passMatch = password === DEMO_PASSWORD

      if (userMatch && passMatch) {
        logEvent('Credential verification successful.', 'success')
        setPhase('mfa')
        const newOtp = generateOtp()
        setGeneratedOtp(newOtp)
        setShowOtp(true)
        logEvent(`MFA required. OTP generated: ${newOtp}`, 'info')
      } else {
        const newFailedAttempts = failedAttempts + 1
        setFailedAttempts(newFailedAttempts)
        setError('Invalid username or password.')
        setPhase('login')
        logEvent(`Credential verification failed. Attempt ${newFailedAttempts} of ${MAX_FAILED_ATTEMPTS}.`, 'error')

        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          setPhase('locked')
          setLockRemaining(LOCKOUT_DURATION_SEC)
          setError(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION_SEC} seconds.`)
          logEvent(`Account locked for ${LOCKOUT_DURATION_SEC} seconds due to excessive failed logins.`, 'warning')
        }
      }
    }, VERIFY_DELAY_MS)
  }

  const handleOtpSubmit = (e) => {
    e.preventDefault()
    if (otp === generatedOtp) {
      logEvent('OTP verification successful.', 'success')
      setPhase('success')
      setShowOtp(false)
      verifyTimerRef.current = setTimeout(() => {
        setPhase('dashboard')
        logEvent('User authenticated successfully. Session created.', 'success')
      }, VERIFY_DELAY_MS)
    } else {
      setError('Invalid OTP. Please try again.')
      logEvent('OTP verification failed.', 'error')
    }
  }

  const handleReset = () => {
    setPhase('login')
    setUsername(DEMO_USERNAME)
    setPassword(DEMO_PASSWORD)
    setOtp('')
    setGeneratedOtp('')
    setShowOtp(false)
    setFailedAttempts(0)
    setLockRemaining(0)
    setSessionRemaining(SESSION_TIMEOUT_SEC)
    setError('')
    setSimulationComplete(false)
    setShowPassword(true)
    if (verifyTimerRef.current) clearTimeout(verifyTimerRef.current)
    logEvent('Simulation reset to initial state.', 'system')
  }

  const handleTryIncorrect = () => {
    setPassword('WrongPassword123')
    setError('')
    logEvent('Password changed to an incorrect value for demonstration.', 'info')
  }

  const renderContent = () => {
    switch (phase) {
      case 'login':
        return (
          <div className="login-sim-panel">
            <div className="login-sim-panel__header">
              <i className="fa-solid fa-right-to-bracket"></i>
              <h2>Authentication Required</h2>
            </div>
            <form className="login-sim-form" onSubmit={handleLogin}>
              <div className="login-sim-prefilled-fields">
                <div className="form-group">
                  <label htmlFor="username">Email Address</label>
                  <input
                    type="email"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-sim-input--prefilled"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={password === DEMO_PASSWORD ? 'login-sim-input--prefilled' : ''}
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="login-sim-actions">
                <Button type="submit" variant="primary" className="login-sim-submit" disabled={phase === 'verifying'}>
                  {phase === 'verifying' ? 'Verifying...' : 'Login'}
                </Button>
                <button type="button" className="login-sim-demo-fail" onClick={handleTryIncorrect}>
                  Or, try with an incorrect password
                </button>
              </div>
            </form>
          </div>
        )
      case 'mfa':
        return (
          <div className="login-sim-panel">
            <div className="login-sim-panel__header">
              <i className="fa-solid fa-shield-halved" aria-hidden="true" />
              <h2>Step 2: Multi-Factor Authentication</h2>
            </div>
            {showOtp && (
              <div className="otp-display"><span>Generated OTP:</span><strong>{generatedOtp}</strong></div>
            )}
            <form onSubmit={handleOtpSubmit} className="login-sim-form">
              <div className="form-group">
                <label htmlFor="sim-otp">One-Time Password (OTP)</label>
                <input id="sim-otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="otp-input" maxLength={6} inputMode="numeric" required />
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="login-sim-actions">
                <Button type="button" variant="outline" onClick={() => setShowOtp(true)}>
                  <i className="fa-solid fa-eye" aria-hidden="true" /> Show Generated OTP
                </Button>
                <Button type="submit" variant="primary" size="lg">Verify OTP</Button>
              </div>
            </form>
          </div>
        )
      case 'success':
        return (
          <div className="login-sim-success">
            <i className="fa-solid fa-circle-check login-sim-success__icon" aria-hidden="true" />
            <h2>Step 3: Authentication Successful</h2>
            <p>Redirecting to simulated dashboard…</p>
            <div className="login-sim-spinner login-sim-spinner--sm" aria-hidden="true" />
          </div>
        )
      case 'dashboard':
        return (
          <div className="login-sim-panel">
            <div className="login-sim-panel__header">
              <i className="fa-solid fa-gauge-high" aria-hidden="true" />
              <h2>{phase === 'session-expired' ? 'Session Ended' : 'Step 4: Simulated Dashboard'}</h2>
            </div>
            {phase === 'session-expired' ? (
              <div className="login-sim-expired">
                <i className="fa-solid fa-hourglass-end" aria-hidden="true" />
                <h3>Session Timed Out</h3>
                <p>Automatically logged out due to session expiration.</p>
                <Button variant="primary" onClick={handleReset}>Restart Simulation</Button>
              </div>
            ) : (
              <div className="login-sim-dashboard">
                <div className="login-sim-dashboard__welcome">
                  <span className="login-sim-dashboard__status" />
                  <div><strong>Welcome, Demo User</strong><span>Simulated session active</span></div>
                </div>
                <div className="login-sim-session-timer">
                  <div className="timeout-ring">
                    <svg viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#60a5fa" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        strokeDashoffset={`${2 * Math.PI * 52 * (sessionPercent / 100)}`}
                        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                    <div className="timeout-ring__label">
                      <span className="timeout-ring__time">{formatTime(sessionRemaining)}</span>
                      <span className="timeout-ring__sub">session remaining</span>
                    </div>
                  </div>
                </div>
                <dl className="login-sim-session-details">
                  <div className="session-detail"><dt>Session Token</dt><dd className="mono">sess_sim…8a2f</dd></div>
                  <div className="session-detail"><dt>Status</dt><dd className="status-ok">Active</dd></div>
                </dl>
                <div className="login-sim-restart-footer">
                  <Button onClick={handleReset} variant="secondary" size="sm">
                    <i className="fa-solid fa-rotate-right"></i> Restart Simulation
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
    }
  }

  const sessionPercent = ((SESSION_TIMEOUT_SEC - sessionRemaining) / SESSION_TIMEOUT_SEC) * 100

  return (
    <Layout>
      <div className="tool-page">
        <div className="tool-page__header">
          <h1>Login Security Simulator</h1>
          <p>This tool demonstrates key security concepts in a modern authentication flow, from credential verification to session management.</p>
        </div>

        <div className="login-sim-training-banner">
          <i className="fa-solid fa-graduation-cap"></i>
          <div>
            <strong>New to Authentication?</strong>
            <span>Learn the fundamentals of secure login systems with our interactive guide.</span>
          </div>
          <Link to="/learning/authentication" className="login-sim-training-banner__link">
            Start Learning <i className="fa-solid fa-arrow-right-long"></i>
          </Link>
        </div>

        <div className="login-sim-timeline">
          {PROGRESS_STEPS.map((step, index) => (
            <div
              key={step.key}
              className={`timeline-step ${index <= stepIndex ? 'timeline-step--active' : ''} ${index === stepIndex ? 'timeline-step--current' : ''}`}
            >
              <div className="timeline-step__icon"><i className={`fa-solid ${step.icon}`}></i></div>
              <span className="timeline-step__label">{step.label}</span>
              {index < PROGRESS_STEPS.length - 1 && <div className="timeline-step__line"></div>}
            </div>
          ))}
        </div>

        <div className="login-sim-grid">
          {renderContent()}
          <SecurityLearningPanel title={panel.title} icon={panel.icon} variant={panel.variant} points={panel.points} />
        </div>

        <AuditLog log={auditLog} />

        {simulationComplete && (
          <div className="login-sim-summary">
            <div className="login-sim-summary__header">
              <i className="fa-solid fa-shield-halved"></i>
              <h2>Simulation Complete: Key Security Layers</h2>
              <p>You've walked through a secure authentication process. Here’s a recap of the protections involved.</p>
            </div>
            <div className="login-sim-summary__grid">
              {LEARNING_SUMMARY.map((item) => (
                <div key={item.title} className="login-sim-summary__card">
                  <div className="login-sim-summary__icon"><i className={`fa-solid ${item.icon}`}></i></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
            <div className="login-sim-summary__actions">
              <Button onClick={handleReset} variant="secondary">
                <i className="fa-solid fa-rotate-right"></i> Run Simulation Again
              </Button>
            </div>
          </div>
        )}

        <IsoInfoBox
          controlId="A.5.17"
          title="Authentication Information"
          text="This simulation demonstrates ISO 27001:2022 Annex A control A.5.17, which requires a secure authentication process. It covers password verification, multi-factor authentication, and session management to protect against unauthorized access."
        />
      </div>
    </Layout>
  )
}
