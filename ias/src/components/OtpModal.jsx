import Button from './Button'
import './OtpModal.css'

export default function OtpModal({
  isOpen,
  email,
  otp,
  error,
  loading,
  resendLoading,
  onOtpChange,
  onSubmit,
  onResend,
  onCancel,
}) {
  if (!isOpen) return null

  return (
    <div className="otp-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="otp-modal-title">
      <div className="otp-modal">
        <button type="button" className="otp-modal__close" onClick={onCancel} aria-label="Close">
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="otp-modal__icon">
          <i className="fa-solid fa-shield-halved" />
        </div>

        <h2 id="otp-modal-title">Verify your identity</h2>
        <p className="otp-modal__subtitle">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <form onSubmit={onSubmit} className="otp-modal__form">
          <label htmlFor="otp-code">One-time password</label>
          <input
            id="otp-code"
            type="text"
            value={otp}
            onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="otp-input"
            maxLength={6}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            disabled={loading}
          />

          {error && <div className="form-error">{error}</div>}

          <Button type="submit" variant="primary" size="lg" className="otp-modal__submit" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying…' : 'Verify & continue'}
          </Button>
        </form>

        <div className="otp-modal__footer">
          <button
            type="button"
            className="otp-modal__resend"
            onClick={onResend}
            disabled={resendLoading || loading}
          >
            {resendLoading ? 'Sending…' : 'Resend code'}
          </button>
          <button type="button" className="otp-modal__cancel" onClick={onCancel} disabled={loading}>
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
