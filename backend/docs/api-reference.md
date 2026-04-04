# Petopia API Reference

**Base URL:** `http://localhost:5001`

## Authentication

All protected routes require the following header:

```
Authorization: Bearer <token>
```

Tokens are returned by the `/register` and `/login` endpoints and expire after 30 days.

---

## Auth Routes (`/api/auth`)

| Method | Endpoint   | Auth  | Body / Query Params                    | Success Response                              |
|--------|------------|-------|----------------------------------------|-----------------------------------------------|
| POST   | /register  | None  | `{ name, email, password }`            | `{ id, name, email, token }` (201)            |
| POST   | /login     | None  | `{ email, password }`                  | `{ id, name, email, role, token }`            |
| GET    | /profile   | User  | —                                      | `{ id, name, email, role, createdAt }`        |
| PUT    | /profile   | User  | `{ name?, email? }`                    | `{ id, name, email, role, token }`            |
| GET    | /users     | Admin | —                                      | `[{ _id, name, email, role, createdAt }]`     |

**Error responses:** `{ message: '...' }` with appropriate status (400, 401, 403, 404, 500)

---

## Category Routes (`/api/categories`)

> _To be documented in `feature/category-crud`_

---

## Product Routes (`/api/products`)

> _To be documented in `feature/product-crud`_
