const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(data.error || 'Request failed.', response.status)
  }

  return data
}

export const authApi = {
  signup(body) {
    return request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  login(body) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  verifyOtp(body) {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  resendOtp(body) {
    return request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  refresh(refreshToken) {
    return request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    })
  },

  me(idToken) {
    return request('/auth/me', {
      headers: { Authorization: `Bearer ${idToken}` },
    })
  },

  logout(idToken) {
    return request('/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    })
  },
}

export { ApiError }
