import { useState } from 'react'
import Layout from '../components/Layout'
import IsoInfoBox from '../components/IsoInfoBox'
import { checkPassword, ISO_PASSWORD_POLICY } from '../data/passwordPolicy'
import './PasswordChecker.css'

const STRENGTH_COLORS = {
  none: '#333',
  weak: '#ef4444',
  moderate: '#f59e0b',
  strong: '#3b82f6',
  'very-strong': '#22c55e',
}

const STRENGTH_LABELS = {
  none: '—',
  weak: 'Weak',
  moderate: 'Moderate',
  strong: 'Strong',
  'very-strong': 'Very Strong',
}

export default function PasswordChecker() {
  const [password, setPassword] = useState('')
  const { results, passedCount, total, isValid, strength } = checkPassword(password)
  const strengthPercent = password.length > 0 ? (passedCount / total) * 100 : 0

  const displayRules = results.filter((r) =>
    ['length', 'uppercase', 'lowercase', 'number', 'special', 'common'].includes(r.id)
  )

  return (
    <Layout>
      <div className="tool-page">
        <div className="tool-page__header">
          <h1>Password Policy Checker</h1>
          <p>{ISO_PASSWORD_POLICY.reference}</p>
        </div>

        <IsoInfoBox title="ISO 27001 A.9.4 — Password Management">
          ISO 27001 A.9.4 requires strong password policies for all system access.
          Passwords must meet complexity requirements and must not be easily guessable.
        </IsoInfoBox>

        <div className="checker-layout">
          <div className="checker-input-panel">
            <div className="form-group">
              <label htmlFor="check-password">Password to validate</label>
              <input
                id="check-password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type a password to check..."
                autoComplete="off"
              />
            </div>

            <div className="strength-meter">
              <div className="strength-meter__bar">
                <div
                  className="strength-meter__fill"
                  style={{
                    width: `${strengthPercent}%`,
                    background: STRENGTH_COLORS[strength],
                  }}
                />
              </div>
              <div className="strength-meter__labels">
                <span>Strength</span>
                <span style={{ color: STRENGTH_COLORS[strength] }}>
                  {STRENGTH_LABELS[strength]}
                </span>
              </div>
            </div>

            {password.length > 0 && (
              <div className={`validity-badge ${isValid ? 'validity-badge--valid' : 'validity-badge--invalid'}`}>
                {isValid ? '✓ Password meets policy requirements' : '✗ Password does not meet policy'}
              </div>
            )}
          </div>

          <div className="checker-rules-panel">
            <h2>Requirements</h2>
            <p className="checker-rules-count">{displayRules.filter((r) => r.passed).length} of {displayRules.length} met</p>
            <ul className="rules-list">
              {displayRules.map((rule) => (
                <li key={rule.id} className={`rule-item ${rule.passed ? 'rule-item--pass' : 'rule-item--fail'}`}>
                  <span className="rule-item__icon">{rule.passed ? '✓' : '✗'}</span>
                  <span className="rule-item__label">{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}
