export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 12) {
    return 'Password must be at least 12 characters.'
  }
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must include a number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character.'
  return null
}
