# 📖 Hướng dẫn thêm thư mục mới

## Cách thêm thư mục mới vào File Explorer

### 1. Mở file `js/file-explorer.js`

### 2. Tìm hàm `loadFileStructure()`

### 3. Thêm thư mục mới vào `this.folders`

```javascript
this.folders = new Map([
    ['JAR Ratio Testing', {
        icon: '🧪',
        color: '#667eea',
        description: 'Tài liệu và test cases cho JAR Ratio API',
        path: 'jar-ratio-testing',
        files: [...]
    }],
    
    // THÊM THƯ MỤC MỚI Ở ĐÂY
    ['User Management', {
        icon: '👥',                           // Icon cho thư mục
        color: '#10b981',                     // Màu border (green)
        description: 'API docs cho User Management',
        path: 'user-management',              // Đường dẫn thư mục
        files: [
            { 
                name: 'API-DOCS.md', 
                icon: '📄', 
                path: 'user-management/API-DOCS.md', 
                type: 'md' 
            },
            { 
                name: 'test-data.json', 
                icon: '📊', 
                path: 'user-management/test-data.json', 
                type: 'json' 
            }
        ]
    }],
    
    ['Authentication', {
        icon: '🔐',
        color: '#f59e0b',                     // Màu border (orange)
        description: 'Tài liệu Authentication & Authorization',
        path: 'auth',
        files: [
            { name: 'auth-flow.md', icon: '📖', path: 'auth/auth-flow.md', type: 'md' }
        ]
    }]
]);
```

## 📋 Các thuộc tính của Folder

| Thuộc tính | Bắt buộc | Mô tả | Ví dụ |
|-----------|----------|-------|-------|
| `icon` | ✅ | Emoji icon hiển thị | `'🧪'`, `'👥'`, `'🔐'` |
| `color` | ❌ | Màu border (hex) | `'#667eea'`, `'#10b981'` |
| `description` | ❌ | Mô tả ngắn về thư mục | `'API docs cho...'` |
| `path` | ✅ | Đường dẫn thư mục | `'jar-ratio-testing'` |
| `files` | ✅ | Mảng các file trong thư mục | `[{...}, {...}]` |

## 📄 Các thuộc tính của File

| Thuộc tính | Bắt buộc | Mô tả | Ví dụ |
|-----------|----------|-------|-------|
| `name` | ✅ | Tên file hiển thị | `'API-DOCS.md'` |
| `icon` | ✅ | Icon file | `'📄'`, `'📊'`, `'🌐'` |
| `path` | ✅ | Đường dẫn đầy đủ | `'folder/file.md'` |
| `type` | ✅ | Loại file | `'md'`, `'json'`, `'http'` |

## 🎨 Các màu gợi ý

```javascript
// Primary colors
'#667eea' // Purple
'#10b981' // Green
'#f59e0b' // Orange
'#ef4444' // Red
'#3b82f6' // Blue
'#8b5cf6' // Violet
'#ec4899' // Pink
'#14b8a6' // Teal
```

## 🔍 Các icon gợi ý

```
Folders:
🧪 Testing
👥 Users
🔐 Auth
📊 Data
🌐 API
⚙️ Config
📁 General
🎨 UI/UX
🚀 Deploy

Files:
📄 README
📚 Guide
📖 Docs
🚀 Quick Start
📋 Summary
📑 Index
🌐 HTTP
📊 JSON
```

## ✅ Ví dụ hoàn chỉnh

```javascript
async loadFileStructure() {
    this.folders = new Map([
        ['JAR Ratio Testing', {
            icon: '🧪',
            color: '#667eea',
            description: 'Tài liệu và test cases cho JAR Ratio API',
            path: 'jar-ratio-testing',
            files: [
                { name: 'QUICK-START.md', icon: '🚀', path: 'jar-ratio-testing/QUICK-START.md', type: 'md' },
                { name: 'test-data.json', icon: '📊', path: 'jar-ratio-testing/test-data.json', type: 'json' }
            ]
        }],
        
        ['User API', {
            icon: '👥',
            color: '#10b981',
            description: 'User Management API Documentation',
            path: 'user-api',
            files: [
                { name: 'USER-API.md', icon: '📄', path: 'user-api/USER-API.md', type: 'md' }
            ]
        }]
    ]);
    
    // Flatten all files
    this.files = [];
    this.folders.forEach(folder => {
        this.files.push(...folder.files);
    });
}
```

## 🚀 Sau khi thêm

1. Lưu file `js/file-explorer.js`
2. Refresh browser (Ctrl + F5)
3. Thư mục mới sẽ hiển thị dạng card
4. Click vào card để xem files trong đó

## 💡 Tips

- Mỗi thư mục nên có 3-10 files để dễ quản lý
- Sử dụng icon phù hợp với nội dung
- Mô tả ngắn gọn, rõ ràng (40-60 ký tự)
- Màu sắc nhất quán theo chủ đề (test=purple, user=green, auth=orange...)
