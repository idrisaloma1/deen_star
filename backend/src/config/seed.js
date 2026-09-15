// Run with: npm run seed
// Seeds sample categories, an admin user, and sample products.
// Safe to re-run — uses ON CONFLICT to avoid duplicates.

const bcrypt = require('bcryptjs');
const pool = require('./db');
const { slugify } = require('../utils/slugify');

const SALT_ROUNDS = 10;

const CATEGORIES = [
  { name: 'Groceries', description: 'Everyday food and household essentials' },
  { name: 'Electronics', description: 'Phones, gadgets, and accessories' },
  { name: 'Fashion', description: 'Clothing, shoes, and accessories' },
  { name: 'Home & Living', description: 'Furniture, decor, and kitchenware' },
  { name: 'Health & Beauty', description: 'Personal care and wellness products' },
];

const PRODUCTS_BY_CATEGORY = {
  Groceries: [
    { name: 'Golden Penny Semovita 2kg', price: 3500, stock: 120 },
    { name: 'Peak Milk Powder 400g', price: 2800, stock: 80 },
    { name: 'Mama Gold Rice 5kg', price: 9500, stock: 60 },
  ],
  Electronics: [
    { name: 'Infinix Hot 40 Smartphone', price: 145000, stock: 15 },
    { name: 'Bluetooth Wireless Earbuds', price: 12500, stock: 40 },
    { name: '20000mAh Power Bank', price: 15000, stock: 30 },
  ],
  Fashion: [
    { name: "Men's Ankara Shirt", price: 8500, stock: 25 },
    { name: "Women's Ankle Boots", price: 18000, stock: 20 },
    { name: 'Kids School Backpack', price: 6500, stock: 35 },
  ],
  'Home & Living': [
    { name: '5-Piece Non-Stick Cookware Set', price: 32000, stock: 18 },
    { name: 'Memory Foam Pillow', price: 9500, stock: 40 },
  ],
  'Health & Beauty': [
    { name: 'Shea Butter Body Lotion 500ml', price: 4200, stock: 50 },
    { name: 'Electric Hair Clipper', price: 11000, stock: 22 },
  ],
};

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding admin user...');
    const adminEmail = 'admin@deenstarmall.com';
    const adminPassword = 'Admin@12345'; // change after first login
    const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    const adminResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id, email`,
      ['Store Admin', adminEmail, passwordHash]
    );
    const adminId = adminResult.rows[0].id;
    console.log(`✅ Admin ready: ${adminEmail} / ${adminPassword}`);

    console.log('Seeding categories...');
    const categoryIds = {};
    for (const cat of CATEGORIES) {
      const slug = slugify(cat.name);
      const result = await client.query(
        `INSERT INTO categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [cat.name, slug, cat.description]
      );
      categoryIds[result.rows[0].name] = result.rows[0].id;
    }
    console.log(`✅ ${CATEGORIES.length} categories ready`);

    console.log('Seeding products...');
    let productCount = 0;
    for (const [categoryName, products] of Object.entries(PRODUCTS_BY_CATEGORY)) {
      const categoryId = categoryIds[categoryName];
      for (const p of products) {
        const slug = slugify(p.name);
        await client.query(
          `INSERT INTO products (name, slug, description, price, stock_quantity, category_id, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (slug) DO UPDATE SET
             price = EXCLUDED.price,
             stock_quantity = EXCLUDED.stock_quantity`,
          [p.name, slug, `${p.name} — quality product in ${categoryName}`, p.price, p.stock, categoryId, adminId]
        );
        productCount++;
      }
    }
    console.log(`✅ ${productCount} products ready`);

    console.log('\n🎉 Seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();