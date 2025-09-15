const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a demo tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      email: 'demo@example.com'
    }
  });

  console.log('✅ Created demo tenant:', tenant.email);

  // Create a demo store
  const store = await prisma.store.create({
    data: {
      shopifyId: 'demo_store_123',
      name: 'Demo Store',
      domain: 'demo-store.myshopify.com',
      tenantId: tenant.id
    }
  });

  console.log('✅ Created demo store:', store.name);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });