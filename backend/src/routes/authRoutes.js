const express = require('express')
const rateLimit = require('express-rate-limit')
const {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  registerValidation,
  loginValidation
} = require('../controllers/authController')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Very strict limit for login attempts
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Public routes (no authentication required)

// POST /api/auth/register - Register new user
router.post('/register', authLimiter, registerValidation, register)

// POST /api/auth/login - Login user
router.post('/login', strictAuthLimiter, loginValidation, login)

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', authLimiter, refreshToken)

// Protected routes (authentication required)

// GET /api/auth/profile - Get current user profile
router.get('/profile', authenticateToken, getProfile)

// PUT /api/auth/profile - Update user profile
router.put('/profile', authenticateToken, updateProfile)

// PUT /api/auth/change-password - Change password
router.put('/change-password', authenticateToken, changePassword)

// POST /api/auth/logout - Logout user
router.post('/logout', authenticateToken, logout)

// GET /api/auth/verify - Verify token (useful for frontend)
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      isActive: req.user.isActive
    }
  })
})

module.exports = router