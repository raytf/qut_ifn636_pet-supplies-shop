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

Represents a product in the pet supplies shop. Each product must belong to a Category.

| Field       | Type     | Required | Constraints / Notes                        |
|-------------|----------|----------|--------------------------------------------|
| name        | String   | ✅       | trim, maxlength 100                        |
| description | String   | —        | trim, maxlength 500                        |
| price       | Number   | ✅       | min 0                                      |
| category    | ObjectId | ✅       | ref: `Category`; validated on create/update |
| stock       | Number   | ✅       | min 0, default 0                           |
| imageUrl    | String   | —        | trim; URL to product image                 |
| createdAt   | Date     | —        | default: `Date.now`                        |
