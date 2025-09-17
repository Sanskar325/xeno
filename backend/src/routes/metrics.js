const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getMetrics } = require('../services/metricsService');
const prisma = require('../config/database');
const router = express.Router();

// Get dashboard metrics
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { storeId, dateFrom, dateTo } = req.query;
    
    const metrics = await getMetrics({
      tenantId: req.user.tenantId,
      storeId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch metrics',
      message: error.message 
    });
  }
});

// Get products
router.get('/products', authenticateToken, async (req, res) => {
  try {
    const { storeId, limit = 50, offset = 0 } = req.query;
    
    const whereClause = { tenantId: req.user.tenantId };

    if (storeId) {
      // Filtering by storeId is not supported in the current schema; scoped by tenant only.
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.product.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        products,
        totalCount,
        hasMore: products.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
});

// Get orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const { storeId, limit = 50, offset = 0, status } = req.query;
    
    const whereClause = { tenantId: req.user.tenantId };

    if (storeId) {
      // Filtering by storeId is not supported in the current schema; scoped by tenant only.
    }

    if (status) {
      whereClause.financialStatus = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        lineItems: {
          include: {
            product: {
              select: {
                title: true
              }
            }
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.order.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        orders,
        totalCount,
        hasMore: orders.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
});

// Get customers
router.get('/customers', authenticateToken, async (req, res) => {
  try {
    const { storeId, limit = 50, offset = 0 } = req.query;
    
    const whereClause = { tenantId: req.user.tenantId };

    if (storeId) {
      // Filtering by storeId is not supported in the current schema; scoped by tenant only.
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      orderBy: {
        totalSpent: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const totalCount = await prisma.customer.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        customers,
        totalCount,
        hasMore: customers.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Customers error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customers',
      message: error.message 
    });
  }
});

module.exports = router;