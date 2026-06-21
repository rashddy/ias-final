import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const { login, verifyMfa, mfaPending, DEMO_OTP } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    const result = login(email.trim(), password)
    if (result.mfaRequired) return
    if (!result.success) setError(result.error)
  }

  const handleMfa = (e) => {
    e.preventDefault()
    setError('')
    const result = verifyMfa(otp)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
  }

  return (
    <Layout>
      <div className="login-page">
        <div className="login-card">
          <IsoInfoBox title="ISO 27001 A.9.4 — Secure Authentication">
            Multi-Factor Authentication (MFA) is required under ISO 27001 A.9.4.
            It adds a second verification step beyond passwords, significantly
            reducing the risk of unauthorized access.
          </IsoInfoBox>

          {!mfaPending ? (
            <>
              <div className="login-card__header">
                <h1>Secure Login</h1>
                <p>Enter your credentials to access the compliance portal</p>
              </div>

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrap">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      autoComplete="current-password"
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
                </div>

                {error && <div className="form-error">{error}</div>}

                <Button type="submit" variant="primary" size="lg" className="login-submit">
                  Sign in
                </Button>
              </form>

              <div className="login-demo-hint">
                <p><strong>Demo credentials:</strong></p>
                <p>Email: <code>admin@company.com</code></p>
                <p>Password: <code>SecurePass123!</code></p>
              </div>
            </>
          ) : (
            <>
              <div className="login-card__header">
                <div className="mfa-icon">
                  <i className="fa-solid fa-shield-halved" />
                </div>
                <h1>Multi-Factor Authentication</h1>
                <p>Enter the 6-digit verification code</p>
              </div>

              <div className="otp-display">
                <span>Your code:</span>
                <strong>{DEMO_OTP}</strong>
              </div>

              <form onSubmit={handleMfa} className="login-form">
                <div className="form-group">
                  <label htmlFor="otp">One-Time Password (OTP)</label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="otp-input"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                </div>

                {error && <div className="form-error">{error}</div>}

                <Button type="submit" variant="primary" size="lg" className="login-submit">
                  Verify &amp; Continue
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
