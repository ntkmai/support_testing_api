# Common Interfaces - Các interface chung

Tài liệu này mô tả các interface response được sử dụng chung cho tất cả các API endpoints.

---

## Base Response Interfaces

### SuccessResponse

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  warning?: string; // Chỉ có khi duyệt bước 5-6 trên mobile
}
```

**Example:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Example"
  },
  "message": "Operation successful"
}
```

### ErrorResponse

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}
```

**Example:**
```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "name": "Name is required",
    "amount": "Amount must be greater than 0"
  }
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Example:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

## Approval Interface

### ApprovalStep

Interface cho từng bước duyệt trong workflow:

```typescript
interface ApprovalStep {
  step: number;
  role: string;
  approver_id: string | null;
  approver_name: string | null;
  status: 'waiting' | 'pending' | 'approved' | 'rejected';
  approved_at: string | null; // ISO 8601 format
  note: string | null;
  can_approve_on_mobile?: boolean; // Có thể duyệt trên mobile?
  reason?: string; // Lý do không duyệt được trên mobile
}
```

**Example:**
```json
{
  "step": 1,
  "role": "department_manager",
  "approver_id": "user-uuid-123",
  "approver_name": "Mai Thanh Thuận",
  "status": "pending",
  "approved_at": null,
  "note": null,
  "can_approve_on_mobile": true
}
```

**Example (Web only step):**
```json
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
}
```

---

## Common Entity Interfaces

### Jar (Lọ)

```typescript
interface Jar {
  id: string;
  name: string;
  code?: string;
}
```

### JarCategory (Hạng mục lọ)

```typescript
interface JarCategory {
  id: string;
  code: string;
  name: string;
}
```

### Requester (Người đề nghị)

```typescript
interface Requester {
  id: string;
  name: string;
  code: string; // MSNV
  email?: string;
  phone?: string;
}
```

### Workplace (Phòng ban / Chi nhánh)

```typescript
interface Workplace {
  id: string;
  name: string;
  type: 'department' | 'branch';
  code?: string;
}
```

### Disburser (Đối tượng chi)

```typescript
interface Disburser {
  id: string;
  name: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_name: string;
  tax_code?: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
}
```

---

## Payment Request Interfaces

### PaymentDetail

```typescript
interface PaymentDetail {
  id: string;
  content: string; // Nội dung chi
  unit_name: string; // Đơn vị tính
  quantity: number;
  price: string; // Decimal string
  tax: string; // % thuế (VD: "10")
  total_before_tax: string; // Decimal string
  total_after_tax: string; // Decimal string
}
```

**Example:**
```json
{
  "id": "detail-uuid-1",
  "content": "Mua laptop Dell Inspiron 15",
  "unit_name": "Cái",
  "quantity": 2,
  "price": "22000000.00",
  "tax": "10",
  "total_before_tax": "44000000.00",
  "total_after_tax": "48400000.00"
}
```

### PaymentDocument

```typescript
interface PaymentDocument {
  id: string;
  name: string;
  request_module: 'payment_request' | 'advance_request';
  checked?: boolean; // Có đính kèm không
}
```

### Invoice (Hóa đơn)

```typescript
interface Invoice {
  id: string;
  company_abbreviation: string; // Pháp nhân viết tắt
  company_name: string; // Đơn vị xuất hóa đơn
  tax_code: string; // Mã số thuế
  code: string; // Số hóa đơn
  date: string; // Ngày hóa đơn (YYYY-MM-DD)
  amount: string; // Số tiền
}
```

**Example:**
```json
{
  "id": "invoice-uuid-1",
  "company_abbreviation": "LO",
  "company_name": "Công ty TNHH Loship",
  "tax_code": "0123456789",
  "code": "HD001/2025",
  "date": "2025-01-15",
  "amount": "48400000.00"
}
```

### Contract (Hợp đồng)

```typescript
interface Contract {
  id: string;
  company_abbreviation: string; // Pháp nhân viết tắt
  company_name: string; // Đối tác
  tax_code: string; // Mã số thuế
  code: string; // Số hợp đồng
  date: string; // Ngày hợp đồng (YYYY-MM-DD)
  place: string; // Nơi lưu trữ
}
```

**Example:**
```json
{
  "id": "contract-uuid-1",
  "company_abbreviation": "LO",
  "company_name": "Công ty ABC",
  "tax_code": "0987654321",
  "code": "HĐ-2025-001",
  "date": "2025-01-10",
  "place": "Phòng Hành chính - Tủ số 3"
}
```

### PaymentRequestListItem

```typescript
interface PaymentRequestListItem {
  id: string;
  code: string; // Mã phiếu (VD: DNTT-LO.TS01-15012025)
  jar_name: string;
  jar_category_name?: string;
  requester_name: string;
  workplace_name: string;
  total_amount: string; // Decimal string
  payment_type: 'cash' | 'bank_transfer';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  current_step: number;
  current_approver: string;
  created_at: string; // ISO 8601
  updated_at?: string;
}
```

### PaymentRequestDetail

```typescript
interface PaymentRequestDetail {
  id: string;
  code: string;
  jar: Jar;
  jar_category: JarCategory;
  requester: Requester;
  workplace: Workplace;
  disburser: Disburser;
  payment_type: 'cash' | 'bank_transfer';
  payment_details: PaymentDetail[];
  payment_documents: PaymentDocument[];
  invoices: Invoice[];
  contracts: Contract[];
  total_payment: string;
  advance_amount: string; // Số tiền đã tạm ứng
  previous_payments: string; // Số tiền đã thanh toán trước
  total_final: string; // Tổng tiền còn phải thanh toán
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  current_step: number;
  approvals: ApprovalStep[];
  created_at: string;
  updated_at: string;
}
```

---

## Advance Request Interfaces

### AdvanceDetail

```typescript
interface AdvanceDetail {
  id: string;
  content: string; // Nội dung tạm ứng
  unit_name: string;
  quantity: number;
  price: string; // Decimal string
  total_amount: string; // Decimal string (không có tax)
}
```

**Example:**
```json
{
  "id": "advance-detail-uuid-1",
  "content": "Khách sạn",
  "unit_name": "Đêm",
  "quantity": 3,
  "price": "1000000.00",
  "total_amount": "3000000.00"
}
```

### AdvanceRequestListItem

```typescript
interface AdvanceRequestListItem {
  id: string;
  code: string; // Mã phiếu (VD: DNTU-LO.HD02-15012025)
  jar_name: string;
  requester_name: string;
  workplace_name: string;
  payment_amount: string; // Số tiền tạm ứng
  payment_type: 'cash' | 'bank_transfer';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  current_step: number;
  current_approver: string;
  created_at: string;
}
```

### AdvanceRequestDetail

```typescript
interface AdvanceRequestDetail {
  id: string;
  code: string;
  jar: Jar;
  jar_category: JarCategory;
  requester: Requester;
  workplace: Workplace;
  disburser: Disburser;
  payment_type: 'cash' | 'bank_transfer';
  advance_details: AdvanceDetail[];
  advance_documents: PaymentDocument[];
  invoices: Invoice[]; // Empty khi tạo, thêm sau khi quyết toán
  contracts: Contract[]; // Empty khi tạo
  payment_amount: string; // Tổng tiền tạm ứng
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  current_step: number;
  approvals: ApprovalStep[];
  created_at: string;
  updated_at: string;
}
```

---

## Payment Voucher Interfaces

### PaymentVoucherListItem

```typescript
interface PaymentVoucherListItem {
  id: string;
  code: string; // Mã lịch chi (VD: PC-15012025-001)
  type: 'disbursement' | 'collect'; // Chi hoặc Thu
  payment_request_id: string;
  payment_request_code: string;
  disburser_name: string;
  amount: string;
  payment_date: string | null; // Ngày chi (chưa chọn = null)
  source_account: string | null; // Tài khoản nguồn
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  current_step: number;
  current_approver: string;
  created_at: string;
}
```

### PaymentVoucherDetail

```typescript
interface PaymentVoucherDetail {
  id: string;
  code: string;
  type: 'disbursement' | 'collect';
  payment_request: {
    id: string;
    code: string;
    requester_name: string;
    workplace_name: string;
  };
  disburser: Disburser;
  amount: string;
  payment_date: string | null;
  source_account: string | null;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  current_step: number;
  approvals: ApprovalStep[];
  disbursement_receipt: {
    id: string;
    code: string;
    status: string;
  } | null; // Phiếu chi (null nếu chưa tạo)
  created_at: string;
  updated_at: string;
}
```

---

## Jar Ratio Interfaces

### JarRatioListItem

```typescript
interface JarRatioListItem {
  id: string;
  jar_id: string;
  jar_name: string;
  month: number; // 1-12
  year: number;
  ratio: number; // % tỷ lệ (VD: 15.5)
  status: 'pending' | 'approved' | 'rejected';
  step: number; // Bước hiện tại
  current_approver: string;
  created_at: string;
}
```

### JarRatioDetail

```typescript
interface JarRatioDetail {
  id: string;
  jar_id: string;
  jar_name: string;
  month: number;
  year: number;
  ratio: number;
  status: 'pending' | 'approved' | 'rejected';
  step: number;
  approvals: ApprovalStep[];
  created_at: string;
  updated_at: string;
}
```

### JarRatioReport

```typescript
interface JarRatioReport {
  month: number;
  year: number;
  jars: {
    jar_id: string;
    jar_name: string;
    ratio: number;
    total_amount: number; // Tổng doanh thu
    extracted_amount: number; // Số tiền trích
    status: 'approved' | 'pending';
  }[];
  total_extracted: number; // Tổng số tiền trích tất cả lọ
  generated_at: string; // Thời điểm tạo báo cáo
}
```

---

## Approve/Reject Request Body

### ApproveRequest

```typescript
interface ApproveRequest {
  action: 'approve' | 'reject';
  note?: string; // Bắt buộc khi reject
}
```

**Example - Approve:**
```json
{
  "action": "approve",
  "note": "Đã kiểm tra và phê duyệt"
}
```

**Example - Reject:**
```json
{
  "action": "reject",
  "note": "Nội dung chi chưa rõ ràng, vui lòng bổ sung"
}
```

---

## Select Payment Info Request Body

### SelectPaymentInfoRequest

```typescript
interface SelectPaymentInfoRequest {
  payment_date: string; // YYYY-MM-DD
  source_account: string; // Text mô tả tài khoản nguồn
}
```

**Example:**
```json
{
  "payment_date": "2025-01-20",
  "source_account": "Tài khoản Vietcombank - STK: 0123456789"
}
```

---

## Complete Request Body

### CompleteRequest

```typescript
interface CompleteRequest {
  note?: string; // Ghi chú khi hoàn thành
}
```

**Example:**
```json
{
  "note": "Đã chi tiền mặt thành công cho Nguyen Van A"
}
```

---

## Xem thêm

- [Overview](./OVERVIEW.md) - Tổng quan hệ thống
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test
