# API Documentation - Phiếu đề nghị thanh toán

**Module**: Payment Request (Phiếu đề nghị thanh toán)
**Base URL**: `http://localhost:3000/api`
**Version**: 2.0.0
**Last Updated**: 2025-12-16

---

## 📋 Mục lục

- [1. Tổng quan](#1-tổng-quan)
- [2. Authentication](#2-authentication)
- [3. Workflow - Luồng duyệt](#3-workflow---luồng-duyệt)
- [4. API Endpoints](#4-api-endpoints)
- [5. Data Models](#5-data-models)
- [6. Business Rules](#6-business-rules)
- [7. Error Codes](#7-error-codes)

---

## 1. Tổng quan

### 1.1. Quy trình nghiệp vụ

Phiếu đề nghị thanh toán có **3 luồng duyệt khác nhau** tùy theo **loại lọ ngân sách**:

| Loại lọ | jar_id | Bước 2 duyệt bởi | jar_category_id |
|---------|--------|------------------|-----------------|
| **Lọ Tài sản** | `a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd` | Kế toán Tài sản | `69f31527-ba0d-499e-838d-f775c3f37690` |
| **Lọ Hàng hóa** | `7ce3b31a-ba53-4fd3-a565-3ddbce1bb03b` | Kế toán Hàng hóa | `8e8c4e1a-6605-4652-b81c-945feab01392` |
| **Lọ Khác** | `251af1ac-b48c-4cda-a03c-ac2e91d762dd` | Kế toán Thuế | `72e8b13a-d21a-4770-b50e-0bb9771df48d` |

### 1.2. Công thức tính tiền

```javascript
// Tính tiền từng dòng payment_detail
amount = quantity × price × (1 + tax/100)

// Ví dụ:
// 10 × 50,000 × (1 + 10/100) = 10 × 50,000 × 1.1 = 550,000

// Tổng tiền phiếu
total_amount = sum(payment_details[].amount)
```

---

## 2. Authentication

### 2.1. Login

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "username": "55555",
  "password": "55555"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "...",
    "user": {
      "id": "...",
      "username": "55555",
      "name": "Nguyễn Văn A",
      "role": "employee"
    }
  }
}
```

### 2.2. Tài khoản theo vai trò

| Vai trò | Username | Password | Sử dụng ở |
|---------|----------|----------|-----------|
| Người tạo phiếu | 55555 | 55555 | Bước 0: Tạo phiếu |
| Trưởng bộ phận | 55555 | 55555 | Bước 1: Duyệt lần 1 |
| Kế toán Tài sản | 0025 | 0001 | Bước 2: Duyệt (Lọ Tài sản) |
| Kế toán Hàng hóa | 0091 | 0091 | Bước 2: Duyệt (Lọ Hàng hóa) |
| Kế toán Thuế | 44444 | 44444 | Bước 2 (Lọ Khác) hoặc Bước 3 |
| Kế toán Thanh toán | 11111 | 11111 | Bước 4: Tạo hạch toán |
| TBP KTTT | 22222 | 22222 | Bước 5: Sửa/duyệt hạch toán |
| Kế toán trưởng | 33333 | 33333 | Bước 6: Duyệt cuối |

### 2.3. Authorization Header

Tất cả API (trừ login) cần header:
```
Authorization: Bearer {access_token}
```

---

## 3. Workflow - Luồng duyệt

### 3.1. Luồng LỌ TÀI SẢN

```
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 0: TẠO PHIẾU                                              │
│ User: 55555/55555                                              │
│ API: POST /api/payment-request                                │
├─────────────────────────────────────────────────────────────────┤
│ Body:                                                          │
│ - jar_id: a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd (Lọ Tài sản) │
│ - workplace_type: 1 (Phòng ban)                               │
│ - workplace_id: e92cf911-b543-4638-b996-2c4441ca0480         │
│ - payment_details: [{quantity, price, tax, amount}, ...]     │
│ - payment_documents: [{type_document_id, ref_id, ref_code}]  │
│                                                                │
│ type_document_id: 7835a8dc-707a-45d0-a006-4cbb9002c568       │
│ (Phải gọi GET /api/document-type?jar_id={jar_id})            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 1: TRƯỞNG BỘ PHẬN DUYỆT                                  │
│ User: 55555/55555                                              │
│ API: PUT /api/payment-request/status/{id}                     │
├─────────────────────────────────────────────────────────────────┤
│ Body: { "status": "approved" }                                │
│                                                                │
│ FE hiển thị:                                                   │
│ - Button "Duyệt" / "Từ chối"                                  │
│ - Nếu từ chối: textarea nhập lý do (required)                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 2: KẾ TOÁN TÀI SẢN                                       │
│ User: 0025/0001                                                │
│ API 1: PUT /api/payment-request/documents/{id} (Optional)     │
│ API 2: PUT /api/payment-request/status/{id}                   │
├─────────────────────────────────────────────────────────────────┤
│ TRƯỚC KHI DUYỆT: Có thể sửa chứng từ đính kèm                │
│                                                                │
│ API 1 - Sửa chứng từ (nếu cần):                              │
│ Body: [                                                        │
│   {                                                            │
│     "ids": ["doc-uuid-1", "doc-uuid-2"],                     │
│     "type_document_id": "7835a8dc-707a-45d0-a006-4cbb9002c568",│
│     "ref_id": ["11...11", "22...22"],                         │
│     "ref_code": ["REF001", "REF002"]                          │
│   }                                                            │
│ ]                                                              │
│                                                                │
│ API 2 - Duyệt:                                                │
│ Body: { "status": "approved" }                                │
│                                                                │
│ FE hiển thị:                                                   │
│ - Form sửa chứng từ đính kèm (optional)                      │
│ - Button "Lưu chứng từ" (nếu có sửa)                         │
│ - Button "Duyệt" / "Từ chối"                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 3: KẾ TOÁN THUẾ                                          │
│ User: 44444/44444                                              │
│ API 1: PUT /api/payment-request/invoices/{id}                 │
│ API 2: PUT /api/payment-request/contracts/{id} (Optional)     │
│ API 3: PUT /api/payment-request/status/{id}                   │
├─────────────────────────────────────────────────────────────────┤
│ API 1 - Tạo hóa đơn:                                          │
│ Body: [                                                        │
│   {                                                            │
│     "code": "HD-001",                                          │
│     "date": "2025-12-16",                                      │
│     "company_id": "9e2ba481-7040-404a-9da0-d612d28303f5",    │
│     "file_id": "e41e24c6-215e-43d5-83bf-94cba481daa2",       │
│     "place": "Công ty VTCODE",                                │
│     "amount": "11660000"                                       │
│   }                                                            │
│ ]                                                              │
│                                                                │
│ API 2 - Tạo hợp đồng (tùy chọn):                             │
│ Body: [giống hóa đơn]                                         │
│                                                                │
│ API 3 - Duyệt:                                                │
│ Body: { "status": "approved" }                                │
│                                                                │
│ FE hiển thị:                                                   │
│ - Form thêm hóa đơn (bắt buộc)                                │
│ - Form thêm hợp đồng (tùy chọn)                               │
│ - Button "Thêm hóa đơn"                                        │
│ - Button "Thêm hợp đồng"                                       │
│ - Button "Duyệt" (disabled nếu chưa có hóa đơn)              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 4: KẾ TOÁN THANH TOÁN                                    │
│ User: 11111/11111                                              │
│ API 1: POST /api/payment-request/{id}/accounting (REQUIRED!)  │
│ API 2: PUT /api/payment-request/status/{id}                   │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️  BẮT BUỘC TẠO HẠCH TOÁN TRƯỚC KHI DUYỆT!                  │
│                                                                │
│ API 1 - Tạo hạch toán:                                        │
│ Body: {                                                        │
│   "jar_category_id": "69f31527-ba0d-499e-838d-f775c3f37690", │
│   "items": [                                                   │
│     {                                                          │
│       "debit_account_id": "4ffd...",                          │
│       "credit_account_id": "ddb5...",                         │
│       "debit_disburser_type": "bank_account",                 │
│       "credit_disburser_type": "bank_account",                │
│       "debit_disburser_id": "74eb...",                        │
│       "credit_disburser_id": "8c36...",                       │
│       "unit_id": "4ccc...",                                    │
│       "quantity": 10,                                          │
│       "price": 50000,                                          │
│       "tax": 10,                                               │
│       "description": "Giấy A4",                                │
│       "expense_code": "BTMAYIN"                                │
│     }                                                          │
│   ]                                                            │
│ }                                                              │
│                                                                │
│ API 2 - Duyệt:                                                │
│ Body: { "status": "approved" }                                │
│                                                                │
│ FE hiển thị:                                                   │
│ - Form tạo hạch toán (bắt buộc)                               │
│   + Select debit_account                                       │
│   + Select credit_account                                      │
│   + Select disburser (theo type)                              │
│   + Input quantity, price, tax                                │
│   + Auto calculate amount                                     │
│   + Select expense_code                                        │
│ - Button "Thêm dòng hạch toán"                                │
│ - Button "Lưu hạch toán"                                       │
│ - Button "Duyệt" (disabled nếu chưa lưu hạch toán)           │
│                                                                │
│ ❌ Nếu duyệt mà chưa tạo hạch toán:                           │
│    Error: "Hạch toán phải được tạo trước khi duyệt ở bước này"│
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 5: TBP KTTT                                               │
│ User: 22222/22222                                              │
│ API 1: PUT /api/payment-request/{id}/accounting (Optional)    │
│ API 2: PUT /api/payment-request/status/{id}                   │
├─────────────────────────────────────────────────────────────────┤
│ Có thể SỬA hạch toán nếu cần:                                 │
│                                                                │
│ API 1 - Sửa hạch toán (nếu cần):                             │
│ Body: {giống Bước 4}                                          │
│                                                                │
│ API 2 - Duyệt:                                                │
│ Body: { "status": "approved" }                                │
│                                                                │
│ FE hiển thị:                                                   │
│ - Xem hạch toán hiện tại (read-only hoặc editable)           │
│ - Button "Sửa hạch toán" (optional)                           │
│ - Button "Duyệt" / "Từ chối"                                  │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ BƯỚC 6: KẾ TOÁN TRƯỞNG (CUỐI CÙNG)                           │
│ User: 33333/33333                                              │
│ API 1: PUT /api/payment-request/{id}/accounting (Optional)    │
│ API 2: PUT /api/payment-request/status/{id}                   │
├─────────────────────────────────────────────────────────────────┤
│ API 1 - Sửa hạch toán (nếu cần):                             │
│ Body: {giống Bước 4}                                          │
│                                                                │
│ API 2 - Duyệt cuối:                                           │
│ Body: {                                                        │
│   "status": "approved",                                        │
│   "disbursement_date": "2025-12-20"  // BẮT BUỘC            │
│ }                                                              │
│                                                                │
│ FE hiển thị:                                                   │
│ - Xem hạch toán (có thể sửa)                                  │
│ - DatePicker chọn ngày chi (required)                         │
│   + Validate: ngày chi >= ngày hiện tại                       │
│ - Button "Duyệt" (disabled nếu chưa chọn ngày chi)           │
│ - Button "Từ chối"                                             │
│                                                                │
│ ✅ Kết quả khi duyệt thành công:                              │
│    - Phiếu chuyển sang trạng thái "Hoàn thành"                │
│    - Tự động tạo lịch chi                                     │
│                                                                │
│ ❌ Lỗi nếu thiếu ngày chi:                                     │
│    "Vui lòng chọn ngày chi trước khi duyệt"                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. Luồng LỌ HÀNG HÓA

Giống **Luồng Lọ Tài sản**, chỉ khác:
- **Bước 2**: Kế toán **Hàng hóa** (0091/0091) duyệt thay vì KT Tài sản
- **jar_id**: `7ce3b31a-ba53-4fd3-a565-3ddbce1bb03b`
- **type_document_id**: `a13deb11-8acf-4076-aea2-ca98b4fad403`
- **jar_category_id**: `8e8c4e1a-6605-4652-b81c-945feab01392`

### 3.3. Luồng LỌ KHÁC

Khác với 2 luồng trên:
- **Bước 2**: KẾ TOÁN THUẾ duyệt luôn (KHÔNG qua KT Tài sản/Hàng hóa)
- Quy trình: `Bước 1 → Bước 2 (KT Thuế) → Bước 3 (KT TT) → Bước 4 (TBP) → Bước 5 (KT Trưởng)`
- **jar_id**: `251af1ac-b48c-4cda-a03c-ac2e91d762dd`
- **type_document_id**: `ce3942da-c1e7-44eb-8755-eef06f66123f`
- **jar_category_id**: `72e8b13a-d21a-4770-b50e-0bb9771df48d`

---

## 4. API Endpoints

### 4.1. Tạo phiếu

**Endpoint**: `POST /api/payment-request`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "date": "2025-12-16",
  "has_advance": false,
  "requester_id": "3d9caa7b-52f0-e711-10da-00155d0a0504",
  "workplace_type": 1,
  "workplace_id": "e92cf911-b543-4638-b996-2c4441ca0480",
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "content": "Thanh toán thiết bị văn phòng",
  "payment_type": "cash",
  "previous_payments": 0,
  "payment_details": [
    {
      "description": "Laptop Dell",
      "unit_id": "c3061db2-a12c-46bb-9cf4-7413d5695e96",
      "quantity": 1,
      "price": 10000000,
      "tax": 10,
      "amount": 11000000
    }
  ],
  "payment_documents": [
    {
      "type_document_id": "7835a8dc-707a-45d0-a006-4cbb9002c568",
      "ref_id": ["11111111-1111-1111-1111-111111111111"],
      "ref_code": ["REF001"]
    }
  ],
  "file_ids": ["e41e24c6-215e-43d5-83bf-94cba481daa2"]
}
```

**Response**:
```json
{
  "status": "success",
  "id": "payment-request-uuid",
  "message": "Tạo phiếu thành công"
}
```

**FE Implementation**:
```javascript
// 1. Gọi API lấy danh sách lọ
GET /api/jar

// 2. Khi user chọn lọ, gọi API lấy type_document_id
GET /api/document-type?jar_id={selected_jar_id}

// 3. Validate tính tiền
function validateAmount(quantity, price, tax) {
  const calculated = quantity * price * (1 + tax / 100);
  return calculated;
}

// 4. Submit form
const payload = {
  date: formData.date,
  jar_id: selectedJar.id,
  payment_details: details.map(d => ({
    ...d,
    amount: validateAmount(d.quantity, d.price, d.tax)
  })),
  payment_documents: [{
    type_document_id: selectedDocType.id, // Từ API document-type
    ref_id: [...],
    ref_code: [...]
  }]
};

POST /api/payment-request body=payload
```

---

### 4.2. Xem chi tiết phiếu

**Endpoint**: `GET /api/payment-request/detail/{id}`

**Response**:
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "code": "PDNTT001",
    "date": "2025-12-16",
    "content": "Thanh toán thiết bị",
    "payment_type": "cash",
    "status": "in_progress",
    "current_step": 2,
    "total_steps": 6,
    "jar": {
      "id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
      "name": "Lọ Tài sản",
      "jar_category_id": "69f31527-ba0d-499e-838d-f775c3f37690"
    },
    "requester": {
      "id": "...",
      "name": "Nguyễn Văn A"
    },
    "workplace": {
      "id": "e92cf911-b543-4638-b996-2c4441ca0480",
      "name": "Phòng Đào Tạo",
      "type": 1
    },
    "payment_details": [
      {
        "id": "detail-uuid",
        "description": "Laptop Dell",
        "unit_id": "...",
        "unit_name": "Cái",
        "quantity": 1,
        "price": 10000000,
        "tax": 10,
        "amount": 11000000
      }
    ],
    "payment_documents": [
      {
        "id": "doc-uuid",
        "type_document_id": "7835a8dc-707a-45d0-a006-4cbb9002c568",
        "type_document_name": "Phiếu đề xuất tài sản",
        "ref_id": ["11...11"],
        "ref_code": ["REF001"]
      }
    ],
    "file_ids": ["e41e24c6-..."],
    "files": [
      {
        "id": "e41e24c6-...",
        "name": "invoice.pdf",
        "url": "/uploads/invoice.pdf"
      }
    ],
    "approval_history": [
      {
        "step": 1,
        "approver": "Nguyễn Văn B",
        "role": "Trưởng bộ phận",
        "status": "approved",
        "approved_at": "2025-12-16T10:00:00Z",
        "reason": null
      }
    ],
    "accounting_entries": null,
    "created_at": "2025-12-16T09:00:00Z",
    "updated_at": "2025-12-16T10:00:00Z"
  }
}
```

**FE Implementation**:
```javascript
// Hiển thị thông tin phiếu
function renderPaymentDetail(data) {
  // 1. Hiển thị thông tin cơ bản
  // 2. Hiển thị payment_details với tổng tiền
  const total = data.payment_details.reduce((sum, d) => sum + d.amount, 0);

  // 3. Hiển thị progress bar duyệt
  const progress = (data.current_step / data.total_steps) * 100;

  // 4. Hiển thị approval_history

  // 5. Hiển thị action buttons tùy theo role và current_step
  if (canApprove(currentUser, data)) {
    showApproveButton();
  }
}
```

---

### 4.3. Duyệt phiếu

**Endpoint**: `PUT /api/payment-request/status/{id}`

**Request Body**:
```json
{
  "status": "approved",
  "reason": null,
  "disbursement_date": "2025-12-20"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | ✅ | `approved` hoặc `rejected` |
| reason | string | ⚠️ | Bắt buộc nếu `status = rejected` |
| disbursement_date | string | ⚠️ | Bắt buộc ở Bước 6 (KT Trưởng), format: YYYY-MM-DD |

**Response**:
```json
{
  "status": "success",
  "message": "Duyệt phiếu thành công"
}
```

**FE Implementation**:
```javascript
async function approvePayment(id, status, reason = null) {
  // Validate
  if (status === 'rejected' && !reason) {
    alert('Vui lòng nhập lý do từ chối');
    return;
  }

  // Bước 6: Validate ngày chi
  if (isStep6 && status === 'approved') {
    if (!disbursementDate) {
      alert('Vui lòng chọn ngày chi');
      return;
    }
    if (new Date(disbursementDate) < new Date()) {
      alert('Ngày chi không được trước ngày hiện tại');
      return;
    }
  }

  const payload = {
    status,
    reason: status === 'rejected' ? reason : null,
    ...(isStep6 && { disbursement_date: disbursementDate })
  };

  await PUT(`/api/payment-request/status/${id}`, payload);
}
```

---

### 4.4. Sửa chứng từ đính kèm

**Endpoint**: `PUT /api/payment-request/documents/{id}`

**Sử dụng**: Bước 2 - KT Tài sản/Hàng hóa sửa chứng từ trước khi duyệt

**Request Body**:
```json
[
  {
    "ids": ["doc-uuid-1", "doc-uuid-2"],
    "type_document_id": "7835a8dc-707a-45d0-a006-4cbb9002c568",
    "ref_id": [
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222"
    ],
    "ref_code": ["REF001", "REF002"]
  }
]
```

**Response**:
```json
{
  "status": "success",
  "message": "Cập nhật chứng từ thành công"
}
```

---

### 4.5. Tạo hóa đơn

**Endpoint**: `PUT /api/payment-request/invoices/{id}`

**Sử dụng**: Bước 3 - KT Thuế tạo hóa đơn

**Request Body**:
```json
[
  {
    "code": "HD-001",
    "date": "2025-12-16",
    "company_id": "9e2ba481-7040-404a-9da0-d612d28303f5",
    "file_id": "e41e24c6-215e-43d5-83bf-94cba481daa2",
    "place": "Công ty VTCODE",
    "amount": "11000000"
  }
]
```

**Response**:
```json
{
  "status": "success",
  "ids": ["invoice-uuid"],
  "message": "Tạo hóa đơn thành công"
}
```

**FE Implementation**:
```javascript
function InvoiceForm() {
  const [invoices, setInvoices] = useState([{
    code: '',
    date: '',
    company_id: '',
    file_id: '',
    place: '',
    amount: ''
  }]);

  const addInvoice = () => {
    setInvoices([...invoices, { /* new invoice */ }]);
  };

  const submit = async () => {
    await PUT(`/api/payment-request/invoices/${paymentId}`, invoices);
  };

  return (
    <>
      {invoices.map((inv, i) => (
        <InvoiceFormRow key={i} data={inv} onChange={...} />
      ))}
      <Button onClick={addInvoice}>+ Thêm hóa đơn</Button>
      <Button onClick={submit}>Lưu</Button>
    </>
  );
}
```

---

### 4.6. Tạo hợp đồng

**Endpoint**: `PUT /api/payment-request/contracts/{id}`

**Sử dụng**: Bước 3 - KT Thuế tạo hợp đồng (tùy chọn)

**Request/Response**: Giống API tạo hóa đơn

---

### 4.7. Tạo hạch toán

**Endpoint**: `POST /api/payment-request/{id}/accounting`

**Sử dụng**: Bước 4 - KT Thanh toán tạo hạch toán (BẮT BUỘC)

**Request Body**:
```json
{
  "jar_category_id": "69f31527-ba0d-499e-838d-f775c3f37690",
  "items": [
    {
      "debit_account_id": "4ffd48e4-2f4f-4a6c-9687-300b7eb9b482",
      "credit_account_id": "ddb52d80-84d9-47bf-aecc-a13578d1741c",
      "debit_disburser_type": "bank_account",
      "credit_disburser_type": "bank_account",
      "debit_disburser_id": "74eb3886-f8eb-4e92-963a-3c6efaf54cf4",
      "credit_disburser_id": "8c367d7a-229e-4a8d-918e-c1975650e160",
      "unit_id": "4ccc730d-3dd2-441a-b6b6-0eff23d9c16b",
      "quantity": 10,
      "price": 50000,
      "tax": 10,
      "description": "Giấy A4",
      "expense_code": "BTMAYIN"
    }
  ]
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Tạo hạch toán thành công"
}
```

**FE Implementation**:
```javascript
function AccountingForm({ paymentDetails, jarCategoryId }) {
  const [items, setItems] = useState([]);

  // Auto fill từ payment_details
  useEffect(() => {
    const autoItems = paymentDetails.map(d => ({
      debit_account_id: '',
      credit_account_id: '',
      debit_disburser_type: 'bank_account',
      credit_disburser_type: 'bank_account',
      debit_disburser_id: '',
      credit_disburser_id: '',
      unit_id: d.unit_id,
      quantity: d.quantity,
      price: d.price,
      tax: d.tax,
      description: d.description,
      expense_code: ''
    }));
    setItems(autoItems);
  }, [paymentDetails]);

  const submit = async () => {
    const payload = {
      jar_category_id: jarCategoryId,
      items
    };
    await POST(`/api/payment-request/${paymentId}/accounting`, payload);
  };

  return (
    <>
      {items.map((item, i) => (
        <AccountingRow key={i} data={item} onChange={...} />
      ))}
      <Button onClick={submit}>Lưu hạch toán</Button>
    </>
  );
}
```

---

### 4.8. Sửa hạch toán

**Endpoint**: `PUT /api/payment-request/{id}/accounting`

**Sử dụng**: Bước 5, 6 - TBP KTTT, KT Trưởng sửa hạch toán (nếu cần)

**Request/Response**: Giống API tạo hạch toán

---

### 4.9. Lấy danh sách phiếu (Phân trang)

**Endpoint**: `GET /api/payment-request`

**Query Parameters**:
```
page=1
limit=10
search=keyword
status=in_progress
from_date=2025-12-01
to_date=2025-12-31
jar_id=a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": "...",
        "code": "PDNTT001",
        "date": "2025-12-16",
        "content": "...",
        "status": "in_progress",
        "current_step": 2,
        "total_amount": 11000000,
        "requester": { "name": "..." },
        "created_at": "..."
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "total_pages": 10
  },
  "more": {
    "total_final_sum": "50000000"
  }
}
```

---

### 4.10. In phiếu PDF

**Endpoint**: `GET /api/payment-request/print/{id}`

**Response**: File PDF

**FE Implementation**:
```javascript
function downloadPDF(id) {
  window.open(`/api/payment-request/print/${id}`, '_blank');
}
```

---

### 4.11. Thêm comment

**Endpoint**: `POST /api/payment-request/{id}/comments`

**Request**:
```json
{
  "content": "Vui lòng bổ sung chứng từ",
  "parent_id": null
}
```

---

### 4.12. APIs phụ trợ

| API | Method | Mô tả |
|-----|--------|-------|
| `/api/jar` | GET | Lấy danh sách lọ ngân sách |
| `/api/units` | GET | Lấy danh sách đơn vị tính |
| `/api/disburser/all` | GET | Lấy danh sách đối tượng chi |
| `/api/document-type?jar_id={id}` | GET | Lấy loại chứng từ theo lọ |
| `/api/files/upload` | POST | Upload file đính kèm |
| `/api/account` | GET | Lấy danh sách tài khoản (cho hạch toán) |
| `/api/expense-code` | GET | Lấy danh sách mã chi phí |

---

## 5. Data Models

### 5.1. PaymentRequest

```typescript
interface PaymentRequest {
  id: string;
  code: string; // Auto generate: PDNTT001
  date: string; // YYYY-MM-DD
  has_advance: boolean;
  requester_id: string;
  workplace_type: 0 | 1; // 0: Cửa hàng, 1: Phòng ban
  workplace_id: string;
  jar_id: string;
  content: string;
  payment_type: 'cash' | 'bank_transfer';
  previous_payments: number;

  // Thông tin đối tượng chi (nếu bank_transfer)
  disburser_id?: string;
  disburser_name?: string;
  disburser_bank_account_number?: string;
  disburser_bank_account_name?: string;
  disburser_bank_name?: string;

  // Tham chiếu tạm ứng (nếu has_advance = true)
  advance_code?: string[];

  // Chi tiết
  payment_details: PaymentDetail[];
  payment_documents: PaymentDocument[];
  file_ids: string[];

  // Trạng thái
  status: 'draft' | 'in_progress' | 'completed' | 'rejected';
  current_step: number;
  total_steps: number;

  // Ngày chi (Bước 6)
  disbursement_date?: string;

  // Hạch toán
  accounting_entries?: AccountingEntry;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string;
}
```

### 5.2. PaymentDetail

```typescript
interface PaymentDetail {
  id?: string;
  payment_id?: string;
  sort_order?: number;
  description: string;
  unit_id: string;
  quantity: number;
  price: number;
  tax: number; // Phần trăm (10 = 10%)
  amount: number; // = quantity * price * (1 + tax/100)
}
```

### 5.3. PaymentDocument

```typescript
interface PaymentDocument {
  type_document_id: string; // Phải lấy từ API document-type theo jar_id
  ref_id: string[]; // UUID references
  ref_code: string[]; // Code references
}
```

### 5.4. AccountingEntry

```typescript
interface AccountingEntry {
  jar_category_id: string;
  items: AccountingItem[];
}

interface AccountingItem {
  debit_account_id: string;
  credit_account_id: string;
  debit_disburser_type: 'employee' | 'bank_account' | 'supplier';
  credit_disburser_type: 'employee' | 'bank_account' | 'supplier';
  debit_disburser_id: string;
  credit_disburser_id: string;
  unit_id: string;
  quantity: number;
  price: number;
  tax: number;
  description: string;
  expense_code: string; // BTMAYIN, BTRIIT, DIEN, etc.
}
```

---

## 6. Business Rules

### 6.1. Tính tiền

```javascript
// Rule 1: amount phải đúng công thức
amount = quantity × price × (1 + tax/100)

// Rule 2: Tổng tiền phiếu
total_amount = sum(payment_details[].amount)

// Rule 3: Validate khi tạo/sửa
if (calculated_amount !== input_amount) {
  throw new Error('Số tiền tính toán không khớp');
}
```

### 6.2. Luồng duyệt

```javascript
// Rule 1: Xác định luồng theo jar_id
function getApprovalWorkflow(jar_id) {
  if (jar_id === 'a9656a3d-...') {
    return 'asset'; // Lọ Tài sản
  } else if (jar_id === '7ce3b31a-...') {
    return 'goods'; // Lọ Hàng hóa
  } else {
    return 'other'; // Lọ Khác
  }
}

// Rule 2: Bước 2 khác nhau theo loại lọ
switch (workflow) {
  case 'asset':
    step2_approver = 'Kế toán Tài sản';
    break;
  case 'goods':
    step2_approver = 'Kế toán Hàng hóa';
    break;
  case 'other':
    step2_approver = 'Kế toán Thuế'; // Skip sang bước 3
    break;
}

// Rule 3: Không thể duyệt trước khi có hạch toán (Bước 4)
if (step === 4 && !accounting_entries) {
  throw new Error('Hạch toán phải được tạo trước khi duyệt ở bước này');
}

// Rule 4: Bước 6 bắt buộc có ngày chi
if (step === 6 && !disbursement_date) {
  throw new Error('Vui lòng chọn ngày chi trước khi duyệt');
}
```

### 6.3. type_document_id theo jar

```javascript
// Rule: Mỗi lọ có danh sách type_document riêng
const typeDocumentByJar = {
  'a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd': [
    { id: '7835a8dc-...', name: 'Phiếu đề xuất tài sản' },
    { id: '508f05bc-...', name: 'Phiếu ghi tăng' },
    // ...
  ],
  '7ce3b31a-ba53-4fd3-a565-3ddbce1bb03b': [
    { id: 'a13deb11-...', name: 'Phiếu đề xuất tài sản' },
    // ...
  ]
};

// Phải validate
if (!isValidTypeDocument(jar_id, type_document_id)) {
  throw new Error('type_document_id không hợp lệ cho lọ này');
}
```

### 6.4. Hạch toán

```javascript
// Rule 1: jar_category_id phải đúng theo jar_id
const jarCategoryMapping = {
  'a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd': '69f31527-ba0d-499e-838d-f775c3f37690', // Tài sản
  '7ce3b31a-ba53-4fd3-a565-3ddbce1bb03b': '8e8c4e1a-6605-4652-b81c-945feab01392', // Hàng hóa
  '251af1ac-b48c-4cda-a03c-ac2e91d762dd': '72e8b13a-d21a-4770-b50e-0bb9771df48d'  // Khác
};

// Rule 2: Items phải khớp với payment_details
accounting.items.forEach((item, i) => {
  const detail = payment_details[i];
  if (
    item.quantity !== detail.quantity ||
    item.price !== detail.price ||
    item.tax !== detail.tax
  ) {
    throw new Error('Hạch toán không khớp với chi tiết thanh toán');
  }
});
```

### 6.5. Quyền hạn

```javascript
// Rule: Mỗi bước chỉ người có quyền mới được duyệt
function canApprove(user, payment, step) {
  const permissions = {
    1: ['truong_bo_phan'],
    2: ['ke_toan_tai_san', 'ke_toan_hang_hoa', 'ke_toan_thue'], // Tùy loại lọ
    3: ['ke_toan_thue'],
    4: ['ke_toan_thanh_toan'],
    5: ['tbp_kttt'],
    6: ['ke_toan_truong']
  };

  return permissions[step].includes(user.role);
}
```

---

## 7. Error Codes

| Code | Message | Nguyên nhân |
|------|---------|-------------|
| 400 | Đang trong quá trình duyệt không thể sửa | Sửa phiếu đang duyệt |
| 400 | Bạn không được phép sửa yêu cầu đã hoàn thành | Sửa phiếu đã hoàn thành |
| 400 | Hạch toán phải được tạo trước khi duyệt ở bước này | Bước 4 duyệt mà chưa tạo hạch toán |
| 400 | Với hình thức chuyển khoản, các trường thông tin người chi và tài khoản ngân hàng là bắt buộc | Thiếu info đối tượng chi |
| 400 | Vui lòng ghi rõ lý do từ chối | Từ chối không có lý do |
| 400 | Vui lòng chọn ngày chi trước khi duyệt | Bước 6 thiếu disbursement_date |
| 400 | Lịch chi không được trước ngày hiện tại | Ngày chi không hợp lệ |
| 400 | Yêu cầu tạm ứng không tồn tại hoặc chưa hoàn thành | Tạm ứng không hợp lệ |
| 400 | Không thể thay đổi nơi làm việc khi trưởng bộ phận hiện tại đã duyệt | Sửa workplace sau BP duyệt |
| 400 | Yêu cầu tạm ứng là bắt buộc khi tạo phiếu thanh toán có tạm ứng | has_advance=true thiếu advance_code |
| 400 | Số tiền tính toán không khớp | amount ≠ quantity × price × (1 + tax/100) |
| 401 | Unauthorized | Token không hợp lệ/hết hạn |
| 403 | Forbidden | Không có quyền thực hiện |
| 404 | Yêu cầu thanh toán không tồn tại | ID không tồn tại |

---

## 8. FE Checklist

### 8.1. Form tạo phiếu

- [ ] Select lọ ngân sách (call `/api/jar`)
- [ ] Khi chọn lọ → call `/api/document-type?jar_id={id}` để lấy type_document_id
- [ ] Input payment_details với auto calculate amount
- [ ] Validate: amount = quantity × price × (1 + tax/100)
- [ ] Upload files (call `/api/files/upload`)
- [ ] Preview trước khi submit

### 8.2. Màn hình chi tiết phiếu

- [ ] Hiển thị thông tin phiếu
- [ ] Hiển thị payment_details với tổng tiền
- [ ] Progress bar hiển thị current_step/total_steps
- [ ] Timeline approval_history
- [ ] Action buttons tùy theo role và step
- [ ] Modal duyệt/từ chối
- [ ] Form comment

### 8.3. Bước 2 - KT Tài sản/Hàng hóa

- [ ] Form sửa payment_documents
- [ ] Button "Lưu chứng từ"
- [ ] Button "Duyệt" / "Từ chối"

### 8.4. Bước 3 - KT Thuế

- [ ] Form thêm hóa đơn (multiple)
- [ ] Form thêm hợp đồng (multiple, optional)
- [ ] Button "Thêm hóa đơn/hợp đồng"
- [ ] Button "Duyệt" (disabled nếu chưa có hóa đơn)

### 8.5. Bước 4 - KT Thanh toán

- [ ] Form tạo hạch toán
  - [ ] Select debit_account, credit_account
  - [ ] Select disburser (theo type)
  - [ ] Auto fill quantity, price, tax từ payment_details
  - [ ] Auto calculate amount
  - [ ] Select expense_code
- [ ] Button "Thêm dòng"
- [ ] Button "Lưu hạch toán"
- [ ] Button "Duyệt" (disabled nếu chưa lưu hạch toán)

### 8.6. Bước 5, 6 - TBP KTTT, KT Trưởng

- [ ] Xem hạch toán (có thể sửa)
- [ ] Button "Sửa hạch toán"
- [ ] (Bước 6) DatePicker chọn ngày chi (required, >= today)
- [ ] Button "Duyệt" (disabled nếu thiếu ngày chi)

### 8.7. Danh sách phiếu

- [ ] Table with pagination
- [ ] Filter: status, date range, jar
- [ ] Search box
- [ ] Action: Xem chi tiết, In PDF
- [ ] Hiển thị total_final_sum

---

**End of Document**

**Created**: 2025-12-16
**Version**: 2.0.0
**Author**: Accounting System Team
