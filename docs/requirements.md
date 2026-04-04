# IFN636 Assessment 1.2 — Implementation Requirements

## Project Context

**What this is:** Extend a starter "task manager" app into a Pet Supplies Shop (Petopia) admin/management system with CRUD operations, deployed to an EC2 instance via GitHub Actions CI/CD.

**Starter project provides:**
- Auth system: Register, Login, Get Profile, Update Profile (all working)
- User model (name, email, hashed password, university, address)
- JWT middleware (`authMiddleware.js`)
- MongoDB connection (`config/db.js`)
- React frontend with AuthContext, Navbar, Login/Register/Profile pages
- Axios config pointing to `localhost:5001`
- GitHub Actions CI/CD pipeline (checkout → install → build → test → deploy with PM2)
- Task routes/components exist as **non-functional placeholders** to be replaced

**What you're building:** Replace the task manager placeholder with a Pet Supplies Shop management system. The scope is an **admin management portal** — not a full customer-facing e-commerce storefront. Focus on clean CRUD across 2–3 entities with solid code quality.

**Time constraint:** Less than 1 week. Every decision below optimises for HD marks within this window.

---

## Rubric-Driven Priority Matrix

| Criterion | Weight | HD Requirement | Priority |
|---|---|---|---|
| Backend (Node + Express + MongoDB) | 5 pts | Fully functional, clean, thoroughly documented with clear comments | 🔴 CRITICAL |
| Frontend (React.js) | 3 pts | Responsive, clean UI using React best practices | 🔴 CRITICAL |
| Auth & Authorisation | 3 pts | Fully functional, clean, thoroughly documented | 🟡 MEDIUM (mostly provided) |
| GitHub Version Control & Branching | 3 pts | Meaningful commits, feature branches, completed PRs | 🔴 CRITICAL |
| CI/CD Pipeline | 3 pts | Fully functional GitHub Actions → EC2, pm2 status, public URL | 🔴 CRITICAL |
| README.md & Report | 3 pts | Clear setup instructions, public URL, credentials, well-structured | 🟡 MEDIUM |

**Total: 20 pts (20% of final grade)**

---

## Scope Decision: What to Build

### Entities to Implement (3 CRUD entities)

Given <1 week, implement **3 well-done entities** rather than 5 half-done ones:

1. **Products** (full CRUD) — the core entity, most complex
2. **Categories** (full CRUD) — supports product organisation, demonstrates relational data
3. **Users** (extend existing) — already has Create/Read/Update, add admin role + list users

### What to Skip (time-saving cuts)

- ❌ Customer-facing storefront (browsing, product cards, public pages)
- ❌ Shopping cart & checkout flow
- ❌ Orders entity & order management
- ❌ Customer registration (public) — admin creates/manages the system
- ❌ Complex search/filter UI (basic search is fine)

### Why This Scope Gets HD

The rubric grades **code quality, documentation, and practices** — not feature count. Three entities with clean models, proper validation, clear comments, error handling, responsive UI, good Git history, and working CI/CD scores higher than six entities with spaghetti code and no comments.

---

## 1. Backend Requirements (5 pts)

### 1.1 Existing Auth — Extend, Don't Rewrite

The starter project's auth system is already functional. Make these targeted modifications:

**User Model changes:**
- Add `role` field: `{ type: String, enum: ['admin', 'customer'], default: 'customer' }`
- Keep existing fields (name, email, password, university, address) — removing university/address is optional but cleaning them up shows intentionality
- Add `createdAt` timestamp if not present

**Auth route changes:**
- Modify `POST /api/auth/register` — keep as-is but ensure the role defaults to `customer`
- Add seed script that creates an admin user (see Section 6)
- Modify profile endpoint to return the user's role

**Middleware changes:**
- Add `isAdmin` middleware that checks `req.user.role === 'admin'` — use after `authMiddleware` on admin-only routes
- Keep the existing `authMiddleware.js` as-is

### 1.2 Category Model & Routes

**Model: `models/Category.js`**
```
Fields:
  - name: String, required, unique, trim, maxlength 50
  - description: String, trim, maxlength 200
  - createdAt: Date, default Date.now
```

**Routes: `/api/categories`**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Admin | List all categories |
| GET | `/api/categories/:id` | Admin | Get single category |
| POST | `/api/categories` | Admin | Create category |
| PUT | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete category (only if no products reference it) |

**Controller: `controllers/categoryController.js`**
- Every function must have a JSDoc comment explaining what it does
- Use try/catch with proper HTTP status codes (400 for validation, 404 for not found, 500 for server error)
- DELETE must check for products referencing this category before allowing deletion — return 400 with message if products exist
- **Response format — match the existing `authController.js` pattern:**
  - Success: return the data object directly, e.g. `res.status(201).json(category)` or `res.json(categories)`
  - Error: `res.status(4xx|5xx).json({ message: '...' })` — no `success` wrapper key

### 1.3 Product Model & Routes

**Model: `models/Product.js`**
```
Fields:
  - name: String, required, trim, maxlength 100
  - description: String, trim, maxlength 500
  - price: Number, required, min 0
  - category: ObjectId, ref 'Category', required
  - stock: Number, required, min 0, default 0
  - imageUrl: String, trim (URL to product image — can be placeholder)
  - createdAt: Date, default Date.now
```

**Routes: `/api/products`**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Admin | List all products (populate category name). Support `?search=` query param for name search, `?category=` for filtering by category ID |
| GET | `/api/products/:id` | Admin | Get single product (populate category) |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

**Controller: `controllers/productController.js`**
- JSDoc comments on every function
- `getProducts` must support optional query params: `search` (regex match on name, case-insensitive) and `category` (filter by category ObjectId)
- Validate that the referenced category exists on create/update
- Populate category name in GET responses (use `.populate('category', 'name')`)
- Same response format as `categoryController`: direct data on success, `{ message: '...' }` on error

### 1.4 Users — Admin List Endpoint

**Add to existing auth/user routes:**

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/auth/users` | Admin | List all users (exclude password field). Return name, email, role, createdAt |

This is a simple read-only endpoint. No need for admin to edit/delete other users — it just demonstrates the admin can view registered users.

### 1.5 Backend Code Quality Standards (for HD)

These are what separate HD from Distinction:

- **Comments:** Every controller function gets a JSDoc block (`/** @desc ..., @route ..., @access ... */`). Every model gets a header comment explaining the entity. Complex logic gets inline comments.
- **Consistent error handling:** Create a simple error response helper or use consistent try/catch patterns. Never send raw error objects to the client.
- **Input validation:** Validate required fields, types, and constraints in controllers (or use express-validator if time permits — but manual validation is fine).
- **Clean file structure:** Follow the starter project's pattern. Don't over-engineer — match the existing style.
- **Environment variables:** Use `.env` for `MONGO_URI`, `JWT_SECRET`, `PORT`. Document all in README. `backend/.env.example` already exists with placeholder values — keep it committed and never commit the real `.env`.

### 1.6 File Structure (Backend)

```
backend/
├── config/
│   └── db.js                    # (existing) MongoDB connection
├── controllers/
│   ├── authController.js        # (existing, modify) Add user list
│   ├── categoryController.js    # (new) Full CRUD
│   └── productController.js     # (new) Full CRUD
├── docs/                        # (existing, empty) Backend-specific documentation
│   ├── api-reference.md         # (new, Day 1–2) All REST endpoints
│   └── data-models.md           # (new, Day 1–2) Mongoose schema reference
├── middleware/
│   ├── authMiddleware.js        # (existing) JWT verification
│   └── adminMiddleware.js       # (new) Role check
├── models/
│   ├── User.js                  # (existing, modify) Add role field
│   ├── Category.js              # (new)
│   └── Product.js               # (new)
├── routes/
│   ├── authRoutes.js            # (existing, modify) Add GET /users
│   ├── categoryRoutes.js        # (new)
│   └── productRoutes.js         # (new)
├── seed.js                      # (new) Seed script
├── server.js                    # (existing, modify) Register new routes
├── .env                         # (existing, modify) — never commit this
├── .env.example                 # (existing) placeholder values for onboarding — keep committed
└── package.json
```

---

## 2. Frontend Requirements (3 pts)

### 2.1 Replace Task Manager UI with Pet Shop Admin Panel

Remove all task-related components and pages. Replace with:

**Pages to create:**

| Page | Route | Purpose |
|---|---|---|
| Dashboard | `/` or `/dashboard` | Landing page after login. Show summary counts (total products, categories, users). Simple stat cards. |
| Product List | `/products` | Table/list of all products with search bar and category filter dropdown. Edit/Delete buttons per row. |
| Add Product | `/products/new` | Form: name, description, price, stock, category (dropdown), imageUrl. Validates before submit. |
| Edit Product | `/products/edit/:id` | Same form as Add, pre-populated with existing data. |
| Category List | `/categories` | Table/list of categories. Inline or modal add/edit. Delete button with confirmation. |
| User List | `/users` | Read-only table: name, email, role, joined date. |
| Profile | `/profile` | (existing) Keep and clean up. |

**Pages to keep (modify):**
- `/login` — keep, update branding/text from task manager to Petopia
- `/register` — keep but only for creating accounts; could be hidden from nav if admin-only

**Pages to remove:**
- `/tasks` — remove entirely

### 2.2 Navigation

Update the Navbar component:
- **Brand:** "Petopia Admin" (or "Pet Supplies Shop")
- **Logged-in links:** Dashboard, Products, Categories, Users, Profile, Logout
- **Logged-out links:** Login, Register
- **Mobile responsive:** Hamburger menu or collapsible nav at smaller breakpoints

### 2.3 Component Structure

```
frontend/
├── docs/                            # (existing, empty) Frontend-specific documentation
│   └── component-guide.md           # (new, Day 3) Component tree, props, Tailwind conventions
└── src/
    ├── components/
    │   ├── Navbar.jsx               # (existing, modify) Update links & branding
    │   ├── ProductForm.jsx          # (new) Reusable for Add/Edit
    │   ├── ProductList.jsx          # (new) Table with search/filter
    │   ├── CategoryList.jsx         # (new) Table with inline add/edit/delete
    │   ├── CategoryForm.jsx         # (new) Modal or inline form
    │   ├── UserList.jsx             # (new) Read-only table
    │   ├── Dashboard.jsx            # (new) Summary cards
    │   └── ProtectedRoute.jsx       # (new) Redirect to login if not authed
    ├── context/
    │   └── AuthContext.js           # (existing) Keep as-is
    ├── pages/
    │   ├── Login.jsx                # (existing, modify) Update text — note: no "Page" suffix
    │   ├── Register.jsx             # (existing, modify) Update text
    │   ├── Profile.jsx              # (existing, modify) Clean up
    │   ├── Dashboard.jsx            # (new)
    │   ├── ProductList.jsx          # (new)
    │   ├── AddProduct.jsx           # (new)
    │   ├── EditProduct.jsx          # (new)
    │   ├── CategoryList.jsx         # (new)
    │   └── UserList.jsx             # (new)
    ├── App.js                       # (existing, modify) Update routes
    └── axiosConfig.jsx              # (existing, modify) Update base URL for production
```

**File naming conventions (match existing codebase):**
- Components and pages use `.jsx` extension
- Context files (`AuthContext.js`) and config files (`App.js`) use `.js`
- Page filenames have no "Page" suffix — e.g. `Login.jsx` not `LoginPage.jsx`
- If a page and component share a name (e.g. `ProductList`), put them in their respective `pages/` and `components/` folders

### 2.4 Frontend Code Quality Standards (for HD)

- **React best practices:** Functional components with hooks (useState, useEffect, useContext). No class components.
- **Loading states:** Show a spinner or "Loading..." while fetching data. Every API call should have a loading state.
- **Error handling:** Display user-friendly error messages (toast or inline). Never show raw API errors. Since the backend returns `{ message: '...' }` on errors, display `error.response?.data?.message` or a fallback string.
- **Form validation:** Validate on the client side before submitting (required fields, price > 0, etc.).
- **Responsive design:** All pages must work on mobile. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Test at 375px and 1024px+ breakpoints.
- **Clean code:** Consistent naming, no dead code, no console.logs left in. Comments on complex logic.
- **Confirmation dialogs:** Before any delete action, show a confirm dialog.
- **Auth token — match existing pattern:** The existing `Profile.jsx` passes the token per-request: `{ headers: { Authorization: \`Bearer ${user.token}\` } }`. Follow this same pattern in all protected API calls, reading `user.token` from `useAuth()`. The `user` object in context stores the raw login response `{ id, name, email, token }`.
- **Session persistence:** The current `AuthContext` resets on page refresh (no localStorage). Add localStorage persistence to `AuthContext`: save `user` to `localStorage` on `login()`, clear it on `logout()`, and initialise state with `useState(() => JSON.parse(localStorage.getItem('user')) || null)`. Without this, refreshing the page while navigating to screenshots will log the user out.

### 2.5 Styling Approach

**Use Tailwind CSS — it is already installed and configured.** Do not add Bootstrap or a second CSS framework.

The project already has:
- `tailwindcss@^3` in `frontend/devDependencies`
- `frontend/tailwind.config.js` scanning `./src/**/*.{js,jsx,ts,tsx}`
- `postcss` and `autoprefixer` also installed

**What to do:**
- `frontend/src/index.css` already contains the three `@tailwind` directives — do not modify it
- Use Tailwind utility classes directly in JSX — follow the pattern already established in `Navbar.jsx`, `Login.jsx`, `Register.jsx`, and `Profile.jsx`
- Use responsive prefixes (`sm:`, `md:`, `lg:`) for the mobile requirement — test at 375px and 1024px+
- Keep class strings readable — if a class list grows beyond ~8 utilities, extract it into a named `const` above the JSX or a small helper component
- **Tailwind best practices:**
  - Prefer utility composition over `@apply` (avoid `@apply` except for truly global reusable patterns)
  - Use `clsx` or template literals for conditional classes (e.g. active nav link, error states)
  - Stick to the default Tailwind palette — don't introduce custom colours unless necessary

Do NOT spend time implementing Figma designs pixel-perfect. The rubric grades "responsive, clean UI using React best practices" — not visual fidelity.

---

## 3. Authentication & Authorisation (3 pts)

### 3.1 What's Already Done (from starter)

- ✅ User registration with bcrypt password hashing
- ✅ Login with JWT token generation
- ✅ AuthContext in React storing user + token
- ✅ `authMiddleware.js` validating JWT on protected routes
- ✅ Profile view and update

### 3.2 What to Add

- **Role-based access:** Add `role` field to User model. Create `middleware/adminMiddleware.js` that checks role after auth.
- **`adminMiddleware.js` — match existing middleware pattern:**
  - Export a named function: `module.exports = { adminCheck }` (mirrors `authMiddleware.js` exporting `{ protect }`)
  - If `req.user.role !== 'admin'`, respond with **HTTP 403** and body `{ message: 'Access denied. Admins only.' }` — do not call `next()`. This matches the `{ message: '...' }` error format used throughout `authController.js`.
- **Protected routes (backend):** All `/api/categories`, `/api/products`, `/api/auth/users` routes chain both middleware functions. Follow the exact same pattern as `authRoutes.js`: `router.get('/', protect, adminCheck, getCategories)` — import `{ protect }` from `authMiddleware` and `{ adminCheck }` from `adminMiddleware`.
- **Protected routes (frontend):** Create `ProtectedRoute.jsx` using React Router v6 (`<Navigate to="/login" />` — not v5 `<Redirect>`). If `user` from `useAuth()` is null, redirect to `/login`. If a non-admin tries to access admin pages, a 403 from the API is sufficient — no separate frontend role check is strictly required, but is a nice-to-have.
- **Seed an admin user:** The seed script must create at least one admin account with known credentials.

### 3.3 Documentation Requirements

- Comment the middleware explaining what it checks and why
- In the report/README, explicitly list the admin credentials
- Show that regular users cannot access admin endpoints (mention in report)

---

## 4. GitHub Version Control & Branching (3 pts)

### 4.1 Branching Strategy

Use `feature/xxx` branches merged via Pull Requests into `main`:

| Branch | Purpose | PR into |
|---|---|---|
| `main` | Production-ready code, deploys via CI/CD | — |
| `feature/user-model-role` | Add role to User model + admin middleware | `main` |
| `feature/category-crud` | Category model, routes, controller, frontend | `main` |
| `feature/product-crud` | Product model, routes, controller, frontend | `main` |
| `feature/admin-dashboard` | Dashboard page, user list, navbar updates | `main` |
| `feature/ui-polish` | Responsive design, error handling, cleanup | `main` |
| `feature/seed-readme` | Seed script, README, final documentation | `main` |

### 4.2 Commit Standards

- **Meaningful messages:** `feat: add Category model and CRUD routes`, `fix: handle duplicate category name error`, `docs: add API documentation to README`
- **Atomic commits:** One logical change per commit. Don't commit "everything" in one go.
- **Minimum ~15-20 meaningful commits** across branches to show real history
- **Each feature branch:** At least 3-5 commits before merging via PR

### 4.3 Pull Request Standards

- Every feature branch merges via a PR (not direct push to main)
- PR title describes what the feature adds
- Brief description in the PR body (1-2 sentences is fine)
- At least 5-6 completed PRs by submission

### 4.4 What NOT to Do

- ❌ Don't push everything directly to main
- ❌ Don't use "update", "fix", "changes" as commit messages
- ❌ Don't have 2-3 massive commits — the rubric calls out "well-documented commit history"
- ❌ Don't forget to actually close/merge your PRs

---

## 5. CI/CD Pipeline (3 pts)

### 5.1 What the Starter Already Provides

The `.github/workflows/ci.yml` already:
1. Triggers on push to `main`
2. Runs on a self-hosted runner (your EC2 instance)
3. Installs dependencies (Yarn)
4. Builds the frontend
5. Runs backend tests
6. Writes `.env` from GitHub Secrets
7. Restarts with PM2

### 5.2 What to Modify/Verify

- **Update the workflow** if your package manager differs (npm vs yarn)
- **Configure GitHub Secrets** on your repo: `MONGO_URI`, `JWT_SECRET`, `PORT`, and any others
- **Set up the self-hosted runner** on your EC2 instance (if not already)
- **PM2 process config:** Ensure PM2 starts both backend (Node) and serves the built frontend
- **Verify the public URL** works after deployment (e.g., `http://54.252.43.234:5001` or whatever port)

### 5.3 Evidence Required for Report

The rubric says: "step by step screenshot of CI/CD pipeline details." Capture:

1. GitHub Actions workflow file (show the YAML)
2. GitHub Actions run log showing all steps passing (green checkmarks)
3. EC2 terminal showing `pm2 status` with processes running
4. Browser showing the app at the public URL
5. GitHub Secrets page (blurred values) showing configured secrets

### 5.4 Test File

**⚠️ The existing `backend/test/example_test.js` will break the pipeline immediately.** It imports `../models/Task` and `../controllers/taskController` — both of which don't exist once the task manager placeholder is removed. The CI pipeline runs `npm test` (Mocha) before deploying; a failing test blocks deployment entirely.

**This is not optional for HD.** Replace `example_test.js` with tests for your new controllers.

#### Test Stack (already installed — no new packages needed)

| Package | Role | Location |
|---|---|---|
| `mocha@^11` | Test runner | `devDependencies` |
| `chai@^4` + `chai-http@^4` | Assertions | `dependencies` |
| `sinon@^19` | Stubs & spies | `devDependencies` |
| `mongoose` | ObjectId helpers in tests | `dependencies` |

Run tests: `cd backend && npm test`

#### Required Tests (minimum for HD)

Write one test file per controller in `backend/test/`. Follow the **5-step pattern** (Stub → Mock req/res → Call → Assert → Restore) for every `it` block. Never connect to a real database — always stub the Mongoose method.

**`categoryController_test.js`** — minimum 3 tests:
- `getCategories` → returns all categories (200)
- `createCategory` → creates successfully (201)
- `createCategory` → returns 500 on DB error

**`productController_test.js`** — minimum 3 tests:
- `getProducts` → returns all products (200)
- `createProduct` → creates successfully (201)
- `deleteProduct` → returns 404 if product not found

**`authController_test.js`** — minimum 2 tests:
- `getUsers` → returns user list for admin (200)
- `getUsers` → returns 500 on DB error

#### Test File Structure

```js
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const { expect } = chai;

const Category = require('../models/Category');
const { getCategories, createCategory } = require('../controllers/categoryController');

describe('getCategories', () => {
  it('should return all categories', async () => {
    // 1. Stub
    const stub = sinon.stub(Category, 'find').resolves([{ name: 'Dogs' }]);
    // 2. Mock req/res
    const req = {};
    const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };
    // 3. Call
    await getCategories(req, res);
    // 4. Assert
    expect(res.json.calledOnce).to.be.true;
    // 5. Restore
    stub.restore();
  });
});
```

If time is genuinely too tight, at minimum delete the content of `example_test.js` and replace it with one passing smoke test so the pipeline stays green.

---

## 6. Seed Script (seed.js)

Create `backend/seed.js` that:

1. Connects to MongoDB
2. Clears existing data (optional — include a `--fresh` flag or just always clear)
3. Creates an admin user:
   - Email: `admin@petopia.com`
   - Password: `Admin123!`
   - Role: `admin`
   - Name: `Admin User`
4. Creates 4-5 categories:
   - Dogs, Cats, Birds, Fish, Small Pets
5. Creates 8-10 sample products spread across categories:
   - e.g., "Premium Dog Food" ($29.99, Dogs, stock: 50), "Cat Scratching Post" ($45.00, Cats, stock: 20), etc.
6. Logs what was created and exits

**Run command:** `node seed.js`

Include this in the README setup instructions.

---

## 7. README.md (part of 3 pts)

### Required Contents

```markdown
# Petopia — Pet Supplies Shop

## Project Overview
Brief description of the pet supplies shop management system.
Built with React, Node.js/Express, and MongoDB.

## Tech Stack
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose ODM)
- Authentication: JWT + bcrypt
- Deployment: AWS EC2 + PM2 + GitHub Actions CI/CD

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas URI)
- Yarn or npm

### Backend Setup
cd backend
npm install (or yarn)
cp .env.example .env    # then fill in values
node seed.js             # seed the database
npm start                # starts on port 5001

### Frontend Setup
cd frontend
npm install (or yarn)
npm start                # starts on port 3000

### Environment Variables
MONGO_URI=mongodb://localhost:27017/petopia
JWT_SECRET=your_jwt_secret_here
PORT=5001

## Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@petopia.com | Admin123! |

## Live Demo
Public URL: http://<EC2-IP>:<PORT>

## Features
- Admin authentication (login/register)
- Product management (full CRUD)
- Category management (full CRUD)
- User list (admin view)
- Dashboard with summary statistics
- Responsive design
- Automated CI/CD deployment

## API Endpoints
[List key endpoints]

## GitHub Repository
[Link]
```

---

## 8. Report Requirements

The submission report needs screenshots as evidence. Based on the rubric and submission template:

### Screenshots to Capture (with your GitHub username & AWS visible)

1. **GitHub repo** — showing backend/ and frontend/ directories, commit history
2. **Feature branches** — list of branches in the repo
3. **Pull requests** — at least 2-3 merged PRs shown
4. **CI/CD workflow YAML** — the GitHub Actions file
5. **CI/CD run log** — successful pipeline execution (green checkmarks)
6. **EC2 pm2 status** — terminal showing pm2 list with processes online
7. **Live app screenshots** — login page, dashboard, product list, category list at the public URL
8. **README.md** — rendered in GitHub showing setup instructions and credentials

---

## 9. Implementation Order (Critical Path)

Given <1 week, follow this exact order. Each step maps to a feature branch.

### 9.1 Documentation Files to Create

Four supporting docs are woven into the plan below (marked 📄). Each lives close to the code it describes:

| File | Location | Created | Updated |
|---|---|---|---|
| `git-workflow.md` | `docs/` | Day 1 | Never (stable) |
| `api-reference.md` | `backend/docs/` | Day 1 | Day 2 |
| `data-models.md` | `backend/docs/` | Day 1 | Day 2 |
| `component-guide.md` | `frontend/docs/` | Day 3 | Day 3 |

---

**`docs/git-workflow.md`** — project-level, created on Day 1 before the first feature branch:
```markdown
# Git Workflow

## Branch Naming
feature/<short-description>   e.g. feature/category-crud

## Commit Message Format
<type>: <short description>
Types: feat | fix | docs | style | refactor | test | chore
Examples:
  feat: add Category model and CRUD routes
  fix: handle duplicate category name error
  docs: complete API reference for product routes

## PR Checklist
- [ ] Branch is up to date with main
- [ ] All tests pass locally (npm test from backend/)
- [ ] No console.logs, no .env committed
- [ ] PR title matches the feature branch purpose
```

---

**`backend/docs/api-reference.md`** — started Day 1, completed Day 2:
```markdown
# Petopia API Reference

Base URL: http://localhost:5001

## Authentication
All protected routes require: Authorization: Bearer <token>

## Auth Routes (/api/auth)
| Method | Endpoint  | Auth  | Body / Params             | Response                   |
|--------|-----------|-------|---------------------------|----------------------------|
| POST   | /register | None  | { name, email, password } | { id, name, email, token } |
| POST   | /login    | None  | { email, password }       | { id, name, email, token } |
| GET    | /profile  | User  | —                         | { name, email, ... }       |
| PUT    | /profile  | User  | { name, email, ... }      | { id, name, email, token } |
| GET    | /users    | Admin | —                         | [{ name, email, role, createdAt }] |

## Category Routes (/api/categories)
...

## Product Routes (/api/products)
...
```

---

**`backend/docs/data-models.md`** — started Day 1 (User, Category), completed Day 2 (Product):
```markdown
# Data Models

## User
| Field      | Type   | Required | Notes                          |
|------------|--------|----------|--------------------------------|
| name       | String | ✅       |                                |
| email      | String | ✅       | unique                         |
| password   | String | ✅       | bcrypt-hashed via pre-save hook |
| role       | String | —        | enum: admin, customer; default: customer |
| createdAt  | Date   | —        | default: Date.now              |

## Category
...

## Product
...
```

---

**`frontend/docs/component-guide.md`** — created Day 3 alongside the UI:
```markdown
# Frontend Component Guide

## Route Map
| Route              | Page component     | Auth required |
|--------------------|--------------------|---------------|
| /login             | Login.jsx          | No            |
| /dashboard         | Dashboard.jsx      | Yes           |
| /products          | ProductList.jsx    | Yes           |
| /products/new      | AddProduct.jsx     | Yes           |
| /products/edit/:id | EditProduct.jsx    | Yes           |
| /categories        | CategoryList.jsx   | Yes           |
| /users             | UserList.jsx       | Yes           |

## Shared Components
| Component         | Props                        | Purpose                    |
|-------------------|------------------------------|----------------------------|
| Navbar.jsx        | —                            | Top nav, uses useAuth()    |
| ProtectedRoute.jsx| { children }                 | Redirects if user is null  |
| ProductForm.jsx   | { product?, onSubmit }       | Add and Edit product form  |
| CategoryForm.jsx  | { category?, onSubmit }      | Add and Edit category form |

## Tailwind Conventions
- Form inputs: `w-full p-2 border rounded mb-4`
- Primary button: `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700`
- Danger button: `bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700`
- Page wrapper: `max-w-4xl mx-auto p-6`
- Table: `w-full text-left border-collapse`
```

---

### Day 1: Foundation (Branches: `feature/user-model-role`, `feature/category-crud`)
1. Fork/clone starter → create your GitHub repo
2. Set up EC2 self-hosted runner (if not done)
3. Verify `backend/.env.example` is committed with placeholder keys — it already exists, just ensure it's in the repo and `.env` is in `.gitignore`
4. **📄 Create `docs/git-workflow.md`** — write this *before* any feature branches so every commit follows the conventions. See format in Section 9.1. Commit directly to `main` as part of initial setup.
5. Add `role` field to User model
6. Create `middleware/adminMiddleware.js` — export `{ adminCheck }`, return 403 + `{ message: 'Access denied. Admins only.' }` for non-admins
7. Create Category model, controller, routes
8. Register category routes in `server.js`
9. Test category CRUD with Postman/curl
10. **📄 Create `backend/docs/api-reference.md`** — document the Auth routes and Category routes with request bodies, response shapes, and auth requirements. Use the format in Section 9.1. This doubles as your Postman reference.
11. **📄 Create `backend/docs/data-models.md`** — document the User and Category schemas (fields, types, constraints, relationships). Use the format in Section 9.1.
12. **Commit + PR:** merge `feature/user-model-role`, then `feature/category-crud`

### Day 2: Products (Branch: `feature/product-crud`)
1. Create Product model, controller, routes
2. Register product routes in `server.js`
3. Test product CRUD with Postman/curl (including search/filter)
4. **📄 Update `backend/docs/api-reference.md`** — add the Product routes (all 5 endpoints, including `?search=` and `?category=` query params) and `GET /api/auth/users`. The API reference is now complete for the full backend surface.
5. **📄 Update `backend/docs/data-models.md`** — add the Product schema. All three models are now documented.
6. Start frontend: replace task components with product list page
7. Build ProductForm component (add/edit)
8. **Commit + PR:** merge `feature/product-crud`

### Day 3: Admin UI (Branch: `feature/admin-dashboard`)
1. Build Dashboard page (stat cards)
2. Build CategoryList page with add/edit/delete UI
3. Build UserList page (GET /api/auth/users endpoint + frontend)
4. Update Navbar — rebrand, update links
5. Update Login/Register pages — rebrand text
6. Add ProtectedRoute component
7. Update App.js routes
8. **📄 Create `frontend/docs/component-guide.md`** — now that all components and pages exist, document the route map, each shared component's props and purpose, and the Tailwind class conventions used throughout. Use the format in Section 9.1.
9. **Commit + PR:** merge `feature/admin-dashboard`

### Day 4: Polish + CI/CD (Branch: `feature/ui-polish`)
1. Responsive CSS — test all pages at mobile and desktop
2. Add loading states to all data-fetching pages
3. Add error handling (try/catch on all API calls, display messages)
4. Add delete confirmation dialogs
5. Clean up console.logs, dead code, placeholder text
6. **Replace `backend/test/example_test.js`** — write tests for `categoryController`, `productController`, and `authController` using Mocha + Chai + Sinon (see Section 5.4). Run `npm test` from `backend/` and confirm all pass locally before pushing.
7. Verify GitHub Actions pipeline deploys to EC2
8. **Commit + PR:** merge `feature/ui-polish`

### Day 5: Documentation + Final (Branch: `feature/seed-readme`)
1. Write seed script
2. Run seed on EC2
3. Write `README.md` — link to `backend/docs/api-reference.md` for the API endpoints section rather than duplicating it inline; link to `backend/docs/data-models.md` for the data model overview
4. Verify public URL works (login, CRUD flows)
5. Capture all screenshots for report
6. Write report (use submission template)
7. **Commit + PR:** merge `feature/seed-readme`
8. Final check: `pm2 status` shows online, public URL loads, login works

---

## 10. Acceptance Checklist

Before submission, verify every item:

### Backend
- [ ] Category CRUD: create, read (all + single), update, delete — all working
- [ ] Product CRUD: create, read (all + single + search + filter), update, delete — all working
- [ ] User list endpoint returns all users (admin only)
- [ ] All routes protected with auth + admin middleware
- [ ] Delete category blocked if products reference it
- [ ] Product validates that category exists
- [ ] Consistent JSON response format
- [ ] JSDoc comments on every controller function
- [ ] No raw error objects sent to client
- [ ] `adminMiddleware.js` exports `{ adminCheck }`, returns 403 + `{ message: 'Access denied. Admins only.' }` for non-admins

### Frontend
- [ ] Tailwind CSS utility classes used throughout — no Bootstrap or second CSS framework
- [ ] All new components/pages use `.jsx` extension (context + config files use `.js`)
- [ ] `ProtectedRoute.jsx` uses React Router v6 `<Navigate>` (not v5 `<Redirect>`)
- [ ] `AuthContext` persists `user` to localStorage — refresh does not log the user out
- [ ] Auth token attached per-request as `Authorization: Bearer ${user.token}` (matching `Profile.jsx` pattern)
- [ ] Dashboard shows summary counts
- [ ] Product list with search and category filter
- [ ] Add/Edit product form with validation
- [ ] Category list with add/edit/delete
- [ ] User list (read-only)
- [ ] Delete confirmations on all destructive actions
- [ ] Loading states on all data-fetching pages
- [ ] Error messages displayed to user
- [ ] Responsive at 375px and 1024px+
- [ ] No placeholder text remaining ("Your App Name", "CRUD", "Your Form Name")
- [ ] No console.logs in production code

### Auth
- [ ] Admin user can log in and access all pages
- [ ] Non-authenticated users redirected to login
- [ ] JWT token stored and sent with requests
- [ ] Role field on User model works correctly

### GitHub
- [ ] 5+ feature branches created and merged via PR
- [ ] 15+ meaningful commit messages
- [ ] No direct pushes to main (all via PR)
- [ ] Clean repo — no node_modules, no `.env` committed
- [ ] `.env.example` committed with placeholder values

### CI/CD
- [ ] GitHub Actions workflow triggers on push to main
- [ ] All pipeline steps pass (green) — including `npm test` in backend
- [ ] `backend/test/example_test.js` replaced with tests for the new controllers (Mocha + Chai + Sinon, no real DB)
- [ ] PM2 running on EC2 (`pm2 status` shows online)
- [ ] App accessible at public URL
- [ ] GitHub Secrets configured

### README & Supporting Docs
- [ ] Setup instructions (backend + frontend)
- [ ] Environment variables listed
- [ ] Admin credentials provided
- [ ] Public URL included
- [ ] Tech stack described
- [ ] `docs/git-workflow.md` committed — branch naming, commit format, PR checklist
- [ ] `backend/docs/api-reference.md` committed and complete — all Auth, Category, and Product endpoints with request/response shapes
- [ ] `backend/docs/data-models.md` committed and complete — User, Category, and Product schemas documented
- [ ] `frontend/docs/component-guide.md` committed and complete — route map, shared component props, Tailwind class conventions

### Report
- [ ] All required screenshots captured (with GitHub username + AWS visible)
- [ ] CI/CD step-by-step screenshots
- [ ] GitHub repo link included
