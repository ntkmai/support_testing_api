# Payment Request API - Phiếu đề nghị thanh toán

API quản lý phiếu đề nghị thanh toán cho mobile app.

---

## Tổng quan

Phiếu đề nghị thanh toán (Payment Request) dùng để đề nghị chi tiền cho các khoản chi phí như mua tài sản, hàng hóa, dịch vụ.

**Trên Mobile**:
- ✅ Xem danh sách và chi tiết
- ✅ Duyệt/Từ chối (Bước 1, 5-6)
- ❌ Không tạo/sửa phiếu (Web only)

---

## Workflow duyệt (6 bước)

```
Bước 0: Tạo phiếu (55555)           → Web only
    ↓
Bước 1: Trưởng bộ phận (55555)      → Mobile: ✅ Có thể duyệt
    ↓
Bước 2: KT Tài sản (0025)           → Mobile: ❌ Web only (chỉnh sửa chứng từ)
   hoặc KT Hàng hóa (0091)
   hoặc KT Thuế (44444)
    ↓
Bước 3: KT Thuế (44444)             → Mobile: ❌ Web only (thêm hóa đơn)
    ↓
Bước 4: KT Thanh toán (11111)       → Mobile: ❌ Web only (tạo hạch toán)
    ↓
Bước 5: TBP KTTT (22222)            → Mobile: ⚠️ Có cảnh báo
    ↓
Bước 6: Kế toán trưởng (33333)      → Mobile: ⚠️ Có cảnh báo
    ↓
Hoàn thành → Tạo Lịch chi tự động
```

---

## API Endpoints

### 1. Get Payment Request List

**Endpoint**: `GET /api/payment-request`

**Query Parameters**:
```typescript
{
  page?: number;          // Mặc định: 1
  limit?: number;         // Mặc định: 20
  exclude_advance?: boolean; // true = Loại bỏ phiếu tạm ứng
  status?: string;        // Filter theo trạng thái
  from_date?: string;     // YYYY-MM-DD
  to_date?: string;       // YYYY-MM-DD
}
```

**Response**: `PaginatedResponse<PaymentRequestListItem>`

**Example Request**:
```http
GET /api/payment-request?page=1&limit=20&exclude_advance=true
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "pr-uuid-1",
      "code": "DNTT-LO.TS01-15012025",
      "jar_name": "Lọ Tài sản",
      "jar_category_name": "Tài sản cố định",
      "requester_name": "Nguyen Van A",
      "workplace_name": "Phòng IT",
      "total_amount": "48400000.00",
      "payment_type": "bank_transfer",
      "status": "pending",
      "current_step": 1,
      "current_approver": "Trưởng bộ phận",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

### 2. Get Pending Payment Requests (My Turn)

**Endpoint**: `GET /api/payment-request?only_my_turn=true`

**Description**: Lấy danh sách phiếu chờ duyệt của user hiện tại

**Query Parameters**:
```typescript
{
  only_my_turn: true;
  exclude_advance?: boolean;
  page?: number;
  limit?: number;
}
```

**Example Request**:
```http
GET /api/payment-request?only_my_turn=true&exclude_advance=true&page=1&limit=20
x-auth: YOUR_TOKEN_OF_55555
```

**Response**: Chỉ trả về những phiếu mà user hiện tại có quyền duyệt

### 3. Get Payment Request Detail

**Endpoint**: `GET /api/payment-request/:id`

**Response**: `PaymentRequestDetail`

**Example Request**:
```http
GET /api/payment-request/pr-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "pr-uuid-1",
  "code": "DNTT-LO.TS01-15012025",
  "jar": {
    "id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
    "name": "Lọ Tài sản"
  },
  "jar_category": {
    "id": "jc-uuid-1",
    "code": "TS01",
    "name": "Tài sản cố định"
  },
  "requester": {
    "id": "user-uuid-1",
    "name": "Nguyen Van A",
    "code": "55555"
  },
  "workplace": {
    "id": "dept-uuid-1",
    "name": "Phòng IT",
    "type": "department"
  },
  "disburser": {
    "id": "dis-uuid-1",
    "name": "Nguyen Van A",
    "bank_account_name": "NGUYEN VAN A",
    "bank_account_number": "123456789",
    "bank_name": "Vietcombank",
    "tax_code": "0123456789",
    "address": "123 Street",
    "phone": "0901234567"
  },
  "payment_type": "bank_transfer",
  "payment_details": [
    {
      "id": "pd-uuid-1",
      "content": "Mua laptop Dell Inspiron 15",
      "unit_name": "Cái",
      "quantity": 2,
      "price": "22000000.00",
      "tax": "10",
      "total_before_tax": "44000000.00",
      "total_after_tax": "48400000.00"
    }
  ],
  "payment_documents": [
    {
      "id": "doc-uuid-1",
      "name": "Hợp đồng mua bán",
      "request_module": "payment_request",
      "checked": true
    }
  ],
  "invoices": [],
  "contracts": [],
  "total_payment": "48400000.00",
  "advance_amount": "0.00",
  "previous_payments": "0.00",
  "total_final": "48400000.00",
  "status": "pending",
  "current_step": 1,
  "approvals": [
    {
      "step": 1,
      "role": "department_manager",
      "approver_id": "user-uuid-2",
      "approver_name": "Mai Thanh Thuận",
      "status": "pending",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": true
    },
    {
      "step": 2,
      "role": "asset_accountant",
      "approver_id": null,
      "approver_name": null,
      "status": "waiting",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": false,
      "reason": "Phải chỉnh sửa chứng từ đính kèm trên Web"
    },
    {
      "step": 3,
      "role": "tax_accountant",
      "approver_id": null,
      "approver_name": null,
      "status": "waiting",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": false,
      "reason": "Phải thêm hóa đơn/hợp đồng trên Web"
    },
    {
      "step": 4,
      "role": "payment_accountant",
      "approver_id": null,
      "approver_name": null,
      "status": "waiting",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": false,
      "reason": "Phải tạo hạch toán trên Web"
    },
    {
      "step": 5,
      "role": "payment_manager",
      "approver_id": null,
      "approver_name": null,
      "status": "waiting",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": true
    },
    {
      "step": 6,
      "role": "chief_accountant",
      "approver_id": null,
      "approver_name": null,
      "status": "waiting",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": true
    }
  ],
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### 4. Approve/Reject Payment Request

**Endpoint**: `POST /api/payment-request/:id/approve`

**Request Body**: `ApproveRequest`

**Example - Approve (Bước 1)**:
```http
POST /api/payment-request/pr-uuid-1/approve
x-auth: YOUR_TOKEN_OF_55555
Content-Type: application/json

{
  "action": "approve",
  "note": "Đã kiểm tra và phê duyệt"
}
```

**Example - Reject**:
```json
{
  "action": "reject",
  "note": "Nội dung chi chưa rõ ràng, vui lòng bổ sung thêm"
}
```

**Response - Success (Bước 1)**:
```json
{
  "success": true,
  "message": "Duyệt phiếu thành công",
  "data": {
    "id": "pr-uuid-1",
    "current_step": 2,
    "status": "pending"
  }
}
```

**Response - Success với Warning (Bước 5-6)**:
```json
{
  "success": true,
  "message": "Duyệt phiếu thành công",
  "warning": "Bạn đang duyệt trên mobile. Không thể sửa hạch toán. Vui lòng kiểm tra kỹ trước khi duyệt.",
  "data": {
    "id": "pr-uuid-1",
    "current_step": 6,
    "status": "pending"
  }
}
```

**Response - Error (Web only)**:
```json
{
  "success": false,
  "error": "Bước này chỉ có thể duyệt trên Web",
  "code": "WEB_ONLY_STEP",
  "details": {
    "step": 2,
    "reason": "Phải chỉnh sửa chứng từ đính kèm trên Web"
  }
}
```

---

## Đặc điểm của từng loại lọ

| Loại lọ | Jar ID | Bước 2 | Người duyệt | Mobile |
|---------|--------|--------|-------------|--------|
| Lọ Tài sản | `a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd` | KT Tài sản | 0025/0001 | ❌ |
| Lọ Hàng hóa | Khác | KT Hàng hóa | 0091/0091 | ❌ |
| Lọ khác | Khác | KT Thuế | 44444/44444 | ❌ |

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC14 | GET /payment-request?exclude_advance=true | Any | Danh sách | 200 + list |
| TC15 | GET /payment-request?only_my_turn=true | 55555 | DS chờ duyệt | 200 + my pending |
| TC16 | GET /payment-request/:id | Any | Chi tiết | 200 + full detail |
| TC17 | POST /payment-request/:id/approve | 55555 | Duyệt bước 1 | 200 Success |
| TC18 | POST /payment-request/:id/approve | 55555 | Từ chối | 200 Rejected |
| TC19 | POST /payment-request/:id/approve | 0025 | Duyệt bước 2 | 403 Web only |
| TC20 | POST /payment-request/:id/approve | 22222 | Duyệt bước 5 | 200 + Warning |
| TC21 | POST /payment-request/:id/approve | 33333 | Duyệt bước 6 | 200 + Warning |

---

## Mobile Implementation Notes

### 1. Phân biệt phiếu thanh toán và tạm ứng

**QUAN TRỌNG**: Phải thêm `exclude_advance=true` để chỉ lấy phiếu thanh toán

```javascript
// ĐÚNG - Chỉ lấy phiếu thanh toán
GET /api/payment-request?exclude_advance=true

// SAI - Lấy cả phiếu tạm ứng
GET /api/payment-request
```

### 2. Hiển thị trạng thái duyệt

Sử dụng field `can_approve_on_mobile` trong mảng `approvals` để:
- Hiển thị icon "Web only" cho các bước không duyệt được
- Disable nút "Duyệt" cho các bước Web only
- Hiển thị `reason` khi user hỏi tại sao không duyệt được

```typescript
// Pseudo code
approvals.forEach(approval => {
  if (!approval.can_approve_on_mobile) {
    // Hiển thị badge "Web only"
    // Disable button
    // Tooltip: approval.reason
  }
});
```

### 3. Popup cảnh báo (Bước 5-6)

Khi duyệt bước 5-6, check response có field `warning`:

```typescript
const response = await approvePaymentRequest(id, { action: 'approve' });

if (response.warning) {
  showWarningPopup({
    title: "⚠️ BẠN ĐANG DUYỆT TRÊN MOBILE",
    message: response.warning,
    buttons: ['Hủy', 'Tiếp tục duyệt']
  });
}
```

### 4. Hiển thị chi tiết phiếu

**Sections cần hiển thị**:
1. Thông tin cơ bản (code, lọ, người đề nghị, nơi làm việc)
2. Đối tượng chi (tên, tài khoản, ngân hàng)
3. Chi tiết thanh toán (bảng payment_details)
4. Tổng tiền (total_payment, advance_amount, total_final)
5. Chứng từ đính kèm (payment_documents)
6. Hóa đơn/Hợp đồng (nếu có)
7. Lịch sử duyệt (approvals timeline)

---

## Xem thêm

- [Common Interfaces](./COMMON-INTERFACES.md) - Interface chi tiết
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test
- [Overview](./OVERVIEW.md) - Tổng quan hệ thống
