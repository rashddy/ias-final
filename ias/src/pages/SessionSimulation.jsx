import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import { useAuth } from '../context/AuthContext'
import './SessionSimulation.css'

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

function formatDateTime(ts) {
  return new Date(ts).toLocaleTimeString()
}

const TIMELINE_STEPS = [
  { key: 'login', label: 'Login', icon: 'fa-right-to-bracket' },
  { key: 'auth', label: 'Authentication', icon: 'fa-shield-halved' },
  { key: 'session', label: 'Session Created', icon: 'fa-key' },
  { key: 'activity', label: 'Activity', icon: 'fa-chart-line' },
  { key: 'timeout', label: 'Session Timeout', icon: 'fa-hourglass-end' },
]

export default function SessionSimulation() {
  const {
    user,
    isAuthenticated,
    sessionExpired,
    sessionRemaining,
    lastActivity,
    touchActivity,
    logout,
    SESSION_TIMEOUT_MS,
  } = useAuth()
  const navigate = useNavigate()
  const [activityLog, setActivityLog] = useState([])

  useEffect(() => {
    if (!isAuthenticated) return
    const loginEntry = {
      time: user?.sessionStart ? new Date(user.sessionStart).getTime() : Date.now(),
      event: 'User login successful (MFA verified)',
    }
    setActivityLog([
      { time: Date.now(), event: 'Page viewed: Session Simulation' },
      loginEntry,
    ])
  }, [isAuthenticated, user?.sessionStart])

  const handleSimulateActivity = () => {
    touchActivity()
    setActivityLog((log) => [
      { time: Date.now(), event: 'User activity detected — session timer reset' },
      ...log.slice(0, 9),
    ])
  }

  const handleForceLogout = () => {
    setActivityLog((log) => [
      { time: Date.now(), event: 'Session terminated by user (force logout)' },
      ...log.slice(0, 9),
    ])
    logout()
    navigate('/login')
  }

  const idlePercent = isAuthenticated
    ? ((SESSION_TIMEOUT_MS - sessionRemaining) / SESSION_TIMEOUT_MS) * 100
    : 0

  const activeStep = sessionExpired
    ? 'timeout'
    : idlePercent > 50
      ? 'activity'
      : isAuthenticated
        ? 'session'
        : 'login'

  const stepIndex = TIMELINE_STEPS.findIndex((s) => s.key === activeStep)

  if (!isAuthenticated && !sessionExpired) {
    return (
      <Layout>
        <div className="tool-page session-gate">
          <div className="session-gate__card">
            <h1>Session Simulation</h1>
            <p>Login first to experience live session management and timeout controls.</p>
            <Button variant="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="tool-page">
        <div className="tool-page__header">
          <h1>Session Simulation</h1>
          <p>Live demonstration of session lifecycle and timeout controls</p>
        </div>

        <IsoInfoBox title="ISO 27001 A.9 — Session Management">
          ISO 27001 A.9 requires session timeout controls to prevent unauthorized
          access when a user leaves their workstation unattended. Sessions should
          automatically terminate after a defined period of inactivity.
        </IsoInfoBox>

        {sessionExpired && (
          <div className="session-expired-banner">
            <div>
              <strong>Session Expired</strong>
              <p>Your session was terminated due to 5 minutes of inactivity.</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              Re-authenticate
            </Button>
          </div>
        )}

        <div className="session-timeline">
          {TIMELINE_STEPS.map((step, i) => (
            <div
              key={step.key}
              className={`timeline-step ${i <= stepIndex ? 'timeline-step--active' : ''} ${step.key === activeStep ? 'timeline-step--current' : ''}`}
            >
              <div className="timeline-step__icon">
                <i className={`fa-solid ${step.icon}`} aria-hidden="true" />
              </div>
              <span className="timeline-step__label">{step.label}</span>
              {i < TIMELINE_STEPS.length - 1 && <div className="timeline-step__line" />}
            </div>
          ))}
        </div>

        <div className="session-grid">
          <div className="session-panel">
            <h2>Live Session</h2>
            <div className="timeout-visual">
              <div className="timeout-ring">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke={sessionExpired ? 'var(--danger)' : '#60a5fa'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (idlePercent / 100)}`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                </svg>
                <div className="timeout-ring__label">
                  <span className="timeout-ring__time">
                    {sessionExpired ? '0:00' : formatTime(sessionRemaining)}
                  </span>
                  <span className="timeout-ring__sub">until timeout</span>
                </div>
              </div>
            </div>

            <div className="session-actions">
              <Button variant="outline" size="sm" onClick={handleSimulateActivity}>
                Simulate Activity
              </Button>
              <Button variant="danger" size="sm" onClick={handleForceLogout}>
                Force Logout / End Session
              </Button>
            </div>
          </div>

          <div className="session-panel">
            <h2>Session Details</h2>
            <dl className="session-details">
              <div className="session-detail">
                <dt>User</dt>
                <dd>{user?.displayName || '—'}</dd>
              </div>
              <div className="session-detail">
                <dt>Login Time</dt>
                <dd>{user?.sessionStart ? new Date(user.sessionStart).toLocaleString() : '—'}</dd>
              </div>
              <div className="session-detail">
                <dt>Last Activity</dt>
                <dd>{formatDateTime(lastActivity)}</dd>
              </div>
              <div className="session-detail">
                <dt>Status</dt>
                <dd className={sessionExpired ? 'status-expired' : 'status-ok'}>
                  {sessionExpired ? 'Expired' : 'Active'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="session-panel session-panel--full">
            <h2>Session Logs</h2>
            <div className="activity-log">
              {activityLog.length === 0 ? (
                <p className="activity-log__empty">No activity recorded yet.</p>
              ) : (
                activityLog.map((entry) => (
                  <div key={`${entry.time}-${entry.event}`} className="activity-log__entry">
                    <span className="activity-log__time">{formatDateTime(entry.time)}</span>
                    <span className="activity-log__event">{entry.event}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
