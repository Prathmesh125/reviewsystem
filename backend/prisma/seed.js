const { PrismaClient } = require('@prisma/client')
const { hashPassword } = require('../src/utils/auth')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Create Super Admin user
    const superAdminPassword = await hashPassword('admin123')
    
    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@reviewsystem.com' },
      update: {},
      create: {
        email: 'admin@reviewsystem.com',
        password: superAdminPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })

    console.log('✅ Created Super Admin:', superAdmin.email)

    // Create Business Owner users
    const businessOwnerPassword = await hashPassword('business123')
    
    const businessOwner1 = await prisma.user.upsert({
      where: { email: 'business@example.com' },
      update: {},
      create: {
        email: 'business@example.com',
        password: businessOwnerPassword,
        firstName: 'John',
        lastName: 'Smith',
        role: 'BUSINESS_OWNER',
        businessName: 'Delicious Pizza Restaurant',
        businessType: 'restaurant',
        businessPhone: '+1 (555) 123-4567',
        businessAddress: '123 Main St, New York, NY 10001',
        businessWebsite: 'https://deliciouspizza.com',
        isActive: true
      }
    })

    console.log('✅ Created Business Owner 1:', businessOwner1.email)

    const businessOwner2 = await prisma.user.upsert({
      where: { email: 'salon@example.com' },
      update: {},
      create: {
        email: 'salon@example.com',
        password: businessOwnerPassword,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'BUSINESS_OWNER',
        businessName: 'Elegant Hair Salon',
        businessType: 'salon',
        businessPhone: '+1 (555) 987-6543',
        businessAddress: '456 Beauty Ave, Los Angeles, CA 90210',
        businessWebsite: 'https://eleganthair.com',
        isActive: true
      }
    })

    console.log('✅ Created Business Owner 2:', businessOwner2.email)

    const businessOwner3 = await prisma.user.upsert({
      where: { email: 'auto@example.com' },
      update: {},
      create: {
        email: 'auto@example.com',
        password: businessOwnerPassword,
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'BUSINESS_OWNER',
        businessName: 'Wilson Auto Repair',
        businessType: 'automotive',
        businessPhone: '+1 (555) 456-7890',
        businessAddress: '789 Mechanic St, Chicago, IL 60601',
        businessWebsite: 'https://wilsonauto.com',
        isActive: true
      }
    })

    console.log('✅ Created Business Owner 3:', businessOwner3.email)

    // Create sample businesses for the business owners
    const business1 = await prisma.business.upsert({
      where: { id: 'sample-business-1' },
      update: {},
      create: {
        id: 'sample-business-1',
        userId: businessOwner1.id,
        name: 'Delicious Pizza Restaurant',
        type: 'restaurant',
        description: 'Family-owned Italian restaurant serving authentic pizza and pasta since 1995.',
        website: 'https://deliciouspizza.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001',
        brandColor: '#E53E3E',
        customMessage: 'Thank you for dining with us! We\'d love to hear about your experience.',
        isPublished: true,
        googleReviewUrl: 'https://g.page/r/delicious-pizza/review'
      }
    })

    console.log('✅ Created Business 1:', business1.name)

    const business2 = await prisma.business.upsert({
      where: { id: 'sample-business-2' },
      update: {},
      create: {
        id: 'sample-business-2',
        userId: businessOwner2.id,
        name: 'Elegant Hair Salon',
        type: 'salon',
        description: 'Premium hair salon offering cuts, colors, and styling services.',
        website: 'https://eleganthair.com',
        phone: '+1 (555) 987-6543',
        address: '456 Beauty Ave, Los Angeles, CA 90210',
        brandColor: '#9F7AEA',
        customMessage: 'We hope you loved your new look! Please share your experience.',
        isPublished: true,
        googleReviewUrl: 'https://g.page/r/elegant-hair/review'
      }
    })

    console.log('✅ Created Business 2:', business2.name)

    // Create sample customers
    const customers = [
      {
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '+1 (555) 111-2222',
        businessId: business1.id
      },
      {
        name: 'Bob Davis',
        email: 'bob@example.com',
        phone: '+1 (555) 333-4444',
        businessId: business1.id
      },
      {
        name: 'Carol Wilson',
        email: 'carol@example.com',
        phone: '+1 (555) 555-6666',
        businessId: business2.id
      }
    ]

    for (const customerData of customers) {
      const customer = await prisma.customer.create({
        data: customerData
      })
      console.log('✅ Created Customer:', customer.name)
    }

    // Create sample reviews
    const reviews = [
      {
        customerId: (await prisma.customer.findFirst({ where: { email: 'alice@example.com' } })).id,
        businessId: business1.id,
        rating: 5,
        feedback: 'Amazing pizza! The crust was perfect and the service was excellent.',
        generatedReview: 'Had an incredible dining experience at Delicious Pizza Restaurant! The pizza was absolutely amazing - the crust was perfectly crispy and the toppings were fresh and flavorful. The service was excellent and the staff was very friendly. Highly recommend this place for authentic Italian cuisine!',
        status: 'GENERATED'
      },
      {
        customerId: (await prisma.customer.findFirst({ where: { email: 'bob@example.com' } })).id,
        businessId: business1.id,
        rating: 4,
        feedback: 'Good food, friendly staff. Atmosphere could be improved.',
        generatedReview: 'Really enjoyed my meal at Delicious Pizza Restaurant. The food was good and the staff was very friendly and attentive. The pizza had great flavor and the ingredients tasted fresh. The only thing I would suggest is improving the atmosphere a bit, but overall a solid dining experience that I would recommend.',
        status: 'SUBMITTED'
      },
      {
        customerId: (await prisma.customer.findFirst({ where: { email: 'carol@example.com' } })).id,
        businessId: business2.id,
        rating: 5,
        feedback: 'Love my new haircut! Sarah is amazing and really listened to what I wanted.',
        generatedReview: 'Absolutely love my new haircut from Elegant Hair Salon! Sarah is an amazing stylist who really took the time to listen to what I wanted and gave me exactly that. The salon has a great atmosphere and all the staff are professional and friendly. Will definitely be coming back and recommending to friends!',
        status: 'GENERATED'
      }
    ]

    for (const reviewData of reviews) {
      const review = await prisma.review.create({
        data: reviewData
      })
      console.log('✅ Created Review for rating:', review.rating)
    }

    // Create sample system analytics
    const now = new Date()
    const analyticsData = []

    // Create analytics for the last 30 days
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000))
      date.setHours(0, 0, 0, 0)

      const analytics = await prisma.systemAnalytics.upsert({
        where: { date },
        update: {},
        create: {
          date,
          totalUsers: Math.floor(Math.random() * 50) + 100,
          totalBusinesses: Math.floor(Math.random() * 30) + 50,
          totalCustomers: Math.floor(Math.random() * 200) + 500,
          totalReviews: Math.floor(Math.random() * 150) + 300,
          totalQRScans: Math.floor(Math.random() * 500) + 1000
        }
      })
    }

    console.log('✅ Created system analytics data')

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📋 Demo Accounts:')
    console.log('Super Admin: admin@reviewsystem.com / admin123')
    console.log('Business Owner 1: business@example.com / business123')
    console.log('Business Owner 2: salon@example.com / business123')
    console.log('Business Owner 3: auto@example.com / business123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})