import jwt from 'jsonwebtoken'

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

function readToken(req) {
  const header = req.headers.authorization || ''
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

export function requireAuth(req, res, next) {
  const token = readToken(req)
  if (!token) return res.status(401).json({ message: 'Authentication required.' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' })
  }
}

export function optionalAuth(req, res, next) {
  const token = readToken(req)
  if (token) {
    try { req.user = jwt.verify(token, process.env.JWT_SECRET) } catch {}
  }
  next()
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' })
  }
  next()
}
