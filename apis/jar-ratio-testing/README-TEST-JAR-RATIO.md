# 🧪 Bộ Test Hoàn Chỉnh - Quản Lý Tỷ Lệ Lọ

> **Tất cả những gì bạn cần để test module Jar Ratio từ A-Z**

---

## ✨ Tổng Quan

Bộ test này bao gồm **7 file chính** với **31 test cases** để kiểm tra toàn bộ flow:

```
Tạo Tỷ Lệ Lọ → Duyệt 3 Cấp → Báo Cáo Tỷ Lệ Lọ
```

---

## 📁 7 File Chính Đã Tạo

### 1️⃣ [TEST-INDEX.md](TEST-INDEX.md)
**📌 START HERE - Điều hướng tất cả file**

Mục đích:
- Trang chủ của bộ test
- Chọn file phù hợp với vai trò
- Quick links và shortcuts

**Ai nên đọc:** Tất cả mọi người

---

### 2️⃣ [QUICK-START-TEST.md](QUICK-START-TEST.md)
**⚡ Test nhanh trong 5 phút**

Mục đích:
- Test flow cơ bản: Tạo → Duyệt → Báo cáo
- Demo cho người khác
- Smoke test

**Ai nên dùng:** Developer, Demo, Quick check

---

### 3️⃣ [TEST-README.md](TEST-README.md)
**📚 Hướng dẫn sử dụng đầy đủ**

Mục đích:
- Hướng dẫn chi tiết cách test
- Business rules & công thức tính toán
- Troubleshooting
- Checklist

**Ai nên đọc:** Tất cả, đặc biệt là lần đầu test

---

### 4️⃣ [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)
**📋 Test guide với checklist - 31 test cases**

Mục đích:
- Test chính thức
- UAT testing
- Tạo báo cáo test
- Ghi kết quả Pass/Fail

**Ai nên dùng:** Tester, QA, UAT

---

### 5️⃣ [jar-ratio-test.http](jar-ratio-test.http)
**⚡ File REST Client - Test trực tiếp trong VS Code**

Mục đích:
- Test API nhanh
- Debug
- Test hàng ngày
- Không cần Postman

**Ai nên dùng:** Developer, Tester (daily)

---

### 6️⃣ [jar-ratio-test-data.json](jar-ratio-test-data.json)
**💾 Dữ liệu mẫu JSON**

Mục đích:
- Test data cho tất cả scenarios
- Expected results
- Copy/paste vào Postman
- Reference cho automation

**Ai nên dùng:** Tất cả

---

### 7️⃣ [TEST-FILES-SUMMARY.md](TEST-FILES-SUMMARY.md)
**📦 Tổng hợp chi tiết tất cả file**

Mục đích:
- Giải thích từng file
- So sánh các file
- Workflow đề xuất
- Metrics & KPI

**Ai nên đọc:** Product Owner, Team Lead

---

## 🎯 Bắt Đầu Ngay

### Nếu bạn muốn...

| Mục đích | Làm gì | Thời gian |
|----------|--------|-----------|
| **Test nhanh** | Mở [QUICK-START-TEST.md](QUICK-START-TEST.md) | 5 phút |
| **Học cách test** | Đọc [TEST-README.md](TEST-README.md) | 10-15 phút |
| **Test đầy đủ** | Dùng [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) | 60-90 phút |
| **Test API hàng ngày** | Mở [jar-ratio-test.http](jar-ratio-test.http) | 5-30 phút |
| **Tìm file phù hợp** | Xem [TEST-INDEX.md](TEST-INDEX.md) | 2 phút |

---

## 🚀 Quick Start trong 3 Bước

### Bước 1: Cài đặt (30 giây)

```
1. Mở VS Code
2. Cài extension "REST Client"
```

### Bước 2: Chọn file (10 giây)

```
Mở file: jar-ratio-test.http
```

### Bước 3: Test (2 phút)

```
1. Login → lấy token
2. Tạo jar ratio
3. Duyệt 3 cấp
4. Xem báo cáo
```

✅ **Done!** Xem chi tiết: [QUICK-START-TEST.md](QUICK-START-TEST.md)

---

## 📊 Test Coverage

### Modules Covered:

- ✅ **CRUD Operations** (10 test cases)
- ✅ **Approval Workflow** (6 test cases)
- ✅ **Report** (6 test cases)
- ✅ **Comment & Interaction** (4 test cases)
- ✅ **Export Excel** (1 test case)
- ✅ **Edge Cases** (4 test cases)

**Total: 31 test cases**

### Test Types:

- ✅ Positive tests: 15 (48%)
- ✅ Negative tests: 16 (52%)

---

## 👥 Sử Dụng Theo Vai Trò

### 👨‍💻 Developer

**Workflow:**
1. Code feature
2. Mở [jar-ratio-test.http](jar-ratio-test.http)
3. Test API
4. Fix bugs
5. Commit

**File chính:**
- [jar-ratio-test.http](jar-ratio-test.http) - Daily testing
- [TEST-README.md](TEST-README.md) - Troubleshooting

---

### 🧪 Tester / QA

**Workflow:**
1. Đọc [TEST-README.md](TEST-README.md)
2. Mở [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)
3. Chạy 31 test cases
4. Ghi Pass/Fail
5. Report bugs
6. Tạo test report

**File chính:**
- [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) - Test guide
- [jar-ratio-test-data.json](jar-ratio-test-data.json) - Test data

---

### 👔 Business Analyst / Product Owner

**Workflow:**
1. Đọc [TEST-README.md](TEST-README.md) - Business rules
2. UAT với [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)
3. Demo với [QUICK-START-TEST.md](QUICK-START-TEST.md)
4. Sign-off

**File chính:**
- [TEST-FILES-SUMMARY.md](TEST-FILES-SUMMARY.md) - Overview
- [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) - UAT

---

## 🎓 Learning Path

### Level 1: Beginner (30 phút)

```
1. [TEST-INDEX.md](TEST-INDEX.md) (5 phút)
   → Hiểu có những file gì

2. [QUICK-START-TEST.md](QUICK-START-TEST.md) (5 phút)
   → Test flow cơ bản

3. [jar-ratio-test.http](jar-ratio-test.http) (20 phút)
   → Thử test API
```

### Level 2: Intermediate (2 giờ)

```
1. [TEST-README.md](TEST-README.md) (30 phút)
   → Hiểu toàn bộ business logic

2. [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) (90 phút)
   → Chạy đầy đủ 31 test cases
```

### Level 3: Advanced (4+ giờ)

```
1. Viết automation test
2. CI/CD integration
3. Extend test cases
```

---

## 📖 Business Logic Tóm Tắt

### Workflow Duyệt 3 Cấp:

```
[Nhân viên tạo]
    ↓
[waiting_director] --- Giám đốc (0018) duyệt →
    ↓
[waiting_president] --- Chủ tịch (0025) duyệt →
    ↓
[waiting_board_chairman] --- Chủ tịch HĐQT (44444) duyệt →
    ↓
[approved] ✅ --- Có thể tạo báo cáo
```

### Quy Tắc Quan Trọng:

1. **Tổng ratio = 100%**
   - Sum của tất cả ratio phải = 100
   - Nếu không → 400 Bad Request

2. **Chỉ update khi status = waiting_director**
   - Đã duyệt rồi không sửa được

3. **Chỉ báo cáo khi status = approved**
   - Phải duyệt 3 cấp xong mới có báo cáo

4. **Soft Delete**
   - Xóa = is_deleted = true
   - Vẫn còn trong database

---

## 🎯 API Endpoints

### Core Endpoints:

```
POST   /api/jar-ratios              - Tạo tỷ lệ lọ
GET    /api/jar-ratios              - Danh sách
GET    /api/jar-ratios/:id          - Chi tiết
PUT    /api/jar-ratios/:id          - Cập nhật
DELETE /api/jar-ratios/:id          - Xóa
PUT    /api/jar-ratios/:id/approve  - Duyệt/từ chối
GET    /api/jar-ratios/report       - Báo cáo
GET    /api/jar-ratios/export       - Export Excel
```

### Comment Endpoints:

```
GET    /api/jar-ratios/:id/comments           - Danh sách comment
POST   /api/jar-ratios/:id/comments           - Thêm comment
PUT    /api/jar-ratios/comments/:comment_id   - Sửa comment
DELETE /api/jar-ratios/comments/:comment_id   - Xóa comment
```

---

## 🔧 Setup Requirements

### Environment:

- [ ] Server chạy: http://localhost:3000
- [ ] Database có data:
  - [ ] Users: 55555, 0018, 0025, 44444
  - [ ] Jars (lọ)
  - [ ] Store KPIs

### Tools:

**Option 1: VS Code + REST Client (Khuyến nghị)**
- [ ] VS Code installed
- [ ] REST Client extension installed

**Option 2: Postman**
- [ ] Postman installed
- [ ] Import requests

**Option 3: cURL**
- [ ] Terminal ready

---

## 📞 Support & Help

### Khi gặp vấn đề:

1. Check [TEST-README.md#troubleshooting](TEST-README.md#-troubleshooting)
2. Xem [TEST-INDEX.md#cần-giúp](TEST-INDEX.md#-cần-giúp)
3. Đọc error message trong response
4. Check server logs

### Common Issues:

| Issue | Solution |
|-------|----------|
| Token expired | Re-login |
| Tổng ratio ≠ 100% | Check sum of ratios |
| Cannot update | Check status = waiting_director |
| No report data | Check status = approved |
| Permission denied | Use correct user |

---

## 🎁 Bonus Features

### Auto-save Variables:

File `jar-ratio-test.http` tự động lưu:

```http
@token_55555 = {{login_55555.response.body.data.access_token}}
@jar_ratio_id = {{create_jar_ratio.response.body.data.id}}
```

### Expected Results:

File `jar-ratio-test-data.json` có expected results cho mọi scenario.

### Checklist:

File `JAR-RATIO-COMPLETE-TEST-GUIDE.md` có checkbox để đánh dấu Pass/Fail.

---

## 📈 Metrics

### File Statistics:

- **Total files:** 7
- **Total test cases:** 31
- **Total size:** ~75 KB
- **Documentation:** ~50 pages

### Time Estimates:

- **Quick test:** 5 phút
- **Full test:** 60-90 phút
- **Learning:** 30 phút - 2 giờ

---

## 🌟 Best Practices

1. **Always** đọc [TEST-README.md](TEST-README.md) trước
2. **Use** [jar-ratio-test.http](jar-ratio-test.http) cho daily testing
3. **Use** [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) cho official testing
4. **Save** test results
5. **Update** test cases khi có thay đổi

---

## 🗂️ File Structure

```
📦 Test Files
├── 📌 Navigation
│   ├── TEST-INDEX.md                          ← Start here
│   └── README-TEST-JAR-RATIO.md              ← This file
│
├── 📚 Documentation
│   ├── TEST-README.md                         ← Full guide
│   ├── TEST-FILES-SUMMARY.md                 ← File overview
│   └── QUICK-START-TEST.md                   ← Quick start
│
├── 📋 Test Guide
│   └── JAR-RATIO-COMPLETE-TEST-GUIDE.md      ← 31 test cases
│
├── 💻 Practice Files
│   ├── jar-ratio-test.http                    ← REST Client
│   └── jar-ratio-test-data.json              ← Test data
│
└── 📊 Results (existing)
    ├── test-report-12.12/                     ← Templates
    └── test-results-12.12/                    ← Results
```

---

## 🎯 Next Steps

### Bây giờ:

1. **Mở** [TEST-INDEX.md](TEST-INDEX.md) để chọn file phù hợp
2. **Hoặc** [QUICK-START-TEST.md](QUICK-START-TEST.md) để test ngay

### Sau đó:

1. Đọc [TEST-README.md](TEST-README.md) để hiểu rõ
2. Test đầy đủ với [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)
3. Tạo báo cáo test

---

## 📝 Changelog

**Version 1.0 - 2025-12-15**

Tạo mới:
- ✅ TEST-INDEX.md
- ✅ QUICK-START-TEST.md
- ✅ TEST-README.md
- ✅ JAR-RATIO-COMPLETE-TEST-GUIDE.md
- ✅ jar-ratio-test.http
- ✅ jar-ratio-test-data.json
- ✅ TEST-FILES-SUMMARY.md
- ✅ README-TEST-JAR-RATIO.md (this file)

---

## 🏆 Summary

Bạn có:
- ✅ 7 file documentation
- ✅ 31 test cases
- ✅ REST Client file
- ✅ Test data JSON
- ✅ Hướng dẫn đầy đủ
- ✅ Quick start guide
- ✅ Troubleshooting

**Everything you need to test Jar Ratio module! 🎉**

---

## 🚀 Start Now

### 👉 [TEST-INDEX.md](TEST-INDEX.md) - Chọn file phù hợp

### ⚡ [QUICK-START-TEST.md](QUICK-START-TEST.md) - Test ngay trong 5 phút

---

**Version:** 1.0
**Created:** 2025-12-15
**Author:** Claude AI Assistant
**License:** MIT

**Happy Testing! 🎉**
