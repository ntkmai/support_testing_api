# Revenue Receipt API - Phiếu thu

API quản lý phiếu thu (Revenue Receipt / Collection Receipt) cho mobile app.

---

## Tổng quan

Phiếu thu (Revenue Receipt) dùng để ghi nhận các khoản thu vào doanh nghiệp (thu tiền bán hàng, thu nợ, thu khác...).

**Trên Mobile**:
- ✅ Xem danh sách và chi tiết
- ✅ Duyệt phiếu thu (workflow tùy cấu hình)
- ❌ Tạo/Sửa phiếu (Web only)

**QUAN TRỌNG**: Endpoint đã thay đổi
- **Endpoint cũ**: ~~`/api/revenue-receipt`~~ (deprecated)
- **Endpoint mới**: `/api/payment-voucher?type=collect`

---

## Endpoint migration

Mobile team **BẮT BUỘC** cập nhật endpoint:

```diff
- GET /api/revenue-receipt
+ GET /api/payment-voucher?type=collect

- GET /api/revenue-receipt/:id
+ GET /api/payment-voucher/:id (với type=collect)

- POST /api/revenue-receipt/:id/approve
+ POST /api/payment-voucher/:id/approve (với type=collect)
```

---

## API Endpoints

### 1. Get Revenue Receipt List

**Endpoint**: `GET /api/payment-voucher`

**Query Parameters**:
```typescript
{
  page?: number;          // Mặc định: 1
  limit?: number;         // Mặc định: 20
  type: 'collect';        // collect = Phiếu thu (BẮT BUỘC)
  status?: string;        // Filter theo trạng thái
  from_date?: string;     // YYYY-MM-DD
  to_date?: string;       // YYYY-MM-DD
}
```

**Response**: `PaginatedResponse<RevenueReceiptListItem>`

**Example Request**:
```http
GET /api/payment-voucher?page=1&limit=20&type=collect
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "rr-uuid-1",
      "code": "PT-15012025-001",
      "type": "collect",
      "payer_name": "Công ty TNHH ABC",
      "amount": "100000000.00",
      "collection_date": "2025-01-15",
      "collection_type": "sales",
      "status": "pending",
      "current_step": 1,
      "current_approver": "Kế toán",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": "rr-uuid-2",
      "code": "PT-16012025-002",
      "type": "collect",
      "payer_name": "Nguyen Van A",
      "amount": "50000000.00",
      "collection_date": "2025-01-16",
      "collection_type": "debt",
      "status": "approved",
      "current_step": 3,
      "current_approver": null,
      "created_at": "2025-01-16T09:00:00Z",
      "updated_at": "2025-01-16T14:30:00Z"
    }
  ],
  "total": 35,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

### 2. Get Revenue Receipt Detail

**Endpoint**: `GET /api/payment-voucher/:id`

**Lưu ý**: Phải đảm bảo ID là của phiếu thu (type=collect)

**Response**: `RevenueReceiptDetail`

**Example Request**:
```http
GET /api/payment-voucher/rr-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "rr-uuid-1",
  "code": "PT-15012025-001",
  "type": "collect",
  "payer": {
    "id": "payer-uuid-1",
    "name": "Công ty TNHH ABC",
    "tax_code": "0123456789",
    "address": "123 Street, Hanoi",
    "phone": "0901234567"
  },
  "amount": "100000000.00",
  "collection_date": "2025-01-15",
  "collection_type": "sales",
  "payment_method": "bank_transfer",
  "bank_account": "Tài khoản Vietcombank - STK: 0123456789",
  "description": "Thu tiền bán hàng tháng 12/2024",
  "invoice_number": "HD-202412-001",
  "status": "pending",
  "current_step": 1,
  "approvals": [
    {
      "step": 1,
      "role": "accountant",
      "approver_id": "user-uuid-1",
      "approver_name": "Nguyen Thi Accountant",
      "status": "pending",
      "approved_at": null,
      "note": null
    },
    {
      "step": 2,
      "role": "chief_accountant",
      "approver_id": null,
      "approver_name": "Kế toán trưởng",
      "status": "waiting",
      "approved_at": null,
      "note": null
    },
    {
      "step": 3,
      "role": "financial_director",
      "approver_id": null,
      "approver_name": "Giám đốc Tài chính",
      "status": "waiting",
      "approved_at": null,
      "note": null
    }
  ],
  "attachments": [
    {
      "id": "att-uuid-1",
      "name": "Hóa đơn bán hàng.pdf",
      "url": "/uploads/invoices/hd-202412-001.pdf",
      "type": "invoice"
    }
  ],
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### 3. Approve Revenue Receipt

**Endpoint**: `POST /api/payment-voucher/:id/approve`

**Request Body**: `ApproveRequest`

**Example - Approve**:
```http
POST /api/payment-voucher/rr-uuid-1/approve
x-auth: YOUR_TOKEN
Content-Type: application/json

{
  "action": "approve",
  "note": "Đã kiểm tra hóa đơn và xác nhận thu tiền"
}
```

**Response - Success**:
```json
{
  "success": true,
  "message": "Duyệt phiếu thu thành công",
  "data": {
    "id": "rr-uuid-1",
    "current_step": 2,
    "status": "pending"
  }
}
```

**Example - Reject**:
```json
{
  "action": "reject",
  "note": "Thông tin hóa đơn chưa chính xác, vui lòng kiểm tra lại"
}
```

---

## Loại phiếu thu

| Collection Type | Mô tả | Ví dụ |
|----------------|-------|-------|
| `sales` | Thu tiền bán hàng | Thu tiền từ khách hàng |
| `debt` | Thu nợ | Thu công nợ phải thu |
| `advance` | Thu hoàn trả tạm ứng | Nhân viên hoàn trả tiền tạm ứng |
| `other` | Thu khác | Thu lãi ngân hàng, thu khác |

---

## Phương thức thu

| Payment Method | Mô tả |
|---------------|-------|
| `cash` | Tiền mặt |
| `bank_transfer` | Chuyển khoản |
| `check` | Séc |
| `card` | Thẻ |

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC35 | GET /payment-voucher?type=collect | Any | Danh sách phiếu thu | 200 + list |
| TC36 | GET /payment-voucher/:id | Any | Chi tiết phiếu thu | 200 + full detail |
| TC37 | POST /payment-voucher/:id/approve | Kế toán | Duyệt bước 1 | 200 Success |
| TC38 | POST /payment-voucher/:id/approve | KT trưởng | Duyệt bước 2 | 200 Success |
| TC39 | POST /payment-voucher/:id/approve | GĐ TC | Duyệt bước 3 | 200 + Approved |
| TC40 | POST /payment-voucher/:id/approve (reject) | Kế toán | Từ chối | 200 Rejected |

---

## Mobile Implementation Notes

### 1. Lấy danh sách phiếu thu

**QUAN TRỌNG**: Phải thêm `type=collect` để chỉ lấy phiếu thu

```javascript
// ĐÚNG - Endpoint mới
GET /api/payment-voucher?type=collect

// SAI - Endpoint cũ (deprecated)
GET /api/revenue-receipt
```

### 2. Phân biệt với lịch chi

Sử dụng query parameter `type`:

```typescript
// Lịch chi
const disbursements = await getPaymentVouchers({ type: 'disbursement' });

// Phiếu thu
const collections = await getPaymentVouchers({ type: 'collect' });
```

### 3. Hiển thị chi tiết phiếu thu

**Sections cần hiển thị**:

1. **Header**:
   - Mã phiếu thu (code)
   - Trạng thái (status badge)
   - Loại thu (collection_type)

2. **Người nộp tiền**:
   - Tên (payer.name)
   - Mã số thuế (payer.tax_code)
   - Số điện thoại (payer.phone)
   - Địa chỉ (payer.address)

3. **Thông tin thu tiền**:
   - Số tiền (amount) - format currency, highlight
   - Ngày thu (collection_date)
   - Phương thức (payment_method)
   - Tài khoản (bank_account) - nếu chuyển khoản

4. **Thông tin bổ sung**:
   - Số hóa đơn (invoice_number) - nếu có
   - Diễn giải (description)

5. **File đính kèm**:
   - Danh sách attachments (hóa đơn, chứng từ)
   - Có thể xem/download

6. **Lịch sử duyệt**:
   - Timeline với các bước duyệt
   - Hiển thị approver_name, status, approved_at, note

7. **Actions**:
   - Nếu status = 'pending' + user có quyền: Nút Duyệt/Từ chối

### 4. Badge cho loại thu

```typescript
const getCollectionTypeColor = (type: string) => {
  switch (type) {
    case 'sales': return 'green';
    case 'debt': return 'blue';
    case 'advance': return 'orange';
    case 'other': return 'gray';
    default: return 'gray';
  }
};

const getCollectionTypeText = (type: string) => {
  switch (type) {
    case 'sales': return 'Bán hàng';
    case 'debt': return 'Thu nợ';
    case 'advance': return 'Hoàn trả TU';
    case 'other': return 'Thu khác';
    default: return type;
  }
};
```

### 5. Badge cho phương thức thu

```typescript
const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'cash': return '💵';
    case 'bank_transfer': return '🏦';
    case 'check': return '📝';
    case 'card': return '💳';
    default: return '💰';
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method) {
    case 'cash': return 'Tiền mặt';
    case 'bank_transfer': return 'Chuyển khoản';
    case 'check': return 'Séc';
    case 'card': return 'Thẻ';
    default: return method;
  }
};
```

### 6. Hiển thị file đính kèm

```typescript
<AttachmentsList>
  {attachments.map(attachment => (
    <AttachmentItem
      key={attachment.id}
      name={attachment.name}
      type={attachment.type}
      onPress={() => viewAttachment(attachment.url)}
      onDownload={() => downloadAttachment(attachment.url, attachment.name)}
    />
  ))}
</AttachmentsList>
```

### 7. Filter theo loại thu

```typescript
const COLLECTION_TYPE_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Bán hàng', value: 'sales' },
  { label: 'Thu nợ', value: 'debt' },
  { label: 'Hoàn trả TU', value: 'advance' },
  { label: 'Thu khác', value: 'other' }
];

const [collectionType, setCollectionType] = useState('');

// Fetch with filter
useEffect(() => {
  fetchRevenueReceipts({
    type: 'collect',
    collection_type: collectionType || undefined
  });
}, [collectionType]);
```

---

## Lưu ý quan trọng

### 1. Migration endpoint

**BẮT BUỘC** cập nhật endpoint trong mobile app:
- Endpoint cũ `/api/revenue-receipt` sẽ bị deprecated
- Sử dụng endpoint mới `/api/payment-voucher?type=collect`
- Đảm bảo backward compatibility trong transition period

### 2. Workflow duyệt

Workflow duyệt phiếu thu có thể khác nhau tùy cấu hình:
- Thường có 2-3 bước
- Mobile có thể duyệt tất cả các bước (không có Web only)
- Check field `approvals` để biết số bước và người duyệt

### 3. Khác biệt với lịch chi/phiếu chi

| Feature | Phiếu thu | Lịch chi/Phiếu chi |
|---------|-----------|-------------------|
| Type | `collect` | `disbursement` |
| Mục đích | Thu tiền vào | Chi tiền ra |
| Workflow | 2-3 bước (tùy cấu hình) | 3 bước + hoàn thành |
| Tạo tự động | Không | Có (từ phiếu đề nghị) |

### 4. Validation

Mobile nên validate:
- amount > 0
- collection_date không được là ngày tương lai
- Phương thức thu: nếu bank_transfer thì bank_account là bắt buộc

```typescript
// Validation example
const validateRevenueReceipt = (data) => {
  const errors = {};

  if (!data.amount || parseFloat(data.amount) <= 0) {
    errors.amount = 'Số tiền phải lớn hơn 0';
  }

  if (new Date(data.collection_date) > new Date()) {
    errors.collection_date = 'Ngày thu không được là ngày tương lai';
  }

  if (data.payment_method === 'bank_transfer' && !data.bank_account) {
    errors.bank_account = 'Tài khoản ngân hàng là bắt buộc khi chuyển khoản';
  }

  return Object.keys(errors).length > 0 ? errors : null;
};
```

### 5. Quyền duyệt

Quyền duyệt phiếu thu tùy thuộc vào cấu hình hệ thống. Thường:
- Bước 1: Kế toán
- Bước 2: Kế toán trưởng
- Bước 3: Giám đốc Tài chính (nếu số tiền lớn)

Check field `approvals` để xác định người duyệt cho từng bước.

### 6. Trạng thái phiếu thu

| Status | Ý nghĩa |
|--------|---------|
| `pending` | Đang chờ duyệt |
| `approved` | Đã duyệt xong |
| `rejected` | Bị từ chối |

---

## Xem thêm

- [5a-PAYMENT-VOUCHER-GUIDE.md](./5a-PAYMENT-VOUCHER-GUIDE.md) - Hướng dẫn Lịch chi
- [5b-DISBURSEMENT-RECEIPT-GUIDE.md](./5b-DISBURSEMENT-RECEIPT-GUIDE.md) - Hướng dẫn Phiếu chi
- [COMMON-INTERFACES.md](./COMMON-INTERFACES.md) - Interface chi tiết
- [TEST-ACCOUNTS.md](./TEST-ACCOUNTS.md) - Tài khoản test
- [OVERVIEW.md](./OVERVIEW.md) - Tổng quan hệ thống
