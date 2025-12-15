# 🔧 Test Tool Viewer v2.0 - Modular Edition

## ✨ Tính năng mới

### 📂 File Explorer với cấu trúc thư mục
- Hiển thị file theo cấu trúc folder tree
- Phân loại file: Markdown, API tests, JSON data
- Đếm số lượng file trong mỗi folder
- Collapse/expand folders

### 🧪 API Tester với giao diện hoàn chỉnh
- Danh sách các request được lưu sẵn
- Hiển thị chi tiết request (method, endpoint, headers, body)
- Thực thi request và xem response
- Syntax highlighting cho JSON
- Copy response vào clipboard
- Hiển thị status code, response time
- Error handling với gợi ý khắc phục

### ⚙️ Dynamic Configuration
- **Input để thay đổi Base URL** ngay trên header
- Lưu config vào localStorage
- Áp dụng ngay lập tức cho tất cả requests
- Export/Import configuration

### 🏗️ Kiến trúc Module (ES6 Modules)

```
js/
├── app.js              # Main application controller
├── config.js           # Configuration management
├── file-explorer.js    # File tree & navigation
├── markdown-viewer.js  # Markdown rendering
├── api-tester.js       # API testing functionality
└── ui-components.js    # Reusable UI components
```

## 🚀 Cách sử dụng

### 1. Khởi chạy Local Server

```bash
# Sử dụng http-server (Node.js)
npx http-server -p 8000

# Hoặc Python
python -m http.server 8000
```

### 2. Mở trình duyệt

```
http://localhost:8000
```

### 3. Thay đổi API Base URL

1. Nhập URL mới vào ô input ở header (ví dụ: `http://192.168.1.100:3000`)
2. Click nút **💾 Lưu**
3. Tất cả API requests sẽ tự động sử dụng URL mới

### 4. Xem file Markdown

1. Click vào folder trong **File Explorer**
2. Chọn file `.md` muốn xem
3. Nội dung sẽ hiển thị với syntax highlighting

### 5. Test API

1. Chuyển sang tab **🧪 API Tester**
2. Chọn một request từ danh sách
3. Chỉnh sửa endpoint hoặc body nếu cần
4. Click **🚀 Thực thi**
5. Xem response (Body/Headers)

## 📁 Cấu trúc Project

```
test-tool-viewer/
├── index.html              # Main HTML (modular version)
├── index-old.html          # Backup của version cũ
├── styles.css              # CSS styles
├── js/                     # JavaScript modules
│   ├── app.js
│   ├── config.js
│   ├── file-explorer.js
│   ├── markdown-viewer.js
│   ├── api-tester.js
│   └── ui-components.js
└── jar-ratio-testing/      # Test files & data
    ├── *.md                # Markdown docs
    ├── jar-ratio-test.http # HTTP requests
    └── jar-ratio-test-data.json # Test data
```

## 🎯 Các Module chính

### Config Manager (`config.js`)
- Quản lý Base URL
- Lưu trữ trong localStorage
- Notify khi config thay đổi
- Export/Import configuration

### File Explorer (`file-explorer.js`)
- Hiển thị cây thư mục
- Phân loại file theo type
- Search files
- File selection callback

### Markdown Viewer (`markdown-viewer.js`)
- Render Markdown sang HTML
- Syntax highlighting
- Copy code blocks
- Generate table of contents
- Export as HTML

### API Tester (`api-tester.js`)
- Load test requests từ JSON
- Execute HTTP requests
- Format JSON response
- Error handling
- Request history

### UI Components (`ui-components.js`)
- Notifications (success, error, warning, info)
- Loading spinner
- Empty states
- Modal dialogs
- Format utilities

## 🔧 Customization

### Thêm API Request mới

Chỉnh sửa `jar-ratio-testing/jar-ratio-test-data.json`:

```json
{
  "requests": [
    {
      "name": "Your Request Name",
      "method": "GET|POST|PUT|DELETE",
      "endpoint": "/api/your-endpoint",
      "description": "Mô tả request",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "key": "value"
      }
    }
  ]
}
```

### Thay đổi Theme

Chỉnh sửa CSS variables trong `styles.css`:

```css
:root {
    --primary-color: #2563eb;    /* Màu chính */
    --success-color: #10b981;    /* Màu success */
    --danger-color: #ef4444;     /* Màu error */
    /* ... */
}
```

## 📝 So sánh với Version cũ

| Tính năng | Version cũ | Version mới |
|-----------|------------|-------------|
| Cấu trúc code | Monolithic (1 file) | Modular (6 modules) |
| File explorer | Danh sách phẳng | Cấu trúc thư mục |
| API Config | Hardcoded | Dynamic input |
| API Tester | Cơ bản | Đầy đủ (request list, details, response) |
| UI Components | Inline | Reusable module |
| Maintainability | Khó | Dễ dàng |
| Extensibility | Hạn chế | Cao |

## 🐛 Troubleshooting

### Lỗi CORS khi test API
- Đảm bảo server API của bạn enable CORS
- Hoặc chạy browser với flag `--disable-web-security` (chỉ để test)

### Module loading error
- Đảm bảo đang chạy qua HTTP server (không mở file trực tiếp)
- Check console để xem lỗi chi tiết

### File không load được
- Verify đường dẫn file trong file explorer
- Check server có serve đúng thư mục không

## 📄 License

MIT License - Tự do sử dụng và chỉnh sửa

## 👨‍💻 Author

Built with ❤️ for better testing experience
