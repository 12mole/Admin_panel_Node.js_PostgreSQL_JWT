const allowedGenders = ['male', 'female', 'other', 'non-binary', 'prefer-not-to-say']

const sanitizeInput = (data) => {
  if (!data) return {}
  
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (value === null || value === undefined) {
      acc[key] = value
    } else if (typeof value === 'string') {
      // Remove control chars, HTML tags, and trim whitespace
      acc[key] = value.replace(/[\x00-\x1F\x7F<>]/g, '').trim()
    } else {
      acc[key] = value
    }
    return acc
  }, {})
}

const validateUserData = (data, { requirePassword = true, isUpdate = false } = {}) => {
  const errors = []
  
  if (!data || typeof data !== 'object') {
    errors.push('No valid data provided')
    return errors
  }

  // Username validation
  if (!isUpdate || data.username !== undefined) {
    if (!data.username?.trim()) {
      errors.push('Username is required')
    } else if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters')
    } else if (data.username.length > 30) {
      errors.push('Username cannot exceed 30 characters')
    }
  }

  // Password validation
  if ((requirePassword && !isUpdate) || data.password !== undefined) {
    if (requirePassword && !data.password?.trim()) {
      errors.push('Password is required')
    } else if (data.password && data.password.length < 8) {
      errors.push('Password must be at least 8 characters')
    }
  }

  // Birthdate validation
  if (data.birthdate !== undefined) {
    if (data.birthdate && isNaN(Date.parse(data.birthdate))) {
      errors.push('Birthdate must be a valid date (YYYY-MM-DD)')
    }
  }

  // Gender validation
  if (data.gender !== undefined && data.gender && !allowedGenders.includes(data.gender)) {
    errors.push(`Gender must be one of: ${allowedGenders.join(', ')}`)
  }

  return errors
}

module.exports = {
  sanitizeInput,
  validateUserData
}