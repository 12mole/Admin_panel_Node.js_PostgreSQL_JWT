require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const path = require('path')
const db = require('./config/db')

const app = express()
const PORT = process.env.PORT || 3000

// Basic middleware
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '..', 'public')))

// Content Security Policy - restrict to same origin for scripts/styles/images
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'"
  )
  next()
})


// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/userRoutes'))

// Serve app pages
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'index.html')))
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, '..', 'public', 'admin.html')))

// 404 handler
app.use((req, res) => res.status(404).send('Not found'))

// Start server after DB connect
db.connect()
  .then(() => {
    console.log('[DB] connected')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('DB connection failed', err)
    process.exit(1)
  })
