import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import './Navbar.css'

const APP_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Policy', path: '/security-policy' },
  { label: 'Checklist', path: '/checklist' },
  { label: 'Password', path: '/password-checker' },
  { label: 'Quiz', path: '/quiz' },
  { label: 'Session', path: '/session' },
]

const LANDING_LINKS = [
  { label: 'Overview', path: '/#overview' },
  { label: 'Policy', path: '/security-policy' },
  { label: 'Checklist', path: '/checklist' },
  { label: 'Features', path: '/#features' },
]

export default function Navbar({ variant = 'landing' }) {
  const { isAuthenticated, logout } = useAuth()
  const location = useLocation()

  const links = variant === 'landing' ? LANDING_LINKS : APP_LINKS

  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo" aria-label="ISOGuard Home">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <rect x="2" y="2" width="11" height="11" rx="2" fill="white" />
          <rect x="15" y="2" width="11" height="11" rx="2" fill="white" opacity="0.5" />
          <rect x="2" y="15" width="11" height="11" rx="2" fill="white" opacity="0.5" />
          <rect x="15" y="15" width="11" height="11" rx="2" fill="white" />
        </svg>
        <span className="navbar__brand">ISOGuard</span>
      </Link>

      <nav className="navbar__links">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`navbar__link ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="navbar__actions">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
            <Button variant="primary" size="sm" onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
