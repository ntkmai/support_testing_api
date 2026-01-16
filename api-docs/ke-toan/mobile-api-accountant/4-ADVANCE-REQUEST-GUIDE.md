# Advance Request API - Phiếu đề nghị tạm ứng

API quản lý phiếu đề nghị tạm ứng cho mobile app.

---

## Tổng quan

Phiếu đề nghị tạm ứng (Advance Request) dùng để đề nghị tạm ứng tiền cho nhân viên thực hiện công việc (công tác, mua hàng, v.v.). Sau đó nhân viên sẽ quyết toán và hoàn trả nếu còn thừa.

**Trên Mobile**:
- ✅ Xem danh sách và chi tiết
- ✅ Duyệt/Từ chối (Bước 1, 5-6)
- ❌ Không tạo/sửa phiếu (Web only)

**Khác biệt với Payment Request**:
- Không có tax trong advance_details
- Không có invoices, contracts ban đầu (thêm sau khi quyết toán)
- Workflow đơn giản hơn

---

## Workflow duyệt (6 bước)

```
Bước 0: Tạo phiếu (55555)           → Web only
    ↓
Bước 1: Trưởng bộ phận (55555)      → Mobile: ✅ Có thể duyệt
    ↓
Bước 2: KT Tài sản (0025)           → Mobile: ❌ Web only
   hoặc KT Hàng hóa (0091)
   hoặc KT Thuế (44444)
    ↓
Bước 3: KT Thuế (44444)             → Mobile: ❌ Web only
    ↓
Bước 4: KT Thanh toán (11111)       → Mobile: ❌ Web only
    ↓
Bước 5: TBP KTTT (22222)            → Mobile: ⚠️ Có cảnh báo
    ↓
Bước 6: Kế toán trưởng (33333)      → Mobile: ⚠️ Có cảnh báo
    ↓
Hoàn thành → Tạo Lịch chi tự động
```

---

## API Endpoints

### 1. Get Advance Request List

**Endpoint**: `GET /api/advance-request`

**Query Parameters**:
```typescript
{
  page?: number;          // Mặc định: 1
  limit?: number;         // Mặc định: 20
  status?: string;        // Filter theo trạng thái
  from_date?: string;     // YYYY-MM-DD
  to_date?: string;       // YYYY-MM-DD
}
```

**Response**: `PaginatedResponse<AdvanceRequestListItem>`

**Example Request**:
```http
GET /api/advance-request?page=1&limit=20
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "ar-uuid-1",
      "code": "DNTU-LO.HD02-15012025",
      "jar_name": "Lọ Hàng hóa",
      "jar_category_name": "Hàng hóa tiêu hao",
      "requester_name": "Nguyen Thi B",
      "workplace_name": "Phòng Kinh doanh",
      "payment_amount": "5000000.00",
      "payment_type": "cash",
      "status": "pending",
      "current_step": 1,
      "current_approver": "Trưởng bộ phận",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 2. Get Pending Advance Requests (My Turn)

**Endpoint**: `GET /api/advance-request?only_my_turn=true`

**Description**: Lấy danh sách phiếu tạm ứng chờ duyệt của user hiện tại

**Query Parameters**:
```typescript
{
  only_my_turn: true;
  page?: number;
  limit?: number;
}
```

**Example Request**:
```http
GET /api/advance-request?only_my_turn=true&page=1&limit=20
x-auth: YOUR_TOKEN_OF_55555
```

**Response**: Chỉ trả về những phiếu mà user hiện tại có quyền duyệt

### 3. Get Advance Request Detail

**Endpoint**: `GET /api/advance-request/:id`

**Response**: `AdvanceRequestDetail`

**Example Request**:
```http
GET /api/advance-request/ar-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "ar-uuid-1",
  "code": "DNTU-LO.HD02-15012025",
  "jar": {
    "id": "jar-uuid-2",
    "name": "Lọ Hàng hóa"
  },
  "jar_category": {
    "id": "jc-uuid-2",
    "code": "HD02",
    "name": "Hàng hóa tiêu hao"
  },
  "requester": {
    "id": "user-uuid-2",
    "name": "Nguyen Thi B",
    "code": "0018"
  },
  "workplace": {
    "id": "dept-uuid-2",
    "name": "Phòng Kinh doanh",
    "type": "department"
  },
  "disburser": {
    "id": "dis-uuid-2",
    "name": "Nguyen Thi B",
    "bank_account_name": "NGUYEN THI B",
    "bank_account_number": "987654321",
    "bank_name": "Vietcombank",
    "phone": "0912345678"
  },
  "payment_type": "cash",
  "advance_details": [
    {
      "id": "ad-uuid-1",
      "content": "Khách sạn",
      "unit_name": "Đêm",
      "quantity": 3,
      "price": "1000000.00",
      "total_amount": "3000000.00"
    },
    {
      "id": "ad-uuid-2",
      "content": "Ăn uống",
      "unit_name": "Ngày",
      "quantity": 4,
      "price": "500000.00",
      "total_amount": "2000000.00"
    }
  ],
  "advance_documents": [
    {
      "id": "doc-uuid-1",
      "name": "Giấy đề nghị tạm ứng",
      "request_module": "advance_request",
      "checked": true
    }
  ],
  "invoices": [],
  "contracts": [],
  "payment_amount": "5000000.00",
  "status": "pending",
  "current_step": 1,
  "approvals": [
    {
      "step": 1,
      "role": "department_manager",
      "approver_id": "user-uuid-3",
      "approver_name": "Mai Thanh Thuận",
      "status": "pending",
      "approved_at": null,
      "note": null,
      "can_approve_on_mobile": true
    },
    {
      "step": 2,
      "role": "goods_accountant",
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
      "reason": "Phải kiểm tra thuế trên Web"
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

### 4. Approve/Reject Advance Request

**Endpoint**: `POST /api/advance-request/:id/approve`

**Request Body**: `ApproveRequest`

**Example - Approve (Bước 1)**:
```http
POST /api/advance-request/ar-uuid-1/approve
x-auth: YOUR_TOKEN_OF_55555
Content-Type: application/json

{
  "action": "approve",
  "note": "Tạm ứng hợp lý, đồng ý"
}
```

**Example - Reject**:
```json
{
  "action": "reject",
  "note": "Số tiền tạm ứng quá cao, vui lòng điều chỉnh"
}
```

**Response - Success (Bước 1)**:
```json
{
  "success": true,
  "message": "Duyệt phiếu tạm ứng thành công",
  "data": {
    "id": "ar-uuid-1",
    "current_step": 2,
    "status": "pending"
  }
}
```

**Response - Success với Warning (Bước 5-6)**:
```json
{
  "success": true,
  "message": "Duyệt phiếu tạm ứng thành công",
  "warning": "Bạn đang duyệt trên mobile. Không thể sửa hạch toán. Vui lòng kiểm tra kỹ trước khi duyệt.",
  "data": {
    "id": "ar-uuid-1",
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

## Khác biệt với Payment Request

| Feature | Payment Request | Advance Request |
|---------|-----------------|-----------------|
| Mục đích | Chi tiền cho tài sản, hàng hóa, dịch vụ | Tạm ứng tiền cho nhân viên |
| Chi tiết | payment_details (có tax) | advance_details (KHÔNG có tax) |
| Hóa đơn | Có từ đầu | Thêm sau khi quyết toán |
| Hợp đồng | Có từ đầu | Thêm sau khi quyết toán |
| Workflow | 6 bước | 6 bước (tương tự) |
| Người nhận | Bên ngoài (nhà cung cấp) | Thường là nhân viên nội bộ |

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC15 | GET /advance-request | Any | Danh sách | 200 + list |
| TC16 | GET /advance-request?only_my_turn=true | 55555 | DS chờ duyệt | 200 + my pending |
| TC17 | GET /advance-request/:id | Any | Chi tiết | 200 + full detail |
| TC18 | POST /advance-request/:id/approve | 55555 | Duyệt bước 1 | 200 Success |
| TC19 | POST /advance-request/:id/approve | 55555 | Từ chối | 200 Rejected |
| TC20 | POST /advance-request/:id/approve | 0025 | Duyệt bước 2 | 403 Web only |
| TC21 | POST /advance-request/:id/approve | 22222 | Duyệt bước 5 | 200 + Warning |
| TC22 | POST /advance-request/:id/approve | 33333 | Duyệt bước 6 | 200 + Warning |

---

## Mobile Implementation Notes

### 1. Hiển thị advance_details

Khác với payment_details, advance_details KHÔNG có tax:

```typescript
// Payment Details (có tax)
interface PaymentDetail {
  content: string;
  quantity: number;
  price: string;
  tax: string;              // ← Có tax
  total_before_tax: string; // ← Có
  total_after_tax: string;  // ← Có
}

// Advance Details (KHÔNG có tax)
interface AdvanceDetail {
  content: string;
  quantity: number;
  price: string;
  total_amount: string;     // ← Chỉ có tổng tiền
}
```

**UI Display**:
```
Khách sạn
  Số lượng: 3 Đêm
  Đơn giá: 1,000,000 đ
  Thành tiền: 3,000,000 đ

Ăn uống
  Số lượng: 4 Ngày
  Đơn giá: 500,000 đ
  Thành tiền: 2,000,000 đ

TỔNG CỘNG: 5,000,000 đ
```

### 2. Không hiển thị invoices/contracts ban đầu

Ban đầu phiếu tạm ứng không có invoices và contracts:
- Chỉ hiển thị nếu array không rỗng
- Sau khi quyết toán mới có dữ liệu

```typescript
// Conditional rendering
{invoices.length > 0 && (
  <Section title="Hóa đơn">
    {invoices.map(invoice => (
      <InvoiceItem key={invoice.id} invoice={invoice} />
    ))}
  </Section>
)}

{contracts.length > 0 && (
  <Section title="Hợp đồng">
    {contracts.map(contract => (
      <ContractItem key={contract.id} contract={contract} />
    ))}
  </Section>
)}
```

### 3. Popup cảnh báo (Bước 5-6)

Tương tự Payment Request, check response có field `warning`:

```typescript
const response = await approveAdvanceRequest(id, { action: 'approve' });

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
3. Chi tiết tạm ứng (bảng advance_details - KHÔNG có tax)
4. Tổng tiền tạm ứng (payment_amount)
5. Chứng từ đính kèm (advance_documents)
6. Hóa đơn/Hợp đồng (nếu có - sau quyết toán)
7. Lịch sử duyệt (approvals timeline)

### 5. Phân biệt với Payment Request

Có thể thêm badge hoặc icon để phân biệt:
- Payment Request: "Thanh toán"
- Advance Request: "Tạm ứng"

```typescript
const getBadgeColor = (type: 'payment' | 'advance') => {
  return type === 'payment' ? 'blue' : 'orange';
};

<Badge color={getBadgeColor('advance')}>Tạm ứng</Badge>
```

---

## Lưu ý quan trọng

### 1. Tính năng quyết toán (Web only)

Sau khi chi tiền tạm ứng, nhân viên phải quyết toán trên Web:
- Bổ sung hóa đơn/hợp đồng thực tế
- Hoàn trả nếu thừa tiền
- Mobile chỉ xem, không thể quyết toán

### 2. Workflow giống Payment Request

Mặc dù đơn giản hơn về dữ liệu, workflow duyệt vẫn có 6 bước như Payment Request:
- Bước 1: Mobile ✅
- Bước 2-4: Web only ❌
- Bước 5-6: Mobile ⚠️ (có cảnh báo)

### 3. Payment type

Tạm ứng thường là:
- `cash` - Tiền mặt (phổ biến)
- `bank_transfer` - Chuyển khoản

### 4. Validation

Mobile nên validate:
- payment_amount > 0
- advance_details không rỗng
- Mỗi item trong advance_details có quantity > 0 và price > 0

---

## Xem thêm

- [Common Interfaces](./COMMON-INTERFACES.md) - Interface chi tiết
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test
- [Overview](./OVERVIEW.md) - Tổng quan hệ thống
- [Payment Request Guide](./3-PAYMENT-REQUEST-GUIDE.md) - So sánh với phiếu thanh toán
