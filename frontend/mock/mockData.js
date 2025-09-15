// Lightweight mock data to populate the UI when backend isn't available

export const mockProducts = [
  {
    id: 'p1',
    tenantId: 'mock',
    shopifyId: 'green-snowboard-1',
    title: 'Green Snowboard',
    handle: 'green-snowboard-1',
    description: '',
    vendor: 'retail-insights-lab',
    productType: 'Sports & Recreation',
    status: 'active',
    tags: '',
    variants: [
      { id: 'pv1', shopifyId: 'SKU-100', title: 'Default', price: 100.0, sku: 'SKU-100' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    tenantId: 'mock',
    shopifyId: 'bamboo-desk-organizer',
    title: 'Bamboo Desk Organizer',
    handle: 'bamboo-desk-organizer',
    description: 'Sustainable bamboo organizer',
    vendor: 'retail-insights-lab',
    productType: 'Office Supplies',
    status: 'active',
    tags: 'bamboo, organization',
    variants: [
      { id: 'pv2', shopifyId: 'BD-ORG-015', title: 'Default', price: 1299.0, sku: 'BD-ORG-015' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    tenantId: 'mock',
    shopifyId: 'insulated-stainless-steel-water-bottle',
    title: 'Insulated Stainless Steel Water Bottle',
    handle: 'insulated-stainless-steel-water-bottle',
    description: '750ml insulated bottle',
    vendor: 'retail-insights-lab',
    productType: 'Sports & Recreation',
    status: 'active',
    tags: 'insulated, water-bottle',
    variants: [
      { id: 'pv3', shopifyId: 'SS-WB-014', title: 'Default', price: 1899.0, sku: 'SS-WB-014' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    tenantId: 'mock',
    shopifyId: 'ultrasonic-essential-oil-diffuser',
    title: 'Ultrasonic Essential Oil Diffuser',
    handle: 'ultrasonic-essential-oil-diffuser',
    description: 'Aromatherapy diffuser',
    vendor: 'retail-insights-lab',
    productType: 'Home & Garden',
    status: 'active',
    tags: 'diffuser',
    variants: [
      { id: 'pv4', shopifyId: 'EO-DIF-013', title: 'Default', price: 2499.0, sku: 'EO-DIF-013' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    tenantId: 'mock',
    shopifyId: 'noise-cancelling-headphones',
    title: 'Noise Cancelling Headphones',
    handle: 'noise-cancelling-headphones',
    description: 'Premium over-ear ANC',
    vendor: 'retail-insights-lab',
    productType: 'Electronics',
    status: 'active',
    tags: 'headphones, audio',
    variants: [
      { id: 'pv5', shopifyId: 'HP-NC-005', title: 'Default', price: 3999.0, sku: 'HP-NC-005' }
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    tenantId: 'mock',
    shopifyId: 'glow-sneakers',
    title: 'Glow Sneakers',
    handle: 'glow-sneakers',
    description: 'Innovative light-up footwear',
    vendor: 'retail-insights-lab',
    productType: 'Footwear',
    status: 'active',
    tags: 'sneakers',
    variants: [
      { id: 'pv6', shopifyId: 'SNK-GL-001', title: 'Default', price: 2999.0, sku: 'SNK-GL-001' }
    ],
    createdAt: new Date().toISOString(),
  }
];

export const mockCustomers = [
  { id: 'c1', tenantId: 'mock', shopifyId: '9367770562841', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@email.com', phone: '+919876543210', acceptsMarketing: true, totalSpent: 4358.91, ordersCount: 2 },
  { id: 'c2', tenantId: 'mock', shopifyId: '9367772758297', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@gmail.com', phone: '+918765432109', acceptsMarketing: true, totalSpent: 1299.0, ordersCount: 1 },
  { id: 'c3', tenantId: 'mock', shopifyId: '9367774232857', firstName: 'Rahul', lastName: 'Gupta', email: 'rahul.gupta@yahoo.com', phone: '+917654321098', acceptsMarketing: true, totalSpent: 2069.91, ordersCount: 1 },
  { id: 'c4', tenantId: 'mock', shopifyId: '9367780557081', firstName: 'Ravi', lastName: 'Mehta', email: 'ravi.mehta@yahoo.com', phone: '+919210987654', acceptsMarketing: true, totalSpent: 4248.82, ordersCount: 2 },
  { id: 'c5', tenantId: 'mock', shopifyId: '9367783211289', firstName: 'Amit', lastName: 'Verma', email: 'amit.verma@gmail.com', phone: '+919098765432', acceptsMarketing: true, totalSpent: 979.91, ordersCount: 1 },
  { id: 'c6', tenantId: 'mock', shopifyId: '9367784390937', firstName: 'Deepika', lastName: 'Nair', email: 'deepika.nair@outlook.com', phone: '+919987654321', acceptsMarketing: true, totalSpent: 3158.82, ordersCount: 2 },
  { id: 'c7', tenantId: 'mock', shopifyId: '9367779049753', firstName: 'Anita', lastName: 'Reddy', email: 'anita.reddy@gmail.com', phone: '+918321098765', acceptsMarketing: true, totalSpent: 2723.91, ordersCount: 1 },
];

export const mockOrders = [
  { id: 'o1', tenantId: 'mock', shopifyId: '6581532033305', orderNumber: '#1001', email: 'guest@example.com', totalPrice: 3049.82, subtotalPrice: 2798.0, totalTax: 251.82, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Guest', lastName: '' },
    lineItems: [ { id: 'oli1', title: 'Aromatherapy Scented Candle Set', quantity: 1, price: 1499.0, sku: 'AC-SET-010' }, { id: 'oli2', title: 'Bamboo Water Bottle', quantity: 1, price: 1299.0, sku: 'BB-WB-006' } ] },
  { id: 'o2', tenantId: 'mock', shopifyId: '6581533475097', orderNumber: '#1002', email: 'amit.verma@gmail.com', totalPrice: 979.91, subtotalPrice: 899.0, totalTax: 80.91, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Amit', lastName: 'Verma' },
    lineItems: [ { id: 'oli3', title: 'Handcrafted Ceramic Coffee Mug', quantity: 1, price: 899.0, sku: 'CM-HC-011' } ] },
  { id: 'o3', tenantId: 'mock', shopifyId: '6581538455833', orderNumber: '#1004', email: 'arjun.sharma@email.com', totalPrice: 4358.91, subtotalPrice: 3999.0, totalTax: 359.91, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Arjun', lastName: 'Sharma' },
    lineItems: [ { id: 'oli4', title: 'Noise Cancelling Headphones', quantity: 1, price: 3999.0, sku: 'HP-NC-005' } ] },
  { id: 'o4', tenantId: 'mock', shopifyId: '6581542256921', orderNumber: '#1005', email: 'kavya.joshi@email.com', totalPrice: 1415.91, subtotalPrice: 1299.0, totalTax: 116.91, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Kavya', lastName: 'Joshi' },
    lineItems: [ { id: 'oli5', title: 'Bamboo Desk Organizer', quantity: 1, price: 1299.0, sku: 'BD-ORG-015' } ] },
  { id: 'o5', tenantId: 'mock', shopifyId: '6581544452377', orderNumber: '#1006', email: 'ravi.mehta@yahoo.com', totalPrice: 4248.82, subtotalPrice: 3898.0, totalTax: 350.82, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Ravi', lastName: 'Mehta' },
    lineItems: [ { id: 'oli6', title: 'Glow Sneakers', quantity: 1, price: 2999.0, sku: 'SNK-GL-001' }, { id: 'oli7', title: 'Handcrafted Ceramic Coffee Mug', quantity: 1, price: 899.0, sku: 'CM-HC-011' } ] },
  { id: 'o6', tenantId: 'mock', shopifyId: '6581563293977', orderNumber: '#1007', email: 'arjun.sharma@email.com', totalPrice: 5993.91, subtotalPrice: 5499.0, totalTax: 494.91, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Arjun', lastName: 'Sharma' },
    lineItems: [ { id: 'oli8', title: 'Smartwatch Edge X', quantity: 1, price: 5499.0, sku: 'SW-EDG-003' } ] },
  { id: 'o7', tenantId: 'mock', shopifyId: '6582707912985', orderNumber: '#1008', email: 'rahul.gupta@yahoo.com', totalPrice: 2069.91, subtotalPrice: 1899.0, totalTax: 170.91, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Rahul', lastName: 'Gupta' },
    lineItems: [ { id: 'oli9', title: 'Insulated Stainless Steel Water Bottle', quantity: 1, price: 1899.0, sku: 'SS-WB-014' } ] },
  { id: 'o8', tenantId: 'mock', shopifyId: '6582710731033', orderNumber: '#1009', email: 'anita.reddy@gmail.com', totalPrice: 2723.91, subtotalPrice: 2499.0, totalTax: 224.91, totalDiscounts: 0, currency: 'INR', financialStatus: 'paid', processedAt: new Date().toISOString(),
    customer: { firstName: 'Anita', lastName: 'Reddy' },
    lineItems: [ { id: 'oli10', title: 'Ultrasonic Essential Oil Diffuser', quantity: 1, price: 2499.0, sku: 'EO-DIF-013' } ] },
  // Abandoned cart example
  { id: 'o9', tenantId: 'mock', shopifyId: '6582710731999', orderNumber: '#1010', email: 'guest2@example.com', totalPrice: 0, subtotalPrice: 0, totalTax: 0, totalDiscounts: 0, currency: 'INR', financialStatus: 'abandoned', processedAt: new Date().toISOString(),
    customer: { firstName: 'Guest', lastName: '' },
    lineItems: [ { id: 'oli11', title: 'Premium Yoga Mat', quantity: 1, price: 1799.0, sku: 'YM-PRM-009' } ] },
];

export function computeMockMetrics() {
  const totalRevenue = mockOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const totalOrders = mockOrders.length;
  const totalCustomers = mockCustomers.length;
  const averageOrderValue = totalOrders > 0 ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;
  const ordersChartData = mockOrders.map(o => ({ date: o.processedAt.slice(0,10), orders: 1, revenue: o.totalPrice }));
  return {
    summary: {
      totalCustomers,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue,
      conversionRate: totalCustomers > 0 ? parseFloat(((totalOrders / totalCustomers) * 100).toFixed(2)) : 0,
      returningCustomers: mockCustomers.filter(c => c.ordersCount > 1).length
    },
    ordersChartData,
    topCustomers: mockCustomers
      .slice()
      .sort((a,b) => (b.totalSpent||0)-(a.totalSpent||0))
      .slice(0,5)
      .map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        totalSpent: c.totalSpent,
        ordersCount: c.ordersCount
      })),
    revenueByCategory: [],
    monthlyTrends: []
  };
}


