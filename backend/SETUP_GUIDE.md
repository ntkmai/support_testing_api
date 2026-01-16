# 🚀 Hướng dẫn Setup & Sửa lỗi MongoDB

## ✅ Các lỗi đã được sửa

### 1. Deprecated Options
- ❌ **Cũ**: `useNewUrlParser: true, useUnifiedTopology: true`
- ✅ **Mới**: Đã xóa (không cần thiết từ MongoDB Driver v4.0.0+)

### 2. SSL/TLS Configuration
- ✅ Thêm `tls: true`
- ✅ Thêm `tlsAllowInvalidCertificates: false`
- ✅ Thêm `serverSelectionTimeoutMS: 5000`
- ✅ Thêm `maxPoolSize: 10`

## 🔧 Sửa lỗi SSL/TLS Alert Internal Error

Lỗi này xảy ra do:
1. **IP chưa được whitelist** trong MongoDB Atlas
2. **Connection string không đúng format**
3. **SSL certificate issues**

### Giải pháp:

#### Bước 1: Whitelist IP Address
```bash
1. Đăng nhập MongoDB Atlas: https://cloud.mongodb.com
2. Chọn cluster > Network Access
3. Click "Add IP Address"
4. Chọn "Allow Access from Anywhere" (0.0.0.0/0)
   hoặc thêm IP cụ thể của bạn
5. Click "Confirm"
```

#### Bước 2: Kiểm tra Connection String
```javascript
// Format chuẩn:
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

// Ví dụ:
mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

#### Bước 3: Kiểm tra Database User
```bash
1. Vào MongoDB Atlas > Database Access
2. Verify user có quyền "Read and write to any database"
3. Nếu cần, tạo user mới với quyền đầy đủ
```

#### Bước 4: Test Connection
```bash
# Chạy server với options mới
cd api
npm start

# Nếu thành công, bạn sẽ thấy:
✅ Connected to MongoDB Atlas
📦 Database: api_test_tool
```

## 📁 Cấu trúc 6 Dự án

### File Structure:
```
api/
├── server.js                    # Server hiện tại (1 dự án)
├── server-multiproject.js       # Server mới (6 dự án)
├── DATABASE_STRUCTURE.md        # Chi tiết cấu trúc database
├── .env.example                 # Template config
├── .env                         # Config thực (tạo mới)
└── package.json
```

### Cấu trúc Database:

#### 1️⃣ Dự án Kế toán (ke-toan)
```
Collections:
- ke_toan_projects
- ke_toan_jar_ratios
- ke_toan_payment_requests
- ke_toan_vouchers
```

#### 2️⃣ Payment Gateway API (payment-gateway)
```
Collections:
- payment_gateway_projects
- payment_gateway_transactions
- payment_gateway_configs
```

#### 3️⃣ User Management & RBAC (user-management)
```
Collections:
- user_mgmt_projects
- user_mgmt_users
- user_mgmt_roles
- user_mgmt_permissions
```

#### 4️⃣ E-commerce API (ecommerce)
```
Collections:
- ecommerce_projects
- ecommerce_products
- ecommerce_orders
- ecommerce_customers
```

#### 5️⃣ Notification Service (notification)
```
Collections:
- notification_projects
- notification_templates
- notification_messages
- notification_subscriptions
```

#### 6️⃣ Analytics Dashboard (analytics)
```
Collections:
- analytics_projects
- analytics_events
- analytics_reports
- analytics_dashboards
```

## 🚀 Chạy Server Mới (Multi-Project)

### Cách 1: Sử dụng server-multiproject.js
```bash
cd api
node server-multiproject.js
```

### Cách 2: Cập nhật package.json
```json
{
  "scripts": {
    "start": "node server-multiproject.js",
    "start:single": "node server.js",
    "dev": "nodemon server-multiproject.js"
  }
}
```

## 📡 API Endpoints Mới

### General Routes:
```bash
GET    /api/health
GET    /api/project-types
```

### Project-Specific Routes:
```bash
# Thay :projectType với: ke-toan, payment-gateway, user-management, 
#                         ecommerce, notification, analytics

GET    /api/:projectType/projects              # Lấy tất cả projects
POST   /api/:projectType/projects              # Tạo project mới
GET    /api/:projectType/projects/:id          # Lấy 1 project
PUT    /api/:projectType/projects/:id          # Update project
DELETE /api/:projectType/projects/:id          # Xóa project
```

### Admin Routes:
```bash
GET    /api/admin/all-projects                 # Lấy tất cả projects
DELETE /api/admin/:projectType/clear           # Xóa tất cả data của 1 project type
```

## 🧪 Test API

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

### 2. Get Project Types
```bash
curl http://localhost:3001/api/project-types
```

### 3. Create Project
```bash
curl -X POST http://localhost:3001/api/ke-toan/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Kế toán",
    "description": "Dự án test",
    "color": "#667eea",
    "userId": "user123"
  }'
```

### 4. Get Projects
```bash
curl http://localhost:3001/api/ke-toan/projects?userId=user123
```

## 🔒 Security Notes

### Production Checklist:
- [ ] Không dùng 0.0.0.0/0 cho IP whitelist
- [ ] Sử dụng strong password cho database user
- [ ] Enable authentication middleware
- [ ] Giới hạn rate limiting
- [ ] Validate tất cả input
- [ ] Log tất cả errors
- [ ] Sử dụng HTTPS
- [ ] Enable CORS chỉ cho domains cần thiết

## 📊 Migration từ Server Cũ

### Bước 1: Backup Data
```javascript
// Xuất data từ collection cũ
mongoexport --uri="<connection_string>" --collection=projects --out=backup.json
```

### Bước 2: Import vào Collection Mới
```javascript
// Import vào ke_toan_projects
mongoimport --uri="<connection_string>" --collection=ke_toan_projects --file=backup.json
```

### Bước 3: Verify
```bash
# Test API mới
curl http://localhost:3001/api/ke-toan/projects
```

## 🐛 Troubleshooting

### Lỗi: Connection timeout
```bash
# Kiểm tra IP whitelist
# Kiểm tra firewall
# Kiểm tra internet connection
```

### Lỗi: Authentication failed
```bash
# Verify username/password
# Check database user permissions
# Regenerate password nếu cần
```

### Lỗi: Collection not found
```bash
# Server sẽ tự tạo collections
# Chạy lại server để initialize
```

## 📝 Next Steps

1. ✅ Sửa lỗi MongoDB connection
2. ✅ Tạo cấu trúc 6 dự án
3. ⏭️ Implement specific APIs cho từng dự án
4. ⏭️ Thêm authentication
5. ⏭️ Thêm validation
6. ⏭️ Viết unit tests
7. ⏭️ Deploy lên production

## 📚 Resources

- [MongoDB Driver Documentation](https://mongodb.github.io/node-mongodb-native/)
- [MongoDB Atlas Setup Guide](https://docs.atlas.mongodb.com/getting-started/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
