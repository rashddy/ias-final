const SIGNUP_RULES = [
  { id: 'length', label: 'At least 12 characters', test: (p) => p.length >= 12 },
  { id: 'uppercase', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export function getSignupPasswordRules(password) {
  return SIGNUP_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }))
}

export function isSignupPasswordValid(password) {
  return SIGNUP_RULES.every((rule) => rule.test(password))
}

export default function PasswordRequirements({ password }) {
  const rules = getSignupPasswordRules(password)
  const unmet = rules.filter((r) => !r.passed)
  const allMet = password.length > 0 && unmet.length === 0

  if (allMet) {
    return (
      <div className="password-reqs password-reqs--complete" aria-live="polite">
        <span className="password-reqs__done">
          <i className="fa-solid fa-circle-check" aria-hidden="true" />
          Password meets all requirements
        </span>
      </div>
    )
  }

  return (
    <ul className="password-reqs" aria-live="polite">
      {unmet.map((rule) => (
        <li key={rule.id} className="password-req">
          <span className="password-req__dot" aria-hidden="true" />
          {rule.label}
        </li>
      ))}
    </ul>
  )
}
