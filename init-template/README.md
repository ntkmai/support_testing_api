# Hướng dẫn sử dụng Template

Thư mục này chứa file template mẫu để tạo test collection cho API Tester.

## Files

- **api-json-template.json** - Template JSON với đầy đủ thuộc tính mỗi json phải có đăng nhập ở đầu và có template cho 1 số tài khoản trong luồng
- **API-DOCUMENT.md** - Mẫu viết flow và test case cho dự án

## Cách sử dụng

### 1. Tạo test collection mới

```bash
# Copy template
cp api-json-template.json ../your-api/your-api-tests.json
```

### 2. Cấu trúc JSON

```json
{
  "requests": [
    {
      "name": "Request Name",
      "method": "GET|POST|PUT|DELETE",
      "endpoint": "/api/path",
      "description": "Mô tả (hỗ trợ Markdown)",
      "headers": { /* optional */ },
      "body": { /* optional - cho POST/PUT */ },
      "templates": [ /* optional - test variations */ ]
    }
  ],
  "baseUrl": "http://localhost:3000",
  "metadata": { /* thông tin collection */ }
}
Nếu có biến ví dụ employee/:id thì trong json là employee/{id}
Cần xem xét dto và query bám sát controller
```

### 3. Request Properties

| Property | Required | Description |
|----------|----------|-------------|
| name | ✅ | Tên hiển thị |
| method | ✅ | HTTP method |
| endpoint | ✅ | API path |
| description | ⚪ | Mô tả (Markdown) |
| headers | ⚪ | HTTP headers |
| body | ⚪ | Request body |
| templates | ⚪ | Test variations |

### 4. Templates

**Lưu ý**: Templates là feature của tool, không gửi lên API.


```json
{
  "templates": [
    {
      "name": "Template Name",
      "description": "Mô tả ngắn",
      "body": { /* data thay thế */ }
    }
  ]
}
```

### 5. Thêm vào manifest phần này developer tự thêm

Edit `apis/manifest.json`:

```json
{
  "folders": [
    {
      "path": "your-api",
      "name": "Your API",
      "icon": "🔧"
    }
  ]
}
```

## Examples

Xem file `api-json-template.json` để có ví dụ đầy đủ.

## API Documentation

Để viết flow và test case cho dự án, xem file `API-DOCUMENT.md`.
