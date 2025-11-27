const { PrismaClient } = require('@prisma/client');
const { subDays, startOfDay, endOfDay } = require('date-fns');

const prisma = new PrismaClient();

async function debugAnalytics() {
  try {
    const businessId = 'cmg5h2ny30005rcbnjtyzugdx';
    const range = '7days';
    
    console.log('=== Debug Analytics Query ===');
    console.log('Business ID:', businessId);
    console.log('Range:', range);
    
    // Calculate date range (same logic as analytics service)
    const now = new Date();
    const daysToSubtract = range === '7days' ? 7 : range === '30days' ? 30 : range === '90days' ? 90 : 365;
    const startDate = startOfDay(subDays(now, daysToSubtract));
    const endDate = endOfDay(now);
    
    console.log('Date Range:');
    console.log('Start Date:', startDate.toISOString());
    console.log('End Date:', endDate.toISOString());
    console.log('Current Date:', now.toISOString());
    
    // Check reviews in date range
    console.log('\n=== Reviews in Date Range ===');
    const reviewsInRange = await prisma.review.findMany({
      where: {
        businessId,
        createdAt: { gte: startDate, lte: endDate }
      },
      select: { id: true, rating: true, createdAt: true }
    });
    console.log(`Reviews in range: ${reviewsInRange.length}`);
    
    if (reviewsInRange.length > 0) {
      console.log('Sample review in range:', reviewsInRange[0]);
    }
    
    // Check all reviews with dates
    console.log('\n=== All Reviews with Dates ===');
    const allReviews = await prisma.review.findMany({
      where: { businessId },
      select: { id: true, rating: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    allReviews.forEach((review, index) => {
      console.log(`Review ${index + 1}:`, {
        date: review.createdAt.toISOString(),
        rating: review.rating,
        inRange: review.createdAt >= startDate && review.createdAt <= endDate
      });
    });
    
    // Test actual analytics query
    console.log('\n=== Testing Analytics Query ===');
    const [reviewCount, avgRating, customerCount] = await Promise.all([
      prisma.review.count({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.review.aggregate({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate }
        },
        _avg: { rating: true }
      }),
      prisma.customer.count({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);
    
    console.log('Analytics Results:');
    console.log('Review Count:', reviewCount);
    console.log('Average Rating:', avgRating._avg.rating);
    console.log('Customer Count:', customerCount);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAnalytics();