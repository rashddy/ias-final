import { getAuth } from '../config/firebaseAdmin.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const token = header.slice(7)

  try {
    const decoded = await getAuth().verifyIdToken(token, true)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session.' })
  }
}
