import jwt from 'jsonwebtoken'

export const AUTH_COOKIE = '__Host-softgate-session'

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  )
}

export function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  })
}

function readToken(req) {
  const cookieToken = req.cookies?.[AUTH_COOKIE]
  if (cookieToken) return cookieToken

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