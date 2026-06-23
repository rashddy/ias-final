import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import { useAuth } from '../context/AuthContext'
import { loadProgress } from '../data/checklistControls'
import { getQuizQuestionsForProgress } from '../data/quizQuestions'
import './Dashboard.css'

const FEATURE_CARDS = [
  { path: '/password-checker', icon: 'fa-key', label: 'Password Policy Checker', iso: 'A.9.4' },
  { path: '/quiz', icon: 'fa-brain', label: 'Security Awareness Quiz', iso: 'A.6.3' },
  { path: '/session', icon: 'fa-clock', label: 'Session Simulation', iso: 'A.9.4' },
  { path: '/login-simulator', icon: 'fa-user-shield', label: 'Login Security Simulator', iso: 'A.8.5' },
  { path: '/checklist', icon: 'fa-list-check', label: 'Compliance Checklist', iso: 'Annex A' },
]

function formatTime(ms) {
  const totalSec = Math.ceil(ms / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

export default function Dashboard() {
  const { user, sessionRemaining, sessionExpired, logout } = useAuth()
  const navigate = useNavigate()
  const [checklistDone, setChecklistDone] = useState(() => loadProgress().completed.length)

  useEffect(() => {
    if (sessionExpired) navigate('/login')
  }, [sessionExpired, navigate])

  useEffect(() => {
    const refresh = () => setChecklistDone(loadProgress().completed.length)
    refresh()
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const quizQuestions = getQuizQuestionsForProgress(loadProgress().completed)

  return (
    <Layout>
      <div className="dashboard">
        <IsoInfoBox title="ISO 27001 — Access Control & Session Management">
          After authentication, ISO 27001 requires session controls including timeout
          limits and secure logout procedures to prevent unauthorized access.
        </IsoInfoBox>

        <div className="dashboard__header">
          <div>
            <h1>Welcome, {user?.displayName || 'Admin User'}</h1>
            <p className="dashboard__subtitle">
              <span className="dashboard__status-dot" /> Session Active
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => { logout(); navigate('/') }}>
            Logout
          </Button>
        </div>

        <div className="dashboard__session-bar">
          <div className="session-stat">
            <i className="fa-solid fa-clock" aria-hidden="true" />
            <div>
              <span className="session-stat__label">Login Time</span>
              <span className="session-stat__value">
                {user?.sessionStart ? new Date(user.sessionStart).toLocaleTimeString() : '—'}
              </span>
            </div>
          </div>
          <div className="session-stat">
            <i className="fa-solid fa-hourglass-half" aria-hidden="true" />
            <div>
              <span className="session-stat__label">Session Expires In</span>
              <span className={`session-stat__value ${sessionRemaining < 60000 ? 'session-stat__value--warn' : ''}`}>
                {formatTime(sessionRemaining)}
              </span>
            </div>
          </div>
        </div>

        <h2 className="dashboard__section-title">Portal Features</h2>
        {checklistDone === 0 && (
          <p className="dashboard__quiz-hint">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            Complete checklist controls to unlock your personalized quiz.
          </p>
        )}
        {checklistDone > 0 && (
          <p className="dashboard__quiz-hint dashboard__quiz-hint--ready">
            <i className="fa-solid fa-brain" aria-hidden="true" />
            Quiz ready — {quizQuestions.length} question{quizQuestions.length !== 1 ? 's' : ''} from {checklistDone} completed control{checklistDone !== 1 ? 's' : ''}.
          </p>
        )}
        <div className="dashboard__quick-links">
          {FEATURE_CARDS.map((link) => (
            <Link key={link.path} to={link.path} className="quick-link">
              <span className="quick-link__icon">
                <i className={`fa-solid ${link.icon}`} aria-hidden="true" />
              </span>
              <div>
                <span className="quick-link__label">{link.label}</span>
                <span className="quick-link__iso">{link.iso}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
