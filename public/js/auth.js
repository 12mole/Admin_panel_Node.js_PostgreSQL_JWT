function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form values
  const username = e.target.username.value.trim();
  const password = e.target.password.value;

  // Clear previous errors
  const errorElement = document.getElementById('error');
  errorElement.textContent = '';

  try {
    // Send login request to server
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-csrf-token': getCookie('csrfToken') || '' // Include CSRF token if available
      },
      credentials: 'include', // Important for cookies/sessions
      body: JSON.stringify({ username, password })
    });

    // Handle response
    if (res.ok) {
      // Successful login - redirect to admin panel
      window.location.href = '/admin';
    } else {
      // Show error message from server or default message
      const data = await res.json().catch(() => ({}));
      errorElement.textContent = data.error || data.message || 'Login failed. Please check your credentials.';
    }
  } catch (err) {
    // Network or other errors
    console.error('Login error:', err);
    errorElement.textContent = 'Network error. Please try again later.';
  }
});
