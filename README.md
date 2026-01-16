# Test Tool Viewer

API Testing Tool với Static Server và clean URLs.

## 📁 Cấu trúc dự án

```
test-tool-viewer/
├── 📁 frontend/              # Frontend code
│   ├── pages/                # HTML pages
│   │   ├── projects-static.html
│   │   ├── project-home.html
│   │   ├── init-project.html
│   │   └── reset-admin-password.html
│   └── assets/               # Static assets (CSS, JS, images, audio)
│
├── 📁 backend/               # Backend API server
│   ├── server.js
│   ├── server-inmemory.js
│   └── package.json
│
├── 📁 api-docs/              # API documentation & test data
│
├── 📁 scripts/               # Build & start scripts
│   ├── start-all.bat         # Chạy cả backend + frontend (Windows CMD)
│   ├── start-all.ps1         # Chạy cả backend + frontend (PowerShell)
│   ├── start-static.bat      # Chỉ chạy frontend
│   └── ...
│
├── server-static.js          # Frontend static server
└── package.json
```

## 🚀 Cách sử dụng

### Chạy cả Backend + Frontend

```bash
# Windows CMD
scripts\start-all.bat

# PowerShell
.\scripts\start-all.ps1
```

### Chỉ chạy Frontend

```bash
node server-static.js
```

### Chỉ chạy Backend

```bash
cd backend
node server-inmemory.js
```

## 🌐 URLs

### Frontend (Clean URLs - không có .html)
- `http://localhost:8080/` - Trang chủ (Projects)
- `http://localhost:8080/projects` - Projects List
- `http://localhost:8080/project-home` - Project Home
- `http://localhost:8080/init-project` - Initialize Project
- `http://localhost:8080/reset-password` - Reset Password

### Backend API
- `http://localhost:3001` - Backend API Server

## 📡 Truy cập từ thiết bị khác

Server tự động hiển thị IP address khi chạy. Ví dụ:
```
Network: http://192.168.100.51:8080
```

Người khác cùng mạng WiFi/LAN có thể truy cập qua link này.

## 🛠️ Cài đặt

```bash
npm install
```

## 🔥 Firewall (nếu cần)

Nếu Windows Firewall chặn, chạy lệnh này (PowerShell as Admin):
```powershell
New-NetFirewallRule -DisplayName "Node.js Web Server" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```
