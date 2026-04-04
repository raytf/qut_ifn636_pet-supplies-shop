# Petopia — Implementation Status

Tracks progress against the feature branches defined in `docs/requirements.md`.

## Branches

| Branch | Status | PR |
|---|---|---|
| `feature/user-model-role` | ✅ Complete | Merged |
| `feature/category-crud` | ✅ Complete | Merged |
| `feature/product-crud` | ✅ Complete | Merged |
| `feature/admin-dashboard` | ✅ Complete | Merged |
| `feature/ui-polish` | 🚧 In progress | — |
| `feature/seed-readme` | 🔲 Not started | — |

---

## `feature/user-model-role` ✅

- [x] `docs/git-workflow.md` committed to `main` before branching
- [x] `User` model — added `role` (admin/customer, default customer) and `createdAt`; removed `university` and `address`
- [x] `middleware/adminMiddleware.js` — exports `{ adminCheck }`, returns 403 for non-admins
- [x] `authController.js` — `getProfile` returns `role`; `loginUser` returns `role`; `getUsers` added (admin-only)
- [x] `authRoutes.js` — `GET /api/auth/users` wired with `protect + adminCheck`
- [x] `backend/test/authController_test.js` — 5 unit tests (getUsers ×2, getProfile ×3); replaces broken `example_test.js`
- [x] `backend/docs/api-reference.md` — Auth routes documented
- [x] `backend/docs/data-models.md` — User schema documented

---

## `feature/category-crud` ✅

- [x] `Category` model (`name`, `description`, `createdAt`)
- [x] `controllers/categoryController.js` — full CRUD with JSDoc comments; delete blocked if products reference category
- [x] `routes/categoryRoutes.js` — all routes protected with `protect + adminCheck`
- [x] `server.js` — `/api/categories` registered
- [x] `backend/docs/api-reference.md` — Category routes added
- [x] `backend/docs/data-models.md` — Category schema added
- [x] `backend/test/categoryController_test.js` — 8 unit tests across all 5 controller functions (13 total passing)

---

## `feature/product-crud` ✅

- [x] `Product` model (`name`, `description`, `price`, `category`, `stock`, `imageUrl`, `createdAt`)
- [x] `controllers/productController.js` — full CRUD, search/filter, category populate and validation
- [x] `routes/productRoutes.js` — all routes protected with `protect + adminCheck`
- [x] `server.js` — `/api/products` registered
- [x] `backend/docs/api-reference.md` — Product routes added (API reference complete for all entities)
- [x] `backend/docs/data-models.md` — Product schema added (data models doc complete)
- [x] `backend/test/productController_test.js` — 10 unit tests; 24 total passing
- [x] `categoryController.js` — lazy Product require replaced with top-level import
- [x] Frontend: `ProductForm.jsx`, `ProductList.jsx`, `AddProduct.jsx`, `EditProduct.jsx`

---

## `feature/admin-dashboard` ✅

- [x] `AuthContext.js` — localStorage persistence added (session survives refresh)
- [x] `ProtectedRoute.jsx` — React Router v6 `<Navigate>` redirect to `/login`
- [x] `Navbar.jsx` — rebranded to Petopia Admin, full nav links, mobile hamburger menu
- [x] `Login.jsx` — rebranded, inline errors, redirects to `/dashboard`
- [x] `Register.jsx` — rebranded, inline errors
- [x] `Profile.jsx` — removed university/address, shows role and joined date, inline errors
- [x] `Dashboard.jsx` — three stat cards (products, categories, users) fetched in parallel
- [x] `CategoryForm.jsx` — inline add/edit form with validation
- [x] `CategoryList.jsx` — full CRUD table with inline form, delete confirmation
- [x] `UserList.jsx` — read-only user table with role badges
- [x] `App.js` — all routes wired with ProtectedRoute, task routes removed
- [x] `Tasks.jsx`, `TaskForm.jsx`, `TaskList.jsx` — removed
- [x] `frontend/docs/component-guide.md` — route map, component props, Tailwind conventions

---

## `feature/ui-polish` 🔲

- [ ] Responsive layout tested at 375px and 1024px+
- [ ] Loading states on all data-fetching pages
- [ ] Error messages displayed (using `error.response?.data?.message`)
- [ ] Delete confirmation dialogs on all destructive actions
- [ ] No `console.log` in production code
- [ ] No placeholder text remaining
- [ ] All tests passing locally (`npm test` from `backend/`)
- [ ] GitHub Actions pipeline verified green end-to-end

---

## `feature/seed-readme` 🔲

- [ ] `backend/seed.js` — admin user, 4–5 categories, 8–10 products
- [ ] `README.md` — setup instructions, env vars, admin credentials, public URL
- [ ] Seed run on EC2 instance
- [ ] Public URL verified (login, CRUD flows working)
- [ ] All report screenshots captured
