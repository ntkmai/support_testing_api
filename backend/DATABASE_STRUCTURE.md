# Cấu trúc Database cho 6 Dự án

## Tổng quan

Database: **api_test_tool**

Mỗi dự án sẽ có collections riêng để quản lý dữ liệu độc lập.

## 1️⃣ Dự án Kế toán (ke-toan)

### Collections:
```javascript
// Collection: ke_toan_projects
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  createdAt: ISODate,
  updatedAt: ISODate,
  settings: {
    baseUrl: String,
    apiVersion: String
  }
}

// Collection: ke_toan_jar_ratios
{
  _id: ObjectId,
  projectId: ObjectId,
  jarId: String,
  name: String,
  percentage: Number,
  description: String,
  createdAt: ISODate
}

// Collection: ke_toan_payment_requests
{
  _id: ObjectId,
  projectId: ObjectId,
  requestId: String,
  amount: Number,
  status: String, // pending, approved, rejected
  jarType: String,
  description: String,
  requestedBy: String,
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: ke_toan_vouchers
{
  _id: ObjectId,
  projectId: ObjectId,
  voucherId: String,
  type: String, // payment, disbursement, revenue
  amount: Number,
  date: ISODate,
  description: String,
  attachments: Array
}
```

## 2️⃣ Payment Gateway API

### Collections:
```javascript
// Collection: payment_gateway_projects
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  createdAt: ISODate
}

// Collection: payment_gateway_transactions
{
  _id: ObjectId,
  projectId: ObjectId,
  transactionId: String,
  gateway: String, // momo, vnpay, zalopay, stripe
  amount: Number,
  currency: String,
  status: String, // pending, success, failed
  customerInfo: {
    name: String,
    email: String,
    phone: String
  },
  metadata: Object,
  createdAt: ISODate,
  completedAt: ISODate
}

// Collection: payment_gateway_configs
{
  _id: ObjectId,
  projectId: ObjectId,
  gateway: String,
  apiKey: String,
  secretKey: String,
  webhookUrl: String,
  isActive: Boolean
}
```

## 3️⃣ User Management & RBAC

### Collections:
```javascript
// Collection: user_mgmt_projects
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  createdAt: ISODate
}

// Collection: user_mgmt_users
{
  _id: ObjectId,
  projectId: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  fullName: String,
  avatar: String,
  status: String, // active, inactive, suspended
  roles: Array, // [roleId1, roleId2]
  createdAt: ISODate,
  lastLogin: ISODate
}

// Collection: user_mgmt_roles
{
  _id: ObjectId,
  projectId: ObjectId,
  roleName: String,
  displayName: String,
  description: String,
  permissions: Array, // ['read:users', 'write:users', 'delete:users']
  priority: Number,
  createdAt: ISODate
}

// Collection: user_mgmt_permissions
{
  _id: ObjectId,
  projectId: ObjectId,
  resource: String, // users, posts, settings
  action: String, // read, write, delete, update
  description: String
}
```

## 4️⃣ E-commerce API

### Collections:
```javascript
// Collection: ecommerce_projects
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  createdAt: ISODate
}

// Collection: ecommerce_products
{
  _id: ObjectId,
  projectId: ObjectId,
  sku: String,
  name: String,
  description: String,
  price: Number,
  salePrice: Number,
  stock: Number,
  category: String,
  images: Array,
  attributes: Object,
  isActive: Boolean,
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: ecommerce_orders
{
  _id: ObjectId,
  projectId: ObjectId,
  orderNumber: String,
  customerId: String,
  items: [{
    productId: ObjectId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String, // pending, processing, shipped, delivered, cancelled
  shippingAddress: Object,
  paymentMethod: String,
  createdAt: ISODate,
  updatedAt: ISODate
}

// Collection: ecommerce_customers
{
  _id: ObjectId,
  projectId: ObjectId,
  email: String,
  fullName: String,
  phone: String,
  addresses: Array,
  orderCount: Number,
  totalSpent: Number,
  createdAt: ISODate
}
```

## 5️⃣ Notification Service

### Collections:
```javascript
// Collection: notification_projects
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  createdAt: ISODate
}

// Collection: notification_templates
{
  _id: ObjectId,
  projectId: ObjectId,
  templateId: String,
  name: String,
  type: String, // email, sms, push, in-app
  subject: String,
  content: String,
  variables: Array, // ['userName', 'orderNumber']
  isActive: Boolean,
  createdAt: ISODate
}

// Collection: notification_messages
{
  _id: ObjectId,
  projectId: ObjectId,
  templateId: String,
  recipient: String, // email, phone, userId
  channel: String, // email, sms, push, in-app
  subject: String,
  content: String,
  status: String, // pending, sent, delivered, failed
  sentAt: ISODate,
  deliveredAt: ISODate,
  metadata: Object
}

// Collection: notification_subscriptions
{
  _id: ObjectId,
  projectId: ObjectId,
  userId: String,
  channels: {
    email: Boolean,
    sms: Boolean,
    push: Boolean,
    inApp: Boolean
  },
  preferences: Object,
  createdAt: ISODate
}
```

## 6️⃣ Analytics Dashboard

### Collections:
```javascript
// Collection: analytics_projects
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  color: String,
  createdAt: ISODate
}

// Collection: analytics_events
{
  _id: ObjectId,
  projectId: ObjectId,
  eventName: String,
  eventType: String, // page_view, click, purchase, signup
  userId: String,
  sessionId: String,
  properties: Object,
  timestamp: ISODate,
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    city: String
  }
}

// Collection: analytics_reports
{
  _id: ObjectId,
  projectId: ObjectId,
  reportName: String,
  reportType: String, // daily, weekly, monthly
  dateRange: {
    start: ISODate,
    end: ISODate
  },
  metrics: {
    totalEvents: Number,
    uniqueUsers: Number,
    pageViews: Number,
    conversions: Number
  },
  generatedAt: ISODate
}

// Collection: analytics_dashboards
{
  _id: ObjectId,
  projectId: ObjectId,
  dashboardName: String,
  widgets: [{
    type: String, // chart, table, metric
    title: String,
    query: Object,
    position: { x: Number, y: Number }
  }],
  isDefault: Boolean,
  createdAt: ISODate
}
```

## Indexes Khuyến nghị

### Performance Indexes:
```javascript
// Cho mỗi project collection
db.{collection_name}.createIndex({ userId: 1 });
db.{collection_name}.createIndex({ createdAt: -1 });

// Cho collections có projectId
db.{collection_name}.createIndex({ projectId: 1 });
db.{collection_name}.createIndex({ projectId: 1, createdAt: -1 });

// Cho collections có status
db.{collection_name}.createIndex({ status: 1 });

// Cho collections có email/username
db.{collection_name}.createIndex({ email: 1 }, { unique: true });
```

## Migration Strategy

1. **Phase 1**: Tạo collections cho dự án Kế toán
2. **Phase 2**: Migrate data hiện tại vào collection mới
3. **Phase 3**: Tạo collections cho 5 dự án còn lại
4. **Phase 4**: Implement APIs cho từng dự án

## Connection String Format

```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

**Lưu ý**: Đảm bảo IP của server đã được whitelist trong MongoDB Atlas Network Access.
