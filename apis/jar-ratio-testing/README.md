# 🧪 Jar Ratio Testing Suite

> **Bộ test hoàn chỉnh cho module Quản lý Tỷ Lệ Lọ**

---

## 📌 Bắt Đầu Tại Đây

### 🚀 Quick Start (5 phút)

```
1. Mở file: QUICK-START-TEST.md
2. Follow hướng dẫn
3. Test flow cơ bản
```

👉 **[QUICK-START-TEST.md](QUICK-START-TEST.md)**

---

### 📚 Đọc Hướng Dẫn Đầy Đủ

```
1. Mở file: README-TEST-JAR-RATIO.md
2. Hiểu toàn bộ bộ test
3. Chọn file phù hợp
```

👉 **[README-TEST-JAR-RATIO.md](README-TEST-JAR-RATIO.md)**

---

## 📁 Cấu Trúc Thư Mục

```
jar-ratio-testing/
│
├── README.md                                  ← Bạn đang ở đây
│
├── 📌 BẮT ĐẦU TẠI ĐÂY
│   ├── README-TEST-JAR-RATIO.md              ← Tổng quan toàn bộ
│   └── TEST-INDEX.md                          ← Điều hướng file
│
├── 📚 HƯỚNG DẪN
│   ├── TEST-README.md                         ← Hướng dẫn đầy đủ
│   ├── TEST-FILES-SUMMARY.md                 ← So sánh các file
│   └── QUICK-START-TEST.md                   ← Test nhanh 5 phút
│
├── 📋 TEST GUIDE
│   └── JAR-RATIO-COMPLETE-TEST-GUIDE.md      ← 31 test cases
│
└── 💻 FILE THỰC HÀNH
    ├── jar-ratio-test.http                    ← REST Client file
    └── jar-ratio-test-data.json              ← Dữ liệu mẫu
```

---

## 🎯 Chọn File Theo Nhu Cầu

| Bạn muốn... | Mở file này | Thời gian |
|-------------|-------------|-----------|
| **Test nhanh** | [QUICK-START-TEST.md](QUICK-START-TEST.md) | 5 phút |
| **Hiểu tổng quan** | [README-TEST-JAR-RATIO.md](README-TEST-JAR-RATIO.md) | 10 phút |
| **Học cách test** | [TEST-README.md](TEST-README.md) | 15 phút |
| **Test đầy đủ** | [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) | 60-90 phút |
| **Test API ngay** | [jar-ratio-test.http](jar-ratio-test.http) | 5-30 phút |
| **Xem test data** | [jar-ratio-test-data.json](jar-ratio-test-data.json) | - |
| **Tìm file phù hợp** | [TEST-INDEX.md](TEST-INDEX.md) | 2 phút |
| **So sánh file** | [TEST-FILES-SUMMARY.md](TEST-FILES-SUMMARY.md) | 5 phút |

---

## 📊 Thống Kê

- ✅ **Total files:** 8 documentation files + 2 test files
- ✅ **Total test cases:** 31
- ✅ **Modules covered:** 6 (CRUD, Approval, Report, Comment, Export, Edge Cases)
- ✅ **API endpoints:** 15+
- ✅ **Users:** 4 test accounts
- ✅ **Total size:** ~96 KB

---

## 👥 Theo Vai Trò

### 👨‍💻 Developer
**Main file:** [jar-ratio-test.http](jar-ratio-test.http)
- Test API hàng ngày
- Debug nhanh
- Troubleshoot với [TEST-README.md](TEST-README.md)

### 🧪 Tester / QA
**Main file:** [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)
- Test chính thức 31 test cases
- Ghi kết quả Pass/Fail
- Lấy test data từ [jar-ratio-test-data.json](jar-ratio-test-data.json)

### 👔 Business Analyst / Product Owner
**Main files:**
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
