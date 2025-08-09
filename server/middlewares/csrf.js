exports.verifyCsrf = (req, res, next) => {
  const method = req.method.toUpperCase()
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next()

  const headerToken = req.get('x-csrf-token')
  const cookieToken = req.cookies?.csrfToken

  if (!headerToken || !cookieToken || !crypto.timingSafeEqual(
    Buffer.from(headerToken),
    Buffer.from(cookieToken)
  )) {
    return res.status(403).json({ 
      error: 'Invalid CSRF token',
      code: 'INVALID_CSRF_TOKEN'
    })
  }

  next()
}