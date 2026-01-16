# Quick Start - API Documentation

## Base URL

```
http://localhost:9000
```

## Authentication

**Login Endpoint:** `POST /api/auth/sign-in`

**Credentials:**

```json
{
  "username": "boss",
  "password": "1"
}
```

**Response:**

```json
{
  "status": true,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "..."
  }
}
```

**Sử dụng Token:**

```
Authorization: Bearer {access_token}
```

---

## API Endpoints

### Promotional Programs

| Method | Endpoint                                       | Description   |
| ------ | ---------------------------------------------- | ------------- |
| GET    | `/api/promotional-programs`                    | Lấy danh sách |
| GET    | `/api/promotional-programs/{id}`               | Chi tiết      |
| POST   | `/api/promotional-programs`                    | Tạo mới       |
| PUT    | `/api/promotional-programs/{id}`               | Cập nhật      |
| PATCH  | `/api/promotional-programs/{id}/toggle-active` | Bật/Tắt       |
| DELETE | `/api/promotional-programs/{id}`               | Xóa           |

### Combos

| Method | Endpoint             | Description   |
| ------ | -------------------- | ------------- |
| GET    | `/api/combos`        | Lấy danh sách |
| GET    | `/api/combos/{id}`   | Chi tiết      |
| GET    | `/api/combos/search` | Tìm kiếm      |

---

## Templates

**Tất cả templates có trong file:** `promotional-programs-api.json`

### Create Promotional Programs

| Template                                       | Mô tả                          |
| ---------------------------------------------- | ------------------------------ |
| `09-create-buy-combo-get-product.json`         | Mua combo tặng sản phẩm        |
| `10-create-buy-product-get-combo.json`         | Mua sản phẩm tặng combo        |
| `11-create-buy-combo-discount-combo.json`      | Mua combo giảm giá combo khác  |
| `12-create-buy-multiple-combos-get-combo.json` | Mua nhiều combo tặng combo     |
| `13-create-combo-flash-sale.json`              | Flash sale combo               |
| `14-create-combo-product-get-product.json`     | Combo + sản phẩm tặng sản phẩm |
| `15-create-happy-hour-all-combos.json`         | Happy hour giảm nhiều combo    |

### Update/Toggle

| Template                  | Mô tả                 |
| ------------------------- | --------------------- |
| `06-update-program.json`  | Cập nhật chương trình |
| `07-disable-program.json` | Tắt chương trình      |
| `08-enable-program.json`  | Bật chương trình      |

---

## Test IDs

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
  "message": "Success message"
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

---

## Chi Tiết

Xem thêm:

- `promotional-programs/README.md` - API chi tiết Promotional Programs
- `combos/README.md` - API chi tiết Combos
- `promotional-programs-api.json` - Full API collection
