const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

class ShopifyService {
  constructor(shopDomain, accessToken) {
    this.shopDomain = shopDomain;
    this.accessToken = accessToken;
    this.baseURL = `https://${shopDomain}/admin/api/2023-10`;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });
  }

  // Rate limiting helper
  async handleRateLimit(response) {
    const callLimit = response.headers['x-shopify-shop-api-call-limit'];
    if (callLimit) {
      const [current, max] = callLimit.split('/').map(Number);
      if (current >= max * 0.8) { // If we're at 80% of rate limit
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      }
    }
  }

  // Generic API call with error handling and rate limiting
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      await this.handleRateLimit(response);
      return response.data;
    } catch (error) {
      console.error(`Shopify API Error for ${endpoint}:`, error.response?.data || error.message);
      
      // Handle specific Shopify API errors
      if (error.response?.status === 401) {
        throw new Error('Invalid Shopify access token. Please check your credentials.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your Shopify app permissions.');
      } else if (error.response?.status === 404) {
        throw new Error('Shopify store not found. Please check your store URL.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.status >= 500) {
        throw new Error('Shopify server error. Please try again later.');
      }
      
      throw new Error(`Shopify API Error: ${error.response?.data?.errors || error.message}`);
    }
  }

  // Paginated data fetching
  async fetchAllPages(endpoint, params = {}) {
    let allData = [];
    let nextPageInfo = null;
    
    do {
      const requestParams = { ...params, limit: 250 };
      if (nextPageInfo) {
        requestParams.page_info = nextPageInfo;
      }
      
      const response = await this.makeRequest(endpoint, requestParams);
      const resourceKey = Object.keys(response)[0];
      const data = response[resourceKey];
      
      allData = allData.concat(data);
      
      // Check for pagination
      const linkHeader = response.headers?.link;
      nextPageInfo = this.extractNextPageInfo(linkHeader);
      
    } while (nextPageInfo);
    
    return allData;
  }

  extractNextPageInfo(linkHeader) {
    if (!linkHeader) return null;
    
    const nextMatch = linkHeader.match(/<[^>]*page_info=([^&>]+)[^>]*>;\s*rel="next"/);
    return nextMatch ? nextMatch[1] : null;
  }

  // Fetch customers from Shopify
  async fetchCustomers(sinceId = null) {
    const params = { fields: 'id,email,first_name,last_name,phone,accepts_marketing,total_spent,orders_count,state,tags,created_at,updated_at,last_order_date' };
    if (sinceId) params.since_id = sinceId;
    
    const customers = await this.fetchAllPages('/customers.json', params);
    return customers;
  }

  // Fetch orders from Shopify
  async fetchOrders(sinceId = null, status = 'any') {
    const params = { 
      status,
      fields: 'id,customer,order_number,email,total_price,subtotal_price,total_tax,total_discounts,currency,financial_status,fulfillment_status,tags,note,shipping_address,billing_address,line_items,processed_at,created_at,updated_at'
    };
    if (sinceId) params.since_id = sinceId;
    
    const orders = await this.fetchAllPages('/orders.json', params);
    return orders;
  }

  // Fetch products from Shopify
  async fetchProducts(sinceId = null) {
    const params = { 
      fields: 'id,title,handle,body_html,vendor,product_type,status,tags,images,variants,created_at,updated_at'
    };
    if (sinceId) params.since_id = sinceId;
    
    const products = await this.fetchAllPages('/products.json', params);
    return products;
  }

  // Fetch customer addresses
  async fetchCustomerAddresses(customerId) {
    try {
      const response = await this.makeRequest(`/customers/${customerId}/addresses.json`);
      return response.addresses || [];
    } catch (error) {
      console.error(`Error fetching addresses for customer ${customerId}:`, error.message);
      return [];
    }
  }

  // Store customer data
  async storeCustomers(tenantId, customers) {
    const results = { created: 0, updated: 0, errors: 0 };
    
    for (const shopifyCustomer of customers) {
      try {
        const customerData = {
          tenantId,
          shopifyId: shopifyCustomer.id.toString(),
          email: shopifyCustomer.email,
          firstName: shopifyCustomer.first_name,
          lastName: shopifyCustomer.last_name,
          phone: shopifyCustomer.phone,
          acceptsMarketing: shopifyCustomer.accepts_marketing || false,
          totalSpent: parseFloat(shopifyCustomer.total_spent || 0),
          ordersCount: shopifyCustomer.orders_count || 0,
          state: shopifyCustomer.state,
          tags: shopifyCustomer.tags ? shopifyCustomer.tags.split(', ') : [],
          lastOrderDate: shopifyCustomer.last_order_date ? new Date(shopifyCustomer.last_order_date) : null,
          updatedAt: new Date()
        };

        const existingCustomer = await prisma.customer.findUnique({
          where: { tenantId_shopifyId: { tenantId, shopifyId: customerData.shopifyId } }
        });

        if (existingCustomer) {
          await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: customerData
          });
          results.updated++;
        } else {
          const newCustomer = await prisma.customer.create({ data: customerData });
          
          // Fetch and store customer addresses
          const addresses = await this.fetchCustomerAddresses(shopifyCustomer.id);
          for (const address of addresses) {
            await prisma.customerAddress.create({
              data: {
                customerId: newCustomer.id,
                firstName: address.first_name,
                lastName: address.last_name,
                company: address.company,
                address1: address.address1,
                address2: address.address2,
                city: address.city,
                province: address.province,
                country: address.country,
                zip: address.zip,
                phone: address.phone,
                isDefault: address.default || false
              }
            });
          }
          
          results.created++;
        }
      } catch (error) {
        console.error(`Error storing customer ${shopifyCustomer.id}:`, error.message);
        results.errors++;
      }
    }
    
    return results;
  }

  // Store product data
  async storeProducts(tenantId, products) {
    const results = { created: 0, updated: 0, errors: 0 };
    
    for (const shopifyProduct of products) {
      try {
        const productData = {
          tenantId,
          shopifyId: shopifyProduct.id.toString(),
          title: shopifyProduct.title,
          handle: shopifyProduct.handle,
          description: shopifyProduct.body_html,
          vendor: shopifyProduct.vendor,
          productType: shopifyProduct.product_type,
          status: shopifyProduct.status,
          tags: shopifyProduct.tags ? shopifyProduct.tags.split(', ') : [],
          images: shopifyProduct.images || [],
          updatedAt: new Date()
        };

        const existingProduct = await prisma.product.findUnique({
          where: { tenantId_shopifyId: { tenantId, shopifyId: productData.shopifyId } }
        });

        let product;
        if (existingProduct) {
          product = await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData
          });
          results.updated++;
        } else {
          product = await prisma.product.create({ data: productData });
          results.created++;
        }

        // Store product variants
        if (shopifyProduct.variants) {
          for (const variant of shopifyProduct.variants) {
            const variantData = {
              productId: product.id,
              shopifyId: variant.id.toString(),
              title: variant.title,
              price: parseFloat(variant.price),
              compareAtPrice: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
              sku: variant.sku,
              barcode: variant.barcode,
              inventoryQuantity: variant.inventory_quantity,
              weight: variant.weight ? parseFloat(variant.weight) : null,
              weightUnit: variant.weight_unit,
              requiresShipping: variant.requires_shipping,
              taxable: variant.taxable,
              position: variant.position
            };

            await prisma.productVariant.upsert({
              where: { productId_shopifyId: { productId: product.id, shopifyId: variantData.shopifyId } },
              update: variantData,
              create: variantData
            });
          }
        }
      } catch (error) {
        console.error(`Error storing product ${shopifyProduct.id}:`, error.message);
        results.errors++;
      }
    }
    
    return results;
  }

  // Store order data
  async storeOrders(tenantId, orders) {
    const results = { created: 0, updated: 0, errors: 0 };
    
    for (const shopifyOrder of orders) {
      try {
        // Find customer if exists
        let customerId = null;
        if (shopifyOrder.customer && shopifyOrder.customer.id) {
          const customer = await prisma.customer.findUnique({
            where: { tenantId_shopifyId: { tenantId, shopifyId: shopifyOrder.customer.id.toString() } }
          });
          customerId = customer?.id || null;
        }

        const orderData = {
          tenantId,
          shopifyId: shopifyOrder.id.toString(),
          customerId,
          orderNumber: shopifyOrder.order_number?.toString() || shopifyOrder.name,
          email: shopifyOrder.email,
          totalPrice: parseFloat(shopifyOrder.total_price),
          subtotalPrice: parseFloat(shopifyOrder.subtotal_price),
          totalTax: parseFloat(shopifyOrder.total_tax),
          totalDiscounts: parseFloat(shopifyOrder.total_discounts),
          currency: shopifyOrder.currency,
          financialStatus: shopifyOrder.financial_status,
          fulfillmentStatus: shopifyOrder.fulfillment_status,
          tags: shopifyOrder.tags ? shopifyOrder.tags.split(', ') : [],
          note: shopifyOrder.note,
          shippingAddress: shopifyOrder.shipping_address,
          billingAddress: shopifyOrder.billing_address,
          processedAt: shopifyOrder.processed_at ? new Date(shopifyOrder.processed_at) : null,
          updatedAt: new Date()
        };

        const existingOrder = await prisma.order.findUnique({
          where: { tenantId_shopifyId: { tenantId, shopifyId: orderData.shopifyId } }
        });

        let order;
        if (existingOrder) {
          order = await prisma.order.update({
            where: { id: existingOrder.id },
            data: orderData
          });
          
          // Delete existing line items
          await prisma.orderLineItem.deleteMany({
            where: { orderId: order.id }
          });
          
          results.updated++;
        } else {
          order = await prisma.order.create({ data: orderData });
          results.created++;
        }

        // Store line items
        if (shopifyOrder.line_items) {
          for (const lineItem of shopifyOrder.line_items) {
            // Find product and variant if they exist
            let productId = null;
            let variantId = null;
            
            if (lineItem.product_id) {
              const product = await prisma.product.findUnique({
                where: { tenantId_shopifyId: { tenantId, shopifyId: lineItem.product_id.toString() } }
              });
              productId = product?.id || null;
              
              if (lineItem.variant_id && product) {
                const variant = await prisma.productVariant.findUnique({
                  where: { productId_shopifyId: { productId: product.id, shopifyId: lineItem.variant_id.toString() } }
                });
                variantId = variant?.id || null;
              }
            }

            await prisma.orderLineItem.create({
              data: {
                orderId: order.id,
                productId,
                variantId,
                shopifyId: lineItem.id.toString(),
                title: lineItem.title,
                quantity: lineItem.quantity,
                price: parseFloat(lineItem.price),
                totalDiscount: parseFloat(lineItem.total_discount || 0),
                sku: lineItem.sku,
                vendor: lineItem.vendor,
                productExists: !!productId
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error storing order ${shopifyOrder.id}:`, error.message);
        results.errors++;
      }
    }
    
    return results;
  }

  // Verify webhook authenticity
  static verifyWebhook(data, hmacHeader, secret) {
    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(data, 'utf8')
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac, 'base64'),
      Buffer.from(hmacHeader, 'base64')
    );
  }

  // Process webhook data
  static async processWebhook(tenantId, topic, payload) {
    try {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const shopifyService = new ShopifyService(tenant.shopifyDomain, tenant.shopifyAccessToken);
      
      switch (topic) {
        case 'customers/create':
        case 'customers/update':
          await shopifyService.storeCustomers(tenantId, [payload]);
          break;
          
        case 'orders/create':
        case 'orders/updated':
        case 'orders/paid':
          await shopifyService.storeOrders(tenantId, [payload]);
          break;
          
        case 'products/create':
        case 'products/update':
          await shopifyService.storeProducts(tenantId, [payload]);
          break;
          
        case 'carts/create':
          await ShopifyService.trackCustomEvent(tenantId, 'cart_created', payload);
          break;
          
        case 'checkouts/create':
          await ShopifyService.trackCustomEvent(tenantId, 'checkout_started', payload);
          break;
          
        default:
          console.log(`Unhandled webhook topic: ${topic}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error processing webhook ${topic}:`, error.message);
      throw error;
    }
  }

  // Track custom events
  static async trackCustomEvent(tenantId, eventType, eventData, customerId = null, sessionId = null) {
    try {
      await prisma.customEvent.create({
        data: {
          tenantId,
          customerId,
          sessionId,
          eventType,
          eventData,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error(`Error tracking custom event ${eventType}:`, error.message);
    }
  }

  // Full data sync
  async performFullSync(tenantId) {
    const syncJob = await prisma.syncJob.create({
      data: {
        tenantId,
        jobType: 'full_sync',
        status: 'running'
      }
    });

    try {
      let totalProcessed = 0;
      let totalErrors = 0;

      // Sync customers
      console.log('Syncing customers...');
      const customers = await this.fetchCustomers();
      const customerResults = await this.storeCustomers(tenantId, customers);
      totalProcessed += customerResults.created + customerResults.updated;
      totalErrors += customerResults.errors;

      // Sync products
      console.log('Syncing products...');
      const products = await this.fetchProducts();
      const productResults = await this.storeProducts(tenantId, products);
      totalProcessed += productResults.created + productResults.updated;
      totalErrors += productResults.errors;

      // Sync orders
      console.log('Syncing orders...');
      const orders = await this.fetchOrders();
      const orderResults = await this.storeOrders(tenantId, orders);
      totalProcessed += orderResults.created + orderResults.updated;
      totalErrors += orderResults.errors;

      // Update sync job
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'completed',
          processedRecords: totalProcessed,
          errorCount: totalErrors,
          completedAt: new Date(),
          // Store metadata as JSON string (schema defines metadata as String?)
          metadata: JSON.stringify({
            customers: customerResults,
            products: productResults,
            orders: orderResults
          })
        }
      });

      return {
        success: true,
        syncJobId: syncJob.id,
        results: {
          customers: customerResults,
          products: productResults,
          orders: orderResults
        }
      };
    } catch (error) {
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: {
          status: 'failed',
          error: error.message,
          completedAt: new Date()
        }
      });
      
      throw error;
    }
  }
}

// Standalone sync function for API routes
const syncShopifyData = async ({ tenantId, storeUrl, accessToken }) => {
  try {
    // Validate inputs
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!storeUrl) {
      throw new Error('Store URL is required');
    }

    // Extract domain from store URL
    let shopDomain = storeUrl;
    if (storeUrl.includes('://')) {
      shopDomain = storeUrl.split('://')[1];
    }
    if (shopDomain.includes('/')) {
      shopDomain = shopDomain.split('/')[0];
    }
    if (!shopDomain.includes('.')) {
      shopDomain = `${shopDomain}.myshopify.com`;
    }

    // Validate Shopify domain format
    if (!shopDomain.includes('.myshopify.com') && !shopDomain.includes('.')) {
      throw new Error('Invalid Shopify store URL format');
    }

    // Create or update tenant record using unique shopifyDomain to avoid duplicates
    let tenant = await prisma.tenant.findUnique({ where: { shopifyDomain: shopDomain } });
    if (tenant) {
      tenant = await prisma.tenant.update({
        where: { shopifyDomain: shopDomain },
        data: {
          shopifyAccessToken: accessToken,
          isActive: true,
          updatedAt: new Date()
        }
      });
    } else {
      tenant = await prisma.tenant.create({
        data: {
          // keep provided tenantId if present to link metrics to caller; otherwise Prisma will generate
          id: tenantId,
          name: `Store ${shopDomain}`,
          shopifyDomain: shopDomain,
          shopifyAccessToken: accessToken,
          isActive: true
        }
      });
    }

    // Create or update store record keyed by unique shopifyId
    const store = await prisma.store.upsert({
      where: { shopifyId: shopDomain },
      update: {
        tenantId: tenant.id,
        domain: shopDomain,
        updatedAt: new Date()
      },
      create: {
        tenantId: tenant.id,
        shopifyId: shopDomain,
        name: `Store ${shopDomain}`,
        domain: shopDomain,
        currency: 'INR'
      }
    });

    // Initialize Shopify service with error handling
    let shopifyService;
    try {
      shopifyService = new ShopifyService(shopDomain, accessToken);
    } catch (error) {
      throw new Error(`Failed to initialize Shopify service: ${error.message}`);
    }

    // Perform full sync with error handling
    let syncResult;
    try {
      syncResult = await shopifyService.performFullSync(tenantId);
    } catch (error) {
      // If sync fails, still return partial results
      console.error('Sync failed:', error.message);
      throw new Error(`Data sync failed: ${error.message}`);
    }

    return {
      customers: syncResult.results.customers.created + syncResult.results.customers.updated,
      products: syncResult.results.products.created + syncResult.results.products.updated,
      orders: syncResult.results.orders.created + syncResult.results.orders.updated,
      syncJobId: syncResult.syncJobId,
      errors: syncResult.results.customers.errors + syncResult.results.products.errors + syncResult.results.orders.errors
    };
  } catch (error) {
    console.error('Sync error:', error);
    
    // Return user-friendly error messages
    if (error.message.includes('Invalid Shopify access token')) {
      throw new Error('Invalid Shopify access token. Please check your credentials.');
    } else if (error.message.includes('Access denied')) {
      throw new Error('Access denied. Please check your Shopify app permissions.');
    } else if (error.message.includes('Store not found')) {
      throw new Error('Shopify store not found. Please check your store URL.');
    } else if (error.message.includes('Rate limit')) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw error;
  }
};

module.exports = { ShopifyService, syncShopifyData };