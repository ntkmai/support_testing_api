# 🧪 Hướng Dẫn Test Hoàn Chỉnh - Quản Lý Tỷ Lệ Lọ

**Mục đích:** Test toàn bộ flow từ tạo tỷ lệ lọ → duyệt 3 cấp → báo cáo tỷ lệ lọ

**Base URL:** `http://localhost:3000`

**Ngày tạo:** 2025-12-15

---

## 📋 Mục Lục

1. [Chuẩn Bị & Setup](#1-chuẩn-bị--setup)
2. [CRUD Tỷ Lệ Lọ](#2-crud-tỷ-lệ-lọ)
3. [Quy Trình Duyệt 3 Cấp](#3-quy-trình-duyệt-3-cấp)
4. [Báo Cáo Tỷ Lệ Lọ](#4-báo-cáo-tỷ-lệ-lọ)
5. [Comment & Tương Tác](#5-comment--tương-tác)
6. [Export Excel](#6-export-excel)
7. [Test Cases Đặc Biệt](#7-test-cases-đặc-biệt)

---

## 1. Chuẩn Bị & Setup

### 1.1. Thông Tin Tài Khoản Test

| Vai trò | Username | Password | Quyền duyệt |
|---------|----------|----------|-------------|
| Nhân viên tạo | 55555 | 55555 | Tạo, Sửa, Xóa |
| Giám đốc | 0018 | 0018 | Duyệt cấp 1 |
| Chủ tịch | 0025 | 0025 | Duyệt cấp 2 |
| Chủ tịch HĐQT | 44444 | 44444 | Duyệt cấp 3 (Final) |

### 1.2. Lấy Access Token

**Chọn tài khoản và click vào link để copy:**

<details>
<summary>🔐 Login - Nhân viên (55555)</summary>

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "55555",
  "password": "55555"
}
```

**Lưu token vào đây:**
```
TOKEN_55555 = eyJhbGc...
```

</details>

<details>
<summary>🔐 Login - Giám đốc (0018)</summary>

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "0018",
  "password": "0018"
}
```

**Lưu token vào đây:**
```
TOKEN_0018 = eyJhbGc...
```

</details>

<details>
<summary>🔐 Login - Chủ tịch (0025)</summary>

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "0025",
  "password": "0025"
}
```

**Lưu token vào đây:**
```
TOKEN_0025 = eyJhbGc...
```

</details>

<details>
<summary>🔐 Login - Chủ tịch HĐQT (44444)</summary>

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "44444",
  "password": "44444"
}
```

**Lưu token vào đây:**
```
TOKEN_44444 = eyJhbGc...
```

</details>

### 1.3. Lấy Danh Sách Jar ID

```http
GET http://localhost:3000/api/jars?page=1&limit=20
Authorization: Bearer {{TOKEN_55555}}
```

**Lưu jar_id để dùng cho các test:**
```
JAR_ID_1 = ________________________________________
JAR_ID_2 = ________________________________________
JAR_ID_3 = ________________________________________
```

---

## 2. CRUD Tỷ Lệ Lọ

### 2.1. ✅ Tạo Tỷ Lệ Lọ Hợp Lệ (Tổng ratio = 100%)

```http
POST http://localhost:3000/api/jar-ratios
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "month": 12,
  "year": 2025,
  "note": "Test tỷ lệ lọ tháng 12/2025 - Flow hoàn chỉnh",
  "details": [
    {
      "jar_id": "{{JAR_ID_1}}",
      "ratio": 40,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    },
    {
      "jar_id": "{{JAR_ID_2}}",
      "ratio": 35,
      "planned_revenue": 80000000,
      "minimum_cost": 25000000
    },
    {
      "jar_id": "{{JAR_ID_3}}",
      "ratio": 25,
      "planned_revenue": 60000000,
      "minimum_cost": 15000000
    }
  ]
}
```

**Kết quả mong đợi:**
- ✅ Status: 201 Created
- ✅ Response có `id` (UUID)
- ✅ Status: `waiting_director`

**Lưu ID:**
```
JAR_RATIO_ID = ________________________________________
```

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.2. ❌ Tạo Tỷ Lệ Lọ - Tổng Ratio ≠ 100%

```http
POST http://localhost:3000/api/jar-ratios
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "month": 11,
  "year": 2025,
  "note": "Test validation - tổng ratio không đúng",
  "details": [
    {
      "jar_id": "{{JAR_ID_1}}",
      "ratio": 40,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    },
    {
      "jar_id": "{{JAR_ID_2}}",
      "ratio": 35,
      "planned_revenue": 80000000,
      "minimum_cost": 25000000
    }
  ]
}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Tổng tỉ lệ phải bằng 100%"

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.3. ❌ Tạo Tỷ Lệ Lọ - Trùng Tháng/Năm

```http
POST http://localhost:3000/api/jar-ratios
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "month": 12,
  "year": 2025,
  "note": "Test duplicate month/year",
  "details": [
    {
      "jar_id": "{{JAR_ID_1}}",
      "ratio": 50,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    },
    {
      "jar_id": "{{JAR_ID_2}}",
      "ratio": 50,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    }
  ]
}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Đã tồn tại tỉ lệ lọ cho tháng này"

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.4. ❌ Tạo Tỷ Lệ Lọ - Trùng jar_id Trong Details

```http
POST http://localhost:3000/api/jar-ratios
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "month": 10,
  "year": 2025,
  "note": "Test duplicate jar_id",
  "details": [
    {
      "jar_id": "{{JAR_ID_1}}",
      "ratio": 50,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    },
    {
      "jar_id": "{{JAR_ID_1}}",
      "ratio": 50,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    }
  ]
}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Các lọ trong danh sách chi tiết không được trùng nhau"

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.5. 📖 Xem Danh Sách Tỷ Lệ Lọ (Pagination)

```http
GET http://localhost:3000/api/jar-ratios?page=1&limit=10
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Response có `data` (array)
- ✅ Response có `metadata` (page, limit, total)

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.6. 📖 Xem Chi Tiết Tỷ Lệ Lọ

```http
GET http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Chi tiết đầy đủ: id, month, year, note, status
- ✅ jar_ratios: Array chi tiết từng lọ
- ✅ approvals: Lịch sử duyệt
- ✅ action: { is_approve, is_edit }

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.7. 📖 Xem Danh Sách Mobile

```http
GET http://localhost:3000/api/jar-ratios/mobile?page=1&limit=10
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Format mobile với timeline 3 cấp duyệt

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.8. 📖 Lấy Danh Sách Người Tạo

```http
GET http://localhost:3000/api/jar-ratios/creators
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Array of users (id, full_name, username)

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.9. ✏️ Cập Nhật Tỷ Lệ Lọ (Status = waiting_director)

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "month": 12,
  "year": 2025,
  "note": "Updated - Test tỷ lệ lọ tháng 12/2025",
  "details": [
    {
      "jar_id": "{{JAR_ID_1}}",
      "ratio": 45,
      "planned_revenue": 120000000,
      "minimum_cost": 35000000
    },
    {
      "jar_id": "{{JAR_ID_2}}",
      "ratio": 30,
      "planned_revenue": 70000000,
      "minimum_cost": 20000000
    },
    {
      "jar_id": "{{JAR_ID_3}}",
      "ratio": 25,
      "planned_revenue": 65000000,
      "minimum_cost": 18000000
    }
  ]
}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Note và ratio đã thay đổi

**Kết quả:** [ ] Pass / [ ] Fail

---

### 2.10. 🗑️ Xóa Tỷ Lệ Lọ (Soft Delete)

⚠️ **CẢNH BÁO:** Chỉ test sau khi đã hoàn thành tất cả test khác!

```http
DELETE http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Jar ratio không còn trong danh sách
- ✅ Database: is_deleted = true

**Kết quả:** [ ] Pass / [ ] Fail

---

## 3. Quy Trình Duyệt 3 Cấp

**Flow duyệt:**
```
[Tạo mới] → [waiting_director] → [waiting_president] → [waiting_board_chairman] → [approved]
```

### 3.1. ✅ Cấp 1: Giám Đốc Duyệt (0018)

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_0018}}
Content-Type: application/json

{
  "status": "approved",
  "note": "Giám đốc đã duyệt - OK"
}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Status chuyển sang: `waiting_president`

**Kết quả:** [ ] Pass / [ ] Fail

---

### 3.2. ❌ Cấp 1: Giám Đốc Từ Chối

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_0018}}
Content-Type: application/json

{
  "status": "rejected",
  "note": "Giám đốc từ chối - Cần điều chỉnh lại tỷ lệ"
}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Status chuyển sang: `rejected`
- ⚠️ Sau khi reject, cần tạo lại jar ratio mới để test tiếp

**Kết quả:** [ ] Pass / [ ] Fail

---

### 3.3. ✅ Cấp 2: Chủ Tịch Duyệt (0025)

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_0025}}
Content-Type: application/json

{
  "status": "approved",
  "note": "Chủ tịch đã duyệt - OK"
}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Status chuyển sang: `waiting_board_chairman`

**Kết quả:** [ ] Pass / [ ] Fail

---

### 3.4. ❌ Cấp 2: Chủ Tịch Từ Chối

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_0025}}
Content-Type: application/json

{
  "status": "rejected",
  "note": "Chủ tịch từ chối - Không phù hợp"
}
```

**Kết quả:** [ ] Pass / [ ] Fail

---

### 3.5. ✅ Cấp 3: Chủ Tịch HĐQT Duyệt (44444) - FINAL

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_44444}}
Content-Type: application/json

{
  "status": "approved",
  "note": "Chủ tịch HĐQT đã duyệt - Hoàn tất"
}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Status chuyển sang: `approved` (FINAL)
- ✅ Bây giờ có thể tạo báo cáo!

**Kết quả:** [ ] Pass / [ ] Fail

---

### 3.6. ❌ Cấp 3: Chủ Tịch HĐQT Từ Chối

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_44444}}
Content-Type: application/json

{
  "status": "rejected",
  "note": "Chủ tịch HĐQT từ chối - Cần xem xét lại"
}
```

**Kết quả:** [ ] Pass / [ ] Fail

---

## 4. Báo Cáo Tỷ Lệ Lọ

⚠️ **Điều kiện:** Tỷ lệ lọ phải có status = `approved`

### 4.1. 📊 Lấy Báo Cáo Tỷ Lệ Lọ

```http
GET http://localhost:3000/api/jar-ratios/report?month=12&year=2025
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Array of IJarReport với các fields:
  - `jar_code`, `jar_name`
  - `planned_revenue`: KPI doanh thu * tỷ lệ / 100
  - `target_rate`: Tỷ lệ mục tiêu
  - `minimum_cost`: Chi phí tối thiểu
  - `actual_revenue`: Tổng thu thực tế
  - `actual_rate`: (Tổng chi / Tổng thu) * 100%
  - `cumulative_additional_cost`: Tổng chi
  - `deviation`: Tỷ lệ thực tế - Tỷ lệ mục tiêu
  - `adjustment`: Điều chỉnh
  - `proposed_rate_after_adjustment`: Tỷ lệ đề xuất
- ✅ Có dòng TOTAL ở cuối

**Kết quả:** [ ] Pass / [ ] Fail

---

### 4.2. ❌ Báo Cáo - Tháng Không Có Tỷ Lệ Lọ

```http
GET http://localhost:3000/api/jar-ratios/report?month=6&year=2030
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 404 Not Found
- ✅ Error: "Tỉ lệ lọ cho tháng này chưa được báo cáo hoặc chưa được thông qua"

**Kết quả:** [ ] Pass / [ ] Fail

---

### 4.3. ❌ Validation - Month Không Hợp Lệ (month = 13)

```http
GET http://localhost:3000/api/jar-ratios/report?month=13&year=2025
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error: "tháng không được lớn hơn 12."

**Kết quả:** [ ] Pass / [ ] Fail

---

### 4.4. ❌ Validation - Month = 0

```http
GET http://localhost:3000/api/jar-ratios/report?month=0&year=2025
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error: "tháng nhỏ nhất là 1."

**Kết quả:** [ ] Pass / [ ] Fail

---

### 4.5. ❌ Validation - Thiếu Month

```http
GET http://localhost:3000/api/jar-ratios/report?year=2025
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error về validation month

**Kết quả:** [ ] Pass / [ ] Fail

---

### 4.6. ❌ Validation - Thiếu Year

```http
GET http://localhost:3000/api/jar-ratios/report?month=12
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 400 Bad Request
- ✅ Error về validation year

**Kết quả:** [ ] Pass / [ ] Fail

---

## 5. Comment & Tương Tác

### 5.1. 💬 Thêm Comment

```http
POST http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/comments
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "content": "Đây là comment test cho tỷ lệ lọ này"
}
```

**Lưu comment_id:**
```
COMMENT_ID = ________________________________________
```

**Kết quả mong đợi:**
- ✅ Status: 201 Created
- ✅ Response có comment_id

**Kết quả:** [ ] Pass / [ ] Fail

---

### 5.2. 📖 Xem Danh Sách Comment

```http
GET http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/comments?page=1&limit=10
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Array of comments với pagination

**Kết quả:** [ ] Pass / [ ] Fail

---

### 5.3. ✏️ Cập Nhật Comment

```http
PUT http://localhost:3000/api/jar-ratios/comments/{{COMMENT_ID}}
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "content": "Comment đã được cập nhật"
}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK

**Kết quả:** [ ] Pass / [ ] Fail

---

### 5.4. 🗑️ Xóa Comment

```http
DELETE http://localhost:3000/api/jar-ratios/comments/{{COMMENT_ID}}
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK

**Kết quả:** [ ] Pass / [ ] Fail

---

## 6. Export Excel

### 6.1. 📥 Xuất Excel Danh Sách Tỷ Lệ Lọ

```http
GET http://localhost:3000/api/jar-ratios/export?from_month=01-2025&to_month=12-2025
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK
- ✅ Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
- ✅ File Excel được download
- ✅ File có thể mở được
- ✅ Dữ liệu chính xác

**Kết quả:** [ ] Pass / [ ] Fail

---

## 7. Test Cases Đặc Biệt

### 7.1. ❌ Cập Nhật Khi Status ≠ waiting_director

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID_APPROVED}}
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "month": 12,
  "year": 2025,
  "note": "Try to update approved jar ratio",
  "details": [...]
}
```

**Kết quả mong đợi:**
- ✅ Status: 403 Forbidden hoặc 400 Bad Request
- ✅ Error: "Chỉ được chỉnh sửa khi ở trạng thái chờ duyệt Giám đốc"

**Kết quả:** [ ] Pass / [ ] Fail

---

### 7.2. ❌ Xóa Jar Ratio Không Tồn Tại

```http
DELETE http://localhost:3000/api/jar-ratios/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 404 Not Found
- ✅ Error: "Không tìm thấy tỷ lệ lọ"

**Kết quả:** [ ] Pass / [ ] Fail

---

### 7.3. ❌ Xem Chi Tiết Jar Ratio Không Tồn Tại

```http
GET http://localhost:3000/api/jar-ratios/00000000-0000-0000-0000-000000000000
Authorization: Bearer {{TOKEN_55555}}
```

**Kết quả mong đợi:**
- ✅ Status: 404 Not Found

**Kết quả:** [ ] Pass / [ ] Fail

---

### 7.4. ❌ Duyệt Với User Không Có Quyền

```http
PUT http://localhost:3000/api/jar-ratios/{{JAR_RATIO_ID}}/approve
Authorization: Bearer {{TOKEN_55555}}
Content-Type: application/json

{
  "status": "approved",
  "note": "Try to approve with wrong user"
}
```

**Kết quả mong đợi:**
- ✅ Status: 403 Forbidden
- ✅ Error: Permission denied

**Kết quả:** [ ] Pass / [ ] Fail

---

## 📊 Tổng Kết Test

### Thống Kê

| Module | Total | Passed | Failed | Skipped |
|--------|-------|--------|--------|---------|
| CRUD | 10 | [ ] | [ ] | [ ] |
| Approval Workflow | 6 | [ ] | [ ] | [ ] |
| Report | 6 | [ ] | [ ] | [ ] |
| Comment | 4 | [ ] | [ ] | [ ] |
| Export | 1 | [ ] | [ ] | [ ] |
| Edge Cases | 4 | [ ] | [ ] | [ ] |
| **TOTAL** | **31** | [ ] | [ ] | [ ] |

### Bugs Phát Hiện

| Bug ID | Severity | Mô tả | Status |
|--------|----------|-------|--------|
| BUG-001 | [ ] Critical / [ ] High / [ ] Medium / [ ] Low | | [ ] Open / [ ] Fixed |
| BUG-002 | [ ] Critical / [ ] High / [ ] Medium / [ ] Low | | [ ] Open / [ ] Fixed |

### Ghi Chú Chung

```
[Ghi chú về quá trình test, các vấn đề gặp phải, đề xuất cải tiến...]






```

---

## 🚀 Quick Start Guide

### Cách sử dụng file này:

1. **VS Code với REST Client Extension:**
   - Cài đặt extension "REST Client"
   - Mở file này trong VS Code
   - Click "Send Request" ở trên mỗi HTTP request

2. **Postman:**
   - Copy từng request vào Postman
   - Thay thế `{{TOKEN_55555}}` bằng token thực tế
   - Thay thế `{{JAR_RATIO_ID}}` bằng ID thực tế

3. **cURL:**
   - Convert từng request sang cURL command
   - Chạy trong terminal

4. **Thứ tự test đề xuất:**
   1. Login tất cả users → lấy tokens
   2. Lấy danh sách jar_id
   3. Tạo jar ratio mới
   4. Test CRUD operations
   5. Test approval workflow (3 cấp)
   6. Test report (sau khi approved)
   7. Test comment & export
   8. Test edge cases

---

**Người test:** ____________________
**Ngày bắt đầu:** ____________________
**Ngày kết thúc:** ____________________
**Chữ ký:** ____________________
