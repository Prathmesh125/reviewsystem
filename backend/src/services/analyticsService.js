const { PrismaClient } = require('@prisma/client');
const { subDays, startOfDay, endOfDay, format } = require('date-fns');

const prisma = new PrismaClient();

class AnalyticsService {
  /**
   * Get comprehensive business analytics
   */
  async getBusinessAnalytics(businessId, dateRange = '7days') {
    const { startDate, endDate, previousStartDate, previousEndDate } = this.getDateRange(dateRange);

    try {
      // Get overview metrics
      const overview = await this.getOverviewMetrics(businessId, startDate, endDate, previousStartDate, previousEndDate);
      
      // Get chart data
      const charts = await this.getChartData(businessId, startDate, endDate);

      // For demo purposes, if we have no data, return sample data
      if (overview.totalReviews === 0 && overview.totalScans === 0) {
        return this.getSampleAnalyticsData(dateRange);
      }

      return {
        overview,
        charts,
        dateRange: {
          start: startDate,
          end: endDate,
          label: this.getDateRangeLabel(dateRange)
        }
      };
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Get overview metrics with trends
   */
  async getOverviewMetrics(businessId, startDate, endDate, previousStartDate, previousEndDate) {
    console.log('=== Analytics Overview Metrics Debug ===');
    console.log('Business ID:', businessId);
    console.log('Date Range:', startDate.toISOString(), 'to', endDate.toISOString());
    
    // Current period metrics
    const [
      totalReviews,
      averageRating,
      totalScans,
      totalCustomers
    ] = await Promise.all([
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
      prisma.qRScan.count({
        where: {
          qrCode: { businessId },
          scannedAt: { gte: startDate, lte: endDate }
        }
      }),
      prisma.customer.count({
        where: {
          businessId,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);

    console.log('Current Period Results:');
    console.log('Total Reviews:', totalReviews);
    console.log('Average Rating:', averageRating);
    console.log('Total Scans:', totalScans);
    console.log('Total Customers:', totalCustomers);

    // Previous period metrics for trend calculation
    const [
      previousReviews,
      previousRating,
      previousScans,
      previousCustomers
    ] = await Promise.all([
      prisma.review.count({
        where: {
          businessId,
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      }),
      prisma.review.aggregate({
        where: {
          businessId,
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        },
        _avg: { rating: true }
      }),
      prisma.qRScan.count({
        where: {
          qrCode: { businessId },
          scannedAt: { gte: previousStartDate, lte: previousEndDate }
        }
      }),
      prisma.customer.count({
        where: {
          businessId,
          createdAt: { gte: previousStartDate, lte: previousEndDate }
        }
      })
    ]);

    // Calculate trends
    const trends = {
      reviewsChange: this.calculatePercentageChange(totalReviews, previousReviews),
      ratingChange: this.calculatePercentageChange(
        averageRating._avg?.rating || 0,
        previousRating._avg?.rating || 0
      ),
      scansChange: this.calculatePercentageChange(totalScans, previousScans),
      customersChange: this.calculatePercentageChange(totalCustomers, previousCustomers)
    };

    const result = {
      totalReviews,
      averageRating: averageRating._avg?.rating || 0,
      totalScans,
      totalCustomers,
      trends
    };

    console.log('Final Overview Result:', result);
    console.log('=== End Analytics Debug ===');

    return result;
  }

  /**
   * Get chart data for visualizations
   */
  async getChartData(businessId, startDate, endDate) {
    // Reviews trend over time
    const reviewsTrend = await this.getReviewsTrend(businessId, startDate, endDate);
    
    // Rating distribution
    const ratingDistribution = await this.getRatingDistribution(businessId, startDate, endDate);
    
    // QR scan activity
    const scanActivity = await this.getScanActivity(businessId, startDate, endDate);
    
    // Customer growth
    const customerGrowth = await this.getCustomerGrowth(businessId, startDate, endDate);

    return {
      reviewsTrend,
      ratingDistribution,
      scanActivity,
      customerGrowth
    };
  }

  /**
   * Get reviews trend over time
   */
  async getReviewsTrend(businessId, startDate, endDate) {
    const reviews = await prisma.review.findMany({
      where: {
        businessId,
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        createdAt: true,
        rating: true
      }
    });

    // Group by day
    const dailyData = {};
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'MM/dd');
      dailyData[dateStr] = { date: dateStr, reviews: 0, rating: 0, totalRating: 0, count: 0 };
    }

    // Populate with actual data
    reviews.forEach(review => {
      const dateStr = format(new Date(review.createdAt), 'MM/dd');
      if (dailyData[dateStr]) {
        dailyData[dateStr].reviews += 1;
        dailyData[dateStr].totalRating += review.rating;
        dailyData[dateStr].count += 1;
      }
    });

    // Calculate average ratings
    return Object.values(dailyData).map(day => ({
      ...day,
      rating: day.count > 0 ? (day.totalRating / day.count).toFixed(1) : 0
    }));
  }

  /**
   * Get rating distribution
   */
  async getRatingDistribution(businessId, startDate, endDate) {
    const ratings = await prisma.review.groupBy({
      by: ['rating'],
      where: {
        businessId,
        createdAt: { gte: startDate, lte: endDate }
      },
      _count: {
        rating: true
      }
    });

    // Ensure all ratings 1-5 are represented
    const distribution = [];
    for (let i = 1; i <= 5; i++) {
      const found = ratings.find(r => r.rating === i);
      distribution.push({
        rating: `${i} Star${i !== 1 ? 's' : ''}`,
        count: found ? found._count.rating : 0
      });
    }

    return distribution;
  }

  /**
   * Get QR scan activity over time
   */
  async getScanActivity(businessId, startDate, endDate) {
    const scans = await prisma.qRScan.findMany({
      where: {
        qrCode: { businessId },
        scannedAt: { gte: startDate, lte: endDate }
      },
      select: {
        scannedAt: true
      }
    });

    // Group by day
    const dailyData = {};
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'MM/dd');
      dailyData[dateStr] = { date: dateStr, scans: 0 };
    }

    // Populate with actual data
    scans.forEach(scan => {
      const dateStr = format(new Date(scan.scannedAt), 'MM/dd');
      if (dailyData[dateStr]) {
        dailyData[dateStr].scans += 1;
      }
    });

    return Object.values(dailyData);
  }

  /**
   * Get customer growth over time
   */
  async getCustomerGrowth(businessId, startDate, endDate) {
    const customers = await prisma.customer.findMany({
      where: {
        businessId,
        createdAt: { gte: startDate, lte: endDate }
      },
      select: {
        createdAt: true
      }
    });

    // Group by day and calculate cumulative growth
    const dailyData = {};
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = format(date, 'MM/dd');
      dailyData[dateStr] = { date: dateStr, customers: 0 };
    }

    // Populate with actual data
    customers.forEach(customer => {
      const dateStr = format(new Date(customer.createdAt), 'MM/dd');
      if (dailyData[dateStr]) {
        dailyData[dateStr].customers += 1;
      }
    });

    // Convert to cumulative
    let cumulative = 0;
    return Object.values(dailyData).map(day => {
      cumulative += day.customers;
      return { ...day, customers: cumulative };
    });
  }

  /**
   * Export analytics data as CSV
   */
  async exportAnalyticsData(businessId, dateRange) {
    const analytics = await this.getBusinessAnalytics(businessId, dateRange);
    
    // Create CSV content
    let csv = 'Date,Reviews,Average Rating,QR Scans,New Customers\n';
    
    // Use reviews trend as the base since it has the most comprehensive data
    analytics.charts.reviewsTrend.forEach((day, index) => {
      const scanData = analytics.charts.scanActivity[index] || { scans: 0 };
      const customerData = analytics.charts.customerGrowth[index] || { customers: 0 };
      
      csv += `${day.date},${day.reviews},${day.rating},${scanData.scans},${customerData.customers}\n`;
    });
    
    return csv;
  }

  /**
   * Get date range based on period
   */
  getDateRange(period) {
    const endDate = endOfDay(new Date());
    let startDate;
    let previousEndDate;
    let previousStartDate;

    switch (period) {
      case '7days':
        startDate = startOfDay(subDays(endDate, 6));
        previousEndDate = startOfDay(subDays(startDate, 1));
        previousStartDate = startOfDay(subDays(previousEndDate, 6));
        break;
      case '30days':
        startDate = startOfDay(subDays(endDate, 29));
        previousEndDate = startOfDay(subDays(startDate, 1));
        previousStartDate = startOfDay(subDays(previousEndDate, 29));
        break;
      case '90days':
        startDate = startOfDay(subDays(endDate, 89));
        previousEndDate = startOfDay(subDays(startDate, 1));
        previousStartDate = startOfDay(subDays(previousEndDate, 89));
        break;
      case '1year':
        startDate = startOfDay(subDays(endDate, 364));
        previousEndDate = startOfDay(subDays(startDate, 1));
        previousStartDate = startOfDay(subDays(previousEndDate, 364));
        break;
      default:
        startDate = startOfDay(subDays(endDate, 6));
        previousEndDate = startOfDay(subDays(startDate, 1));
        previousStartDate = startOfDay(subDays(previousEndDate, 6));
    }

    return { startDate, endDate, previousStartDate, previousEndDate };
  }

  /**
   * Get human-readable date range label
   */
  getDateRangeLabel(period) {
    const labels = {
      '7days': 'Last 7 Days',
      '30days': 'Last 30 Days',
      '90days': 'Last 90 Days',
      '1year': 'Last Year'
    };
    return labels[period] || 'Last 7 Days';
  }

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(current, previous) {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  }

  /**
   * Generate sample analytics data for demo purposes
   */
  getSampleAnalyticsData(dateRange) {
    const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : dateRange === '90days' ? 90 : 365;
    
    // Sample overview data
    const overview = {
      totalReviews: Math.floor(Math.random() * 100) + 20,
      averageRating: 4.2 + Math.random() * 0.6,
      totalScans: Math.floor(Math.random() * 500) + 100,
      totalCustomers: Math.floor(Math.random() * 80) + 15,
      trends: {
        reviewsChange: (Math.random() - 0.5) * 40,
        ratingChange: (Math.random() - 0.5) * 10,
        scansChange: (Math.random() - 0.5) * 60,
        customersChange: (Math.random() - 0.5) * 30
      }
    };

    // Sample chart data
    const charts = {
      reviewsTrend: this.generateSampleTrendData(days, 'reviews'),
      ratingDistribution: [
        { rating: '1 Star', count: Math.floor(Math.random() * 5) },
        { rating: '2 Stars', count: Math.floor(Math.random() * 8) },
        { rating: '3 Stars', count: Math.floor(Math.random() * 15) + 5 },
        { rating: '4 Stars', count: Math.floor(Math.random() * 25) + 15 },
        { rating: '5 Stars', count: Math.floor(Math.random() * 30) + 25 }
      ],
      scanActivity: this.generateSampleTrendData(days, 'scans'),
      customerGrowth: this.generateSampleCumulativeData(days)
    };

    return {
      overview,
      charts,
      dateRange: {
        start: new Date(),
        end: new Date(),
        label: this.getDateRangeLabel(dateRange)
      }
    };
  }

  /**
   * Generate sample trend data
   */
  generateSampleTrendData(days, type) {
    const data = [];
    let baseValue = type === 'reviews' ? 5 : type === 'scans' ? 20 : 10;
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = format(date, 'MM/dd');
      
      const value = Math.max(0, baseValue + Math.floor((Math.random() - 0.5) * baseValue));
      
      if (type === 'reviews') {
        data.push({
          date: dateStr,
          reviews: value,
          rating: (4.0 + Math.random() * 1.0).toFixed(1)
        });
      } else {
        data.push({
          date: dateStr,
          [type]: value
        });
      }
    }
    
    return data;
  }

  /**
   * Generate sample cumulative data
   */
  generateSampleCumulativeData(days) {
    const data = [];
    let cumulative = 0;
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = format(date, 'MM/dd');
      
      const newCustomers = Math.floor(Math.random() * 5) + 1;
      cumulative += newCustomers;
      
      data.push({
        date: dateStr,
        customers: cumulative
      });
    }
    
    return data;
  }
}

module.exports = new AnalyticsService();