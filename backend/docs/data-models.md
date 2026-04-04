# Petopia Data Models

Mongoose schemas for the Petopia admin system. All models live in `backend/models/`.

---

## User

Stores admin and customer accounts. Passwords are bcrypt-hashed via a `pre('save')` hook and are never returned in API responses.

| Field     | Type   | Required | Constraints / Notes                              |
|-----------|--------|----------|--------------------------------------------------|
| name      | String | ✅       | —                                                |
| email     | String | ✅       | unique                                           |
| password  | String | ✅       | bcrypt-hashed via pre-save hook; excluded from responses |
| role      | String | —        | enum: `admin`, `customer`; default: `customer`   |
| createdAt | Date   | —        | default: `Date.now`                              |

---

## Category

> _To be documented in `feature/category-crud`_

---

## Product

> _To be documented in `feature/product-crud`_
