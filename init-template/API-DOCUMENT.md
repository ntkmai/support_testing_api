# API Documentation & Test Flow

Mô tả flow nghiệp vụ và các test case cho API.

## 📋 Overview

**Project**: {PROJECT_NAME}  
**Description**: {DESCRIPTION}  
**Base URL**: `http://localhost:3000`  
**Version**: 1.0.0

## 🔐 Authentication

### Flow đăng nhập

1. **POST** `/api/auth/login`
   - Input: username, password
   - Output: JWT token
   - Token sử dụng cho các request tiếp theo

### Test Cases

| Case | Username | Password | Expected |
|------|----------|----------|----------|
| TC01 | admin | admin123 | ✅ Success - Admin token |
| TC02 | user01 | user123 | ✅ Success - User token |
| TC03 | invalid | wrong | ❌ 401 Unauthorized |
| TC04 | (empty) | (empty) | ❌ 400 Bad Request |

---

## 📦 CRUD Operations

### 1. Create Item

**Endpoint**: `POST /api/items`

**Flow**:
1. User đã login (có token)
2. Submit form tạo item mới
3. Server validate data
4. Tạo record trong DB
5. Return item đã tạo

**Test Cases**:

| Case | Data | Expected Result |
|------|------|-----------------|
| TC05 | Valid data | ✅ 201 Created |
| TC06 | Missing name | ❌ 400 Validation error |
| TC07 | Invalid value | ❌ 400 Invalid type |
| TC08 | No token | ❌ 401 Unauthorized |

### 2. Get List

**Endpoint**: `GET /api/items`

**Flow**:
1. Client request danh sách
2. Server query DB
3. Return array items

**Test Cases**:

| Case | Scenario | Expected |
|------|----------|----------|
| TC09 | Normal request | ✅ 200 + array |
| TC10 | Empty database | ✅ 200 + [] |
| TC11 | No token | ❌ 401 |

### 3. Get By ID

**Endpoint**: `GET /api/items/{id}`

**Test Cases**:

| Case | ID | Expected |
|------|-----|----------|
| TC12 | Valid ID | ✅ 200 + item detail |
| TC13 | ID not exists | ❌ 404 Not Found |
| TC14 | Invalid ID format | ❌ 400 Bad Request |

### 4. Update

**Endpoint**: `PUT /api/items/{id}`

**Flow**:
1. Get item hiện tại
2. Update một số fields
3. Validate
4. Save changes
5. Return updated item

**Test Cases**:

| Case | Scenario | Expected |
|------|----------|----------|
| TC15 | Update name only | ✅ 200 Updated |
| TC16 | Update value only | ✅ 200 Updated |
| TC17 | Update all fields | ✅ 200 Updated |
| TC18 | ID not exists | ❌ 404 Not Found |
| TC19 | Invalid data | ❌ 400 Validation error |

### 5. Delete

**Endpoint**: `DELETE /api/items/{id}`

**Flow**:
1. Check item tồn tại
2. Check quyền xóa
3. Soft delete hoặc hard delete
4. Return success

**Test Cases**:

| Case | Scenario | Expected |
|------|----------|----------|
| TC20 | Delete existing | ✅ 200 Deleted |
| TC21 | Delete not exists | ❌ 404 Not Found |
| TC22 | Delete twice | ❌ 404 (đã xóa) |

---

## 🔄 Complete Flow Example

### Workflow: Tạo và phê duyệt item

```
1. Login (TC01)
   POST /api/auth/login
   → Get admin token

2. Create item (TC05)
   POST /api/items
   → Item status: pending

3. Get item detail (TC12)
   GET /api/items/{id}
   → Verify status: pending

4. Approve item
   PUT /api/items/{id}/approve
   → Status: active

5. Get updated item (TC12)
   GET /api/items/{id}
   → Verify status: active
```

---

## 📊 Test Data

### Users
```json
{
  "admin": { "username": "admin", "password": "admin123", "role": "admin" },
  "user01": { "username": "user01", "password": "user123", "role": "user" }
}
```

### Items
```json
{
  "valid_item": {
    "name": "Test Item",
    "value": 100,
    "status": "active"
  },
  "invalid_item": {
    "name": "",
    "value": -1
  }
}
```

---

## ⚠️ Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not exists |
| 500 | Server Error | Database error |

---

## 📝 Notes

- Tất cả requests (trừ login) đều cần Authorization header
- Token có thời gian sống 24h
- Validation errors trả về chi tiết field nào sai
- Timestamps theo format ISO 8601
