import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { initDatabase, query } from '../config/db.js';
import { runMigrations } from './migrate.js';

export async function seedDatabase() {
  console.log('Seeding database with categories, demo users, and realistic financial transactions...');
  await runMigrations();

  // 1. Seed Categories
  const categories = [
    // Income categories
    { name: 'Salary & Wages', type: 'income', color: '#10b981', icon: 'Briefcase' },
    { name: 'Freelance & Consulting', type: 'income', color: '#06b6d4', icon: 'Laptop' },
    { name: 'Investments & Dividends', type: 'income', color: '#8b5cf6', icon: 'TrendingUp' },
    { name: 'Staking & Yield', type: 'income', color: '#14b8a6', icon: 'Coins' },
    { name: 'Other Income', type: 'income', color: '#22c55e', icon: 'DollarSign' },

    // Expense categories
    { name: 'Housing & Rent', type: 'expense', color: '#f43f5e', icon: 'Home' },
    { name: 'Food & Dining', type: 'expense', color: '#f97316', icon: 'Utensils' },
    { name: 'Cloud Infrastructure & Tech', type: 'expense', color: '#0ea5e9', icon: 'Cloud' },
    { name: 'Utilities & Bills', type: 'expense', color: '#eab308', icon: 'Zap' },
    { name: 'Transportation', type: 'expense', color: '#3b82f6', icon: 'Car' },
    { name: 'Healthcare & Fitness', type: 'expense', color: '#ec4899', icon: 'HeartPulse' },
    { name: 'Entertainment & Media', type: 'expense', color: '#a855f7', icon: 'Film' },
    { name: 'Software Tools & Subscriptions', type: 'expense', color: '#6366f1', icon: 'Box' },
    { name: 'Shopping & Gear', type: 'expense', color: '#d946ef', icon: 'ShoppingBag' },
    { name: 'Miscellaneous', type: 'expense', color: '#64748b', icon: 'MoreHorizontal' },
  ];

  const categoryMap = new Map();

  for (const cat of categories) {
    const res = await query(
      `INSERT INTO categories (name, type, color, icon)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO UPDATE 
       SET type = EXCLUDED.type, color = EXCLUDED.color, icon = EXCLUDED.icon
       RETURNING id, name, type;`,
      [cat.name, cat.type, cat.color, cat.icon]
    );
    categoryMap.set(cat.name, res.rows[0].id);
  }
  console.log(`Seeded ${categories.length} categories.`);

  // 2. Seed Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123456', salt);
  const userPassword = await bcrypt.hash('User@123456', salt);
  const readOnlyPassword = await bcrypt.hash('ReadOnly@123456', salt);

  const users = [
    {
      name: 'System Admin',
      email: 'admin@aurafinance.io',
      password: adminPassword,
      role: 'admin'
    },
    {
      name: 'Alex Rostova',
      email: 'alex@aurafinance.io',
      password: userPassword,
      role: 'user'
    },
    {
      name: 'Auditor ReadOnly',
      email: 'auditor@aurafinance.io',
      password: readOnlyPassword,
      role: 'read-only'
    }
  ];

  const userMap = new Map();

  for (const u of users) {
    const res = await query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE 
       SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, updated_at = CURRENT_TIMESTAMP
       RETURNING id, name, email, role;`,
      [u.name, u.email.toLowerCase(), u.password, u.role]
    );
    userMap.set(u.email.toLowerCase(), res.rows[0].id);
  }
  console.log(`Seeded ${users.length} demo user accounts.`);

  // 3. Seed Realistic Transactions for Alex
  const alexId = userMap.get('alex@aurafinance.io');

  // Check if Alex already has transactions
  const countRes = await query('SELECT COUNT(*) FROM transactions WHERE user_id = $1;', [alexId]);
  if (parseInt(countRes.rows[0].count, 10) > 0) {
    console.log(`Alex already has ${countRes.rows[0].count} transactions. Skipping re-seed.`);
    return;
  }

  console.log('Generating realistic 6-month historical transactions for Alex Rostova...');

  // Helper date generators
  const now = new Date();
  const formatIsoDate = (d) => d.toISOString().split('T')[0];

  const generateTransactions = () => {
    const list = [];

    // Generate transactions for past 6 months
    for (let m = 5; m >= 0; m--) {
      const year = now.getFullYear();
      const month = now.getMonth() - m;
      const targetDate = new Date(year, month, 1);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();

      // Monthly Salary
      list.push({
        type: 'income',
        category: 'Salary & Wages',
        amount: 12500.00,
        description: 'Anthropic Labs Corp — Direct Deposit Executive Salary',
        date: formatIsoDate(new Date(targetYear, targetMonth, 1))
      });

      // Monthly Dividend / Yield
      list.push({
        type: 'income',
        category: 'Staking & Yield',
        amount: 2000.00,
        description: 'Lido Validator Staking — Automated Yield Reinvest',
        date: formatIsoDate(new Date(targetYear, targetMonth, 5))
      });

      // Freelance advisory
      list.push({
        type: 'income',
        category: 'Freelance & Consulting',
        amount: 3200.00,
        description: 'Stripe Treasury Advisory Retainer',
        date: formatIsoDate(new Date(targetYear, targetMonth, 18))
      });

      // Rent
      list.push({
        type: 'expense',
        category: 'Housing & Rent',
        amount: 3450.00,
        description: 'Skyline Lofts Penthouse — Monthly Lease Wire Transfer',
        date: formatIsoDate(new Date(targetYear, targetMonth, 2))
      });

      // Cloud Infrastructure
      list.push({
        type: 'expense',
        category: 'Cloud Infrastructure & Tech',
        amount: 384.50 + (m * 12.3),
        description: 'Amazon Web Services — Cluster Compute & S3 Vault',
        date: formatIsoDate(new Date(targetYear, targetMonth, 3))
      });

      // Software Subscriptions
      list.push({
        type: 'expense',
        category: 'Software Tools & Subscriptions',
        amount: 210.00,
        description: 'GitHub Inc Enterprise Copilot — 25 Seats',
        date: formatIsoDate(new Date(targetYear, targetMonth, 6))
      });

      list.push({
        type: 'expense',
        category: 'Software Tools & Subscriptions',
        amount: 144.00,
        description: 'Figma Enterprise Organization Subscription',
        date: formatIsoDate(new Date(targetYear, targetMonth, 10))
      });

      // Utilities
      list.push({
        type: 'expense',
        category: 'Utilities & Bills',
        amount: 195.40 + (m * 8.2),
        description: 'Fiber Optic Gigabit Internet & Grid Electric',
        date: formatIsoDate(new Date(targetYear, targetMonth, 12))
      });

      // Health & Fitness
      list.push({
        type: 'expense',
        category: 'Healthcare & Fitness',
        amount: 380.00,
        description: 'Equinox Destination — Tier X Performance Membership',
        date: formatIsoDate(new Date(targetYear, targetMonth, 15))
      });

      // Grocery & Dining
      list.push({
        type: 'expense',
        category: 'Food & Dining',
        amount: 420.50 + (m * 15.0),
        description: 'Whole Foods Market — Organic Provisions & Pantry',
        date: formatIsoDate(new Date(targetYear, targetMonth, 8))
      });

      list.push({
        type: 'expense',
        category: 'Food & Dining',
        amount: 185.00,
        description: 'Starbucks Reserve Roastery & Executive Dining',
        date: formatIsoDate(new Date(targetYear, targetMonth, 16))
      });

      list.push({
        type: 'expense',
        category: 'Food & Dining',
        amount: 320.00,
        description: 'Nobu Downtown — Client Dinner Meeting',
        date: formatIsoDate(new Date(targetYear, targetMonth, 24))
      });

      // Transportation
      list.push({
        type: 'expense',
        category: 'Transportation',
        amount: 184.20,
        description: 'Uber Black — SFO to Financial District Transit',
        date: formatIsoDate(new Date(targetYear, targetMonth, 20))
      });

      // Shopping / Hardware
      if (m % 2 === 0) {
        list.push({
          type: 'expense',
          category: 'Shopping & Gear',
          amount: 890.00,
          description: 'Apple Store Online — Studio Display & Hardware Accessories',
          date: formatIsoDate(new Date(targetYear, targetMonth, 22))
        });
      }

      // Entertainment
      list.push({
        type: 'expense',
        category: 'Entertainment & Media',
        amount: 95.00,
        description: 'Criterion Channel & Audiophile Streaming Subscriptions',
        date: formatIsoDate(new Date(targetYear, targetMonth, 27))
      });
    }

    return list;
  };

  const sampleTxs = generateTransactions();

  for (const tx of sampleTxs) {
    const categoryId = categoryMap.get(tx.category);
    if (!categoryId) continue;

    await query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [alexId, categoryId, tx.type, tx.amount, tx.description, tx.date]
    );
  }

  console.log(`Seeded ${sampleTxs.length} historical transactions for Alex Rostova.`);
  console.log('Database seeding successfully finished.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
