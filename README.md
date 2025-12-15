# 🔧 Test Tool Viewer

Công cụ web để xem tài liệu Markdown, test API và quản lý test data cho Frontend Testing.

## ✨ Tính năng

- 📚 **Markdown Viewer**: Xem và render các file .md
- 🔗 **HTTP Request Parser**: Parse và execute file .http
- 🔧 **API Tester**: Test API với request builder
- 📋 **Template Selector (NEW!)**: Chọn nhanh request template từ file .http
- 📋 **Test Data Viewer**: Xem file JSON test data
- 🌍 **Multi-Environment**: Switch giữa Local/Dev/Staging/Production
- 💾 **Auto-save**: Lưu cấu hình tự động

## 🎯 Template Selector - Test Nhanh với 1 Click!

**Tính năng mới** giúp bạn test API nhanh hơn gấp 10 lần!

### Cách sử dụng:
1. **Chọn thư mục** API (VD: "Test quản lý tỷ lệ lọ")
2. **Click file** bất kỳ để mở tab Request
3. **Dropdown "📋 Quick Templates"** tự động hiện ra
4. **Chọn template** từ danh sách được nhóm:
   - 🔐 Authentication (Login, Logout)
   - 📊 CRUD Operations (Create, Read, Update, Delete)
   - ✅ Approval Workflow (Multi-level approval)
   - ❌ Validation Tests (Error cases, Edge cases)
5. **Click "🚀 Thực thi"** → Done!

### Lợi ích:
- ✅ Parse tự động tất cả requests từ file `.http`
- ✅ Không cần copy/paste headers và body
- ✅ Nhóm theo category dễ tìm
- ✅ Giữ nguyên variables và authentication
- ✅ Test nhanh tất cả edge cases

---

## 🚀 Cách sử dụng

### Cách 1: Mở trực tiếp (Đơn giản nhất)

Chỉ cần mở file `index.html` bằng trình duyệt và sử dụng Demo mode:

1. Double click `index.html`
2. Click các nút Demo:
   - 📚 Load Demo Markdown
   - 🔗 Load Demo HTTP Requests
   - 📋 Load Demo Test Data

### Cách 2: Copy vào thư mục test

Copy tool này vào thư mục test của bạn:

```bash
# Ví dụ
cp -r test-tool-viewer your-project/tests/
```

Sau đó mở `tests/test-tool-viewer/index.html`

### Cách 3: Chạy với server

```bash
# Python
cd test-tool-viewer
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Mở: `http://localhost:8000`

## 📖 Hướng dẫn

### Test API

1. Chọn environment và nhập Base URL
2. Chọn tab "API Tester"
3. Nhập endpoint, headers, body
4. Click "Gửi Request"
5. Xem response

### Sử dụng Templates

Tool có sẵn templates:
- 🔐 Login
- 📋 Get List
- ➕ Create
- ✏️ Update
- 🗑️ Delete

### Demo Mode

Click các nút Demo để xem tool hoạt động với data mẫu.

## 📁 File Structure

```
test-tool-viewer/
├── index.html      # Giao diện
├── app.js          # Logic
└── README.md       # Tài liệu
```

## 💡 Tips

- Token từ login sẽ tự động lưu và thêm vào requests tiếp theo
- Config được lưu vào localStorage
- Recent folders được nhớ để dùng lại
- Hỗ trợ CORS khi chạy với server

## 🔧 Browser Support

- Chrome ✅
- Firefox ✅
- Edge ✅
- Safari ✅

---

**Version:** 1.0.0
**Created:** 2025-12-15