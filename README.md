# 🐾 Petopia Admin

A full-stack admin system for a pet supplies shop — built with **Node.js**, **Express**, **MongoDB**, and **React**.
Admins can manage product categories and a product catalogue with full CRUD, role-based access control, and a CI/CD pipeline via GitHub Actions.

---

## 🌐 Public URL

> **http://3.25.55.176**
> *(defaults to port 80)*

---

## 🗂 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, React Router v6, Tailwind CSS |
| Backend   | Node.js, Express 4                |
| Database  | MongoDB (Mongoose 6)              |
| Auth      | JWT (30-day tokens), bcrypt       |
| Testing   | Mocha, Chai, Sinon                |
| CI/CD     | GitHub Actions → self-hosted EC2 runner → PM2 |

---

## ⚙️ Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- A MongoDB Atlas cluster (or local MongoDB instance)

---

## 🚀 Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

# 2. Configure backend environment variables
cp backend/.env.example backend/.env
# Edit backend/.env — fill in MONGO_URI and JWT_SECRET

# 3. Install and run the backend
cd backend
npm install
npm run dev       # starts on http://localhost:5001

# 4. Seed the database (separate terminal)
npm run seed

# 5. Install and run the frontend (separate terminal)
cd ../frontend
npm install
npm start         # starts on http://localhost:3000
```

---

## 🔑 Environment Variables

Create `backend/.env` based on `backend/.env.example`:

| Variable    | Description                              | Example                        |
|-------------|------------------------------------------|--------------------------------|
| `MONGO_URI` | MongoDB connection string                | `mongodb+srv://user:pass@...`  |
| `JWT_SECRET`| Secret key used to sign JWTs             | any long random string         |
| `PORT`      | Port the Express server listens on       | `5001`                         |

---

## 🌱 Seed Data

Run the seed script once after configuring `.env`:

```bash
cd backend
npm run seed
```

This creates — and is safe to re-run (skips existing records):

| Resource      | Count | Details |
|---------------|-------|---------|
| Admin user    | 1     | See credentials below |
| Categories    | 5     | Dogs, Cats, Birds, Fish, Small Animals |
| Products      | 10    | 2–3 products per category |

**Seeded admin credentials:**

| Field    | Value               |
|----------|---------------------|
| Email    | `admin@petopia.com` |
| Password | `Admin@1234`        |

> ⚠️ Change the admin password after first login in a production environment.

---

## 📜 Available Scripts

### Backend (`cd backend`)

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start with nodemon (auto-reload)   |
| `npm start`     | Start in production mode           |
| `npm test`      | Run Mocha unit tests               |
| `npm run seed`  | Seed the database                  |

### Frontend (`cd frontend`)

| Command       | Description                              |
|---------------|------------------------------------------|
| `npm start`   | Start React dev server (port 3000)       |
| `npm run build` | Build optimised production bundle      |

---

## 🧪 Running Tests

```bash
cd backend
npm test
# Expected: 24 passing
```

Tests use Sinon stubs — no real database connection required.

---

## 🏗 Project Structure

```
├── backend/
│   ├── controllers/      # authController, categoryController, productController
│   ├── middleware/        # authMiddleware, adminMiddleware
│   ├── models/           # User, Category, Product
│   ├── routes/           # authRoutes, categoryRoutes, productRoutes
│   ├── test/             # Mocha unit tests
│   ├── seed.js           # Database seed script
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, ProtectedRoute, ProductForm, CategoryForm
│   │   ├── context/      # AuthContext (localStorage persistence)
│   │   └── pages/        # Dashboard, ProductList, AddProduct, EditProduct,
│   │                     #   CategoryList, UserList, Login, Register, Profile
│   └── docs/
│       └── component-guide.md
└── docs/
    ├── requirements.md
    ├── git-workflow.md
    └── STATUS.md
```

---

## 🔒 Role-Based Access

| Role       | Access                                       |
|------------|----------------------------------------------|
| `admin`    | Full access — manage products, categories, users |
| `customer` | Limited — profile only (no admin dashboard)  |

All admin routes are protected by `protect` + `adminCheck` middleware.
The seed script creates the only admin account; additional admins must be set directly in the database.
