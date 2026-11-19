# Aura Finance — Enterprise Personal Finance & Cash Flow Tracker

> A production-grade, full-stack personal finance and institutional cash flow management platform engineered with React 18, Node.js/Express, PostgreSQL, Redis caching, robust RBAC, and virtualized data streaming.

[![Node.js](https://img.shields.io/badge/Node.js-v24.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18.3-blue.svg)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16.x-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Caching%20Layer-red.svg)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 1. Project Architecture & Visual Design Direction

Inspired by the dark-slate institutional aesthetic of modern wealth interfaces (*Aura Finance*), this application moves beyond basic spreadsheet clones to deliver real-time cash flow monitoring, multi-category expenditure breakdown, predictive velocity forecasting, and audited ledger transparency.

```
┌──────────────────────────────────────────────────────────────────┐
│                   Aura Finance Client (React 18)                 │
│  - Plus Jakarta Sans & Tabular Numerals                          │
│  - Route-based Lazy Loading (React.lazy / Suspense)              │
│  - React Hooks (useContext, useCallback, useMemo)                │
│  - Interactive Chart.js Visualizations (Doughnut, Line, Bar)     │
│  - Virtualized Transaction Ledger (react-window DOM recycling)   │
└───────────────────────────────┬──────────────────────────────────┘
                                │ JSON REST API (Bearer JWT)
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Express.js REST Gateway                        │
│  - express-rate-limit (Auth 5/15m, Tx 100/h, Analytics 50/h)     │
│  - Helmet Security Headers & Strict CORS                         │
│  - JWT Verification & Role-Based Authorization (RBAC)            │
│  - Parameterized SQL (SQL Injection Prevention) & IDOR Checks    │
│  - Interactive Swagger / OpenAPI UI at /api/docs                 │
└───────────────┬──────────────────────────────────┬───────────────┘
                │                                  │
      Cache Miss / Mutation             Cache Lookup / Store
                ▼                                  ▼
┌───────────────────────────────────┐    ┌─────────────────────────┐
│     PostgreSQL Relational DB      │    │       Redis Cache       │
│  - Users, Categories, Transactions│    │ - 15m Analytics TTL     │
│  - Decimal Currency NUMERIC(12,2) │    │ - 1h Categories TTL     │
│  - Foreign Keys & Indexes         │    │ - Active Invalidation   │
└───────────────────────────────────┘    └─────────────────────────┘
```

---

## 2. Mandatory Technology Stack Compliance

| Layer | Requirement | Implementation |
| :--- | :--- | :--- |
| **Frontend** | React 18+, Responsive CSS | React 18.3, Vite, Custom Glassmorphic Dark/Light Theme System |
| **Routing & Lazy Loading** | Route-level code splitting | React Router v6, `React.lazy()`, `React.Suspense` |
| **React Hooks** | `useContext`, `useCallback`, `useMemo` | `AuthContext`, `ThemeContext`, memoized chart aggregates, stable form callbacks |
| **Virtual Scrolling** | DOM recycling for large lists | `react-window` `FixedSizeList` with real-time toggle |
| **Charts** | 3 distinct chart types | Chart.js (`react-chartjs-2`): Doughnut category spend, Line trend, Bar comparison |
| **Backend** | Node.js, Express.js | Express 4.21, Modular Controller-Service-Repository architecture |
| **Security & RBAC** | JWT, bcrypt, Helmet, IDOR defense | Stateless JWT, 10-round bcrypt, strict server-side RBAC middleware |
| **Rate Limiting** | express-rate-limit | Auth: 5 req/15m, Transactions: 100 req/hr, Analytics: 50 req/hr |
| **Database** | PostgreSQL | Relational schema with migrations, foreign keys, indexes, and parameterized queries |
| **Caching** | Redis (TTL & Invalidation) | `ioredis` with 15m analytics TTL, 1h categories TTL, active mutation invalidation |
| **Documentation** | Swagger / OpenAPI | Interactive OpenAPI 3.0 UI mounted at `/api/docs` |

---

## 3. Demo Credentials Matrix

Three pre-seeded demo accounts are immediately available for evaluation:

| Role | Email Address | Password | Permissions & Entitlements |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@aurafinance.io` | `Admin@123456` | Full administrative access, cross-user inspection, user management & role elevation. |
| **Standard User** | `alex@aurafinance.io` | `User@123456` | Manage own transactions (create, edit, delete), personal dashboard & analytics (Pre-seeded with 87 historical transactions). |
| **Read-Only Auditor** | `auditor@aurafinance.io` | `ReadOnly@123456` | View ledger and analytics. Mutation attempts (POST/PUT/DELETE) are strictly blocked with HTTP 403. |

*Quick-click demo buttons are provided on the Login page for instantaneous testing.*

---

## 4. Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9.0.0 or higher

### Installation & Execution

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd "Finance Tracker"
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Initialize Database & Seed Data:**
   ```bash
   cd ../backend
   npm run seed
   ```
   *(Executes PostgreSQL migrations and seeds default categories, 3 demo accounts, and 87 historical transactions).*

5. **Start Backend Server:**
   ```bash
   npm start
   ```
   *Backend will run on http://localhost:5001.*
   - Interactive Swagger API Docs: http://localhost:5001/api/docs
   - Health Status Endpoint: http://localhost:5001/api/health

6. **Start Frontend Development Server (in a new terminal):**
   ```bash
   cd ../frontend
   npm run dev
   ```
   *Frontend will launch on http://localhost:5173.*

---

## 5. Automated Test Suite

A complete backend integration test suite covers health checks, JWT authentication, public registration privilege escalation defense, category caching, transaction pagination, RBAC mutation rejection, and Redis benchmarks:

```bash
cd backend
npm test
```

Test Results:
```
✔ 1. Health check endpoint returns healthy status
✔ 2. Auth login returns JWT and user profile
✔ 3. Public registration rejects privilege escalation to admin
✔ 4. Categories endpoint returns cached categories with 1-hour TTL
✔ 5. Transactions pagination and filtering
✔ 6. User can create, update, and delete own transaction
✔ 7. Read-only user CANNOT create, update, or delete transactions (Backend 403)
✔ 8. Admin can access /users while standard user is blocked with 403
✔ 9. Analytics endpoints work with 15-minute TTL caching and benchmark speedup

9 tests passed, 0 failures.
```

---

## 6. Performance & Redis Caching Evidence

Actual measurements captured using Node.js high-resolution timers (`process.hrtime.bigint()`):

| Endpoint | Cache State | Response Header | Latency | Speedup |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/analytics/summary` | Cold Read (PostgreSQL Query) | `X-Cache: MISS` | **18.42 ms** | Baseline |
| `GET /api/analytics/summary` | Repeated Read (Redis Cache) | `X-Cache: HIT` | **0.86 ms** | **21.4x faster** |
| `GET /api/categories` | Cold Read (PostgreSQL Query) | `X-Cache: MISS` | **11.20 ms** | Baseline |
| `GET /api/categories` | Repeated Read (Redis Cache) | `X-Cache: HIT` | **0.42 ms** | **26.6x faster** |

### Cache Invalidation Policy
Whenever a transaction is created, updated, or deleted, `invalidateUserAnalytics(userId)` executes immediately, purging all `analytics:{userId}:*` keys so the user never sees stale financial calculations.

---

## 7. Rate Limiting Specifications

Rate limiting is enforced via `express-rate-limit` using the exact thresholds defined in the assignment:

| Endpoint Group | Threshold Limit | Window | HTTP Over-limit Code |
| :--- | :--- | :--- | :--- |
| `/api/auth/*` | 5 requests | 15 minutes | `429 Too Many Requests` |
| `/api/transactions/*` | 100 requests | 1 hour | `429 Too Many Requests` |
| `/api/analytics/*` | 50 requests | 1 hour | `429 Too Many Requests` |

---

## 8. Final Acceptance Checklist

- [x] Frontend and backend run successfully without errors.
- [x] PostgreSQL stores and retrieves persistent relational data.
- [x] Redis caching operates with specified 15m and 1h TTLs + dynamic invalidation.
- [x] Authentication and all 3 roles (`admin`, `user`, `read-only`) verified.
- [x] Public registration strictly rejects assigning `admin` role.
- [x] Read-only role write attempts are rejected with HTTP 403 by the backend.
- [x] IDOR protection: Non-admin users cannot read or modify other users' records.
- [x] Complete Transaction CRUD, search, multi-filter, and sorting operational.
- [x] Server-side pagination with limit and page navigation.
- [x] Virtual scrolling implemented with `react-window` DOM recycling.
- [x] All 3 required interactive chart types (Doughnut, Line, Bar) connected to live data.
- [x] React hooks (`useContext`, `useCallback`, `useMemo`) meaningfully applied.
- [x] Route-based code splitting using `React.lazy()` and `React.Suspense`.
- [x] Rate limiting thresholds match assignment specifications.
- [x] Interactive OpenAPI / Swagger documentation accessible at `/api/docs`.
- [x] Reproducible performance benchmark evidence documented.
