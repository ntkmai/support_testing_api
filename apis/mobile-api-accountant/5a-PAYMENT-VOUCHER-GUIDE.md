# Payment Voucher API - Lịch chi

API quản lý lịch chi (Payment Voucher - Disbursement Scheduling) cho mobile app.

---

## Tổng quan

Lịch chi (Payment Voucher) là kế hoạch chi tiền được tạo tự động sau khi phiếu đề nghị thanh toán/tạm ứng hoàn thành bước duyệt cuối cùng (bước 6).

**Trên Mobile**:
- ✅ Xem danh sách và chi tiết
- ✅ Chọn ngày chi và tài khoản nguồn (Ngân quỹ - Bước 1)
- ✅ Duyệt lịch chi (GĐ TC - Bước 2, Tổng GĐ - Bước 3)
- ❌ Không tạo thủ công (Tự động từ hệ thống)

**Kết quả**: Sau khi lịch chi được duyệt xong, hệ thống tự động tạo Phiếu chi (Disbursement Receipt)

---

## Workflow duyệt lịch chi (3 bước)

```
Bước 0: Tự động tạo
   Từ Phiếu thanh toán/tạm ứng hoàn thành bước 6
   ↓
Bước 1: Ngân quỹ (797979)
   → Chọn ngày chi + Tài khoản nguồn
   ↓
Bước 2: Giám đốc Tài chính (55555)
   → Duyệt lịch chi
   ↓
Bước 3: Tổng Giám đốc (0018)
   → Duyệt lịch chi
   → Hệ thống TỰ ĐỘNG tạo Phiếu chi
   ✅ HOÀN TẤT LỊCH CHI!
```

---

## API Endpoints

### 1. Get Payment Voucher List

**Endpoint**: `GET /api/payment-voucher`

**Query Parameters**:
```typescript
{
  page?: number;          // Mặc định: 1
  limit?: number;         // Mặc định: 20
  type: 'disbursement';   // disbursement = Lịch chi
  status?: string;        // Filter theo trạng thái
  from_date?: string;     // YYYY-MM-DD
  to_date?: string;       // YYYY-MM-DD
}
```

**Response**: `PaginatedResponse<PaymentVoucherListItem>`

**Example Request**:
```http
GET /api/payment-voucher?page=1&limit=20&type=disbursement
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "pv-uuid-1",
      "code": "LC-15012025-001",
      "type": "disbursement",
      "payment_request_id": "pr-uuid-1",
      "payment_request_code": "DNTT-LO.TS01-15012025",
      "disburser_name": "Nguyen Van A",
      "amount": "48400000.00",
      "payment_date": null,
      "source_account": null,
      "status": "pending",
      "current_step": 1,
      "current_approver": "Ngân quỹ",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": "pv-uuid-2",
      "code": "LC-16012025-002",
      "type": "disbursement",
      "payment_request_id": "ar-uuid-1",
      "payment_request_code": "DNTU-LO.HD02-16012025",
      "disburser_name": "Nguyen Thi B",
      "amount": "5000000.00",
      "payment_date": "2025-01-20",
      "source_account": "Quỹ tiền mặt",
      "status": "approved",
      "current_step": 3,
      "current_approver": null,
      "created_at": "2025-01-16T09:00:00Z",
      "updated_at": "2025-01-18T14:30:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

### 2. Get Payment Voucher Detail

**Endpoint**: `GET /api/payment-voucher/:id`

**Response**: `PaymentVoucherDetail`

**Example Request**:
```http
GET /api/payment-voucher/pv-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "pv-uuid-1",
  "code": "LC-15012025-001",
  "type": "disbursement",
  "payment_request": {
    "id": "pr-uuid-1",
    "code": "DNTT-LO.TS01-15012025",
    "requester_name": "Nguyen Van A",
    "workplace_name": "Phòng IT",
    "total_amount": "48400000.00"
  },
  "disburser": {
    "id": "dis-uuid-1",
    "name": "Nguyen Van A",
    "bank_account_name": "NGUYEN VAN A",
    "bank_account_number": "123456789",
    "bank_name": "Vietcombank",
    "tax_code": "0123456789",
    "address": "123 Street, Hanoi",
    "phone": "0901234567"
  },
  "amount": "48400000.00",
  "payment_date": null,
  "source_account": null,
  "status": "pending",
  "current_step": 1,
  "approvals": [
    {
      "step": 1,
      "role": "treasury",
      "approver_id": "user-uuid-treasury",
      "approver_name": "Bộ phận Ngân quỹ",
      "status": "pending",
      "action": "select_date_and_account",
      "approved_at": null,
      "note": null
    },
    {
      "step": 2,
      "role": "financial_director",
      "approver_id": null,
      "approver_name": "Giám đốc Tài chính",
      "status": "waiting",
      "approved_at": null,
      "note": null
    },
    {
      "step": 3,
      "role": "ceo",
      "approver_id": null,
      "approver_name": "Tổng Giám đốc",
      "status": "waiting",
      "approved_at": null,
      "note": null
    }
  ],
  "disbursement_receipt": null,
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### 3. Select Payment Info (Ngân quỹ - Bước 1)

**Endpoint**: `POST /api/payment-voucher/:id/select-payment-info`

**Request Body**: `SelectPaymentInfoRequest`
```typescript
{
  payment_date: string;     // YYYY-MM-DD (bắt buộc)
  source_account: string;   // Tên tài khoản nguồn (bắt buộc)
}
```

**Example Request**:
```http
POST /api/payment-voucher/pv-uuid-1/select-payment-info
x-auth: YOUR_TOKEN_OF_797979
Content-Type: application/json

{
  "payment_date": "2025-01-20",
  "source_account": "Tài khoản Vietcombank - STK: 0123456789"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Đã chọn ngày chi và tài khoản nguồn",
  "data": {
    "id": "pv-uuid-1",
    "current_step": 2,
    "status": "pending",
    "payment_date": "2025-01-20",
    "source_account": "Tài khoản Vietcombank - STK: 0123456789"
  }
}
```

### 4. Approve Payment Voucher (Bước 2, 3)

**Endpoint**: `POST /api/payment-voucher/:id/approve`

**Request Body**: `ApproveRequest`

**Example - Approve (Bước 2 - GĐ Tài chính)**:
```http
POST /api/payment-voucher/pv-uuid-1/approve
x-auth: YOUR_TOKEN_OF_55555
Content-Type: application/json

{
  "action": "approve",
  "note": "Đã xem xét và phê duyệt lịch chi"
}
```

**Response - Success (Bước 2)**:
```json
{
  "success": true,
  "message": "Duyệt lịch chi thành công",
  "data": {
    "id": "pv-uuid-1",
    "current_step": 3,
    "status": "pending"
  }
}
```

**Example - Approve (Bước 3 - Tổng GĐ)**:
```http
POST /api/payment-voucher/pv-uuid-1/approve
x-auth: YOUR_TOKEN_OF_0018
Content-Type: application/json

{
  "action": "approve",
  "note": "Đồng ý chi tiền"
}
```

**Response - Success (Bước 3 - Tạo phiếu chi)**:
```json
{
  "success": true,
  "message": "Duyệt lịch chi thành công. Phiếu chi đã được tạo tự động",
  "data": {
    "id": "pv-uuid-1",
    "current_step": 3,
    "status": "approved",
    "disbursement_receipt": {
      "id": "dr-uuid-1",
      "code": "PC-15012025-001",
      "status": "pending",
      "current_step": 1
    }
  }
}
```

**Example - Reject**:
```json
{
  "action": "reject",
  "note": "Thời điểm chi chưa phù hợp, vui lòng xem lại"
}
```

---

## Đặc điểm của workflow

| Bước | Vai trò | User | Mobile | Hành động | Kết quả |
|------|---------|------|--------|-----------|---------|
| 1 | Ngân quỹ | 797979 | ✅ | Chọn ngày + TK nguồn | Chuyển bước 2 |
| 2 | GĐ Tài chính | 55555 | ✅ | Duyệt lịch chi | Chuyển bước 3 |
| 3 | Tổng GĐ | 0018 | ✅ | Duyệt lịch chi | Tạo Phiếu chi tự động |

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC22 | GET /payment-voucher?type=disbursement | Any | Danh sách lịch chi | 200 + list |
| TC23 | GET /payment-voucher/:id | Any | Chi tiết lịch chi | 200 + full detail |
| TC24 | POST /payment-voucher/:id/select-payment-info | 797979 | Chọn ngày + TK | 200 Success |
| TC25 | POST /payment-voucher/:id/approve | 55555 | GĐ TC duyệt | 200 Success |
| TC26 | POST /payment-voucher/:id/approve | 0018 | Tổng GĐ duyệt | 200 + Tạo phiếu chi |
| TC27 | POST /payment-voucher/:id/approve (reject) | 55555 | Từ chối | 200 Rejected |

---

## Mobile Implementation Notes

### 1. Lấy danh sách lịch chi

**QUAN TRỌNG**: Phải thêm `type=disbursement` để chỉ lấy lịch chi

```javascript
// ĐÚNG - Chỉ lấy lịch chi
GET /api/payment-voucher?type=disbursement

// SAI - Sẽ báo lỗi thiếu type
GET /api/payment-voucher
```

### 2. Action đặc biệt cho bước 1

Bước 1 của lịch chi KHÔNG phải là approve, mà là select payment info:

```typescript
// SAI - Bước 1 không dùng approve
POST /api/payment-voucher/:id/approve

// ĐÚNG - Bước 1 dùng select-payment-info
POST /api/payment-voucher/:id/select-payment-info
{
  "payment_date": "2025-01-20",
  "source_account": "Tài khoản Vietcombank - STK: 0123456789"
}
```

### 3. Form chọn ngày và tài khoản

**UI cho bước 1 (Ngân quỹ)**:
```typescript
// Form state
const [paymentDate, setPaymentDate] = useState<Date>(new Date());
const [sourceAccount, setSourceAccount] = useState<string>('');

// Source account options
const ACCOUNT_OPTIONS = [
  'Tài khoản Vietcombank - STK: 0123456789',
  'Tài khoản Techcombank - STK: 9876543210',
  'Quỹ tiền mặt'
];

// Submit handler
const handleSelectPaymentInfo = async () => {
  await selectPaymentInfo(paymentVoucherId, {
    payment_date: formatDate(paymentDate, 'YYYY-MM-DD'),
    source_account: sourceAccount
  });
};
```

### 4. Hiển thị chi tiết lịch chi

**Sections cần hiển thị**:
1. **Header**:
   - Mã lịch chi (code)
   - Trạng thái (status badge)
   - Bước hiện tại (current_step/3)

2. **Thông tin phiếu đề nghị**:
   - Mã phiếu đề nghị (payment_request_code) - clickable
   - Người đề nghị (requester_name)
   - Nơi làm việc (workplace_name)

3. **Đối tượng chi**:
   - Tên (disburser.name)
   - Tài khoản: bank_account_number - bank_name
   - Số điện thoại (phone)

4. **Thông tin chi tiền**:
   - Số tiền: amount (format currency)
   - Ngày chi: payment_date (nếu đã chọn)
   - Tài khoản nguồn: source_account (nếu đã chọn)

5. **Lịch sử duyệt**:
   - Timeline với 3 bước
   - Hiển thị approver_name, status, approved_at, note

6. **Actions**:
   - Nếu bước 1 + user là Ngân quỹ: Hiển thị form chọn ngày + TK
   - Nếu bước 2-3 + user có quyền: Hiển thị nút Duyệt/Từ chối

### 5. Kiểm tra đã tạo phiếu chi

Sau khi duyệt bước 3, check field `disbursement_receipt`:

```typescript
const response = await approvePaymentVoucher(id, { action: 'approve' });

if (response.data.disbursement_receipt) {
  // Đã tạo phiếu chi thành công
  showSuccess('Lịch chi đã được duyệt. Phiếu chi đã được tạo tự động');

  // Navigate đến phiếu chi mới
  navigate(`/disbursement-receipt/${response.data.disbursement_receipt.id}`);
}
```

### 6. Status badges

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'approved': return 'green';
    case 'rejected': return 'red';
    default: return 'gray';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ duyệt';
    case 'approved': return 'Đã duyệt';
    case 'rejected': return 'Từ chối';
    default: return status;
  }
};
```

---

## Lưu ý quan trọng

### 1. Tự động tạo lịch chi

- Lịch chi được tạo TỰ ĐỘNG khi phiếu đề nghị thanh toán/tạm ứng hoàn thành bước 6
- Mobile KHÔNG có chức năng tạo lịch chi thủ công
- Một phiếu đề nghị chỉ tạo MỘT lịch chi

### 2. Tự động tạo phiếu chi

- Phiếu chi được tạo TỰ ĐỘNG khi Tổng GĐ duyệt lịch chi (bước 3)
- Response của bước 3 sẽ trả về thông tin phiếu chi mới tạo trong field `disbursement_receipt`
- Phiếu chi sẽ có workflow riêng (xem [5b-DISBURSEMENT-RECEIPT-GUIDE.md](./5b-DISBURSEMENT-RECEIPT-GUIDE.md))

### 3. Validation ngày chi

- `payment_date` không được là ngày quá khứ (so với ngày hiện tại)
- Nên có calendar picker với min date = today

```typescript
const minDate = new Date();
minDate.setHours(0, 0, 0, 0);

// DatePicker props
<DatePicker
  minDate={minDate}
  value={paymentDate}
  onChange={setPaymentDate}
/>
```

### 4. Quyền duyệt

| Bước | Vai trò | Username | Quyền trên Mobile |
|------|---------|----------|-------------------|
| 1 | Ngân quỹ | 797979 | ✅ Chọn ngày + TK |
| 2 | GĐ Tài chính | 55555 | ✅ Duyệt |
| 3 | Tổng GĐ | 0018 | ✅ Duyệt |

### 5. Trạng thái lịch chi

| Status | Ý nghĩa | Bước |
|--------|---------|------|
| `pending` | Đang chờ duyệt | 1-3 |
| `approved` | Đã duyệt xong | 3 (hoàn thành) |
| `rejected` | Bị từ chối | Bất kỳ |

---

## Xem thêm

- [5b-DISBURSEMENT-RECEIPT-GUIDE.md](./5b-DISBURSEMENT-RECEIPT-GUIDE.md) - Hướng dẫn Phiếu chi
- [3-PAYMENT-REQUEST-GUIDE.md](./3-PAYMENT-REQUEST-GUIDE.md) - Phiếu đề nghị thanh toán
- [4-ADVANCE-REQUEST-GUIDE.md](./4-ADVANCE-REQUEST-GUIDE.md) - Phiếu đề nghị tạm ứng
- [COMMON-INTERFACES.md](./COMMON-INTERFACES.md) - Interface chi tiết
- [TEST-ACCOUNTS.md](./TEST-ACCOUNTS.md) - Tài khoản test
- [OVERVIEW.md](./OVERVIEW.md) - Tổng quan hệ thống
