# Disburser API - Đối tượng chi

API quản lý đối tượng chi cho mobile app.

---

## Tổng quan

Đối tượng chi (Disburser) là thông tin của người nhận tiền trong phiếu đề nghị thanh toán/tạm ứng. Có thể là cá nhân hoặc tổ chức.

**Đặc biệt**: Đây là MODULE DUY NHẤT có CRUD đầy đủ trên Mobile

**Trên Mobile**:
- ✅ Xem danh sách (có phân trang)
- ✅ Tìm kiếm
- ✅ Xem chi tiết
- ✅ Tạo mới
- ✅ Sửa
- ✅ Xóa (nếu chưa sử dụng)

---

## API Endpoints

### 1. Get Disburser List

**Endpoint**: `GET /api/disburser`

**Query Parameters**:
```typescript
{
  page?: number;      // Mặc định: 1
  limit?: number;     // Mặc định: 20
  search?: string;    // Tìm kiếm theo tên, số TK, mã số thuế
}
```

**Response**: `PaginatedResponse<DisburserListItem>`

**Example Request**:
```http
GET /api/disburser?page=1&limit=20&search=Nguyen
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "dis-uuid-1",
      "name": "Nguyen Van A",
      "bank_account_name": "NGUYEN VAN A",
      "bank_account_number": "123456789",
      "bank_name": "Vietcombank",
      "tax_code": "0123456789",
      "phone": "0901234567",
      "address": "123 Street, Hanoi",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    },
    {
      "id": "dis-uuid-2",
      "name": "Công ty TNHH ABC",
      "bank_account_name": "CONG TY TNHH ABC",
      "bank_account_number": "9876543210",
      "bank_name": "Techcombank",
      "tax_code": "0123456789",
      "phone": "0987654321",
      "address": "456 Street, Ho Chi Minh City",
      "created_at": "2025-01-14T09:30:00Z",
      "updated_at": "2025-01-14T09:30:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### 2. Get Disburser Detail

**Endpoint**: `GET /api/disburser/:id`

**Response**: `DisburserDetail`

**Example Request**:
```http
GET /api/disburser/dis-uuid-1
x-auth: YOUR_TOKEN
```

**Example Response**:
```json
{
  "id": "dis-uuid-1",
  "name": "Nguyen Van A",
  "bank_account_name": "NGUYEN VAN A",
  "bank_account_number": "123456789",
  "bank_name": "Vietcombank",
  "tax_code": "0123456789",
  "phone": "0901234567",
  "email": "nguyenvana@example.com",
  "address": "123 Street, Hanoi",
  "note": "Nhà cung cấp thiết bị IT",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

### 3. Create Disburser

**Endpoint**: `POST /api/disburser`

**Request Body**: `CreateDisburserRequest`

```typescript
{
  name: string;                    // Bắt buộc
  bank_account_name?: string;      // Optional
  bank_account_number?: string;    // Optional
  bank_name?: string;              // Optional
  tax_code?: string;               // Optional
  phone?: string;                  // Optional
  email?: string;                  // Optional
  address?: string;                // Optional
  note?: string;                   // Optional
}
```

**Example Request - Full Info**:
```http
POST /api/disburser
x-auth: YOUR_TOKEN
Content-Type: application/json

{
  "name": "Công ty TNHH XYZ",
  "bank_account_name": "CONG TY TNHH XYZ",
  "bank_account_number": "1122334455",
  "bank_name": "VietinBank",
  "tax_code": "0987654321",
  "phone": "0912345678",
  "email": "info@xyz.com",
  "address": "789 Street, Da Nang",
  "note": "Nhà cung cấp văn phòng phẩm"
}
```

**Example Request - Minimum Info**:
```http
POST /api/disburser
x-auth: YOUR_TOKEN
Content-Type: application/json

{
  "name": "Tran Thi B"
}
```

**Response - Success**:
```json
{
  "success": true,
  "message": "Tạo đối tượng chi thành công",
  "data": {
    "id": "dis-uuid-new",
    "name": "Công ty TNHH XYZ",
    "bank_account_name": "CONG TY TNHH XYZ",
    "bank_account_number": "1122334455",
    "bank_name": "VietinBank",
    "tax_code": "0987654321",
    "phone": "0912345678",
    "email": "info@xyz.com",
    "address": "789 Street, Da Nang",
    "note": "Nhà cung cấp văn phòng phẩm",
    "created_at": "2025-01-15T14:30:00Z",
    "updated_at": "2025-01-15T14:30:00Z"
  }
}
```

**Response - Error (Validation)**:
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "name": "Tên đối tượng chi là bắt buộc"
  }
}
```

### 4. Update Disburser

**Endpoint**: `PUT /api/disburser/:id`

**Request Body**: `UpdateDisburserRequest` (tất cả field đều optional)

**Example Request - Update Name**:
```http
PUT /api/disburser/dis-uuid-1
x-auth: YOUR_TOKEN
Content-Type: application/json

{
  "name": "Nguyen Van A (Updated)"
}
```

**Example Request - Update Bank Info**:
```http
PUT /api/disburser/dis-uuid-1
x-auth: YOUR_TOKEN
Content-Type: application/json

{
  "bank_account_name": "NGUYEN VAN A",
  "bank_account_number": "9999888877",
  "bank_name": "ACB"
}
```

**Response - Success**:
```json
{
  "success": true,
  "message": "Cập nhật đối tượng chi thành công",
  "data": {
    "id": "dis-uuid-1",
    "name": "Nguyen Van A (Updated)",
    "bank_account_name": "NGUYEN VAN A",
    "bank_account_number": "123456789",
    "bank_name": "Vietcombank",
    "updated_at": "2025-01-15T15:00:00Z"
  }
}
```

### 5. Delete Disburser

**Endpoint**: `DELETE /api/disburser/:id`

**Example Request**:
```http
DELETE /api/disburser/dis-uuid-1
x-auth: YOUR_TOKEN
```

**Response - Success**:
```json
{
  "success": true,
  "message": "Xóa đối tượng chi thành công"
}
```

**Response - Error (Đang được sử dụng)**:
```json
{
  "success": false,
  "error": "Không thể xóa đối tượng chi đang được sử dụng",
  "code": "DISBURSER_IN_USE",
  "details": {
    "used_in": [
      "DNTT-LO.TS01-15012025",
      "DNTU-LO.HD02-16012025"
    ]
  }
}
```

---

## Test Cases

| Case | Endpoint | User | Action | Expected |
|------|----------|------|--------|----------|
| TC07 | GET /disburser?page=1&limit=20 | Any | Danh sách | 200 + list |
| TC08 | GET /disburser?search=Nguyen | Any | Tìm kiếm | 200 + filtered list |
| TC09 | GET /disburser/:id | Any | Chi tiết | 200 + full detail |
| TC10 | POST /disburser | Any | Tạo mới | 200 + created |
| TC11 | POST /disburser (name empty) | Any | Tạo sai | 400 Validation error |
| TC12 | PUT /disburser/:id | Any | Cập nhật | 200 + updated |
| TC13 | DELETE /disburser/:id (unused) | Any | Xóa | 200 Success |
| TC14 | DELETE /disburser/:id (in use) | Any | Xóa | 400 In use error |

---

## Mobile Implementation Notes

### 1. Tìm kiếm

Search hoạt động trên các field:
- `name` - Tên đối tượng chi
- `bank_account_number` - Số tài khoản
- `tax_code` - Mã số thuế
- `phone` - Số điện thoại

```typescript
// Debounce search để tránh call API quá nhiều
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  fetchDisbursers({ search: debouncedSearch, page: 1 });
}, [debouncedSearch]);
```

### 2. Form validation

**Bắt buộc**:
- `name` - Không được để trống

**Optional nhưng nên validate format**:
- `email` - Format email hợp lệ
- `phone` - Số điện thoại Việt Nam (10-11 số)
- `tax_code` - Mã số thuế (10 hoặc 13 số)
- `bank_account_number` - Chỉ số (6-20 ký tự)

```typescript
// Validation examples
const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePhone = (phone: string) =>
  /^(0[3|5|7|8|9])+([0-9]{8,9})$/.test(phone);

const validateTaxCode = (taxCode: string) =>
  /^[0-9]{10}$|^[0-9]{13}$/.test(taxCode);
```

### 3. UI Components

**List Screen**:
- Pull-to-refresh
- Infinite scroll hoặc Load more button
- Search bar ở trên cùng
- Floating Action Button (FAB) để tạo mới
- Item hiển thị: Tên, Số TK, Ngân hàng

**Detail Screen**:
- Hiển thị đầy đủ thông tin
- Nút Edit và Delete ở header hoặc bottom
- Confirm dialog khi delete

**Form Screen (Create/Edit)**:
- Text inputs cho tất cả fields
- Đánh dấu field bắt buộc (*)
- Auto-capitalize cho tên, tên TK
- Keyboard type phù hợp (email, phone, number)

```typescript
// Form layout example
<Form>
  <Input name="name" label="Tên đối tượng chi *" required />
  <Input name="bank_account_name" label="Tên tài khoản" />
  <Input
    name="bank_account_number"
    label="Số tài khoản"
    keyboardType="number-pad"
  />
  <Input name="bank_name" label="Ngân hàng" />
  <Input
    name="tax_code"
    label="Mã số thuế"
    keyboardType="number-pad"
  />
  <Input
    name="phone"
    label="Số điện thoại"
    keyboardType="phone-pad"
  />
  <Input
    name="email"
    label="Email"
    keyboardType="email-address"
  />
  <Input name="address" label="Địa chỉ" multiline />
  <Input name="note" label="Ghi chú" multiline />
</Form>
```

### 4. Delete confirmation

Luôn hiển thị confirm dialog trước khi xóa:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await showConfirmDialog({
    title: 'Xác nhận xóa',
    message: 'Bạn có chắc muốn xóa đối tượng chi này?',
    confirmText: 'Xóa',
    cancelText: 'Hủy',
    confirmColor: 'red'
  });

  if (confirmed) {
    try {
      await deleteDisburser(id);
      showToast('Xóa thành công');
      navigateBack();
    } catch (error) {
      if (error.code === 'DISBURSER_IN_USE') {
        showAlert({
          title: 'Không thể xóa',
          message: `Đối tượng chi đang được sử dụng trong:\n${error.details.used_in.join('\n')}`
        });
      }
    }
  }
};
```

### 5. Auto-complete khi nhập

Có thể implement auto-suggest khi user nhập tên:
- Load danh sách gần đây
- Suggest bank names phổ biến
- Cache địa chỉ đã nhập

```typescript
// Bank suggestions
const POPULAR_BANKS = [
  'Vietcombank',
  'Techcombank',
  'VietinBank',
  'BIDV',
  'ACB',
  'Sacombank',
  'MB Bank',
  'VPBank'
];
```

---

## Lưu ý quan trọng

### 1. Quyền truy cập

- Tất cả user đã login đều có quyền CRUD đối tượng chi
- Không có phân quyền đặc biệt cho module này

### 2. Không thể xóa khi đang sử dụng

Đối tượng chi KHÔNG THỂ xóa nếu đã được sử dụng trong:
- Phiếu đề nghị thanh toán
- Phiếu đề nghị tạm ứng
- Lịch chi
- Phiếu chi

API sẽ trả về error với danh sách các phiếu đang sử dụng.

### 3. Validation server-side

Mặc dù mobile có validation, server vẫn validate lại:
- Tránh duplicate tên (nếu business rule yêu cầu)
- Validate format email, phone, tax_code
- Kiểm tra độ dài các field

### 4. Performance

Với danh sách lớn:
- Implement pagination (default 20 items/page)
- Cache kết quả search
- Debounce search input (500ms)
- Virtual list cho danh sách dài

---

## Xem thêm

- [Common Interfaces](./COMMON-INTERFACES.md) - Interface chi tiết
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test
- [Overview](./OVERVIEW.md) - Tổng quan hệ thống
