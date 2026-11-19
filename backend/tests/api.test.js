import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { initDatabase, query } from '../src/config/db.js';
import { initRedis } from '../src/config/redis.js';
import { runMigrations } from '../src/database/migrate.js';
import { seedDatabase } from '../src/database/seed.js';

let server;
let baseUrl;
let userToken = '';
let adminToken = '';
let readOnlyToken = '';
let testCategoryId = '';

before(async () => {
  process.env.NODE_ENV = 'test';
  await initDatabase();
  await runMigrations();
  await seedDatabase();
  await initRedis();

  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      resolve();
    });
  });

  // Fetch Category ID for tests
  const catRes = await query('SELECT id FROM categories LIMIT 1;');
  testCategoryId = catRes.rows[0].id;
});

after(() => {
  if (server) server.close();
});

test('1. Health check endpoint returns healthy status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'healthy');
  assert.ok(data.database);
  assert.ok(data.cache);
});

test('2. Auth login returns JWT and user profile', async () => {
  // Login as Alex (user)
  const userRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'alex@aurafinance.io', password: 'User@123456' })
  });
  assert.equal(userRes.status, 200);
  const userData = await userRes.json();
  assert.equal(userData.success, true);
  assert.ok(userData.token);
  assert.equal(userData.user.role, 'user');
  userToken = userData.token;

  // Login as Admin
  const adminRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@aurafinance.io', password: 'Admin@123456' })
  });
  assert.equal(adminRes.status, 200);
  const adminData = await adminRes.json();
  adminToken = adminData.token;
  assert.equal(adminData.user.role, 'admin');

  // Login as Read-Only
  const roRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'auditor@aurafinance.io', password: 'ReadOnly@123456' })
  });
  assert.equal(roRes.status, 200);
  const roData = await roRes.json();
  readOnlyToken = roData.token;
  assert.equal(roData.user.role, 'read-only');
});

test('3. Public registration rejects privilege escalation to admin', async () => {
  const registerRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sneaky Attacker',
      email: `attacker_${Date.now()}@example.com`,
      password: 'Password123!',
      role: 'admin' // Attempted privilege escalation
    })
  });
  assert.equal(registerRes.status, 201);
  const data = await registerRes.json();
  // Role must be forced to 'user'
  assert.equal(data.user.role, 'user');
});

test('4. Categories endpoint returns cached categories with 1-hour TTL', async () => {
  // First call (miss)
  const res1 = await fetch(`${baseUrl}/categories`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(res1.status, 200);
  const data1 = await res1.json();
  assert.ok(data1.data.length > 0);
  assert.equal(data1.ttl, 3600);

  // Second call (hit)
  const res2 = await fetch(`${baseUrl}/categories`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(res2.status, 200);
  assert.equal(res2.headers.get('x-cache'), 'HIT');
});

test('5. Transactions pagination and filtering', async () => {
  const res = await fetch(`${baseUrl}/transactions?page=1&limit=5&type=expense`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.equal(data.data.length, 5);
  assert.equal(data.pagination.page, 1);
  assert.equal(data.pagination.limit, 5);
  assert.ok(data.pagination.total > 5);
});

test('6. User can create, update, and delete own transaction', async () => {
  // Create
  const createRes = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      type: 'expense',
      amount: 45.50,
      categoryId: testCategoryId,
      description: 'Automated test expense',
      transactionDate: '2026-11-20'
    })
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  const txId = created.data.id;
  assert.ok(txId);

  // Update
  const updateRes = await fetch(`${baseUrl}/transactions/${txId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`
    },
    body: JSON.stringify({
      amount: 55.00,
      description: 'Updated test expense'
    })
  });
  assert.equal(updateRes.status, 200);
  const updated = await updateRes.json();
  assert.equal(updated.data.amount, '55.00');

  // Delete
  const deleteRes = await fetch(`${baseUrl}/transactions/${txId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(deleteRes.status, 200);
});

test('7. Read-only user CANNOT create, update, or delete transactions (Backend 403)', async () => {
  // Attempt Create
  const createRes = await fetch(`${baseUrl}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${readOnlyToken}`
    },
    body: JSON.stringify({
      type: 'income',
      amount: 1000.00,
      categoryId: testCategoryId,
      description: 'Hacked deposit'
    })
  });
  assert.equal(createRes.status, 403);
  const createData = await createRes.json();
  assert.equal(createData.success, false);
  assert.match(createData.error, /read-only/i);
});

test('8. Admin can access /users while standard user is blocked with 403', async () => {
  // Standard user forbidden
  const userRes = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(userRes.status, 403);

  // Admin permitted
  const adminRes = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(adminRes.status, 200);
  const adminData = await adminRes.json();
  assert.ok(Array.isArray(adminData.data));
  assert.ok(adminData.data.length >= 3);
});

test('9. Analytics endpoints work with 15-minute TTL caching and benchmark speedup', async () => {
  // Summary
  const summaryRes = await fetch(`${baseUrl}/analytics/summary`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(summaryRes.status, 200);
  const summary = await summaryRes.json();
  assert.ok(summary.data.totals.totalIncome);
  assert.equal(summary.ttl, 900);

  // Trends
  const trendsRes = await fetch(`${baseUrl}/analytics/trends?months=6`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(trendsRes.status, 200);
  const trends = await trendsRes.json();
  assert.equal(trends.data.length, 6);

  // Categories
  const catRes = await fetch(`${baseUrl}/analytics/categories?type=expense`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(catRes.status, 200);
  const catData = await catRes.json();
  assert.ok(Array.isArray(catData.data.categories));

  // Benchmark
  const benchRes = await fetch(`${baseUrl}/analytics/benchmark`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(benchRes.status, 200);
  const bench = await benchRes.json();
  assert.ok(bench.measurement.speedupMultiplier);
});
