# Jar Ratio API - Tỷ lệ lọ

API quản lý tỷ lệ lọ và báo cáo trích lọ cho mobile app.

---

## Tổng quan

Tỷ lệ lọ (Jar Ratio) là tỷ lệ phần trăm được phân bổ cho mỗi lọ (jar) theo tháng. Hệ thống sử dụng tỷ lệ này để tính toán phân bổ chi phí vào các lọ khác nhau.

**Trên Mobile**:
- ✅ Xem danh sách theo tháng/năm
- ✅ Xem chi tiết
- ✅ Duyệt/Từ chối (Bước 1 - Trưởng bộ phận)
- ✅ Xem báo cáo trích lọ
- ❌ Không tạo/sửa/xóa tỷ lệ lọ (Web only)

---

## Workflow duyệt (3 bước)

```
Bước 0: Tạo tỷ lệ lọ               → Web only
    ↓
Bước 1: Trưởng bộ phận (55555)      → Mobile: ✅ Có thể duyệt
    ↓
Bước 2: KT Tài sản/Hàng hóa         → Mobile: ❌ Web only
    ↓
Bước 3: KT Thuế (44444)             → Mobile: ❌ Web only
    ↓
Hoàn thành → Áp dụng tỷ lệ cho tháng
```

---

## API Endpoints

### 1. Get Jar Ratio List by Month

**Endpoint**: `GET /api/jar-ratio`

**Query Parameters**:
```typescript
{
  year: number;         // Năm (bắt buộc)
  month: number;        // Tháng 1-12 (bắt buộc)
  page?: number;        // Mặc định: 1
  limit?: number;       // Mặc định: 20
}
```

**Response**: `PaginatedResponse<JarRatioListItem>`

**Example Request**:
```http
GET /api/jar-ratio?year=2025&month=1&page=1&limit=20
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "jr-uuid-1",
      "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
      "jar_name": "Lọ Tài sản",
      "month": 1,
      "year": 2025,
      "ratio": 15.5,
      "status": "pending",
      "step": 1,
      "current_approver": "Trưởng bộ phận",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": "jr-uuid-2",
      "jar_id": "jar-uuid-2",
      "jar_name": "Lọ Hàng hóa",
      "month": 1,
      "year": 2025,
      "ratio": 12.3,
      "status": "approved",
      "step": 3,
      "current_approver": null,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-16T14:30:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### 2. Get Jar Ratio Detail

**Endpoint**: `GET /api/jar-ratio/:id`

**Response**: `JarRatioDetail`

**Example Request**:
```http
GET /api/jar-ratio/jr-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "jr-uuid-1",
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "jar_name": "Lọ Tài sản",
  "month": 1,
  "year": 2025,
  "ratio": 15.5,
  "status": "pending",
  "step": 1,
  "approvals": [
    {
      "step": 1,
      "role": "department_manager",
      "approver_id": "user-uuid-1",
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
      "reason": "Phải kiểm tra và chỉnh sửa trên Web"
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
      "reason": "Phải xác nhận cuối cùng trên Web"
    }
  ],
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### 3. Approve/Reject Jar Ratio

**Endpoint**: `POST /api/jar-ratio/:id/approve`

**Request Body**: `ApproveRequest`

**Example - Approve (Bước 1)**:
```http
POST /api/jar-ratio/jr-uuid-1/approve
x-auth: YOUR_TOKEN_OF_55555
Content-Type: application/json

{
  "action": "approve",
  "note": "Đã kiểm tra và đồng ý"
}
```

**Example - Reject**:
```json
{
  "action": "reject",
  "note": "Tỷ lệ không phù hợp, vui lòng xem lại"
}
```

**Response - Success (Bước 1)**:
```json
{
  "success": true,
  "message": "Duyệt tỷ lệ lọ thành công",
  "data": {
    "id": "jr-uuid-1",
    "current_step": 2,
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
    "reason": "Phải kiểm tra và chỉnh sửa trên Web"
  }
}
```

### 4. Get Jar Ratio Report

**Endpoint**: `GET /api/jar-ratio/report`

**Query Parameters**:
```typescript
{
  year: number;   // Năm (bắt buộc)
  month: number;  // Tháng 1-12 (bắt buộc)
}
```

**Response**: `JarRatioReport`

**Example Request**:
```http
GET /api/jar-ratio/report?year=2025&month=1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "month": 1,
  "year": 2025,
  "jars": [
    {
      "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
      "jar_name": "Lọ Tài sản",
      "jar_code": "TS",
      "ratio": 15.5,
      "total_amount": "50000000.00",
      "extracted_amount": "7750000.00",
      "status": "approved"
    },
    {
      "jar_id": "jar-uuid-2",
      "jar_name": "Lọ Hàng hóa",
      "jar_code": "HH",
      "ratio": 12.3,
      "total_amount": "30000000.00",
      "extracted_amount": "3690000.00",
      "status": "pending"
    },
    {
      "jar_id": "jar-uuid-3",
      "jar_name": "Lọ Chi phí",
      "jar_code": "CP",
      "ratio": 8.2,
      "total_amount": "20000000.00",
      "extracted_amount": "1640000.00",
      "status": "approved"
    }
  ],
  "total_amount": "100000000.00",
  "total_extracted": "13080000.00",
  "total_ratio": 36.0,
  "generated_at": "2025-01-15T10:00:00Z"
}
```

---

## Đặc điểm workflow

| Bước | Vai trò | User | Mobile | Lý do nếu không duyệt được |
|------|---------|------|--------|----------------------------|
| 0 | Tạo tỷ lệ | Web | ❌ | Phải nhập trên Web |
| 1 | Trưởng bộ phận | 55555 | ✅ | - |
| 2 | KT Tài sản/Hàng hóa | 0025/0091 | ❌ | Phải kiểm tra và chỉnh sửa trên Web |
| 3 | KT Thuế | 44444 | ❌ | Phải xác nhận cuối cùng trên Web |

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC01 | GET /jar-ratio?year=2025&month=1 | Any | Danh sách | 200 + list |
| TC02 | GET /jar-ratio/:id | Any | Chi tiết | 200 + full detail |
| TC03 | POST /jar-ratio/:id/approve | 55555 | Duyệt bước 1 | 200 Success |
| TC04 | POST /jar-ratio/:id/approve | 55555 | Từ chối | 200 Rejected |
| TC05 | POST /jar-ratio/:id/approve | 0025 | Duyệt bước 2 | 403 Web only |
| TC06 | GET /jar-ratio/report?year=2025&month=1 | Any | Báo cáo | 200 + report |

---

## Mobile Implementation Notes

### 1. Lấy danh sách theo tháng

**QUAN TRỌNG**: Phải truyền cả `year` và `month` vào query

```javascript
// ĐÚNG - Truyền year và month
GET /api/jar-ratio?year=2025&month=1

// SAI - Thiếu tham số
GET /api/jar-ratio?page=1
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

### 3. Báo cáo trích lọ

Báo cáo chỉ XEM, không chỉnh sửa:
- Hiển thị bảng với các cột: Tên lọ, Tỷ lệ (%), Tổng tiền, Trích lọ, Trạng thái
- Hiển thị tổng cộng ở cuối bảng
- Có thể export hoặc in (nếu cần)

```typescript
// Format số tiền và tỷ lệ
const formatMoney = (amount: string) =>
  new Intl.NumberFormat('vi-VN').format(parseFloat(amount)) + ' đ';

const formatRatio = (ratio: number) => ratio.toFixed(1) + '%';
```

### 4. Chọn tháng/năm

UI nên có:
- Dropdown hoặc DatePicker để chọn tháng/năm
- Hiển thị tháng hiện tại mặc định
- Có thể chuyển qua lại giữa các tháng (Previous/Next)

```typescript
// State management
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

// Load data khi thay đổi tháng/năm
useEffect(() => {
  fetchJarRatios(selectedYear, selectedMonth);
}, [selectedYear, selectedMonth]);
```

---

## Lưu ý quan trọng

### 1. Tỷ lệ lọ đặc biệt

Lọ Tài sản có ID cố định: `a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd`
- Lọ này có quy trình riêng trong phiếu đề nghị thanh toán
- Bước 2 sẽ được duyệt bởi Kế toán Tài sản (0025)

### 2. Trạng thái tỷ lệ lọ

| Status | Ý nghĩa |
|--------|---------|
| `pending` | Đang chờ duyệt |
| `approved` | Đã duyệt xong |
| `rejected` | Bị từ chối |

### 3. Validation

Mobile nên validate:
- Year: Từ 2020 đến năm hiện tại + 1
- Month: Từ 1 đến 12
- Ratio: Từ 0 đến 100 (nếu có form nhập - future feature)

---

## Xem thêm

- [Common Interfaces](./COMMON-INTERFACES.md) - Interface chi tiết
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test
- [Overview](./OVERVIEW.md) - Tổng quan hệ thống
