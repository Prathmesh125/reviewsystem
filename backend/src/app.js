require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  }
}))

// Compression middleware
app.use(compression())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL
    : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(globalLimiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'))
} else {
  app.use(morgan('dev'))
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime()
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    })
  }
})

// Import routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const firebaseRoutes = require('./routes/firebaseRoutes')
const businessRoutes = require('./routes/businessRoutes')
const customerRoutes = require('./routes/customers')
const reviewRoutes = require('./routes/reviews')
const formTemplateRoutes = require('./routes/formTemplates')
const qrCodeRoutes = require('./routes/qrCodes')
const aiRoutes = require('./routes/ai')
const analyticsRoutes = require('./routes/analytics')
const advancedAnalyticsRoutes = require('./routes/advancedAnalytics')
const superAdminRoutes = require('./routes/superAdmin')
const subscriptionRoutes = require('./routes/subscription')
const emailRoutes = require('./routes/email')

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/firebase', firebaseRoutes)
app.use('/api/business', businessRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/form-templates', formTemplateRoutes)
app.use('/api/qr-codes', qrCodeRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/advanced-analytics', advancedAnalyticsRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/email', emailRoutes)

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'QR Code Review Generation System API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      user: '/api/user',
      firebase: '/api/firebase',
      business: '/api/business',
      customers: '/api/customers',
      reviews: '/api/reviews',
      formTemplates: '/api/form-templates',
      qrCodes: '/api/qr-codes',
      analytics: '/api/analytics',
      ai: '/api/ai',
      superAdmin: '/api/super-admin'
    },
    authentication: {
      type: 'JWT Bearer Token',
      endpoints: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        profile: 'GET /api/auth/profile',
        verify: 'GET /api/auth/verify'
      }
    },
    newEndpoints: {
      customers: {
        'GET /api/customers/business/:businessId': 'Get customers for business',
        'POST /api/customers': 'Create customer (public)',
        'GET /api/customers/:customerId': 'Get customer details',
        'PUT /api/customers/:customerId': 'Update customer',
        'DELETE /api/customers/:customerId': 'Delete customer',
        'GET /api/customers/business/:businessId/export': 'Export customer data'
      },
      reviews: {
        'GET /api/reviews/business/:businessId': 'Get reviews for business',
        'POST /api/reviews': 'Submit review (public)',
        'GET /api/reviews/:reviewId': 'Get review details',
        'PUT /api/reviews/:reviewId/status': 'Update review status',
        'DELETE /api/reviews/:reviewId': 'Delete review',
        'GET /api/reviews/business/:businessId/analytics': 'Get review analytics'
      },
      formTemplates: {
        'GET /api/form-templates/business/:businessId': 'Get form templates',
        'GET /api/form-templates/public/:businessId': 'Get public form (for customers)',
        'POST /api/form-templates': 'Create form template',
        'GET /api/form-templates/:templateId': 'Get form template',
        'PUT /api/form-templates/:templateId': 'Update form template',
        'PUT /api/form-templates/:templateId/activate': 'Set active form template',
        'DELETE /api/form-templates/:templateId': 'Delete form template'
      },
      qrCodes: {
        'GET /api/qr-codes': 'Get QR codes for business',
        'POST /api/qr-codes': 'Create new QR code',
        'GET /api/qr-codes/:id': 'Get QR code details',
        'PUT /api/qr-codes/:id': 'Update QR code',
        'DELETE /api/qr-codes/:id': 'Delete QR code',
        'POST /api/qr-codes/:id/track-scan': 'Track QR code scan (public)',
        'GET /api/qr-codes/:id/analytics': 'Get QR code analytics',
        'GET /api/qr-codes/:id/download': 'Download QR code image'
      }
    }
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error)

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  } else {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 API info: http://localhost:${PORT}/api`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app