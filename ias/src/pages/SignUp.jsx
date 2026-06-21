import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import { useAuth } from '../context/AuthContext'
import PasswordRequirements from '../components/PasswordRequirements'
import './Login.css'

export default function SignUp() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const result = signup(email, password, confirmPassword, displayName)
    if (result.success) {
      setSuccess(result.message)
      setTimeout(() => navigate('/login'), 2000)
    } else {
      setError(result.error)
    }
  }

  return (
    <Layout>
      <div className="login-page">
        <div className="login-card">
          <IsoInfoBox title="ISO 27001 A.9.2 — User Registration">
            ISO 27001 requires a formal user registration process. New accounts
            must use strong passwords and complete MFA on first sign-in.
          </IsoInfoBox>

          <div className="login-card__header">
            <h1>Create Account</h1>
            <p>Sign up with your email and a strong password</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="displayName">Full name (optional)</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
              <PasswordRequirements password={password} />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
                required
              />
              {confirmPassword.length > 0 && (
                <p className={`password-match ${password === confirmPassword ? 'password-match--ok' : 'password-match--fail'}`}>
                  <i className={`fa-solid ${password === confirmPassword ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />
                  {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-success">{success}</div>}

            <Button type="submit" variant="primary" size="lg" className="login-submit">
              Sign up
            </Button>
          </form>

          <p className="login-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}
