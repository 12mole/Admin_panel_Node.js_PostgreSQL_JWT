// public/js/main.js
// Common utilities: escapeHTML, auth check

function escapeHTML(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function ensureAuth() {
  try {
    const res = await fetch('/api/auth/check', { credentials: 'include' })
    if (!res.ok) {
      window.location.href = '/login'
      return false
    }
    return true
  } catch (err) {
    window.location.href = '/login'
    return false
  }
}

// Small helper to read cookie by name
function getCookie(name) {
  const parts = document.cookie.split(';').map(x => x.trim())
  for (const p of parts) {
    if (p.startsWith(name + '=')) {
      return decodeURIComponent(p.split('=')[1])
    }
  }
  return null
}