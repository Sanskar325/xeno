/*
  CSV Importer for Products, Customers, and Orders
  Usage:
    node backend/scripts/importCsv.js --shop retail-insights-lab.myshopify.com \
      --products "C:/xeno/frontend/products_export_1.csv" \
      --customers "C:/xeno/frontend/customers_export.csv" \
      --orders "C:/xeno/frontend/orders_export_1.csv"

  Prereqs:
    npm i -w backend csv-parse
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const prisma = require('../src/config/database');

function arg(key, def) {
  const i = process.argv.findIndex(a => a === `--${key}`);
  if (i >= 0 && process.argv[i+1]) return process.argv[i+1];
  return def;
}

const shopDomain = arg('shop');
const productsPath = arg('products');
const customersPath = arg('customers');
const ordersPath = arg('orders');

if (!shopDomain) {
  console.error('Missing --shop <domain.myshopify.com>');
  process.exit(1);
}

async function getOrCreateTenant(shop) {
  let tenant = await prisma.tenant.findUnique({ where: { shopifyDomain: shop } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: { name: `Store ${shop}`, shopifyDomain: shop, isActive: true }
    });
  }
  // Ensure store exists
  await prisma.store.upsert({
    where: { shopifyId: shop },
    update: { tenantId: tenant.id, domain: shop, updatedAt: new Date() },
    create: { tenantId: tenant.id, shopifyId: shop, name: `Store ${shop}`, domain: shop, currency: 'INR' }
  });
  return tenant;
}

function readCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true });
}

function toFloat(v) {
  if (v === undefined || v === null || v === '') return 0;
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
}

function cleanId(v) {
  if (v == null) return undefined;
  return String(v).replace(/^'+|'+$/g, '');
}

async function importProducts(tenantId, rows) {
  let created = 0, updated = 0, errors = 0;
  for (const r of rows) {
    try {
      const handle = r['Handle'];
      const title = r['Title'];
      const description = r['Body (HTML)'];
      const vendor = r['Vendor'];
      const productType = r['Type'];
      const tags = r['Tags'];
      const sku = r['Variant SKU'] || handle;
      const price = toFloat(r['Variant Price']);

      let product = await prisma.product.findFirst({ where: { tenantId, shopifyId: handle } });
      if (product) {
        product = await prisma.product.update({
          where: { id: product.id },
          data: { title, handle, description, vendor, productType, tags }
        });
        updated++;
      } else {
        product = await prisma.product.create({
          data: { tenantId, shopifyId: handle, title, handle, description, vendor, productType, tags }
        });
        created++;
      }

      // Variant upsert
      const variantShopId = sku || `${handle}-default`;
      const existingVariant = await prisma.productVariant.findFirst({ where: { productId: product.id, shopifyId: variantShopId } });
      if (existingVariant) {
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: { title: r['Option1 Value'] || 'Default', price, sku }
        });
      } else {
        await prisma.productVariant.create({
          data: { productId: product.id, shopifyId: variantShopId, title: r['Option1 Value'] || 'Default', price, sku }
        });
      }
    } catch (e) {
      errors++;
      console.error('Product import error:', e.message);
    }
  }
  return { created, updated, errors };
}

async function importCustomers(tenantId, rows) {
  let created = 0, updated = 0, errors = 0;
  for (const r of rows) {
    try {
      const shopifyId = cleanId(r['Customer ID']);
      const email = r['Email'] || null;
      const firstName = r['First Name'] || null;
      const lastName = r['Last Name'] || null;
      const phone = (r['Phone'] || '').replace(/^'+|'+$/g, '');
      const acceptsMarketing = (r['Accepts Email Marketing'] || '').toString().toLowerCase() === 'yes';
      const totalSpent = toFloat(r['Total Spent']);
      const totalOrders = parseInt(r['Total Orders'] || '0', 10) || 0;

      let customer = await prisma.customer.findFirst({ where: { tenantId, shopifyId } });
      if (customer) {
        await prisma.customer.update({
          where: { id: customer.id },
          data: { email, firstName, lastName, phone, acceptsMarketing, totalSpent, ordersCount: totalOrders }
        });
        updated++;
      } else {
        await prisma.customer.create({
          data: { tenantId, shopifyId, email, firstName, lastName, phone, acceptsMarketing, totalSpent, ordersCount: totalOrders }
        });
        created++;
      }
    } catch (e) {
      errors++;
      console.error('Customer import error:', e.message);
    }
  }
  return { created, updated, errors };
}

async function importOrders(tenantId, rows) {
  // Group rows by order Name (e.g., #1009). Use Id if available.
  const groups = new Map();
  for (const r of rows) {
    const key = r['Id'] || r['Name'];
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }

  let created = 0, updated = 0, errors = 0;
  for (const [key, lines] of groups.entries()) {
    try {
      const head = lines[0];
      const shopifyId = String(key);
      const email = head['Email'] || null;
      const totalPrice = toFloat(head['Total']);
      const subtotalPrice = toFloat(head['Subtotal']);
      const totalTax = toFloat(head['Taxes']);
      const totalDiscounts = toFloat(head['Discount Amount']) || toFloat(head['Lineitem discount']);
      const currency = head['Currency'] || 'INR';
      const financialStatus = head['Financial Status'] || null;
      const createdAtStr = head['Created at'] || head['Paid at'];
      const processedAt = createdAtStr ? new Date(createdAtStr.replace(' -0400','')) : null;

      // Optional customer link by email
      let customerId = null;
      if (email) {
        const cust = await prisma.customer.findFirst({ where: { tenantId, email } });
        if (cust) customerId = cust.id;
      }

      let order = await prisma.order.findFirst({ where: { tenantId, shopifyId } });
      if (order) {
        order = await prisma.order.update({
          where: { id: order.id },
          data: { customerId, email, totalPrice, subtotalPrice, totalTax, totalDiscounts, currency, financialStatus, processedAt }
        });
        updated++;
      } else {
        order = await prisma.order.create({
          data: { tenantId, shopifyId, customerId, orderNumber: head['Name'] || shopifyId, email, totalPrice, subtotalPrice, totalTax, totalDiscounts, currency, financialStatus, processedAt }
        });
        created++;
      }

      // Remove previous line items and recreate for simplicity
      await prisma.orderLineItem.deleteMany({ where: { orderId: order.id } });
      for (const r of lines) {
        const qty = parseInt(r['Lineitem quantity'] || '1', 10) || 1;
        const price = toFloat(r['Lineitem price']);
        const title = r['Lineitem name'] || 'Item';
        const sku = r['Lineitem sku'] || null;

        // Optional product/variant linkage by SKU/handle
        let variantId = null, productId = null;
        if (sku) {
          const variant = await prisma.productVariant.findFirst({ where: { sku } });
          if (variant) { variantId = variant.id; productId = variant.productId; }
        }

        await prisma.orderLineItem.create({
          data: {
            orderId: order.id,
            productId, variantId,
            shopifyId: `${order.id}-${title}-${Math.random().toString(36).slice(2,8)}`,
            title, quantity: qty, price, sku, vendor: r['Vendor'] || null
          }
        });
      }
    } catch (e) {
      errors++;
      console.error('Order import error:', e.message);
    }
  }
  return { created, updated, errors };
}

(async () => {
  const tenant = await getOrCreateTenant(shopDomain);
  console.log('Tenant:', tenant.shopifyDomain, tenant.id);

  if (productsPath && fs.existsSync(productsPath)) {
    const rows = readCsv(productsPath);
    const res = await importProducts(tenant.id, rows);
    console.log('Products:', res);
  }

  if (customersPath && fs.existsSync(customersPath)) {
    const rows = readCsv(customersPath);
    const res = await importCustomers(tenant.id, rows);
    console.log('Customers:', res);
  }

  if (ordersPath && fs.existsSync(ordersPath)) {
    const rows = readCsv(ordersPath);
    const res = await importOrders(tenant.id, rows);
    console.log('Orders:', res);
  }

  await prisma.$disconnect();
  console.log('Import completed.');
})();


