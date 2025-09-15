const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { syncShopifyData } = require('../services/shopifyService');
const router = express.Router();

// Sync Shopify data
router.post('/sync-data', authenticateToken, async (req, res) => {
  try {
    const { storeUrl, accessToken } = req.body;
    
    if (!storeUrl) {
      return res.status(400).json({ error: 'Store URL is required' });
    }

    const result = await syncShopifyData({
      tenantId: req.user.tenantId,
      storeUrl,
      accessToken
    });

    res.json({
      success: true,
      message: 'Data sync completed',
      stats: result
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Failed to sync data',
      message: error.message 
    });
  }
});

module.exports = router;