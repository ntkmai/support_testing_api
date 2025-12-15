# 📁 Template cho việc viết Documentation

## 🎯 Cấu trúc thư mục chuẩn

Mỗi project/API nên có cấu trúc như sau:

```
apis/
└── [tên-project]/
    ├── README.md                    # Tổng quan project
    ├── QUICK-START.md              # Hướng dẫn nhanh
    ├── [project]-api-tests.json    # API test endpoints (BẮT BUỘC cho API Tester)
    ├── [project]-test.http         # HTTP client requests (optional)
    └── [các-file-doc-khác].md      # Tài liệu chi tiết
```

## 📋 Các file cần có

### 1. README.md (Bắt buộc)
- Giới thiệu tổng quan về project
- Mục đích, tính năng chính
- Tech stack
- Link đến các tài liệu khác

### 2. QUICK-START.md (Khuyến nghị)
- Hướng dẫn setup nhanh
- Các bước cơ bản nhất
- Ví dụ sử dụng đơn giản

### 3. [project]-api-tests.json (BẮT BUỘC nếu có API)
- File này để Test Tool Viewer load vào API Tester
- Chứa danh sách API endpoints
- Xem template bên dưới

### 4. [project]-test.http (Optional)
- File HTTP cho REST Client extension
- Dùng để test trực tiếp trong VS Code

## 📝 Template cho API Tests JSON

File: `[project-name]-api-tests.json`

```json
{
  "requests": [
    {
      "name": "Tên API request",
      "method": "GET|POST|PUT|DELETE",
      "endpoint": "/api/endpoint",
      "description": "Mô tả chi tiết API này làm gì",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer YOUR_TOKEN"
      },
      "body": {
        "key": "value"
      }
    }
  ],
  "baseUrl": "http://localhost:PORT",
  "metadata": {
    "name": "Tên Project API",
    "version": "1.0.0",
    "description": "Mô tả ngắn gọn",
    "created": "YYYY-MM-DD"
  }
}
```

### Chi tiết các field:

#### Request Object:
- `name` (required): Tên hiển thị của request
- `method` (required): GET, POST, PUT, DELETE, PATCH
- `endpoint` (required): Đường dẫn API (VD: /api/users)
- `description` (optional): Mô tả request làm gì
- `headers` (optional): HTTP headers (Content-Type, Authorization, etc.)
- `body` (optional): Request body cho POST/PUT/PATCH

#### Metadata:
- `baseUrl`: URL mặc định của server
- `metadata`: Thông tin về bộ API tests

## 📚 Ví dụ hoàn chỉnh

Xem file `jar-ratio-api-tests.json` trong thư mục này làm mẫu.

## 🎨 Quy ước đặt tên

### File Markdown:
- `README.md` - Tổng quan
- `QUICK-START.md` - Hướng dẫn nhanh
- `[FEATURE]-GUIDE.md` - Hướng dẫn tính năng cụ thể
- `API-REFERENCE.md` - Tài liệu API chi tiết
- `TROUBLESHOOTING.md` - Xử lý lỗi

### File JSON/HTTP:
- `[project-name]-api-tests.json` - API tests cho Test Tool Viewer
- `[project-name]-test.http` - HTTP requests
- `[project-name]-sample-data.json` - Dữ liệu mẫu

## ✅ Checklist khi tạo thư mục mới

- [ ] Tạo thư mục trong `apis/[project-name]/`
- [ ] Tạo README.md với tổng quan
- [ ] Tạo QUICK-START.md với hướng dẫn cơ bản
- [ ] Tạo [project]-api-tests.json với API endpoints
- [ ] Cập nhật file-explorer.js để thêm thư mục mới
- [ ] Test load file trong Test Tool Viewer

## 📖 Hướng dẫn thêm thư mục vào Test Tool Viewer

Xem file `HOW-TO-ADD-FOLDERS.md` ở thư mục root.

## 💡 Tips

1. **Markdown files**: Dùng heading structure rõ ràng (h1, h2, h3...)
2. **Code examples**: Luôn wrap trong code blocks với syntax highlighting
3. **API tests**: Nhóm các request liên quan gần nhau
4. **Descriptions**: Viết ngắn gọn, rõ ràng
5. **Update regularly**: Cập nhật khi có thay đổi API

## 🔗 Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [HTTP Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [REST API Best Practices](https://restfulapi.net/)
