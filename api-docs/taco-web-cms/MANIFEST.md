# Taco Web CMS - API Documentation

## Overview

API documentation for Promotional Programs and Combos module.

---

## Files

```
taco-web-cms/
├── promotional-programs-api.json    # API Collection
├── MANIFEST.md                      # This file
├── QUICK-START.md                   # Quick Reference
├── ENUMS.md                         # Enums & Constants
└── API-REFERENCE.md                 # TypeScript Interfaces
```

---

## Quick Start

### 1. Authentication

```
POST /api/auth/sign-in
Body: { "username": "boss", "password": "1" }
```

### 2. API Collection

File: `promotional-programs-api.json`

- All endpoints with examples
- Templates for all use cases

### 3. Quick Reference

File: `QUICK-START.md`

- Base URL & endpoints
- Test IDs

### 4. Enums & Constants

File: `ENUMS.md`

- PromotionType (buy_x_get_y, discount_percentage, etc.)
- DiscountType (percentage, fixed_amount)
- PromotionalProgramStatus (active, inactive, etc.)
  - **⚠️ Status is computed automatically** (read-only field)
  - Based on `active`, `start_date`, `end_date` with Vietnam timezone
- Condition types (time_range, day_of_week, etc.)

### 5. API Documentation

File: `API-REFERENCE.md`

- Complete TypeScript interfaces
- Request/Response types
- Enums & constants

---

## Test Data

### Combo IDs

```
ed2236f0-023f-45f2-b5fc-99e81ff44d53
94f7aa14-1b5a-4cad-a030-2d33dd7d451b
8737843b-ec65-48ba-a3c0-6e266510f38c
9d7268ed-a135-44cd-8ad6-e59217e0587e
4eda12cc-7843-4b43-98c3-4889322ff3e9
```

### Product IDs

```
231228ee-e9b7-4bae-8150-f24dfdb067f4
11e3e792-5014-4574-b096-d86f07cab248
d12b15ae-7b2e-41bd-801b-885375e3088e
aedcb000-1f1f-4c87-aadb-bd6591f34840
```

### Store ID

```
f3e2c02f-5ca1-4f63-9843-4a0ae8d6f262
```

---

## Response Format

### Success

```json
{
  "status": true,
  "data": { ... },
  "message": "Success"
}
```

### Error

```json
{
  "status": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

### Pagination

```json
{
  "status": true,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "size": 10,
    "totalPages": 10
  }
}
```
