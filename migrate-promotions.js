// migrate-promotions.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Running manual ALTER TABLE for promotions...");
        // originalPrice Decimal(12,2), discountPercentage Int
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "products" 
      ADD COLUMN IF NOT EXISTS "originalPrice" DECIMAL(12, 2),
      ADD COLUMN IF NOT EXISTS "discountPercentage" INTEGER;
    `);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
