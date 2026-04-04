/**
 * Petopia seed script
 * Creates one admin user, 5 categories, and 10 products.
 * Safe to run more than once — skips records that already exist.
 *
 * Usage (from the backend/ directory):
 *   node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User     = require('./models/User');
const Category = require('./models/Category');
const Product  = require('./models/Product');

// ── Seed data ────────────────────────────────────────────────────────────────

const ADMIN = {
    name:     'Admin',
    email:    'admin@petopia.com',
    password: 'Admin@1234',
    role:     'admin',
};

const CATEGORIES = [
    { name: 'Dogs',          description: 'Food, toys, accessories, and care products for dogs' },
    { name: 'Cats',          description: 'Food, toys, accessories, and care products for cats' },
    { name: 'Birds',         description: 'Seed mixes, cages, perches, and bird accessories' },
    { name: 'Fish',          description: 'Aquarium equipment, food, and water treatments' },
    { name: 'Small Animals', description: 'Supplies for rabbits, guinea pigs, hamsters, and more' },
];

// Products are defined with category names; ObjectIds are resolved after categories are seeded
const PRODUCTS = [
    { name: 'Premium Dry Dog Food',      category: 'Dogs',          price: 29.99, stock: 50,  description: 'High-protein kibble for adult dogs, 5 kg bag',          imageUrl: 'https://placehold.co/400x300?text=Dog+Food' },
    { name: 'Rope Chew Toy',             category: 'Dogs',          price:  9.99, stock: 100, description: 'Durable braided rope toy for medium to large breeds',    imageUrl: 'https://placehold.co/400x300?text=Rope+Toy' },
    { name: 'Adjustable Dog Harness',    category: 'Dogs',          price: 24.99, stock: 40,  description: 'Padded no-pull harness, available in S / M / L',         imageUrl: 'https://placehold.co/400x300?text=Harness' },
    { name: 'Premium Wet Cat Food',      category: 'Cats',          price: 19.99, stock: 60,  description: 'Grain-free wet food with real salmon, 24-pack',          imageUrl: 'https://placehold.co/400x300?text=Cat+Food' },
    { name: 'Cat Scratching Post',       category: 'Cats',          price: 34.99, stock: 25,  description: '60 cm sisal scratching post with toy ball on top',       imageUrl: 'https://placehold.co/400x300?text=Scratching+Post' },
    { name: 'Feather Wand Interactive Toy', category: 'Cats',       price:  8.99, stock: 80,  description: 'Telescopic wand with replaceable feather attachment',    imageUrl: 'https://placehold.co/400x300?text=Feather+Wand' },
    { name: 'Budgie Seed Mix',           category: 'Birds',         price: 12.99, stock: 70,  description: 'Nutritious seed blend for budgerigars and small parrots', imageUrl: 'https://placehold.co/400x300?text=Bird+Seed' },
    { name: 'Wooden Cage Perch Set',     category: 'Birds',         price: 15.99, stock: 45,  description: 'Natural wood perches in three sizes, set of 4',          imageUrl: 'https://placehold.co/400x300?text=Perch+Set' },
    { name: 'Tropical Fish Flake Food',  category: 'Fish',          price:  7.99, stock: 90,  description: 'Balanced flake food for tropical community fish, 50 g',   imageUrl: 'https://placehold.co/400x300?text=Fish+Food' },
    { name: 'Hamster Exercise Wheel',    category: 'Small Animals', price: 18.99, stock: 35,  description: 'Silent-spin 21 cm wheel suitable for hamsters and mice',  imageUrl: 'https://placehold.co/400x300?text=Exercise+Wheel' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const log = (msg) => process.stdout.write(`${msg}\n`);

async function seedUser() {
    const existing = await User.findOne({ email: ADMIN.email });
    if (existing) { log(`  ↳ admin user already exists — skipped`); return; }
    const hashed = await bcrypt.hash(ADMIN.password, 10);
    await User.create({ ...ADMIN, password: hashed });
    log(`  ↳ admin user created: ${ADMIN.email}`);
}

async function seedCategories() {
    const map = {};
    for (const cat of CATEGORIES) {
        let record = await Category.findOne({ name: cat.name });
        if (record) {
            log(`  ↳ category "${cat.name}" already exists — skipped`);
        } else {
            record = await Category.create(cat);
            log(`  ↳ category "${cat.name}" created`);
        }
        map[cat.name] = record._id;
    }
    return map;
}

async function seedProducts(categoryMap) {
    for (const prod of PRODUCTS) {
        const existing = await Product.findOne({ name: prod.name });
        if (existing) { log(`  ↳ product "${prod.name}" already exists — skipped`); continue; }
        const { category: catName, ...rest } = prod;
        await Product.create({ ...rest, category: categoryMap[catName] });
        log(`  ↳ product "${prod.name}" created`);
    }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
    log('\n🌱 Petopia seed script starting…');
    await mongoose.connect(process.env.MONGO_URI);
    log('✅ Connected to MongoDB\n');

    log('👤 Seeding admin user…');
    await seedUser();

    log('\n📂 Seeding categories…');
    const categoryMap = await seedCategories();

    log('\n📦 Seeding products…');
    await seedProducts(categoryMap);

    log('\n✅ Seed complete.\n');
    log(`   Admin credentials:`);
    log(`   Email    : ${ADMIN.email}`);
    log(`   Password : ${ADMIN.password}\n`);
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    process.stderr.write(`\n❌ Seed failed: ${err.message}\n`);
    mongoose.disconnect();
    process.exit(1);
});
