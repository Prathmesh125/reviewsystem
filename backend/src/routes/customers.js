const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyFirebaseToken } = require('../middleware/firebaseAuth');

const router = express.Router();
const prisma = new PrismaClient();

// Public customer creation (for review forms)
router.post('/public', async (req, res) => {
  try {
    const { name, email, phone, businessId } = req.body;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    // Verify business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Create customer with provided data or defaults
    const customer = await prisma.customer.create({
      data: {
        name: name || 'Anonymous Customer',
        email: email || 'no-email@example.com',
        phone: phone || '000-000-0000',
        businessId: businessId
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating public customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get all customers for a business
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get businesses owned by user
    const businesses = await prisma.business.findMany({
      where: { userId: user.id }
    });

    if (businesses.length === 0) {
      return res.json([]);
    }

    // Get customers for all businesses owned by user
    const businessIds = businesses.map(b => b.id);
    const customers = await prisma.customer.findMany({
      where: { 
        businessId: { in: businessIds }
      },
      include: { reviews: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get specific customer
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get businesses owned by user
    const businesses = await prisma.business.findMany({
      where: { userId: user.id }
    });

    const businessIds = businesses.map(b => b.id);

    const customer = await prisma.customer.findFirst({
      where: { 
        id: req.params.id,
        businessId: { in: businessIds }
      },
      include: { reviews: true }
    });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { name, email, phone, businessId } = req.body;
    
    if (!name || !email || !businessId) {
      return res.status(400).json({ error: 'Name, email, and businessId are required' });
    }

    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    });

    if (!business) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        businessId: businessId
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get businesses owned by user
    const businesses = await prisma.business.findMany({
      where: { userId: user.id }
    });

    const businessIds = businesses.map(b => b.id);
    
    const customer = await prisma.customer.updateMany({
      where: { 
        id: req.params.id,
        businessId: { in: businessIds }
      },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone })
      }
    });

    if (customer.count === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.findFirst({
      where: { 
        id: req.params.id,
        businessId: { in: businessIds }
      }
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get businesses owned by user
    const businesses = await prisma.business.findMany({
      where: { userId: user.id }
    });

    const businessIds = businesses.map(b => b.id);

    const customer = await prisma.customer.deleteMany({
      where: { 
        id: req.params.id,
        businessId: { in: businessIds }
      }
    });

    if (customer.count === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get customers for a specific business
router.get('/business/:businessId', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessId } = req.params;

    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify business ownership
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    });

    if (!business) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    // Get customers for the specific business
    const customers = await prisma.customer.findMany({
      where: { businessId: businessId },
      include: { reviews: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers for business:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Export customer data (CSV format)
router.get('/business/:businessId/export', verifyFirebaseToken, async (req, res) => {
  try {
    const { businessId } = req.params;

    // Find the user in local database
    let user = await prisma.user.findUnique({
      where: { email: req.user.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify business ownership by checking if business belongs to user
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: user.id
      }
    });

    if (!business) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    // Get all customers with review data
    const customers = await prisma.customer.findMany({
      where: { businessId: businessId },
      include: {
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to CSV format
    const csvData = customers.map(customer => ({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      reviewCount: customer.reviews.length,
      avgRating: customer.reviews.length > 0 
        ? (customer.reviews.reduce((sum, r) => sum + r.rating, 0) / customer.reviews.length).toFixed(1)
        : 0,
      lastReviewDate: customer.reviews.length > 0 
        ? customer.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
        : '',
      customerSince: customer.createdAt
    }));

    res.json(csvData);

  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ error: 'Failed to export customer data' });
  }
});

module.exports = router;