const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    
    // Resolve tenant:
    // Prefer explicit shop domain header/query to select the correct tenant created during sync
    const requestedShop = req.headers['x-shop-domain'] || req.query.shop;
    let tenant = null;
    if (requestedShop && typeof requestedShop === 'string') {
      tenant = await prisma.tenant.findUnique({ where: { shopifyDomain: requestedShop } });
    }
    // Fallback to most recently updated active tenant
    if (!tenant) {
      tenant = await prisma.tenant.findFirst({
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' }
      });
    }
    // As a last resort, create a minimal tenant so requests don't crash
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: decodedToken.name || decodedToken.email.split('@')[0],
          shopifyDomain: decodedToken.email,
          isActive: true
        }
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      tenantId: tenant.id
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate JWT token for authenticated users
const generateToken = (userData) => {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = { authenticateToken, generateToken };