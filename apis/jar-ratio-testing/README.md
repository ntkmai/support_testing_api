# 🧪 JAR Ratio Management API

> **API Quản lý Tỷ Lệ Lọ** - Workflow phê duyệt 3 cấp với validation và tracking đầy đủ

---

## 📋 Tổng Quan

Module quản lý tỷ lệ phân bổ lọ (JAR) theo tháng với:

- ✅ **Quản lý tỷ lệ lọ** theo tháng/năm
- ✅ **Workflow phê duyệt 3 cấp**: Giám đốc → Chủ tịch → Chủ tịch HĐQT
- ✅ **Validation nghiêm ngặt**: Tổng ratio = 100%, không trùng lọ, không trùng tháng
- ✅ **Tracking đầy đủ**: Lịch sử phê duyệt, người tạo, người duyệt
- ✅ **Mobile API**: Endpoints riêng cho mobile app
- ✅ **Phân quyền**: Theo role và trạng thái

---

## 🔐 Test Accounts

| Role | Username | Password | Quyền |
|------|----------|----------|-------|
| **Nhân viên** | 55555 | 55555 | Tạo, sửa, xem tỷ lệ lọ |
| **Giám đốc** | 0018 | 0018 | Phê duyệt/Từ chối Level 1 |
| **Chủ tịch** | 0025 | 0025 | Phê duyệt/Từ chối Level 2 |
| **HĐQT** | 44444 | 44444 | Phê duyệt/Từ chối Level 3 |

---

## 📊 Data Model

### JAR Ratio Object
```json
{
  "id": "string",
  "month": 12,
  "year": 2025,
  "note": "Tỷ lệ lọ tháng 12/2025",
  "status": "waiting_director",
  "created_by": "55555",
  "created_at": "2025-12-15T10:00:00Z",
  "details": [
    {
      "jar_id": "jar_001",
      "ratio": 40,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    }
  ]
}
```

### Status Flow
```
draft → waiting_director → waiting_president → waiting_board_chairman → approved
                    ↓              ↓                      ↓
                rejected        rejected              rejected
```

---

## 🚀 Quick Start

### 1. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "55555",
  "password": "55555"
}

# Response
{
  "data": {
    "access_token": "eyJhbGc...",
    "user": {...}
  }
}
```

### 2. Tạo Tỷ Lệ Lọ (Tổng ratio = 100%)
```http
POST /api/jar-ratios
Authorization: Bearer {token}
Content-Type: application/json

{
  "month": 12,
  "year": 2025,
  "note": "Tỷ lệ tháng 12/2025",
  "details": [
    {
      "jar_id": "jar_001",
      "ratio": 40,
      "planned_revenue": 100000000,
      "minimum_cost": 30000000
    },
    {
      "jar_id": "jar_002",
      "ratio": 35,
      "planned_revenue": 80000000,
      "minimum_cost": 25000000
    },
    {
      "jar_id": "jar_003",
      "ratio": 25,
      "planned_revenue": 60000000,
      "minimum_cost": 15000000
    }
  ]
}
```

### 3. Phê duyệt Level 1 (Giám đốc)
```http
PUT /api/jar-ratios/{id}/approve
Authorization: Bearer {director_token}
Content-Type: application/json

{
  "status": "approved",
  "note": "Đã duyệt"
}
```

---

## 📡 API Endpoints

### 🔑 Authentication
- `POST /api/auth/login` - Đăng nhập, nhận JWT token
- `GET /api/health` - Health check server

### 📊 JAR Ratio Management
- `GET /api/jar-ratios` - Danh sách (pagination: ?page=1&limit=10)
- `GET /api/jar-ratios/{id}` - Chi tiết theo ID
- `POST /api/jar-ratios` - Tạo mới (status: draft/waiting_director)
- `PUT /api/jar-ratios/{id}` - Cập nhật (chỉ status: draft, rejected)
- `DELETE /api/jar-ratios/{id}` - Xóa (chỉ status: draft, rejected)

### 📱 Mobile API
- `GET /api/jar-ratios/mobile` - Danh sách cho mobile (pagination)

### 👥 Utilities
- `GET /api/jar-ratios/creators` - Danh sách người tạo
- `GET /api/jars` - Danh sách lọ để chọn

### ✅ Approval Workflow
- `PUT /api/jar-ratios/{id}/approve` - Phê duyệt/Từ chối
  - Body: `{ "status": "approved|rejected", "note": "..." }`
  - Giám đốc: `waiting_director` → `waiting_president|rejected`
  - Chủ tịch: `waiting_president` → `waiting_board_chairman|rejected`
  - HĐQT: `waiting_board_chairman` → `approved|rejected`

### 📜 History
- `GET /api/jar-ratios/{id}/history` - Lịch sử phê duyệt chi tiết

---

## ⚠️ Validation Rules

### 1. Tổng Ratio = 100%
```
✅ ratio_1: 40% + ratio_2: 35% + ratio_3: 25% = 100% (OK)
❌ ratio_1: 40% + ratio_2: 35% = 75% (FAIL - không đủ 100%)
```

### 2. Không Trùng jar_id
```
✅ [{jar_id: "001", ratio: 50}, {jar_id: "002", ratio: 50}] (OK)
❌ [{jar_id: "001", ratio: 50}, {jar_id: "001", ratio: 50}] (FAIL)
```

### 3. Không Trùng Tháng/Năm
```
✅ month: 12, year: 2025 (chưa tồn tại - OK)
❌ month: 12, year: 2025 (đã tồn tại - FAIL)
```

### 4. Quyền Cập Nhật/Xóa
```
✅ Status: draft hoặc rejected → Có thể sửa/xóa
❌ Status: waiting_*, approved → Không thể sửa/xóa
```

---

## 🔄 Workflow Phê Duyệt

### Flow Hoàn Chỉnh
```
1. Nhân viên (55555) tạo JAR Ratio
   → Status: draft hoặc waiting_director
   
2. Giám đốc (0018) duyệt Level 1
   → Status: waiting_president (approved) hoặc rejected
   
3. Chủ tịch (0025) duyệt Level 2
   → Status: waiting_board_chairman (approved) hoặc rejected
   
4. HĐQT (44444) duyệt Level 3
   → Status: approved (cuối cùng) hoặc rejected
```

### Quyền Phê Duyệt
- **waiting_director**: Chỉ Giám đốc (0018) duyệt được
- **waiting_president**: Chỉ Chủ tịch (0025) duyệt được
- **waiting_board_chairman**: Chỉ HĐQT (44444) duyệt được

### Từ Chối
- Bất kỳ cấp nào cũng có thể từ chối
- Sau khi từ chối → Status: rejected
- Nhân viên có thể sửa lại và gửi duyệt lại

---

## 📁 Files Hướng Dẫn

### jar-ratio-api-tests.json
- **12 API endpoints** với mô tả chi tiết
- Request/Response examples
- Metadata: accounts, version, description
- Sử dụng trong **API Tester Tool**

### jar-ratio-test.http
- **Test file đầy đủ** cho VS Code REST Client
- **525 dòng** với tất cả scenarios:
  - ✅ Happy paths (tạo, duyệt thành công)
  - ❌ Edge cases (validation errors)
  - 🔄 Full workflow (tạo → duyệt 3 cấp → approved)
- Auto-save tokens với `@token_*`
- Ví dụ thực tế với data cụ thể

---

## 🧪 Test Scenarios

### ✅ Happy Path
1. Login nhân viên → Tạo JAR ratio (ratio = 100%)
2. Login giám đốc → Duyệt level 1
3. Login chủ tịch → Duyệt level 2
4. Login HĐQT → Duyệt level 3 → **APPROVED**

### ❌ Validation Tests
1. Tạo với tổng ratio ≠ 100% → **400 Bad Request**
2. Tạo với trùng month/year → **409 Conflict**
3. Tạo với trùng jar_id → **400 Bad Request**
4. Update khi status = approved → **403 Forbidden**

### 🔄 Reject Flow
1. Tạo JAR ratio
2. Giám đốc từ chối → **Status: rejected**
3. Nhân viên sửa lại
4. Gửi duyệt lại → Workflow mới

---

## 💡 Sử Dụng

### Với Template Selector (Mới! ✨)
1. Vào thư mục **"Test quản lý tỷ lệ lọ"**
2. Click bất kỳ file nào để mở tab Request
3. **Dropdown "Quick Templates"** sẽ hiện ở đầu tab
4. Chọn template từ danh sách (được nhóm theo loại):
   - **Authentication**: Login các users
   - **CRUD Operations**: Tạo, sửa, xóa, lấy danh sách
   - **Approval Workflow**: Phê duyệt 3 cấp
   - **Validation Tests**: Test các trường hợp lỗi
5. Template tự động fill vào form → Click **"🚀 Thực thi"**

### Với REST Client (VS Code)
1. Install extension: **REST Client**
2. Mở file `jar-ratio-test.http`
3. Click **"Send Request"** từng endpoint
4. Token tự động lưu, không cần copy/paste

### Với API Tester Tool
1. Vào tab **"🧪 API Tester"**
2. Chọn folder **"Test quản lý tỷ lệ lọ"**
3. Click file **jar-ratio-api-tests.json**
4. Chọn endpoint → Click **"🚀 Thực thi"**
5. Token tự động apply cho các request

---

## 📝 Response Examples

### Success - Get All
```json
{
  "data": [
    {
      "id": "jr_001",
      "month": 12,
      "year": 2025,
      "status": "waiting_director",
      "created_by": "55555",
      "total_ratio": 100,
      "details_count": 3
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

### Success - Create
```json
{
  "data": {
    "id": "jr_002",
    "month": 12,
    "year": 2025,
    "status": "waiting_director",
    "created_at": "2025-12-15T10:00:00Z"
  },
  "message": "Created successfully"
}
```

### Error - Validation
```json
{
  "error": "Validation Error",
  "message": "Tổng tỷ lệ phải bằng 100%. Hiện tại: 75%",
  "statusCode": 400
}
```

### Error - Duplicate
```json
{
  "error": "Conflict",
  "message": "Tỷ lệ lọ tháng 12/2025 đã tồn tại",
  "statusCode": 409
}
```

---

## 🐛 Troubleshooting

| Issue | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| 401 Unauthorized | Token hết hạn hoặc sai | Đăng nhập lại |
| 403 Forbidden | Không có quyền thực hiện | Kiểm tra role và status |
| 400 Bad Request | Tổng ratio ≠ 100% | Điều chỉnh tỷ lệ cho đúng |
| 409 Conflict | Trùng month/year hoặc jar_id | Đổi tháng hoặc chọn lọ khác |
| 404 Not Found | ID không tồn tại | Kiểm tra lại ID |

---

## 📞 Base URL

- **Development**: `http://localhost:3000`
- **Production**: (Liên hệ Backend team)

---

## ✨ Features Nổi Bật

1. **📋 Template Selector (NEW!)**: Chọn nhanh request từ file .http
   - Parse tự động 525 dòng test cases
   - Nhóm theo category: Auth, CRUD, Approval, Validation
   - 1 click fill vào form, không cần copy/paste
2. **Auto Token Management**: Token tự động lưu và apply
3. **3-Level Approval**: Workflow rõ ràng, dễ theo dõi
4. **Strict Validation**: Đảm bảo data luôn chính xác
5. **Full History**: Tracking đầy đủ mọi thay đổi
6. **Mobile Ready**: API riêng cho mobile app
7. **Test Complete**: 12 endpoints + 525 lines test cases

---

📚 **Happy Testing!**


- [TEST-README.md](TEST-README.md) - Business rules
- [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) - UAT
- [QUICK-START-TEST.md](QUICK-START-TEST.md) - Demo

### 🆕 Người Mới
**Learning path:**
1. [README-TEST-JAR-RATIO.md](README-TEST-JAR-RATIO.md) - Tổng quan
2. [QUICK-START-TEST.md](QUICK-START-TEST.md) - Thử ngay
3. [TEST-README.md](TEST-README.md) - Học chi tiết
4. [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) - Test đầy đủ

---

## ⚡ Quick Commands

### Setup REST Client (VS Code)

```bash
# 1. Install VS Code extension "REST Client"
# 2. Open jar-ratio-test.http
# 3. Click "Send Request"
```

### Chạy với cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"55555","password":"55555"}'

# Lưu token
TOKEN="your_token_here"

# Test API
curl -X GET "http://localhost:3000/api/jar-ratios" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📖 Business Logic Tóm Tắt

### Workflow:
```
Tạo → Giám đốc duyệt → Chủ tịch duyệt → Chủ tịch HĐQT duyệt → Báo cáo
```

### Quy tắc:
1. ✅ Tổng ratio = 100%
2. ✅ Chỉ update khi status = waiting_director
3. ✅ Chỉ báo cáo khi status = approved
4. ✅ Soft delete (is_deleted = true)

---

## 🔧 Requirements

### Environment:
- [ ] Server: http://localhost:3000
- [ ] Database với users: 55555, 0018, 0025, 44444
- [ ] Database với jars và store KPIs

### Tools:
- [ ] VS Code + REST Client extension (khuyến nghị)
- [ ] Hoặc Postman
- [ ] Hoặc cURL

---

## 🆘 Cần Giúp?

### Troubleshooting:
- 🔍 [TEST-README.md#troubleshooting](TEST-README.md#-troubleshooting)
- 🔍 [TEST-INDEX.md#cần-giúp](TEST-INDEX.md#-cần-giúp)

### Common Issues:
| Issue | File | Section |
|-------|------|---------|
| Token expired | TEST-README.md | Troubleshooting |
| Ratio ≠ 100% | TEST-README.md | Business Rules |
| Cannot update | TEST-README.md | Troubleshooting |
| No report | TEST-README.md | Troubleshooting |

---

## 🎯 Next Steps

### Bây giờ:

1️⃣ **Muốn test nhanh?**
   → Mở [QUICK-START-TEST.md](QUICK-START-TEST.md)

2️⃣ **Muốn hiểu toàn bộ?**
   → Mở [README-TEST-JAR-RATIO.md](README-TEST-JAR-RATIO.md)

3️⃣ **Muốn test ngay với REST Client?**
   → Mở [jar-ratio-test.http](jar-ratio-test.http)

### Sau đó:

- 📚 Đọc [TEST-README.md](TEST-README.md) để hiểu sâu
- 📋 Test đầy đủ với [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)
- 📊 Tạo báo cáo test

---

## 📞 Support

**Có câu hỏi?**
1. Check [README-TEST-JAR-RATIO.md](README-TEST-JAR-RATIO.md)
2. Check [TEST-README.md](TEST-README.md)
3. Check troubleshooting sections

---

## 📝 Version

**Version:** 1.0
**Created:** 2025-12-15
**Author:** Claude AI Assistant

---

## 🌟 Features

- ✅ 31 test cases đầy đủ
- ✅ REST Client integration
- ✅ Auto-save variables
- ✅ Checkbox Pass/Fail
- ✅ Expected results
- ✅ Business rules documentation
- ✅ Troubleshooting guide
- ✅ Multi-level navigation

---

**Happy Testing! 🎉**

**👉 START: [README-TEST-JAR-RATIO.md](README-TEST-JAR-RATIO.md)**
