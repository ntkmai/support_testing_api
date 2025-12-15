# 🐛 Bug Fixes - Quick Summary

## ✅ Đã sửa (Dec 15, 2025)

### 1. Lỗi 404 khi load file Markdown
**Vấn đề:** File path sai `jar-ratio-testing/` thay vì `apis/jar-ratio-testing/`

**Giải pháp:**
- Cập nhật `basePath` trong [file-explorer.js](js/file-explorer.js) → `'apis/jar-ratio-testing'`
- Cập nhật path trong [api-tester.js](js/api-tester.js) cho test data

### 2. Không thể chuyển tab bằng click
**Vấn đề:** Tab buttons không có event listener

**Giải pháp:**
- Thêm event listeners trong `setupEventHandlers()` của [app.js](js/app.js)
- Sửa logic `switchTab()` để active đúng tab button

### 3. Auto-load file khi khởi động
**Vấn đề:** App tự động load file trước khi user chọn folder

**Giải pháp:**
- Xóa auto-load trong `init()` của [app.js](js/app.js)
- User sẽ thấy folder cards khi vào lần đầu

## 📁 Cấu trúc đúng

```
test-tool-viewer/
├── apis/
│   └── jar-ratio-testing/
│       ├── JAR-RATIO-COMPLETE-TEST-GUIDE.md
│       ├── TEST-README.md
│       ├── QUICK-START-TEST.md
│       ├── README-TEST-JAR-RATIO.md
│       ├── README.md
│       ├── TEST-FILES-SUMMARY.md
│       ├── TEST-INDEX.md
│       ├── jar-ratio-test.http
│       └── jar-ratio-test-data.json
├── js/
│   ├── app.js
│   ├── config.js
│   ├── file-explorer.js
│   ├── markdown-viewer.js
│   ├── api-tester.js
│   └── ui-components.js
├── index.html
└── styles.css
```

## 🔧 Code Changes

### file-explorer.js
```javascript
// TRƯỚC
const basePath = 'jar-ratio-testing';

// SAU
const basePath = 'apis/jar-ratio-testing';
```

### app.js
```javascript
// THÊM: Event handlers cho tabs
setupEventHandlers() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const tabs = ['markdown', 'api', 'settings'];
            this.switchTab(tabs[index]);
        });
    });
    // ... rest of handlers
}

// SỬA: Logic switchTab
switchTab(tabName) {
    // ... hide/show tabs
    const tabIndex = ['markdown', 'api', 'settings'].indexOf(tabName);
    if (tabIndex >= 0) {
        const buttons = document.querySelectorAll('.tab-btn');
        if (buttons[tabIndex]) {
            buttons[tabIndex].classList.add('active');
        }
    }
}
```

## ✅ Test Checklist

- [x] Click vào folder card → Hiển thị danh sách file
- [x] Click vào file → Load nội dung markdown
- [x] Click "⬅️ Tất cả thư mục" → Quay về folder cards
- [x] Click tab "🧪 API Tester" → Chuyển sang API tab
- [x] Click tab "⚙️ Settings" → Chuyển sang Settings tab
- [x] Click tab "📚 Markdown Viewer" → Quay về Markdown tab

## 🚀 Next Steps

Nếu muốn thêm thư mục mới:
1. Tạo thư mục trong `apis/`
2. Thêm config trong `file-explorer.js`
3. Xem [HOW-TO-ADD-FOLDERS.md](HOW-TO-ADD-FOLDERS.md)
