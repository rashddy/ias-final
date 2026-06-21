import helmet from 'helmet'
import cors from 'cors'
import hpp from 'hpp'
import rateLimit from 'express-rate-limit'

const isProduction = process.env.NODE_ENV === 'production'

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function isAllowedOrigin(origin) {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  if (!isProduction) {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  }
  return false
}

export function applySecurityMiddleware(app) {
  app.set('trust proxy', 1)

  app.use(helmet({
    contentSecurityPolicy: false,
  }))

  app.use(cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  app.use(hpp())

  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  }))
}

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
})
