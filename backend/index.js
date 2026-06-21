import 'dotenv/config'
import express from 'express'
import { initFirebaseAdmin } from './config/firebaseAdmin.js'
import { applySecurityMiddleware } from './middleware/security.js'
import authRoutes from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

try {
  initFirebaseAdmin()
} catch (err) {
  console.error(err.message)
  process.exit(1)
}

applySecurityMiddleware(app)

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' })
})

app.use((err, _req, res, _next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origin not allowed.' })
  }
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error.' })
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
