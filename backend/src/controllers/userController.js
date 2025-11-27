const { PrismaClient } = require('@prisma/client')
const { generateUserResponse } = require('../utils/auth')

const prisma = new PrismaClient()

// Get user dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id

    // Get user's businesses
    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        customers: true,
        reviews: true,
        qrCodes: true
      }
    })

    // Calculate metrics
    const totalBusinesses = businesses.length
    const totalCustomers = businesses.reduce((sum, business) => sum + business.customers.length, 0)
    const totalReviews = businesses.reduce((sum, business) => sum + business.reviews.length, 0)
    const totalQRCodes = businesses.reduce((sum, business) => sum + business.qrCodes.length, 0)

    // Calculate average rating
    const allReviews = businesses.flatMap(business => business.reviews)
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
      : 0

    // Get recent activity (last 10 customers)
    const recentCustomers = await prisma.customer.findMany({
      where: {
        business: {
          userId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        business: {
          select: { name: true }
        }
      }
    })

    // Get recent reviews (last 10)
    const recentReviews = await prisma.review.findMany({
      where: {
        business: {
          userId
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        customer: {
          select: { name: true }
        },
        business: {
          select: { name: true }
        }
      }
    })

    res.json({
      success: true,
      metrics: {
        totalBusinesses,
        totalCustomers,
        totalReviews,
        totalQRCodes,
        avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        conversionRate: totalCustomers > 0 ? Math.round((totalReviews / totalCustomers) * 100) : 0
      },
      recentActivity: {
        customers: recentCustomers,
        reviews: recentReviews
      }
    })

  } catch (error) {
    console.error('Dashboard metrics error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard metrics'
    })
  }
}

// Get user's businesses
const getUserBusinesses = async (req, res) => {
  try {
    const userId = req.user.id

    const businesses = await prisma.business.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            customers: true,
            reviews: true,
            qrCodes: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      businesses
    })

  } catch (error) {
    console.error('Get businesses error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get businesses'
    })
  }
}

// Get user analytics
const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.id
    const { dateRange = '30d' } = req.query

    // Calculate date range
    const now = new Date()
    let startDate
    
    switch (dateRange) {
      case '7d':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))
        break
      case '30d':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
        break
      case '90d':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000))
        break
      case '1y':
        startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000))
        break
      default:
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000))
    }

    // Get reviews by date
    const reviewsByDate = await prisma.review.groupBy({
      by: ['createdAt'],
      where: {
        business: { userId },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get customers by date
    const customersByDate = await prisma.customer.groupBy({
      by: ['createdAt'],
      where: {
        business: { userId },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Get rating distribution
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        business: { userId },
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        rating: true
      },
      orderBy: {
        rating: 'asc'
      }
    })

    res.json({
      success: true,
      analytics: {
        dateRange,
        reviewsByDate,
        customersByDate,
        ratingDistribution
      }
    })

  } catch (error) {
    console.error('User analytics error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user analytics'
    })
  }
}

module.exports = {
  getDashboardMetrics,
  getUserBusinesses,
  getUserAnalytics
}