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

Groups products into logical sections (e.g. Dogs, Cats, Birds). Cannot be deleted while products reference it.

| Field       | Type   | Required | Constraints / Notes                    |
|-------------|--------|----------|----------------------------------------|
| name        | String | ✅       | unique, trim, maxlength 50             |
| description | String | —        | trim, maxlength 200                    |
| createdAt   | Date   | —        | default: `Date.now`                    |

---

## Product

> _To be documented in `feature/product-crud`_
