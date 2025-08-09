// Manage users list, add/edit modal, delete selected users.
// Uses cookies: 'csrfToken' must be sent as header 'x-csrf-token'

(async () => {
  // Universal admin check function
  function isAdminValue(val) {
    return (
      val === true ||
      val === 1 ||
      val === "1" ||
      String(val).toLowerCase() === "true"
    )
  }

  // Show error modal with message
  function showError(message) {
    document.getElementById('errorModalMessage').textContent = message
    document.getElementById('errorModal').classList.remove('hidden')
  }

  // Close error modal handler
  document.getElementById('errorModalClose').addEventListener('click', () => {
    document.getElementById('errorModal').classList.add('hidden')
  })

  // Close details modal handler
  document.getElementById('closeDetailsBtn').addEventListener('click', () => {
    document.getElementById('userDetailsModal').classList.add('hidden')
  })

  // Close any modal when clicking on background
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target.classList.contains('modal')) {
        modal.classList.add('hidden')
      }
    })
  })

  // Require authentication before proceeding
  const ok = await ensureAuth()
  if (!ok) return

  // Pagination and sorting variables
  let page = 1
  const limit = 10
  let sort = 'username'
  let order = 'asc'
  let totalPages = 1
  let searchQuery = ''

  const tbody = document.querySelector('#userTable tbody')
  const pageNumSpan = document.getElementById('pageNum')

  // Load users from API with current filters/pagination
  async function loadUsers() {
    const res = await fetch(
      `/api/users?page=${page}&limit=${limit}&sort=${encodeURIComponent(sort)}&order=${encodeURIComponent(order)}&search=${encodeURIComponent(searchQuery)}`,
      { credentials: 'include' }
    )
    if (!res.ok) {
      if (res.status === 401) window.location.href = '/login'
      return
    }
    const data = await res.json()
    tbody.innerHTML = ''
    data.users.forEach(u => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td><input class="rowCheckbox" data-id="${escapeHTML(u.id)}" type="checkbox"></td>
        <td>${escapeHTML(u.id)}</td>
        <td><span class="user-link" data-id="${escapeHTML(u.id)}">${escapeHTML(u.username)}</span></td>
        <td><span class="user-link" data-id="${escapeHTML(u.id)}">${escapeHTML(u.first_name || '')}</span></td>
        <td>${escapeHTML(u.last_name || '')}</td>
        <td>${escapeHTML(u.gender || '')}</td>
        <td>${escapeHTML(u.birthdate ? new Date(u.birthdate).toISOString().split('T')[0] : '')}</td>
        <td>${isAdminValue(u.is_admin) ? 'Yes' : 'No'}</td>
        <td>
          <button class="editBtn" data-id="${u.id}">Edit</button>
          <button class="delBtn" data-id="${u.id}">Delete</button>
        </td>`
      tbody.appendChild(tr)
    })
    totalPages = data.totalPages || 1
    pageNumSpan.textContent = page
  }

  // Debounce function for search input
  function debounce(fn, delay) {
    let timer
    return (...args) => {
      clearTimeout(timer)
      timer = setTimeout(() => fn(...args), delay)
    }
  }

  // Search input handler with debounce
  const searchInput = document.getElementById('searchInput')
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce(() => {
        searchQuery = searchInput.value.trim()
        page = 1
        loadUsers()
      }, 300)
    )
  }

  // Initial load of users
  await loadUsers()

  // Pagination handlers
  document.getElementById('nextPage').addEventListener('click', async () => {
    if (page < totalPages) {
      page++
      await loadUsers()
    }
  })
  document.getElementById('prevPage').addEventListener('click', async () => {
    if (page > 1) {
      page--
      await loadUsers()
    }
  })

  // Sorting handlers
  document.getElementById('sortSelect').addEventListener('change', e => {
    sort = e.target.value
    page = 1
    loadUsers()
  })
  document.getElementById('orderSelect').addEventListener('change', e => {
    order = e.target.value
    page = 1
    loadUsers()
  })

  // Column sort mapping (click on table headers)
  const columnMap = {
    2: 'username',
    3: 'first_name',
    6: 'birthdate'
  }
  document.querySelectorAll('#userTable thead th').forEach(th => {
    th.style.cursor = 'pointer'
    th.addEventListener('click', () => {
      const colIndex = th.cellIndex
      if (columnMap[colIndex]) {
        if (sort === columnMap[colIndex]) {
          order = order === 'asc' ? 'desc' : 'asc'
        } else {
          sort = columnMap[colIndex]
          order = 'asc'
        }
        loadUsers()
      }
    })
  })

  // Logout handler
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: { 'x-csrf-token': getCookie('csrfToken') }
    })
    window.location.href = '/login'
  })

  // User form modal variables
  const modal = document.getElementById('modal')
  const userForm = document.getElementById('userForm')
  const modalTitle = document.getElementById('modalTitle')
  const cancelBtn = document.getElementById('cancelBtn')
  let editingId = null

  // Add user button handler
  document.getElementById('addBtn').addEventListener('click', () => {
    editingId = null
    modalTitle.textContent = 'Add user'
    userForm.reset()
    document.getElementById('formError').textContent = ''
    modal.classList.remove('hidden')
  })

  cancelBtn.addEventListener('click', () => modal.classList.add('hidden'))

  // Table row click handlers (view details, edit, delete)
  tbody.addEventListener('click', async e => {
    if (e.target.classList.contains('user-link')) {
      const id = e.target.dataset.id
      const res = await fetch(`/api/users/${id}`, { credentials: 'include' })
      if (!res.ok) return showError('Failed to fetch user details')
      const user = await res.json()

      const detailsHTML = `
        <p><strong>ID:</strong> ${escapeHTML(user.id)}</p>
        <p><strong>Username:</strong> ${escapeHTML(user.username)}</p>
        <p><strong>First name:</strong> ${escapeHTML(user.first_name || '')}</p>
        <p><strong>Last name:</strong> ${escapeHTML(user.last_name || '')}</p>
        <p><strong>Gender:</strong> ${escapeHTML(user.gender || '')}</p>
        <p><strong>Birthdate:</strong> ${user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : ''}</p>
        <p><strong>Admin:</strong> ${isAdminValue(user.is_admin) ? 'Yes' : 'No'}</p>
      `
      document.getElementById('userDetailsContent').innerHTML = detailsHTML
      document.getElementById('userDetailsModal').classList.remove('hidden')
      return
    }

    if (e.target.classList.contains('editBtn')) {
      const id = e.target.dataset.id
      const res = await fetch(`/api/users/${id}`, { credentials: 'include' })
      if (!res.ok) return showError('Failed to fetch user')
      const user = await res.json()
      modalTitle.textContent = 'Edit user'
      editingId = id
      userForm.username.value = user.username || ''
      userForm.password.value = ''
      userForm.first_name.value = user.first_name || ''
      userForm.last_name.value = user.last_name || ''
      userForm.gender.value = user.gender || ''
      userForm.birthdate.value = user.birthdate
        ? new Date(user.birthdate).toISOString().split('T')[0]
        : ''
      userForm.is_admin.checked = isAdminValue(user.is_admin)
      document.getElementById('formError').textContent = ''
      modal.classList.remove('hidden')
    } else if (e.target.classList.contains('delBtn')) {
      const id = e.target.dataset.id
      if (!confirm('Delete user id=' + id + '?')) return
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCookie('csrfToken')
        }
      })
      if (res.ok) {
        await loadUsers()
      } else {
        const errData = await res.json().catch(() => ({}))
        showError(errData.message || 'Failed to delete')
      }
    }
  })

  // Select all checkbox handler
  document.getElementById('selectAll').addEventListener('change', e => {
    const checked = e.target.checked
    document
      .querySelectorAll('.rowCheckbox')
      .forEach(cb => (cb.checked = checked))
  })

  // Delete selected users handler
  document
    .getElementById('deleteSelectedBtn')
    .addEventListener('click', async () => {
      const ids = Array.from(
        document.querySelectorAll('.rowCheckbox:checked')
      ).map(cb => cb.dataset.id)
      if (ids.length === 0) return showError('No users selected')
      if (!confirm('Delete selected users?')) return
      const res = await fetch('/api/users/delete-multiple', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCookie('csrfToken')
        },
        body: JSON.stringify({ ids })
      })
      if (res.ok) {
        await loadUsers()
      } else {
        const errData = await res.json().catch(() => ({}))
        showError(errData.message || errData.error || 'Failed to delete')
      }
    })

  // User form submission handler
  userForm.addEventListener('submit', async e => {
    e.preventDefault()

    const data = {
      username: userForm.username.value.trim(),
      password: userForm.password.value,
      first_name: userForm.first_name.value.trim(),
      last_name: userForm.last_name.value.trim(),
      gender: userForm.gender.value || undefined,
      birthdate: userForm.birthdate.value || undefined,
      is_admin: userForm.is_admin.checked
    }

    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': getCookie('csrfToken')
        },
        body: JSON.stringify(data)
      })

      const resp = await res.json().catch(() => ({}))

      if (res.ok) {
        modal.classList.add('hidden')
        await loadUsers()
      } else {
        if (resp.errors && Array.isArray(resp.errors) && resp.errors.length > 0) {
          showError(resp.errors.join('; '))
        } else if (resp.error) {
          showError(resp.error)
        } else if (resp.message) {
          showError(resp.message)
        } else {
          showError('Failed to save user')
        }
      }
    } catch (err) {
      showError('Network error while saving user')
    }
  })
})()