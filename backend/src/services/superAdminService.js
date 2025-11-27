const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, subDays, format } = require('date-fns');

const prisma = new PrismaClient();

// SuperAdminService - All methods are static
class SuperAdminService {
  // Get platform-wide dashboard statistics
  static async getDashboardStats() {
    try {
      console.log('�� Starting getDashboardStats...');
      
      // Get basic counts
      const totalUsers = await prisma.user.count();
      const totalBusinesses = await prisma.business.count();
      const totalReviews = await prisma.review.count();
      const totalCustomers = await prisma.customer.count();
      const totalQRCodes = await prisma.qRCode.count();

      console.log('✅ Dashboard stats:', { totalUsers, totalBusinesses, totalReviews });

      return {
        overview: {
          totalUsers,
          totalBusinesses,
          totalReviews,
          totalCustomers,
          totalQRCodes
        },
        growth: {
          users: 10,
          businesses: 5,
          reviews: 15
        },
        recentActivity: {
          newUsersThisMonth: totalUsers,
          newBusinessesThisMonth: totalBusinesses,
          reviewsThisWeek: totalReviews
        }
      };
    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      return {
        overview: {
          totalUsers: 0,
          totalBusinesses: 0,
          totalReviews: 0,
          totalCustomers: 0,
          totalQRCodes: 0
        },
        growth: {
          users: 0,
          businesses: 0,
          reviews: 0
        },
        recentActivity: {
          newUsersThisMonth: 0,
          newBusinessesThisMonth: 0,
          reviewsThisWeek: 0
        }
      };
    }
  }

  // Get all users with pagination
  static async getAllUsers(page = 1, limit = 20, search = '') {
    try {
      console.log('🔍 Starting getAllUsers with page:', page, 'limit:', limit, 'search:', search);
      // Updated for testing - 2024-10-02
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            businesses: {
              select: {
                id: true,
                name: true,
                isPublished: true
              }
            },
            _count: {
              select: {
                businesses: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      console.log('✅ Found users:', users.length, 'total:', total);
      
      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting users:', error);
      throw error;
    }
  }

  // Get all businesses with pagination
  static async getAllBusinesses(page = 1, limit = 20, search = '') {
    try {
      console.log('🔍 Starting getAllBusinesses with page:', page, 'limit:', limit, 'search:', search);
      const skip = (page - 1) * limit;
      
      const where = search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { type: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [businesses, total] = await Promise.all([
        prisma.business.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            },
            _count: {
              select: {
                reviews: true,
                customers: true,
                qrCodes: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.business.count({ where })
      ]);

      console.log('✅ Found businesses:', businesses.length, 'total:', total);

      return {
        businesses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting businesses:', error);
      throw error;
    }
  }

  // Get all reviews with moderation capabilities
  static async getAllReviews(page = 1, limit = 20, status = 'all') {
    try {
      console.log('🔍 Starting getAllReviews with page:', page, 'limit:', limit, 'status:', status);
      const skip = (page - 1) * limit;
      
      const where = status !== 'all' ? {
        status: status.toUpperCase()
      } : {};

      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          skip,
          take: limit,
          include: {
            business: {
              select: {
                name: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            },
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.review.count({ where })
      ]);

      console.log('✅ Found reviews:', reviews.length, 'total:', total);

      return {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting reviews:', error);
      throw error;
    }
  }

  // Get platform analytics
  static async getPlatformAnalytics(range = '30days') {
    try {
      console.log('🔍 Starting getPlatformAnalytics with range:', range);
      
      // For now, return basic analytics
      const totalUsers = await prisma.user.count();
      const totalBusinesses = await prisma.business.count();
      const totalReviews = await prisma.review.count();

      // Generate mock daily stats for chart
      const days = range === '7days' ? 7 : range === '30days' ? 30 : 90;
      const dailyStats = [];
      
      for (let i = 0; i < days; i++) {
        const date = subDays(new Date(), days - 1 - i);
        dailyStats.push({
          date: format(date, 'MMM dd'),
          users: Math.floor(Math.random() * 10),
          businesses: Math.floor(Math.random() * 5),
          reviews: Math.floor(Math.random() * 20)
        });
      }

      console.log('✅ Analytics result generated successfully');

      return {
        dailyStats,
        summary: {
          totalUsers,
          totalBusinesses,
          totalReviews,
          avgRating: 4.2
        },
        topBusinesses: [
          { id: 1, name: 'Sample Business', reviewCount: 10, avgRating: 4.5 }
        ]
      };
    } catch (error) {
      console.error('❌ Error getting platform analytics:', error);
      throw error;
    }
  }

  // Other methods...
  static async toggleUserStatus(userId, isActive) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive }
      });
      return user;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      console.log('🗑️ Starting deleteUser for userId:', userId);
      
      // First, check if user has any businesses
      const userWithBusinesses = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          businesses: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!userWithBusinesses) {
        throw new Error('User not found');
      }

      // Delete all businesses owned by this user (which will cascade delete related data)
      if (userWithBusinesses.businesses.length > 0) {
        console.log(`🏢 Deleting ${userWithBusinesses.businesses.length} businesses for user ${userId}`);
        
        for (const business of userWithBusinesses.businesses) {
          // Delete all related data for each business
          await prisma.review.deleteMany({ where: { businessId: business.id } });
          await prisma.qrCode.deleteMany({ where: { businessId: business.id } });
          await prisma.customer.deleteMany({ where: { businessId: business.id } });
          await prisma.formTemplate.deleteMany({ where: { businessId: business.id } });
          await prisma.qrScan.deleteMany({ where: { businessId: business.id } });
          await prisma.aiGeneration.deleteMany({ where: { businessId: business.id } });
          
          // Delete the business itself
          await prisma.business.delete({ where: { id: business.id } });
        }
      }

      // Now delete the user
      const deletedUser = await prisma.user.delete({
        where: { id: userId }
      });

      console.log('✅ User deleted successfully:', userId);
      return deletedUser;
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw error;
    }
  }

  static async deleteBusiness(businessId) {
    try {
      console.log('🗑️ Starting deleteBusiness for businessId:', businessId);
      
      // First, check if business exists
      const business = await prisma.business.findUnique({
        where: { id: businessId },
        select: {
          id: true,
          name: true,
          userId: true
        }
      });

      if (!business) {
        throw new Error('Business not found');
      }

      console.log(`🏢 Deleting business: ${business.name} (${businessId})`);

      // Delete all related data in the correct order to respect foreign key constraints
      // First, delete AI review generations through reviews
      const reviews = await prisma.review.findMany({
        where: { businessId },
        select: { id: true }
      });

      if (reviews.length > 0) {
        const reviewIds = reviews.map(r => r.id);
        await prisma.aIReviewGeneration.deleteMany({ 
          where: { reviewId: { in: reviewIds } }
        });
      }
      
      // Delete reviews
      await prisma.review.deleteMany({ where: { businessId } });
      
      // Delete QR scans (through QR codes relationship)
      const qrCodes = await prisma.qRCode.findMany({
        where: { businessId },
        select: { id: true }
      });
      
      if (qrCodes.length > 0) {
        const qrCodeIds = qrCodes.map(qr => qr.id);
        await prisma.qRScan.deleteMany({ 
          where: { qrCodeId: { in: qrCodeIds } }
        });
      }
      
      // Delete QR codes
      await prisma.qRCode.deleteMany({ where: { businessId } });
      
      // Delete customers
      await prisma.customer.deleteMany({ where: { businessId } });
      
      // Delete form templates
      await prisma.formTemplate.deleteMany({ where: { businessId } });
      
      // Delete AI prompt templates (if they have businessId)
      await prisma.aIPromptTemplate.deleteMany({ where: { businessId } });
      
      // Delete AI usage analytics (if they have businessId)
      await prisma.aIUsageAnalytics.deleteMany({ where: { businessId } });

      // Finally delete the business itself
      const deletedBusiness = await prisma.business.delete({ 
        where: { id: businessId } 
      });

      console.log('✅ Business deleted successfully:', businessId);
      return deletedBusiness;
    } catch (error) {
      console.error('❌ Error deleting business:', error);
      throw error;
    }
  }

  static async moderateReview(reviewId, status, moderatorNotes = '') {
    try {
      const review = await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: status.toUpperCase()
        }
      });
      return review;
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  static async getSystemHealth() {
    try {
      console.log('🏥 Getting system health...');
      
      // Database connectivity check
      const dbStatus = await this.checkDatabaseHealth();
      
      // Get system metrics
      const metrics = await this.getSystemMetrics();
      
      // Check recent errors (you could implement error logging)
      const errorRate = await this.calculateErrorRate();
      
      // Check performance metrics
      const performanceMetrics = await this.getPerformanceMetrics();
      
      const health = {
        status: 'healthy',
        database: dbStatus,
        metrics,
        errorRate,
        performance: performanceMetrics,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
      
      console.log('✅ System health retrieved');
      return health;
    } catch (error) {
      console.error('❌ Error getting system health:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  static async checkDatabaseHealth() {
    try {
      // Simple database connectivity test
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'connected',
        responseTime: Date.now() // Simplified
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message
      };
    }
  }

  static async getSystemMetrics() {
    try {
      const today = new Date();
      const yesterday = subDays(today, 1);
      
      // Get daily metrics
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const yesterdayStart = startOfDay(yesterday);
      const yesterdayEnd = endOfDay(yesterday);
      
      const [
        todayUsers,
        yesterdayUsers,
        todayBusinesses,
        yesterdayBusinesses,
        todayReviews,
        yesterdayReviews
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
        prisma.user.count({ where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } } }),
        prisma.business.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
        prisma.business.count({ where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } } }),
        prisma.review.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
        prisma.review.count({ where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } } })
      ]);
      
      return {
        daily: {
          newUsers: { today: todayUsers, yesterday: yesterdayUsers },
          newBusinesses: { today: todayBusinesses, yesterday: yesterdayBusinesses },
          newReviews: { today: todayReviews, yesterday: yesterdayReviews }
        }
      };
    } catch (error) {
      console.error('Error getting system metrics:', error);
      return { daily: null };
    }
  }

  static async calculateErrorRate() {
    // Simplified error rate calculation
    // In a real app, you'd track errors in a separate table
    return {
      rate: 0.01, // 1% error rate
      total: 0,
      period: '24h'
    };
  }

  static async getPerformanceMetrics() {
    return {
      avgResponseTime: 150, // ms
      memory: {
        used: process.memoryUsage().heapUsed / 1024 / 1024,
        total: process.memoryUsage().heapTotal / 1024 / 1024
      },
      cpu: process.cpuUsage()
    };
  }

  static async updateBusinessStatus(businessId, isApproved, notes = '') {
    try {
      console.log(`📝 Updating business status: ${businessId} -> ${isApproved ? 'approved' : 'suspended'}`);
      
      const business = await prisma.business.update({
        where: { id: businessId },
        data: {
          isPublished: isApproved
          // In a real app, you might have an approval status field
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      console.log('✅ Business status updated successfully');
      return business;
    } catch (error) {
      console.error('❌ Error updating business status:', error);
      throw error;
    }
  }

  static async resetUserPassword(userId) {
    try {
      console.log(`🔑 Resetting password for user: ${userId}`);
      
      // In a real app, you would:
      // 1. Generate a secure temporary password
      // 2. Hash it
      // 3. Send email to user
      // 4. Update the database
      
      // For demo purposes, we'll just return a success message
      const tempPassword = Math.random().toString(36).slice(-8);
      
      console.log('✅ Password reset initiated');
      return {
        message: 'Password reset email sent',
        tempPassword: tempPassword // Don't do this in production!
      };
    } catch (error) {
      console.error('❌ Error resetting user password:', error);
      throw error;
    }
  }

  static async getAuditLogs(page = 1, limit = 20, action = '', userId = '') {
    try {
      console.log(`📋 Getting audit logs - page: ${page}, limit: ${limit}`);
      
      // In a real app, you'd have an audit_logs table
      // For demo purposes, we'll return mock data
      const mockLogs = [
        {
          id: '1',
          action: 'USER_LOGIN',
          userId: 'user1',
          details: 'User logged in successfully',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date()
        },
        {
          id: '2',
          action: 'BUSINESS_CREATED',
          userId: 'user2',
          details: 'New business "Coffee Shop" created',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date()
        }
      ];
      
      const filteredLogs = mockLogs.filter(log => {
        if (action && !log.action.includes(action.toUpperCase())) return false;
        if (userId && log.userId !== userId) return false;
        return true;
      });
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
      
      console.log('✅ Audit logs retrieved');
      return {
        logs: paginatedLogs,
        pagination: {
          total: filteredLogs.length,
          page,
          limit,
          totalPages: Math.ceil(filteredLogs.length / limit)
        }
      };
    } catch (error) {
      console.error('❌ Error getting audit logs:', error);
      throw error;
    }
  }

  // ==============================================
  // HIERARCHICAL NAVIGATION METHODS
  // ==============================================

  // Get all businesses for a specific user
  static async getUserBusinesses(userId) {
    try {
      console.log(`📊 Getting businesses for user: ${userId}`);

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
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`✅ Found ${businesses.length} businesses for user ${userId}`);
      return businesses;
    } catch (error) {
      console.error('❌ Error getting user businesses:', error);
      throw error;
    }
  }

  // Get all customers for a specific business
  static async getBusinessCustomers(businessId) {
    try {
      console.log(`📊 Getting customers for business: ${businessId}`);

      const customers = await prisma.customer.findMany({
        where: { businessId },
        include: {
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`✅ Found ${customers.length} customers for business ${businessId}`);
      return customers;
    } catch (error) {
      console.error('❌ Error getting business customers:', error);
      throw error;
    }
  }

  // Get all reviews for a specific business
  static async getBusinessReviews(businessId, page = 1, limit = 50) {
    try {
      console.log(`📊 Getting reviews for business: ${businessId}, page: ${page}, limit: ${limit}`);

      const skip = (page - 1) * limit;

      const [reviews, totalCount] = await Promise.all([
        prisma.review.findMany({
          where: { businessId },
          include: {
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.review.count({
          where: { businessId }
        })
      ]);

      console.log(`✅ Found ${reviews.length} reviews for business ${businessId}`);
      return reviews;
    } catch (error) {
      console.error('❌ Error getting business reviews:', error);
      throw error;
    }
  }

  // Get detailed analytics for a specific business
  static async getBusinessAnalytics(businessId, range = '30days') {
    try {
      console.log(`📊 Getting analytics for business: ${businessId}, range: ${range}`);

      const rangeMap = {
        '7days': 7,
        '30days': 30,
        '90days': 90,
        '1year': 365
      };

      const days = rangeMap[range] || 30;
      const startDate = subDays(new Date(), days);

      // Get basic metrics
      const [
        totalCustomers,
        totalReviews,
        recentReviews,
        averageRating,
        qrCodeScans
      ] = await Promise.all([
        prisma.customer.count({ where: { businessId } }),
        prisma.review.count({ where: { businessId } }),
        prisma.review.count({
          where: {
            businessId,
            createdAt: {
              gte: startDate
            }
          }
        }),
        prisma.review.aggregate({
          where: { businessId },
          _avg: {
            rating: true
          }
        }),
        prisma.qRScan.count({
          where: {
            qrCode: {
              businessId
            },
            scannedAt: {
              gte: startDate
            }
          }
        })
      ]);

      // Get rating distribution
      const ratingDistribution = await prisma.review.groupBy({
        by: ['rating'],
        where: { businessId },
        _count: {
          rating: true
        }
      });

      // Get daily metrics for the period
      const dailyMetrics = [];
      for (let i = days; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const [reviews, customers, scans] = await Promise.all([
          prisma.review.count({
            where: {
              businessId,
              createdAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          }),
          prisma.customer.count({
            where: {
              businessId,
              createdAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          }),
          prisma.qRScan.count({
            where: {
              qrCode: {
                businessId
              },
              scannedAt: {
                gte: dayStart,
                lte: dayEnd
              }
            }
          })
        ]);

        dailyMetrics.push({
          date: format(date, 'yyyy-MM-dd'),
          reviews,
          customers,
          qrScans: scans
        });
      }

      const analytics = {
        summary: {
          totalCustomers,
          totalReviews,
          recentReviews,
          averageRating: averageRating._avg.rating || 0,
          qrCodeScans
        },
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[`${item.rating}star`] = item._count.rating;
          return acc;
        }, {}),
        dailyMetrics,
        trends: {
          reviewGrowth: calculateGrowthRate(recentReviews, totalReviews),
          customerGrowth: calculateGrowthRate(totalCustomers, totalCustomers)
        }
      };

      console.log(`✅ Generated analytics for business ${businessId}`);
      return analytics;
    } catch (error) {
      console.error('❌ Error getting business analytics:', error);
      throw error;
    }
  }

  // Get user activity logs
  static async getUserActivityLogs(userId, page = 1, limit = 20) {
    try {
      console.log(`📊 Getting activity logs for user: ${userId}`);

      const skip = (page - 1) * limit;

      // For now, we'll get business-related activities
      // In a full implementation, you'd have a dedicated audit_logs table
      const [businesses, reviews] = await Promise.all([
        prisma.business.findMany({
          where: { userId },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: Math.floor(limit / 2)
        }),
        prisma.review.findMany({
          where: {
            business: { userId }
          },
          select: {
            id: true,
            createdAt: true,
            customerName: true,
            rating: true,
            business: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Math.floor(limit / 2)
        })
      ]);

      // Combine and format activities
      const activities = [
        ...businesses.map(business => ({
          id: `business-${business.id}`,
          action: 'BUSINESS_UPDATED',
          details: `Updated business: ${business.name}`,
          timestamp: business.updatedAt,
          entityType: 'business',
          entityId: business.id
        })),
        ...reviews.map(review => ({
          id: `review-${review.id}`,
          action: 'REVIEW_RECEIVED',
          details: `Received ${review.rating}-star review for ${review.business.name}`,
          timestamp: review.createdAt,
          entityType: 'review',
          entityId: review.id
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log(`✅ Found ${activities.length} activities for user ${userId}`);
      return {
        activities: activities.slice(0, limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(activities.length / limit),
          totalCount: activities.length
        }
      };
    } catch (error) {
      console.error('❌ Error getting user activity logs:', error);
      throw error;
    }
  }

  // Export business data in various formats
  static async exportBusinessData(businessId, format = 'csv') {
    try {
      console.log(`📊 Exporting business data: ${businessId}, format: ${format}`);

      // Get comprehensive business data
      const [business, customers, reviews] = await Promise.all([
        prisma.business.findUnique({
          where: { id: businessId },
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }),
        prisma.customer.findMany({
          where: { businessId },
          include: {
            _count: {
              select: { reviews: true }
            }
          }
        }),
        prisma.review.findMany({
          where: { businessId },
          include: {
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        })
      ]);

      if (!business) {
        throw new Error('Business not found');
      }

      const data = {
        business: {
          id: business.id,
          name: business.name,
          type: business.type,
          owner: business.user?.email,
          createdAt: business.createdAt,
          isPublished: business.isPublished
        },
        customers: customers.map(customer => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          reviewCount: customer._count.reviews,
          createdAt: customer.createdAt
        })),
        reviews: reviews.map(review => ({
          id: review.id,
          customerName: review.customer?.name || review.customerName,
          customerEmail: review.customer?.email || review.customerEmail,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          status: review.status,
          createdAt: review.createdAt
        }))
      };

      if (format === 'json') {
        return JSON.stringify(data, null, 2);
      } else if (format === 'csv') {
        // Simple CSV generation (in production, use a proper CSV library)
        let csv = 'Type,ID,Name,Email,Rating,Comment,Date\n';
        
        data.customers.forEach(customer => {
          csv += `Customer,${customer.id},"${customer.name}","${customer.email}",,"",${customer.createdAt}\n`;
        });
        
        data.reviews.forEach(review => {
          csv += `Review,${review.id},"${review.customerName}","${review.customerEmail}",${review.rating},"${review.comment?.replace(/"/g, '""') || ''}",${review.createdAt}\n`;
        });
        
        return csv;
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('❌ Error exporting business data:', error);
      throw error;
    }
  }

  // ==============================================
  // ADVANCED MONITORING METHODS
  // ==============================================

  // Get real-time system statistics
  static async getRealTimeStats() {
    try {
      console.log('📊 Getting real-time statistics');

      const [
        activeUsers,
        onlineBusinesses,
        recentReviews,
        systemLoad
      ] = await Promise.all([
        // Active users in last 15 minutes (approximate)
        prisma.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 15 * 60 * 1000)
            }
          }
        }),
        // Businesses with recent activity
        prisma.business.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
            }
          }
        }),
        // Reviews in the last hour
        prisma.review.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 60 * 60 * 1000)
            }
          }
        }),
        // Mock system load (in a real system, you'd get this from system monitoring)
        Promise.resolve(Math.floor(Math.random() * 100))
      ]);

      console.log('✅ Real-time stats retrieved');
      return {
        activeUsers,
        onlineBusinesses,
        recentReviews,
        systemLoad
      };
    } catch (error) {
      console.error('❌ Error getting real-time stats:', error);
      throw error;
    }
  }

  // Get recent system activities
  static async getRecentActivities(limit = 50) {
    try {
      console.log(`📊 Getting recent activities (limit: ${limit})`);

      // In a real system, you'd have an activity log table
      // For now, we'll create mock activities based on recent data
      const [recentUsers, recentReviews, recentBusinesses] = await Promise.all([
        prisma.user.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: { id: true, email: true, createdAt: true }
        }),
        prisma.review.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: { customer: true, business: true }
        }),
        prisma.business.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: true }
        })
      ]);

      const activities = [];

      // Add user registrations
      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registration',
          description: `New user registered`,
          userEmail: user.email,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
          timestamp: user.createdAt
        });
      });

      // Add review submissions
      recentReviews.forEach(review => {
        activities.push({
          type: 'review_submitted',
          description: `Review submitted for ${review.business.name}`,
          userEmail: review.customer.email,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
          timestamp: review.createdAt
        });
      });

      // Add business creations
      recentBusinesses.forEach(business => {
        activities.push({
          type: 'business_created',
          description: `New business "${business.name}" created`,
          userEmail: business.user.email,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
          timestamp: business.createdAt
        });
      });

      // Sort by timestamp and limit
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);

      console.log(`✅ Retrieved ${sortedActivities.length} recent activities`);
      return sortedActivities;
    } catch (error) {
      console.error('❌ Error getting recent activities:', error);
      throw error;
    }
  }

  // Get comprehensive revenue analytics with real subscription data
  static async getRevenueAnalytics(range = '30days') {
    try {
      console.log(`📊 Getting comprehensive revenue analytics (range: ${range})`);

      const dateRanges = {
        '7days': 7,
        '30days': 30,
        '90days': 90,
        '1year': 365
      };

      const days = dateRanges[range] || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const endDate = new Date();

      // Get all active subscriptions with business and user details
      const activeSubscriptions = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          startDate: { lte: endDate },
          endDate: { gte: new Date() }
        },
        include: {
          business: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  businessName: true,
                  businessType: true,
                  createdAt: true
                }
              },
              customers: { select: { id: true } },
              reviews: { select: { id: true, rating: true } }
            }
          }
        }
      });

      // Get subscription metrics in the selected range
      const rangeSubscriptions = await prisma.subscription.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        include: {
          business: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  businessName: true
                }
              }
            }
          }
        }
      });

      // Get cancelled/expired subscriptions for churn calculation
      const churnedSubscriptions = await prisma.subscription.findMany({
        where: {
          status: { in: ['CANCELLED', 'EXPIRED'] },
          OR: [
            { cancelledAt: { gte: startDate, lte: endDate } },
            { endDate: { gte: startDate, lte: endDate } }
          ]
        }
      });

      // Calculate total revenue in INR
      const totalRevenueINR = activeSubscriptions.reduce((sum, sub) => {
        const priceINR = sub.price * 83; // Convert to INR (approximate rate)
        return sum + priceINR;
      }, 0);

      const rangeRevenueINR = rangeSubscriptions.reduce((sum, sub) => {
        const priceINR = sub.price * 83;
        return sum + priceINR;
      }, 0);

      // Calculate previous period for growth comparison
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - days);
      const previousRangeSubscriptions = await prisma.subscription.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      });

      // Plan breakdown with INR prices (simplified to FREE and PREMIUM only)
      const planMetrics = {
        FREE: { subscribers: 0, revenue: 0, avgMonthlyRevenue: 0 },
        PREMIUM: { subscribers: 0, revenue: 0, avgMonthlyRevenue: 0 }
      };

      // Monthly vs Yearly subscription breakdown
      const billingCycleMetrics = {
        monthly: { count: 0, revenue: 0 },
        yearly: { count: 0, revenue: 0 }
      };

      activeSubscriptions.forEach(sub => {
        const planId = sub.planId || 'FREE';
        const revenueINR = sub.price * 83;
        
        if (planMetrics[planId]) {
          planMetrics[planId].subscribers++;
          planMetrics[planId].revenue += revenueINR;
        }

        // Determine billing cycle based on price (yearly plans typically 10x monthly)
        const isYearly = sub.price > 200; // Assuming yearly plans are >$200
        if (isYearly) {
          billingCycleMetrics.yearly.count++;
          billingCycleMetrics.yearly.revenue += revenueINR;
        } else {
          billingCycleMetrics.monthly.count++;
          billingCycleMetrics.monthly.revenue += revenueINR;
        }
      });

      // Calculate average monthly revenue per plan
      Object.keys(planMetrics).forEach(plan => {
        if (planMetrics[plan].subscribers > 0) {
          planMetrics[plan].avgMonthlyRevenue = planMetrics[plan].revenue / planMetrics[plan].subscribers;
        }
      });

      // Calculate growth metrics
      const subscriptionGrowth = previousRangeSubscriptions > 0 ? 
        ((rangeSubscriptions.length - previousRangeSubscriptions) / previousRangeSubscriptions * 100) : 0;
      
      const churnRate = activeSubscriptions.length > 0 ? 
        (churnedSubscriptions.length / (activeSubscriptions.length + churnedSubscriptions.length) * 100) : 0;

      // ARPU in INR
      const arpuINR = activeSubscriptions.length > 0 ? totalRevenueINR / activeSubscriptions.length : 0;

      // Top paying customers
      const topBusinesses = activeSubscriptions
        .sort((a, b) => (b.price * 83) - (a.price * 83))
        .slice(0, 10)
        .map(sub => ({
          businessId: sub.business.id,
          businessName: sub.business.name,
          ownerName: `${sub.business.user.firstName} ${sub.business.user.lastName}`,
          ownerEmail: sub.business.user.email,
          planId: sub.planId,
          planName: sub.planName,
          monthlyRevenueINR: Math.round(sub.price * 83),
          yearlyRevenueINR: Math.round(sub.price * 83 * 12),
          billingCycle: sub.price > 200 ? 'Yearly' : 'Monthly',
          customersCount: sub.business.customers.length,
          reviewsCount: sub.business.reviews.length,
          avgRating: sub.business.reviews.length > 0 ? 
            (sub.business.reviews.reduce((sum, r) => sum + r.rating, 0) / sub.business.reviews.length).toFixed(1) : 0,
          subscriptionDate: sub.createdAt,
          status: sub.status
        }));

      // Recent transactions
      const recentTransactions = rangeSubscriptions.slice(0, 20).map(sub => ({
        id: sub.id,
        businessName: sub.business.name,
        ownerName: `${sub.business.user.firstName} ${sub.business.user.lastName}`,
        planName: sub.planName,
        amountINR: Math.round(sub.price * 83),
        billingCycle: sub.price > 200 ? 'Yearly' : 'Monthly',
        status: sub.status,
        date: sub.createdAt
      }));

      const revenueData = {
        totalRevenueINR: Math.round(totalRevenueINR),
        rangeRevenueINR: Math.round(rangeRevenueINR),
        totalRevenue: totalRevenueINR / 83, // USD equivalent
        revenueGrowth: subscriptionGrowth.toFixed(1),
        activeSubscriptions: activeSubscriptions.length,
        subscriptionGrowth: subscriptionGrowth.toFixed(1),
        arpuINR: Math.round(arpuINR),
        arpu: arpuINR / 83, // USD equivalent
        churnRate: churnRate.toFixed(1),
        
        // Plan breakdown with INR (simplified structure)
        planBreakdown: [
          {
            name: 'FREE',
            planId: 'FREE',
            subscribers: planMetrics.FREE.subscribers,
            revenueINR: Math.round(planMetrics.FREE.revenue),
            revenue: Math.round(planMetrics.FREE.revenue / 83),
            avgMonthlyRevenueINR: Math.round(planMetrics.FREE.avgMonthlyRevenue),
            priceINR: 0,
            priceUSD: 0,
            description: 'Basic features with limited usage'
          },
          {
            name: 'PREMIUM',
            planId: 'PREMIUM',
            subscribers: planMetrics.PREMIUM.subscribers,
            revenueINR: Math.round(planMetrics.PREMIUM.revenue),
            revenue: Math.round(planMetrics.PREMIUM.revenue / 83),
            avgMonthlyRevenueINR: Math.round(planMetrics.PREMIUM.avgMonthlyRevenue),
            priceINR: 4149, // ₹4,149 monthly
            priceUSD: 49.99,
            yearlyPriceINR: 41490, // ₹41,490 yearly (10 months price)
            yearlyPriceUSD: 499.90,
            description: 'All features with unlimited usage'
          }
        ],

        // Billing cycle breakdown
        billingCycles: {
          monthly: {
            count: billingCycleMetrics.monthly.count,
            revenueINR: Math.round(billingCycleMetrics.monthly.revenue),
            revenue: Math.round(billingCycleMetrics.monthly.revenue / 83),
            percentage: activeSubscriptions.length > 0 ? 
              ((billingCycleMetrics.monthly.count / activeSubscriptions.length) * 100).toFixed(1) : 0
          },
          yearly: {
            count: billingCycleMetrics.yearly.count,
            revenueINR: Math.round(billingCycleMetrics.yearly.revenue),
            revenue: Math.round(billingCycleMetrics.yearly.revenue / 83),
            percentage: activeSubscriptions.length > 0 ? 
              ((billingCycleMetrics.yearly.count / activeSubscriptions.length) * 100).toFixed(1) : 0
          }
        },

        // Payment status (mock for now, replace with real payment data)
        paymentStatus: {
          successful: Math.floor(activeSubscriptions.length * 0.95),
          failed: Math.floor(activeSubscriptions.length * 0.03),
          pending: Math.floor(activeSubscriptions.length * 0.015),
          refunded: Math.floor(activeSubscriptions.length * 0.005)
        },

        topBusinesses,
        recentTransactions,
        
        // Additional metrics
        metrics: {
          totalBusinessOwners: await prisma.user.count({ where: { role: 'BUSINESS_OWNER' } }),
          avgCustomersPerBusiness: activeSubscriptions.length > 0 ? 
            (activeSubscriptions.reduce((sum, sub) => sum + sub.business.customers.length, 0) / activeSubscriptions.length).toFixed(1) : 0,
          avgReviewsPerBusiness: activeSubscriptions.length > 0 ? 
            (activeSubscriptions.reduce((sum, sub) => sum + sub.business.reviews.length, 0) / activeSubscriptions.length).toFixed(1) : 0,
          conversionRate: ((activeSubscriptions.length / Math.max(await prisma.business.count(), 1)) * 100).toFixed(1)
        }
      };

      console.log('✅ Comprehensive revenue analytics retrieved');
      return revenueData;
    } catch (error) {
      console.error('❌ Error getting revenue analytics:', error);
      throw error;
    }
  }

  // Get security analytics and threat monitoring
  static async getSecurityAnalytics() {
    try {
      console.log('🔒 Getting security analytics');

      // In a real system, you'd have security logs and threat detection
      // For now, we'll create mock security data based on user activity patterns
      
      const totalUsers = await prisma.user.count();
      const recentLoginAttempts = Math.floor(totalUsers * 0.1); // Mock login attempts
      
      const securityData = {
        threats: Math.floor(Math.random() * 5), // Mock threat count
        suspiciousLogins: Math.floor(Math.random() * 10),
        failedAttempts: Math.floor(recentLoginAttempts * 0.05),
        blockedIps: Math.floor(Math.random() * 15),
        recentEvents: [
          {
            severity: 'high',
            description: 'Multiple failed login attempts detected',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            status: 'blocked'
          },
          {
            severity: 'medium',
            description: 'Unusual login location detected',
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            status: 'flagged'
          },
          {
            severity: 'low',
            description: 'New device login',
            ipAddress: '172.16.0.25',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            status: 'allowed'
          }
        ]
      };

      console.log('✅ Security analytics retrieved');
      return securityData;
    } catch (error) {
      console.error('❌ Error getting security analytics:', error);
      throw error;
    }
  }

  // Get content moderation queue
  static async getModerationQueue(status = 'pending') {
    try {
      console.log(`📋 Getting moderation queue (status: ${status})`);

      const whereClause = status === 'all' ? {} : { status: status.toUpperCase() };
      
      const reviews = await prisma.review.findMany({
        where: whereClause,
        include: {
          customer: true,
          business: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      // Calculate mock risk scores and flags
      const moderationQueue = reviews.map(review => {
        const riskScore = Math.floor(Math.random() * 100);
        const flags = [];
        
        if (review.comment && review.comment.length < 10) flags.push('too-short');
        if (review.rating === 1) flags.push('low-rating');
        if (riskScore > 70) flags.push('high-risk');
        if (Math.random() > 0.8) flags.push('spam-detected');
        
        return {
          id: review.id,
          title: `Review for ${review.business.name}`,
          content: review.comment,
          rating: review.rating,
          businessName: review.business.name,
          customerName: review.customer.name,
          riskScore,
          flags,
          status: review.status,
          createdAt: review.createdAt
        };
      });

      const stats = {
        pending: reviews.filter(r => r.status === 'PENDING').length,
        flagged: moderationQueue.filter(item => item.flags.length > 0).length,
        aiDetected: moderationQueue.filter(item => item.flags.includes('spam-detected')).length,
        processed: await prisma.review.count({
          where: {
            status: { in: ['APPROVED', 'REJECTED'] },
            moderatedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        queue: moderationQueue
      };

      console.log(`✅ Moderation queue retrieved (${moderationQueue.length} items)`);
      return stats;
    } catch (error) {
      console.error('❌ Error getting moderation queue:', error);
      throw error;
    }
  }

  // Bulk moderate reviews
  static async bulkModerateReviews(action, reviewIds, moderatorId) {
    try {
      console.log(`📋 Bulk moderating ${reviewIds.length} reviews (action: ${action})`);

      const status = action.toUpperCase();
      const validStatuses = ['APPROVE', 'REJECT', 'FLAG', 'DELETE'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid moderation action');
      }

      let updateData = {
        moderatedAt: new Date(),
        moderatedBy: moderatorId
      };

      if (status === 'APPROVE') {
        updateData.status = 'APPROVED';
      } else if (status === 'REJECT') {
        updateData.status = 'REJECTED';
      } else if (status === 'FLAG') {
        updateData.status = 'FLAGGED';
      }

      if (status === 'DELETE') {
        // Soft delete
        await prisma.review.updateMany({
          where: { id: { in: reviewIds } },
          data: {
            deletedAt: new Date(),
            moderatedBy: moderatorId
          }
        });
      } else {
        await prisma.review.updateMany({
          where: { id: { in: reviewIds } },
          data: updateData
        });
      }

      console.log(`✅ Bulk moderation completed (${reviewIds.length} reviews ${action}d)`);
      return {
        processedCount: reviewIds.length,
        action: status,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Error performing bulk moderation:', error);
      throw error;
    }
  }

  // Get system performance metrics
  static async getPerformanceMetrics() {
    try {
      console.log('⚡ Getting performance metrics');

      // In a real system, you'd collect these from system monitoring tools
      const mockMetrics = {
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        diskUsage: Math.floor(Math.random() * 100),
        networkLatency: Math.floor(Math.random() * 100),
        databaseConnections: Math.floor(Math.random() * 50),
        activeRequests: Math.floor(Math.random() * 200),
        errorRate: (Math.random() * 5).toFixed(2),
        uptime: '99.9%',
        lastUpdate: new Date()
      };

      console.log('✅ Performance metrics retrieved');
      return mockMetrics;
    } catch (error) {
      console.error('❌ Error getting performance metrics:', error);
      throw error;
    }
  }

  // Get active user sessions
  static async getActiveSessions() {
    try {
      console.log('👥 Getting active user sessions');

      // In a real system, you'd have a sessions table or use Redis
      // For now, we'll mock active sessions based on recent user activity
      
      const recentUsers = await prisma.user.findMany({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          updatedAt: true
        },
        take: 50
      });

      const sessions = recentUsers.map(user => ({
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        role: user.role,
        sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'][Math.floor(Math.random() * 4)],
        loginTime: new Date(user.updatedAt.getTime() - Math.random() * 3600000),
        lastActivity: user.updatedAt,
        isActive: Math.random() > 0.2
      }));

      const result = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.isActive).length,
        sessions: sessions.sort((a, b) => b.lastActivity - a.lastActivity)
      };

      console.log(`✅ Active sessions retrieved (${result.activeSessions}/${result.totalSessions})`);
      return result;
    } catch (error) {
      console.error('❌ Error getting active sessions:', error);
      throw error;
    }
  }

  // Get detailed subscription metrics for business owners
  static async getSubscriptionMetrics() {
    try {
      console.log('💰 Getting detailed subscription metrics');

      // Get all subscriptions with business owner details
      const allSubscriptions = await prisma.subscription.findMany({
        include: {
          business: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  businessName: true,
                  businessType: true,
                  businessPhone: true,
                  businessAddress: true,
                  createdAt: true
                }
              },
              customers: { select: { id: true } },
              reviews: { select: { id: true, rating: true } },
              qrCodes: { select: { id: true, scansCount: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Categorize subscriptions by status
      const active = allSubscriptions.filter(s => s.status === 'ACTIVE');
      const cancelled = allSubscriptions.filter(s => s.status === 'CANCELLED');
      const expired = allSubscriptions.filter(s => s.status === 'EXPIRED');
      const pending = allSubscriptions.filter(s => s.status === 'PENDING');

      // Calculate revenue metrics in INR
      const totalMonthlyRevenueINR = active.reduce((sum, sub) => {
        const monthlyAmount = sub.price > 200 ? sub.price / 12 : sub.price; // Yearly to monthly
        return sum + (monthlyAmount * 83);
      }, 0);

      const totalYearlyRevenueINR = active.reduce((sum, sub) => {
        const yearlyAmount = sub.price > 200 ? sub.price : sub.price * 12; // Monthly to yearly
        return sum + (yearlyAmount * 83);
      }, 0);

      // Detailed business owner analytics
      const businessOwnerMetrics = allSubscriptions.map(sub => {
        const business = sub.business;
        const user = business.user;
        
        return {
          // Owner Details
          ownerId: user.id,
          ownerName: `${user.firstName} ${user.lastName}`,
          ownerEmail: user.email,
          ownerPhone: user.businessPhone,
          
          // Business Details
          businessId: business.id,
          businessName: business.name || user.businessName,
          businessType: business.type || user.businessType,
          businessAddress: user.businessAddress,
          businessCreatedAt: user.createdAt,
          
          // Subscription Details
          subscriptionId: sub.id,
          planId: sub.planId,
          planName: sub.planName,
          status: sub.status,
          
          // Pricing in both currencies
          priceUSD: sub.price,
          priceINR: Math.round(sub.price * 83),
          monthlyPriceINR: sub.price > 200 ? Math.round((sub.price / 12) * 83) : Math.round(sub.price * 83),
          yearlyPriceINR: sub.price > 200 ? Math.round(sub.price * 83) : Math.round(sub.price * 12 * 83),
          
          // Billing Details
          billingCycle: sub.price > 200 ? 'Yearly' : 'Monthly',
          subscriptionStart: sub.startDate,
          subscriptionEnd: sub.endDate,
          cancelledAt: sub.cancelledAt,
          
          // Business Performance
          customersCount: business.customers.length,
          reviewsCount: business.reviews.length,
          avgRating: business.reviews.length > 0 ? 
            (business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length).toFixed(1) : 0,
          totalQRScans: business.qrCodes.reduce((sum, qr) => sum + qr.scansCount, 0),
          
          // Revenue Contribution
          monthlyRevenueContributionINR: sub.price > 200 ? Math.round((sub.price / 12) * 83) : Math.round(sub.price * 83),
          yearlyRevenueContributionINR: sub.price > 200 ? Math.round(sub.price * 83) : Math.round(sub.price * 12 * 83),
          
          // Performance Metrics
          revenuePerCustomer: business.customers.length > 0 ? 
            Math.round((sub.price * 83) / business.customers.length) : 0,
          revenuePerReview: business.reviews.length > 0 ? 
            Math.round((sub.price * 83) / business.reviews.length) : 0
        };
      });

      // Top performing business owners by revenue
      const topRevenueOwners = businessOwnerMetrics
        .filter(owner => owner.status === 'ACTIVE')
        .sort((a, b) => b.yearlyRevenueContributionINR - a.yearlyRevenueContributionINR)
        .slice(0, 10);

      // Plan distribution (simplified to FREE and PREMIUM)
      const planDistribution = {
        FREE: { count: 0, revenue: 0, revenueINR: 0 },
        PREMIUM: { count: 0, revenue: 0, revenueINR: 0 }
      };

      active.forEach(sub => {
        const planId = sub.planId || 'FREE';
        if (planDistribution[planId]) {
          planDistribution[planId].count++;
          planDistribution[planId].revenue += sub.price;
          planDistribution[planId].revenueINR += sub.price * 83;
        }
      });

      const metrics = {
        // Overall metrics
        totalSubscriptions: allSubscriptions.length,
        activeSubscriptions: active.length,
        cancelledSubscriptions: cancelled.length,
        expiredSubscriptions: expired.length,
        pendingSubscriptions: pending.length,
        
        // Revenue metrics
        totalMonthlyRevenueINR: Math.round(totalMonthlyRevenueINR),
        totalYearlyRevenueINR: Math.round(totalYearlyRevenueINR),
        totalMonthlyRevenueUSD: Math.round(totalMonthlyRevenueINR / 83),
        totalYearlyRevenueUSD: Math.round(totalYearlyRevenueINR / 83),
        
        // Average metrics
        avgMonthlyRevenuePerBusinessINR: active.length > 0 ? Math.round(totalMonthlyRevenueINR / active.length) : 0,
        avgYearlyRevenuePerBusinessINR: active.length > 0 ? Math.round(totalYearlyRevenueINR / active.length) : 0,
        
        // Conversion metrics
        conversionRate: allSubscriptions.length > 0 ? 
          ((active.length / allSubscriptions.length) * 100).toFixed(1) : 0,
        churnRate: (active.length + cancelled.length) > 0 ? 
          ((cancelled.length / (active.length + cancelled.length)) * 100).toFixed(1) : 0,
        
        // Plan breakdown
        planDistribution,
        
        // Business owner metrics
        businessOwnerMetrics,
        topRevenueOwners,
        
        // Growth trends (last 30 days)
        recentGrowth: {
          newSubscriptions: allSubscriptions.filter(s => 
            new Date(s.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          cancelledThisMonth: cancelled.filter(s => 
            s.cancelledAt && new Date(s.cancelledAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length
        }
      };

      console.log('✅ Subscription metrics retrieved');
      return metrics;
    } catch (error) {
      console.error('❌ Error getting subscription metrics:', error);
      throw error;
    }
  }
}

// Helper function to calculate growth rate
function calculateGrowthRate(current, total) {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
}

module.exports = SuperAdminService;
