# User Management API

API endpoints để quản lý người dùng trong hệ thống.

## Endpoints

### GET /api/users
Lấy danh sách tất cả người dùng

**Response Example:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin"
    },
    {
      "id": 2,
      "username": "user1",
      "email": "user1@example.com",
      "role": "user"
    }
  ]
}
```

### GET /api/users/:id
Lấy thông tin chi tiết người dùng theo ID

**Response Example:**
```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### POST /api/users
Tạo người dùng mới

**Request Body:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "SecurePass123",
  "role": "user"
}
```

**Response:**
```json
{
  "data": {
    "id": 3,
    "username": "newuser",
    "email": "newuser@example.com",
    "role": "user"
  },
  "message": "User created successfully"
}
```

### PUT /api/users/:id
Cập nhật thông tin người dùng

### DELETE /api/users/:id
Xóa người dùng khỏi hệ thống
