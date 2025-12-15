# 🚀 Quick Start - Test Tỷ Lệ Lọ trong 5 phút

## Bước 1: Cài đặt REST Client (30 giây)

1. Mở VS Code
2. Nhấn `Ctrl+Shift+X`
3. Tìm "REST Client"
4. Click Install

## Bước 2: Mở File Test (10 giây)

Mở file: [jar-ratio-test.http](jar-ratio-test.http)

## Bước 3: Login & Lấy Token (1 phút)

```http
### Click "Send Request" ở đây 👇
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "55555",
  "password": "55555"
}
```

Token sẽ tự động lưu vào `@token_55555`

## Bước 4: Lấy Jar IDs (30 giây)

```http
### Click "Send Request" ở đây 👇
GET http://localhost:3000/api/jars?page=1&limit=20
Authorization: Bearer {{token_55555}}
```

Copy 3 jar_id từ response và paste vào:

```http
@jar_id_1 = paste_jar_id_here
@jar_id_2 = paste_jar_id_here
@jar_id_3 = paste_jar_id_here
```

## Bước 5: Tạo Tỷ Lệ Lọ (1 phút)

```http
### Click "Send Request" ở đây 👇
POST http://localhost:3000/api/jar-ratios
Authorization: Bearer {{token_55555}}
Content-Type: application/json

{
  "month": 12,
  "year": 2025,
  "note": "Test nhanh",
  "details": [
    {
      "jar_id": "{{jar_id_1}}",
      "ratio": 40,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    },
    {
      "jar_id": "{{jar_id_2}}",
      "ratio": 35,
      "planned_revenue": 80000000,
      "minimum_cost": 25000000
    },
    {
      "jar_id": "{{jar_id_3}}",
      "ratio": 25,
      "planned_revenue": 60000000,
      "minimum_cost": 15000000
    }
  ]
}
```

Lưu `jar_ratio_id` từ response!

## Bước 6: Test Duyệt 3 Cấp (2 phút)

### Cấp 1 - Giám đốc:
```http
### Login giám đốc
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "0018",
  "password": "0018"
}

### Duyệt
PUT http://localhost:3000/api/jar-ratios/{{jar_ratio_id}}/approve
Authorization: Bearer {{token_0018}}
Content-Type: application/json

{
  "status": "approved",
  "note": "OK"
}
```

### Cấp 2 - Chủ tịch:
```http
### Login chủ tịch
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "0025",
  "password": "0025"
}

### Duyệt
PUT http://localhost:3000/api/jar-ratios/{{jar_ratio_id}}/approve
Authorization: Bearer {{token_0025}}
Content-Type: application/json

{
  "status": "approved",
  "note": "OK"
}
```

### Cấp 3 - Chủ tịch HĐQT:
```http
### Login chủ tịch HĐQT
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "44444",
  "password": "44444"
}

### Duyệt FINAL
PUT http://localhost:3000/api/jar-ratios/{{jar_ratio_id}}/approve
Authorization: Bearer {{token_44444}}
Content-Type: application/json

{
  "status": "approved",
  "note": "Hoàn tất"
}
```

## Bước 7: Xem Báo Cáo (30 giây)

```http
### Click "Send Request" ở đây 👇
GET http://localhost:3000/api/jar-ratios/report?month=12&year=2025
Authorization: Bearer {{token_55555}}
```

## ✅ Done!

Bạn vừa test xong flow hoàn chỉnh:
- ✅ Tạo tỷ lệ lọ
- ✅ Duyệt 3 cấp
- ✅ Xem báo cáo

---

## 📚 Muốn test kỹ hơn?

Xem file [TEST-README.md](TEST-README.md) để test đầy đủ 31 test cases!

---

## 🎯 Accounts

| User | Password | Role |
|------|----------|------|
| 55555 | 55555 | Nhân viên |
| 0018 | 0018 | Giám đốc |
| 0025 | 0025 | Chủ tịch |
| 44444 | 44444 | Chủ tịch HĐQT |

---

**Thời gian:** ~5 phút
**File:** [jar-ratio-test.http](jar-ratio-test.http)
