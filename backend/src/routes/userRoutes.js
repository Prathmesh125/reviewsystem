const express = require('express')
const { authenticateToken } = require('../middleware/auth')
const { requireBusinessOwner } = require('../middleware/roleCheck')
const {
  getDashboardMetrics,
  getUserBusinesses,
  getUserAnalytics
} = require('../controllers/userController')

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// GET /api/user/dashboard - Get dashboard metrics
router.get('/dashboard', requireBusinessOwner, getDashboardMetrics)

// GET /api/user/businesses - Get user's businesses
router.get('/businesses', requireBusinessOwner, getUserBusinesses)

// GET /api/user/analytics - Get user analytics
router.get('/analytics', requireBusinessOwner, getUserAnalytics)

module.exports = router