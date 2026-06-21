import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Button from '../components/Button'
import IsoInfoBox from '../components/IsoInfoBox'
import OtpModal from '../components/OtpModal'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const { login, verifyMfa, resendOtp, cancelMfa, mfaPending, mfaEmail } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [otpError, setOtpError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email.trim(), password)
    setLoading(false)

    if (result.success && !result.mfaRequired) {
      navigate('/dashboard')
    } else if (!result.success) {
      setError(result.error)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setOtpError('')
    setOtpLoading(true)

    const result = await verifyMfa(otp)
    setOtpLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setOtpError(result.error)
    }
  }

  const handleResendOtp = async () => {
    setOtpError('')
    setResendLoading(true)

    const result = await resendOtp()
    setResendLoading(false)

    if (!result.success) {
      setOtpError(result.error)
    }
  }

  const handleCancelMfa = () => {
    cancelMfa()
    setOtp('')
    setOtpError('')
  }

  return (
    <Layout>
      <div className="login-page">
        <div className="login-card">
          <IsoInfoBox title="ISO 27001 A.9.4 — Secure Authentication">
            Multi-Factor Authentication (MFA) is required under ISO 27001 A.9.4.
            After signing in, a one-time code is sent to your email before access is granted.
          </IsoInfoBox>

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
                placeholder="you@company.com"
                autoComplete="username"
                required
                disabled={loading || mfaPending}
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
                  disabled={loading || mfaPending}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  disabled={loading || mfaPending}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <Button type="submit" variant="primary" size="lg" className="login-submit" disabled={loading || mfaPending}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="login-switch">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>

      <OtpModal
        isOpen={mfaPending}
        email={mfaEmail}
        otp={otp}
        error={otpError}
        loading={otpLoading}
        resendLoading={resendLoading}
        onOtpChange={setOtp}
        onSubmit={handleVerifyOtp}
        onResend={handleResendOtp}
        onCancel={handleCancelMfa}
      />
    </Layout>
  )
}
