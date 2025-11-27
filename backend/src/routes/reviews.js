const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all reviews for a business
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        customer: {
          businessId: req.user.businessId
        }
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get specific review
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const review = await prisma.review.findFirst({
      where: {
        id: parseInt(req.params.id),
        customer: {
          businessId: req.user.businessId
        }
      },
      include: {
        customer: true
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// Public review submission (for review forms)
router.post('/public', async (req, res) => {
  try {
    const { customerId, businessId, rating, feedback, formData } = req.body;

    if (!customerId || !businessId || !rating) {
      return res.status(400).json({ error: 'Customer ID, business ID, and rating are required' });
    }

    // Verify customer exists and belongs to the business
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        businessId: businessId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const review = await prisma.review.create({
      data: {
        customerId: customerId,
        businessId: businessId,
        rating: parseInt(rating),
        feedback: feedback || '',
        formData: typeof formData === 'string' ? formData : JSON.stringify(formData || {})
      },
      include: {
        customer: true
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating public review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Create a new review
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { customerId, rating, feedback, formData } = req.body;

    if (!customerId || !rating) {
      return res.status(400).json({ error: 'Customer ID and rating are required' });
    }

    // Verify customer belongs to this business
    const customer = await prisma.customer.findFirst({
      where: {
        id: parseInt(customerId),
        businessId: req.user.businessId
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const review = await prisma.review.create({
      data: {
        customerId: parseInt(customerId),
        rating: parseInt(rating),
        feedback,
        formData: formData || {}
      },
      include: {
        customer: true
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review status
router.put('/:reviewId/status', verifyFirebaseToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, generatedReview } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'AI_GENERATED', 'APPROVED', 'PUBLISHED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      });
    }

    // Verify review belongs to user's business
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        customer: {
          businessId: req.user.businessId
        }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update review
    const updateData = { status };
    if (generatedReview && status === 'AI_GENERATED') {
      updateData.generatedReview = generatedReview;
      updateData.submissionStep = 'PROCESSING';
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        customer: true,
        business: true
      }
    });

    res.json(updatedReview);

  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({ error: 'Failed to update review status' });
  }
});

// Delete review
router.delete('/:reviewId', verifyFirebaseToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Verify review belongs to user's business
    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        customer: {
          businessId: req.user.businessId
        }
      }
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get review analytics for business
router.get('/business/:businessId/analytics', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessId } = req.params;

    // Verify business ownership  
    if (parseInt(businessId) !== req.user.businessId) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    // Get review statistics
    const totalReviews = await prisma.review.count({
      where: { 
        customer: {
          businessId: parseInt(businessId)
        }
      }
    });

    const avgRating = await prisma.review.aggregate({
      where: { 
        customer: {
          businessId: parseInt(businessId)
        }
      },
      _avg: { rating: true }
    });

    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { 
        customer: {
          businessId: parseInt(businessId)
        }
      },
      _count: true
    });

    const statusDistribution = await prisma.review.groupBy({
      by: ['status'],
      where: { 
        customer: {
          businessId: parseInt(businessId)
        }
      },
      _count: true
    });

    // Get recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReviews = await prisma.review.count({
      where: {
        customer: {
          businessId: parseInt(businessId)
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    res.json({
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
      recentReviews,
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[`rating_${item.rating}`] = item._count;
        return acc;
      }, {}),
      statusDistribution: statusDistribution.reduce((acc, item) => {
        acc[item.status.toLowerCase()] = item._count;
        return acc;
      }, {})
    });

  } catch (error) {
    console.error('Error fetching review analytics:', error);
    res.status(500).json({ error: 'Failed to fetch review analytics' });
  }
});

module.exports = router;