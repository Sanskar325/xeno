const prisma = require('../config/database');

const getMetrics = async ({ tenantId, storeId, dateFrom, dateTo }) => {
  try {
    // Build where clause scoped to tenant
    const whereClause = {
      tenantId
    };

    if (storeId) {
      whereClause.storeId = storeId;
    }

    if (dateFrom || dateTo) {
      whereClause.processedAt = {};
      if (dateFrom) whereClause.processedAt.gte = dateFrom;
      if (dateTo) whereClause.processedAt.lte = dateTo;
    }

    // Get total customers
    const totalCustomers = await prisma.customer.count({ where: { tenantId } });

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      where: whereClause,
      _sum: {
        totalPrice: true
      }
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;

    // Get top 5 customers by spend
    const topCustomers = await prisma.customer.findMany({
      where: { tenantId },
      orderBy: {
        totalSpent: 'desc'
      },
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalSpent: true,
        ordersCount: true
      }
    });

    // Get orders by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ordersByDate = await prisma.order.groupBy({
      by: ['processedAt'],
      where: {
        ...whereClause,
        processedAt: {
          gte: dateFrom || thirtyDaysAgo,
          lte: dateTo || new Date()
        }
      },
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      orderBy: {
        processedAt: 'asc'
      }
    });

    // Format orders by date for charts
    const ordersChartData = ordersByDate.map(item => ({
      date: item.processedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      orders: item._count.id,
      revenue: item._sum.totalPrice || 0
    }));

    // Get total orders count
    const totalOrders = await prisma.order.count({ where: whereClause });

    // Get stores for this tenant
    const stores = await prisma.store.findMany({ where: { tenantId }, select: { id: true, name: true, domain: true } });

    // Calculate additional metrics
    const averageOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;
    
    // Get returning customers (customers with more than 1 order)
    const returningCustomers = await prisma.customer.count({
      where: {
        store: {
          tenantId
        },
        ordersCount: {
          gt: 1
        }
      }
    });

    // Get conversion rate (placeholder - would need more complex calculation)
    const conversionRate = totalCustomers > 0 ? parseFloat(((totalOrders / totalCustomers) * 100).toFixed(2)) : 0;

    // Get revenue by category (from products)
    const revenueByCategory = await prisma.product.groupBy({
      by: ['productType'],
      where: { tenantId },
      _count: {
        id: true
      }
    });

    // Get monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await prisma.order.groupBy({
      by: ['processedAt'],
      where: {
        ...whereClause,
        processedAt: {
          gte: sixMonthsAgo,
          lte: new Date()
        }
      },
      _count: {
        id: true
      },
      _sum: {
        totalPrice: true
      },
      orderBy: {
        processedAt: 'asc'
      }
    });

    // Format monthly trends
    const formattedMonthlyTrends = monthlyTrends.map(trend => ({
      month: trend.processedAt?.toLocaleDateString('en-US', { month: 'short' }) || 'Unknown',
      revenue: trend._sum.totalPrice || 0,
      orders: trend._count.id,
      customers: 0 // Would need separate calculation
    }));

    return {
      summary: {
        totalCustomers,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue,
        conversionRate,
        returningCustomers
      },
      topCustomers,
      ordersChartData,
      stores,
      revenueByCategory: revenueByCategory.map(cat => ({
        category: cat.productType || 'Uncategorized',
        revenue: 0, // Would need calculation from order line items
        percentage: 0 // Would need calculation
      })),
      monthlyTrends: formattedMonthlyTrends
    };
  } catch (error) {
    console.error('Metrics service error:', error);
    throw error;
  }
};

module.exports = { getMetrics };