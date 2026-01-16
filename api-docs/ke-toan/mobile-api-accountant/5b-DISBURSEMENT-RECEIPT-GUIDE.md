# Disbursement Receipt API - Phiếu chi

API quản lý phiếu chi (Disbursement Receipt) cho mobile app.

---

## Tổng quan

Phiếu chi (Disbursement Receipt) là phiếu xác nhận chi tiền được tạo tự động sau khi Lịch chi được duyệt xong (bước 3).

**Trên Mobile**:
- ✅ Xem danh sách và chi tiết
- ✅ Duyệt phiếu chi (3 bước - Ngân quỹ, GĐ TC, Tổng GĐ)
- ✅ Cập nhật hoàn thành (Ngân quỹ)
- ❌ Không tạo thủ công (Tự động từ hệ thống)

**Kết quả**: Sau khi hoàn thành, tiền đã được chi cho đối tượng chi

---

## Workflow duyệt phiếu chi (3 bước + hoàn thành)

```
Bước 0: Tự động tạo
   Từ Lịch chi được duyệt xong (bước 3)
   ↓
Bước 1: Ngân quỹ (797979)
   → Duyệt phiếu chi
   ↓
Bước 2: Giám đốc Tài chính (55555)
   → Duyệt phiếu chi
   ↓
Bước 3: Tổng Giám đốc (0018)
   → Duyệt phiếu chi cuối cùng
   ↓
Hoàn thành: Ngân quỹ (797979)
   → Cập nhật đã chi tiền thành công
   ✅ ĐÃ CHI TIỀN!
```

---

## API Endpoints

### 1. Get Disbursement Receipt List

**Lưu ý**: Phiếu chi được lấy qua endpoint Payment Voucher với query `disbursement_receipt`

**Endpoint**: `GET /api/payment-voucher/:payment_voucher_id/disbursement-receipt`

Hoặc lấy từ chi tiết Payment Voucher (field `disbursement_receipt`)

**Example**: Xem chi tiết lịch chi để lấy thông tin phiếu chi

```http
GET /api/payment-voucher/pv-uuid-1
x-auth: YOUR_TOKEN
```

**Response** sẽ có field `disbursement_receipt`:
```json
{
  "id": "pv-uuid-1",
  "code": "LC-15012025-001",
  "status": "approved",
  "disbursement_receipt": {
    "id": "dr-uuid-1",
    "code": "PC-15012025-001",
    "status": "pending",
    "current_step": 1,
    "amount": "48400000.00",
    "approvals": [...]
  }
}
```

### 2. Get Disbursement Receipt Detail

**Endpoint**: `GET /api/disbursement-receipt/:id`

**Response**: `DisbursementReceiptDetail`

**Example Request**:
```http
GET /api/disbursement-receipt/dr-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "dr-uuid-1",
  "code": "PC-15012025-001",
  "payment_voucher": {
    "id": "pv-uuid-1",
    "code": "LC-15012025-001",
    "payment_date": "2025-01-20",
    "source_account": "Tài khoản Vietcombank - STK: 0123456789"
  },
  "payment_request": {
    "id": "pr-uuid-1",
    "code": "DNTT-LO.TS01-15012025",
    "requester_name": "Nguyen Van A",
    "workplace_name": "Phòng IT"
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
  "status": "pending",
  "current_step": 1,
  "approvals": [
    {
      "step": 1,
      "role": "treasury",
      "approver_id": "user-uuid-treasury",
      "approver_name": "Bộ phận Ngân quỹ",
      "status": "pending",
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
  "completed_at": null,
  "completed_note": null,
  "created_at": "2025-01-18T14:30:00Z",
  "updated_at": "2025-01-18T14:30:00Z"
}
```

### 3. Approve Disbursement Receipt

**Endpoint**: `POST /api/disbursement-receipt/:id/approve`

**Request Body**: `ApproveRequest`

**Example - Approve (Bước 1 - Ngân quỹ)**:
```http
POST /api/disbursement-receipt/dr-uuid-1/approve
x-auth: YOUR_TOKEN_OF_797979
Content-Type: application/json

{
  "action": "approve",
  "note": "Đã kiểm tra và xác nhận phiếu chi"
}
```

**Response - Success (Bước 1)**:
```json
{
  "success": true,
  "message": "Duyệt phiếu chi thành công",
  "data": {
    "id": "dr-uuid-1",
    "current_step": 2,
    "status": "pending"
  }
}
```

**Example - Approve (Bước 2 - GĐ Tài chính)**:
```http
POST /api/disbursement-receipt/dr-uuid-1/approve
x-auth: YOUR_TOKEN_OF_55555
Content-Type: application/json

{
  "action": "approve",
  "note": "Đã xem xét và phê duyệt"
}
```

**Example - Approve (Bước 3 - Tổng GĐ)**:
```http
POST /api/disbursement-receipt/dr-uuid-1/approve
x-auth: YOUR_TOKEN_OF_0018
Content-Type: application/json

{
  "action": "approve",
  "note": "Đồng ý chi tiền"
}
```

**Response - Success (Bước 3 - Duyệt cuối)**:
```json
{
  "success": true,
  "message": "Duyệt phiếu chi thành công. Có thể cập nhật hoàn thành",
  "data": {
    "id": "dr-uuid-1",
    "current_step": 3,
    "status": "approved"
  }
}
```

**Example - Reject**:
```json
{
  "action": "reject",
  "note": "Cần kiểm tra lại thông tin đối tượng chi"
}
```

### 4. Complete Disbursement Receipt

**Endpoint**: `POST /api/disbursement-receipt/:id/complete`

**Request Body**:
```typescript
{
  note?: string;  // Ghi chú hoàn thành (optional)
}
```

**Điều kiện**:
- Phiếu chi status = 'approved' (đã duyệt xong cả 3 bước)
- User hiện tại là Ngân quỹ (797979)

**Example Request**:
```http
POST /api/disbursement-receipt/dr-uuid-1/complete
x-auth: YOUR_TOKEN_OF_797979
Content-Type: application/json

{
  "note": "Đã chuyển khoản thành công vào TK Vietcombank lúc 14:30"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Đã cập nhật hoàn thành chi tiền",
  "data": {
    "id": "dr-uuid-1",
    "status": "completed",
    "completed_at": "2025-01-20T14:30:00Z",
    "completed_note": "Đã chuyển khoản thành công vào TK Vietcombank lúc 14:30"
  }
}
```

---

## Đặc điểm của workflow

| Bước | Vai trò | User | Mobile | Hành động | Kết quả |
|------|---------|------|--------|-----------|---------|
| 1 | Ngân quỹ | 797979 | ✅ | Duyệt phiếu chi | Chuyển bước 2 |
| 2 | GĐ Tài chính | 55555 | ✅ | Duyệt phiếu chi | Chuyển bước 3 |
| 3 | Tổng GĐ | 0018 | ✅ | Duyệt phiếu chi | Status = approved |
| Hoàn thành | Ngân quỹ | 797979 | ✅ | Cập nhật hoàn thành | Status = completed |

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC28 | GET /disbursement-receipt/:id | Any | Chi tiết phiếu chi | 200 + full detail |
| TC29 | POST /disbursement-receipt/:id/approve | 797979 | Ngân quỹ duyệt | 200 Success |
| TC30 | POST /disbursement-receipt/:id/approve | 55555 | GĐ TC duyệt | 200 Success |
| TC31 | POST /disbursement-receipt/:id/approve | 0018 | Tổng GĐ duyệt | 200 + Approved |
| TC32 | POST /disbursement-receipt/:id/complete | 797979 | Hoàn thành | 200 Completed |
| TC33 | POST /disbursement-receipt/:id/complete | 55555 | Hoàn thành (sai quyền) | 403 Forbidden |
| TC34 | POST /disbursement-receipt/:id/approve (reject) | 797979 | Từ chối | 200 Rejected |

---

## Mobile Implementation Notes

### 1. Lấy phiếu chi từ lịch chi

Có 2 cách lấy thông tin phiếu chi:

**Cách 1**: Từ detail Payment Voucher
```typescript
const paymentVoucher = await getPaymentVoucherDetail(paymentVoucherId);

if (paymentVoucher.disbursement_receipt) {
  const disbursementReceiptId = paymentVoucher.disbursement_receipt.id;
  // Navigate hoặc load detail
}
```

**Cách 2**: Direct access nếu có ID
```typescript
const disbursementReceipt = await getDisbursementReceiptDetail(receiptId);
```

### 2. Hiển thị chi tiết phiếu chi

**Sections cần hiển thị**:

1. **Header**:
   - Mã phiếu chi (code)
   - Trạng thái (status badge)
   - Bước hiện tại (current_step/3)

2. **Thông tin lịch chi**:
   - Mã lịch chi (payment_voucher.code) - clickable
   - Ngày chi (payment_voucher.payment_date)
   - Tài khoản nguồn (payment_voucher.source_account)

3. **Thông tin phiếu đề nghị**:
   - Mã phiếu đề nghị (payment_request.code) - clickable
   - Người đề nghị (payment_request.requester_name)
   - Nơi làm việc (payment_request.workplace_name)

4. **Đối tượng chi**:
   - Tên (disburser.name)
   - Tài khoản: bank_account_number - bank_name
   - Số điện thoại (phone)
   - Địa chỉ (address)

5. **Thông tin chi tiền**:
   - Số tiền: amount (format currency, highlight)

6. **Lịch sử duyệt**:
   - Timeline với 3 bước
   - Hiển thị approver_name, status, approved_at, note

7. **Hoàn thành** (nếu đã complete):
   - Thời gian hoàn thành (completed_at)
   - Ghi chú hoàn thành (completed_note)

8. **Actions**:
   - Nếu status = 'pending' + user có quyền duyệt: Nút Duyệt/Từ chối
   - Nếu status = 'approved' + user là Ngân quỹ: Nút Hoàn thành

### 3. Complete action

Chỉ hiển thị nút "Hoàn thành" khi:
- Phiếu chi status = 'approved'
- Tất cả 3 bước đã duyệt xong
- User hiện tại là Ngân quỹ (797979)

```typescript
const canComplete =
  disbursementReceipt.status === 'approved' &&
  disbursementReceipt.approvals.every(a => a.status === 'approved') &&
  currentUser.code === '797979';

if (canComplete) {
  // Hiển thị nút "Hoàn thành"
}
```

### 4. Complete form

Form nhập ghi chú khi hoàn thành:

```typescript
const [completeNote, setCompleteNote] = useState('');

const handleComplete = async () => {
  const confirmed = await showConfirmDialog({
    title: 'Xác nhận hoàn thành',
    message: 'Xác nhận đã chi tiền cho đối tượng chi?',
    confirmText: 'Hoàn thành',
    cancelText: 'Hủy'
  });

  if (confirmed) {
    await completeDisbursementReceipt(receiptId, {
      note: completeNote || undefined
    });

    showSuccess('Đã cập nhật hoàn thành chi tiền');
    navigate('/disbursement-receipts');
  }
};
```

**Form layout**:
```typescript
<Form>
  <TextArea
    label="Ghi chú hoàn thành"
    placeholder="Ví dụ: Đã chuyển khoản thành công vào TK Vietcombank lúc 14:30"
    value={completeNote}
    onChange={setCompleteNote}
    rows={3}
  />
  <Button
    type="primary"
    onClick={handleComplete}
  >
    Hoàn thành
  </Button>
</Form>
```

### 5. Status badges

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'orange';
    case 'approved': return 'blue';
    case 'completed': return 'green';
    case 'rejected': return 'red';
    default: return 'gray';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ duyệt';
    case 'approved': return 'Đã duyệt - Chờ hoàn thành';
    case 'completed': return 'Đã hoàn thành';
    case 'rejected': return 'Từ chối';
    default: return status;
  }
};
```

### 6. Timeline component

Hiển thị timeline duyệt:

```typescript
<Timeline>
  {approvals.map((approval, index) => (
    <TimelineItem
      key={approval.step}
      status={approval.status}
      title={`Bước ${approval.step}: ${approval.approver_name || approval.role}`}
      time={approval.approved_at}
      note={approval.note}
    />
  ))}

  {status === 'completed' && (
    <TimelineItem
      status="completed"
      title="Hoàn thành chi tiền"
      time={completed_at}
      note={completed_note}
    />
  )}
</Timeline>
```

---

## Lưu ý quan trọng

### 1. Tự động tạo phiếu chi

- Phiếu chi được tạo TỰ ĐỘNG khi Tổng GĐ duyệt lịch chi (bước 3)
- Mobile KHÔNG có chức năng tạo phiếu chi thủ công
- Một lịch chi chỉ tạo MỘT phiếu chi

### 2. Khác biệt giữa Approved và Completed

| Status | Ý nghĩa | Bước tiếp theo |
|--------|---------|----------------|
| `approved` | Đã duyệt xong 3 bước | Chờ Ngân quỹ hoàn thành |
| `completed` | Đã chi tiền thành công | Kết thúc |

**Quan trọng**: Chỉ có status `completed` mới xác nhận tiền đã được chi!

### 3. Quyền hoàn thành

Chỉ **Ngân quỹ** (797979) mới có quyền cập nhật hoàn thành:
- Không phải GĐ Tài chính
- Không phải Tổng GĐ
- API sẽ trả về 403 Forbidden nếu user khác cố gắng complete

### 4. Quyền duyệt

| Bước | Vai trò | Username | Quyền trên Mobile |
|------|---------|----------|-------------------|
| 1 | Ngân quỹ | 797979 | ✅ Duyệt |
| 2 | GĐ Tài chính | 55555 | ✅ Duyệt |
| 3 | Tổng GĐ | 0018 | ✅ Duyệt |
| Hoàn thành | Ngân quỹ | 797979 | ✅ Complete |

### 5. Trạng thái phiếu chi

| Status | Ý nghĩa | Current Step |
|--------|---------|--------------|
| `pending` | Đang chờ duyệt | 1-3 |
| `approved` | Đã duyệt xong, chờ hoàn thành | 3 |
| `completed` | Đã chi tiền thành công | - |
| `rejected` | Bị từ chối | Bất kỳ |

### 6. Validation

- Không cho phép complete nếu status != 'approved'
- Không cho phép approve/reject nếu đã completed
- Ghi chú hoàn thành (optional) nhưng khuyến khích nhập

---

## Xem thêm

- [5a-PAYMENT-VOUCHER-GUIDE.md](./5a-PAYMENT-VOUCHER-GUIDE.md) - Hướng dẫn Lịch chi
- [3-PAYMENT-REQUEST-GUIDE.md](./3-PAYMENT-REQUEST-GUIDE.md) - Phiếu đề nghị thanh toán
- [4-ADVANCE-REQUEST-GUIDE.md](./4-ADVANCE-REQUEST-GUIDE.md) - Phiếu đề nghị tạm ứng
- [COMMON-INTERFACES.md](./COMMON-INTERFACES.md) - Interface chi tiết
- [TEST-ACCOUNTS.md](./TEST-ACCOUNTS.md) - Tài khoản test
- [OVERVIEW.md](./OVERVIEW.md) - Tổng quan hệ thống
