const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon',
  'master', 'login', 'abc123', 'iloveyou', 'sunshine',
]

export const ISO_PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  preventCommon: true,
  preventUsername: true,
  maxRepeatingChars: 3,
  reference: 'ISO/IEC 27001:2022 — A.9.4.3 Password management system',
}

export function checkPassword(password, username = '') {
  const rules = [
    {
      id: 'length',
      label: `At least ${ISO_PASSWORD_POLICY.minLength} characters`,
      isoRef: 'A.9.4.3 — Minimum password length',
      test: (p) => p.length >= ISO_PASSWORD_POLICY.minLength,
    },
    {
      id: 'maxLength',
      label: `No more than ${ISO_PASSWORD_POLICY.maxLength} characters`,
      isoRef: 'A.9.4.3 — Maximum password length',
      test: (p) => p.length <= ISO_PASSWORD_POLICY.maxLength,
    },
    {
      id: 'uppercase',
      label: 'Contains uppercase letter (A–Z)',
      isoRef: 'A.9.4.3 — Password complexity',
      test: (p) => /[A-Z]/.test(p),
    },
    {
      id: 'lowercase',
      label: 'Contains lowercase letter (a–z)',
      isoRef: 'A.9.4.3 — Password complexity',
      test: (p) => /[a-z]/.test(p),
    },
    {
      id: 'number',
      label: 'Contains a number (0–9)',
      isoRef: 'A.9.4.3 — Password complexity',
      test: (p) => /[0-9]/.test(p),
    },
    {
      id: 'special',
      label: 'Contains special character (!@#$%^&*...)',
      isoRef: 'A.9.4.3 — Password complexity',
      test: (p) => /[^A-Za-z0-9]/.test(p),
    },
    {
      id: 'common',
      label: 'Not a commonly used password',
      isoRef: 'A.9.4.3 — Prohibit dictionary words',
      test: (p) => !COMMON_PASSWORDS.includes(p.toLowerCase()),
    },
    {
      id: 'username',
      label: 'Does not contain username',
      isoRef: 'A.9.4.3 — User-specific restrictions',
      test: (p) => {
        if (!username) return true
        return !p.toLowerCase().includes(username.toLowerCase())
      },
    },
    {
      id: 'repeating',
      label: `No more than ${ISO_PASSWORD_POLICY.maxRepeatingChars} repeating characters`,
      isoRef: 'A.9.4.3 — Pattern restrictions',
      test: (p) => !/(.)\1{3,}/.test(p),
    },
  ]

  const results = rules.map((rule) => ({
    ...rule,
    passed: password.length > 0 ? rule.test(password) : false,
  }))

  const passedCount = results.filter((r) => r.passed).length
  const total = results.length
  const isValid = passedCount === total && password.length > 0

  let strength = 'none'
  if (password.length > 0) {
    const coreRules = results.filter((r) => !['maxLength', 'username', 'repeating'].includes(r.id))
    const corePassed = coreRules.filter((r) => r.passed).length
    const ratio = corePassed / coreRules.length
    if (ratio < 0.4) strength = 'weak'
    else if (ratio < 0.7) strength = 'moderate'
    else if (ratio < 1) strength = 'strong'
    else strength = 'very-strong'
  }

  return { results, passedCount, total, isValid, strength }
}
