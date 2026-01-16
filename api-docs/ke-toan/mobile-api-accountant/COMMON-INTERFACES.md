# Common Interfaces - Các interface chung
---

## Base Response Interfaces

### DataResponse

```typescript
interface DataResponse<T> {
  data: T;
}
```

**Example:**
```json
{
  "data": {
    "id": "uuid-123",
    "name": "Example"
  }
}
```

### CreatedResponse

```typescript
interface CreatedResponse<T> {
  data: T;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;     
  totalPages?: number;
}
```

**Example:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "size": 10
}
```

### ErrorResponse (HTTP 400/500)

```typescript
interface ErrorResponse {
  message: string | string[]; 
  error: string;
  statusCode: number;
}
```

**Example - Single error:**
```json
{
  "message": "Validation failed",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

## Approval Interface

### ApprovalStep

Interface cho từng bước duyệt trong workflow:

```typescript
interface ApprovalStep {
  step: number;                      // Equivalent to "level" in DB
  role: string;                      // Role name
  approver_name: string | null;      // Name of approver (null if not yet assigned)
  status: 'waiting' | 'pending' | 'approved' | 'rejected';
  approved_at: string | null;        // ISO 8601 format
  note: string | null;               // Rejection reason or approval note
}
```
**Example:**
```json
{
  "step": 1,
  "role": "department_manager",
  "approver_name": "Mai Thanh Thuận",
  "status": "pending",
  "approved_at": null,
  "note": null
}
```

**Example (Web only step):**
```json
{
  "step": 2,
  "role": "asset_accountant",
  "approver_name": null,
  "status": "waiting",
  "approved_at": null,
  "note": null
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
  id: string;                        // UUID from Employee/User
  name: string;                      // Employee name
  sale: string;                      // Sale code/identifier (can be empty string)
}
```

**Example:**
```json
{
  "id": "uuid-employee",
  "name": "Nguyễn Văn A",
  "sale": "NV001"
}
```

**Note:** Được lấy từ Employee Service (hr-service) hoặc fallback sang User entity.

### Workplace (Phòng ban / Chi nhánh)

```typescript
interface Workplace {
  id: string;                        // UUID
  name: string;                      // Store/Department name
  code?: string;                     // Store/Department code (có trong advance-request)
  type: number;                      // 0 = Store/Branch, 1 = Department
}
```

**Example - Store/Branch (type = 0):**
```json
{
  "id": "uuid-store",
  "name": "Chi nhánh Hà Nội",
  "code": "CN-HN",
  "type": 0
}
```

**Example - Department (type = 1):**
```json
{
  "id": "uuid-dept",
  "name": "Phòng Kế toán",
  "code": "PKT",
  "type": 1
}
```

**Note:**
- Nếu `type = 0` → Lấy từ Store Service (hr-service)
- Nếu `type = 1` → Lấy từ Department Service (hr-service)
- Field `code` có thể không có trong payment-request, nhưng có trong advance-request

### Disburser (Đối tượng chi)

```typescript
interface Disburser {
  id: string;
  code: string;              // Mã đối tượng chi
  full_name: string;         // Tên đối tượng chi
  address?: string;
  tax_code?: string;
  note?: string;
  status?: string;
  group_name?: string;
  active_date: string;       // YYYY-MM-DD
  bank_accounts?: BankAccount[]; // Array - KHÔNG phải single object
  created_at: string;
  updated_at?: string;
}

interface BankAccount {
  id?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  branch?: string;
}
```

**Example:**
```json
{
  "id": "uuid",
  "code": "DT001",
  "full_name": "Nguyen Van A",
  "address": "123 Street, Hanoi",
  "tax_code": "0123456789",
  "active_date": "2025-01-15",
  "bank_accounts": [
    {
      "id": "uuid",
      "bank_name": "Vietcombank",
      "account_number": "123456789",
      "account_name": "NGUYEN VAN A",
      "branch": "Chi nhánh Hà Nội"
    }
  ],
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

## Payment Request Interfaces

### PaymentDetail

```typescript
interface PaymentDetail {
  id: string;
  sort_order: number;
  content: string;           // Mapped from "description" in DB
  unit_id: string;
  unit_name: string;
  quantity: number;
  price: string;             // String for precise decimal
  tax: string;               // String for precise decimal
  total_before: string;      // ← NOT "total_before_tax"!
  total_after: string;       // ← NOT "total_after_tax"!
}
```

**Example:**
```json
{
  "id": "uuid-123",
  "sort_order": 1,
  "content": "Mua văn phòng phẩm",
  "unit_id": "uuid-unit",
  "unit_name": "Cái",
  "quantity": 10,
  "price": "50000.00",
  "tax": "10.00",
  "total_before": "500000.00",
  "total_after": "550000.00"
}
```

### PaymentDocument

```typescript
interface PaymentDocument {
  ids: string[];                     // Array of payment document IDs (grouped by type)
  type_document_id: string;          // UUID reference to document type
  name: string;                      // Document type name (from document_type table)
  request_module: string;            // Module identifier (e.g., which module requested it)
  ref_id: string[];                  // Array of reference IDs
  ref_code: string[];                // Array of reference codes
}
```

**Example:**
```json
{
  "ids": ["uuid-1", "uuid-2"],
  "type_document_id": "uuid-doc-type",
  "name": "Biên bản nghiệm thu",
  "request_module": "payment_request",
  "ref_id": ["ref-uuid-1", "ref-uuid-2"],
  "ref_code": ["REF001", "REF002"]
}
```

**Note:** Documents are grouped by `type_document_id` and `request_module` in the response, với các `ids`, `ref_id`, và `ref_code` được gộp thành mảng.

### Invoice (Hóa đơn)

```typescript
interface Invoice {
  id: string;
  code: string;
  type: string;
  date: string;                      // ISO 8601 format
  company_id?: string;               // Optional - may be null
  company_name?: string;             // Optional - from company join
  company_abbreviation: string;      // Required - from company join
  tax_code: string;                  // Required - from company join
  file: IFile;                       // File attachment
  ref_id?: string;                   // Optional reference ID
  ref_module?: string;               // Optional reference module
  amount: string;                    // Required (default: "0")
  place?: string;                    // Optional
}
```

**Example:**
```json
{
  "id": "uuid-123",
  "code": "HD001",
  "type": "invoice",
  "date": "2025-01-15",
  "company_id": "uuid-company",
  "company_abbreviation": "ABC",
  "company_name": "Công ty TNHH ABC",
  "tax_code": "0123456789",
  "amount": "10000000.00",
  "place": "Hà Nội",
  "file": { "id": "uuid-file", "name": "invoice.pdf" }
}
```

### Contract (Hợp đồng)

```typescript
interface Contract {
  id: string;
  code: string;
  type: string;
  date: string;                      // ISO 8601 format
  company_id?: string;               // Optional - may be null
  company_name?: string;             // Optional - from company join
  company_abbreviation: string;      // Required - from company join
  tax_code: string;                  // Required - from company join
  file: IFile;                       // File attachment
  ref_id?: string;                   // Optional reference ID
  ref_module?: string;               // Optional reference module
  amount: string;                    // Required (default: "0")
  place?: string;                    // Optional
}
```

**Example:**
```json
{
  "id": "uuid-456",
  "code": "HĐ001",
  "type": "contract",
  "date": "2025-01-10",
  "company_id": "uuid-company",
  "company_abbreviation": "XYZ",
  "company_name": "Công ty CP XYZ",
  "tax_code": "0987654321",
  "amount": "50000000.00",
  "place": "TP.HCM",
  "file": { "id": "uuid-file", "name": "contract.pdf" }
}
```

### PaymentRequestListItem

```typescript
interface PaymentRequestListItem {
  id: string;
  code: string;
  date: string;                      // Request date (ISO 8601)
  jar_id: string;
  jar_name: string;
  requester_id: string;
  requester_name: string;
  workplace_name: string;
  content: string;                   // Payment request description
  payment_type: string;              // Type of payment
  advance_code: string[];            // Array of advance request codes
  advance_amount: string;            // Total advance amount (decimal string)
  paid_amount: string;               // Amount already paid (decimal string)
  expense_target: string;            // Calculated: advance_amount - paid_amount
  previous_payments: string;         // Previous payment amount (decimal string)
  status: string;                    // PaymentRequestStatusEnum
  created_at: string;                // Creation timestamp (ISO 8601)
  created_by: string;                // User who created
  total_payment: string;             // Total from payment details (decimal string)
  total_final: string;               // Calculated: total_payment - previous_payments - advance_amount
  status_name: string;               // Human-readable status (e.g., "Hoàn thành", "Chờ duyệt")
  payment_voucher_id: string;        // Payment voucher reference ID
  action: {
    is_approve: boolean;             // Whether user can approve
    is_edit: boolean;                // Whether user can edit
  };
}
```

**Example:**
```json
{
  "id": "uuid-payment",
  "code": "DNTT-001",
  "date": "2025-01-15",
  "jar_id": "uuid-jar",
  "jar_name": "Lọ Tổng sản",
  "requester_id": "uuid-employee",
  "requester_name": "Nguyễn Văn A",
  "workplace_name": "Chi nhánh Hà Nội",
  "content": "Thanh toán mua văn phòng phẩm",
  "payment_type": "TRANSFER",
  "advance_code": ["DNTU-001"],
  "advance_amount": "5000000.00",
  "paid_amount": "0.00",
  "expense_target": "5000000.00",
  "previous_payments": "0.00",
  "status": "PENDING",
  "created_at": "2025-01-15T10:00:00Z",
  "created_by": "uuid-user",
  "total_payment": "10000000.00",
  "total_final": "5000000.00",
  "status_name": "Chờ duyệt",
  "payment_voucher_id": "",
  "action": {
    "is_approve": false,
    "is_edit": true
  }
}
```
### PaymentRequestDetail

```typescript
interface PaymentRequestDetail {
  id: string;
  jar: Jar;
  jar_category: JarCategory;
  requester: Requester;
  workplace: Workplace;
  accounting_date: string;           // ISO 8601 format
  date: string;                      // ISO 8601 format
  code: string;
  content: string;
  disburser: Disburser;
  create_type: string;
  payment_approvals: any[];          // Legacy approval system
  payment_type: string;              // ✅ Type of payment
  status: string;                    // PaymentRequestStatusEnum
  payment_details: PaymentDetail[];
  advance_amount: string;            // ✅ Total advance amount (decimal string)
  advances: any[];                   // Array of linked advance requests
  created_by: string;
  total_payment: string;             // Total from payment details
  previous_payments: string;         // ✅ Previous payment amount
  total_final: string;               // Final calculated total
  payment_document: PaymentDocument[]; // ✅ Array of payment documents (NOT payment_documents!)
  status_name: string;               // Human-readable status
  payment_voucher_id: string;
  files: any[];                      // File attachments
  approvals: ApprovalStep[];
  invoices: Invoice[];               // ✅ Array of invoices
  contracts: Contract[];             // ✅ Array of contracts
  action: {
    is_approve: boolean;
    is_edit: boolean;
  };
}
```

**Example:**
```json
{
  "id": "uuid-payment",
  "code": "DNTT-001",
  "date": "2025-01-15",
  "accounting_date": "2025-01-15",
  "jar": { "id": "uuid-jar", "name": "Lọ Tổng sản", "code": "LO.TS01" },
  "jar_category": { "id": "uuid-cat", "code": "TS", "name": "Tổng sản" },
  "requester": { "id": "uuid-emp", "name": "Nguyễn Văn A", "sale": "NV001" },
  "workplace": { "id": "uuid-store", "name": "Chi nhánh Hà Nội", "type": 0 },
  "content": "Thanh toán mua văn phòng phẩm",
  "disburser": { "id": "uuid-dis", "code": "DT001", "full_name": "Công ty ABC" },
  "payment_type": "TRANSFER",
  "status": "PENDING",
  "payment_details": [...],
  "advance_amount": "5000000.00",
  "previous_payments": "0.00",
  "total_payment": "10000000.00",
  "total_final": "5000000.00",
  "payment_document": [...],
  "invoices": [...],
  "contracts": [...],
  "approvals": [...],
  "action": { "is_approve": false, "is_edit": true }
}
```
---

## Advance Request Interfaces

### AdvanceDetail

```typescript
interface AdvanceDetail {
  id: string;
  sort_order: number;
  content: string;           // Mapped from "description" in DB
  unit_id: string;
  unit_name: string;
  quantity: number;
  price: string;             // String for precise decimal
  tax: string;
  total_before: string;      // Total before tax
  total_after: string;       // Total after tax
}
```

**Example:**
```json
{
  "id": "uuid-123",
  "sort_order": 1,
  "content": "Tạm ứng chi phí đi công tác",
  "unit_id": "uuid-unit",
  "unit_name": "Chuyến",
  "quantity": 1,
  "price": "5000000.00",
  "tax": "0.00",
  "total_before": "5000000.00",
  "total_after": "5000000.00"
}
```

### AdvanceRequestListItem

```typescript
interface AdvanceRequestListItem {
  id: string;
  code: string;
  date: string;                      // ISO 8601 format
  requester: {                       // ← Nested object, NOT requester_name
    id: string;
    name: string;
  };
  workplace: {                       // ← Nested object, NOT workplace_name
    id: string;
    name: string;
    code: string;
    type: number;                    // 0 = Store, 1 = Department
  };
  jar_name: string;
  content: string;
  payment_type: string;
  advance_amount: string;            // ← NOT total_amount!
  payment_code: string;
  payment_id: string;
  payment_amount: string;
  expense_target: string;            // Calculated: payment_amount - advance_amount
  status: string;
  status_name?: string;              // Human-readable status
  payment_voucher_id: string | null;
  created_at: string;                // ISO 8601 format
  created_by: string;
  action?: {
    is_edit: boolean;
    is_approve: boolean;
    is_create_update_invoice_contract?: boolean;
    is_edit_document?: boolean;
    is_create_payment?: boolean;
    is_edit_payment?: boolean;
  };
}
```

**Example:**
```json
{
  "id": "uuid-advance",
  "code": "DNTU-001",
  "date": "2025-01-15",
  "requester": {
    "id": "uuid-emp",
    "name": "Nguyễn Văn A"
  },
  "workplace": {
    "id": "uuid-store",
    "name": "Chi nhánh Hà Nội",
    "code": "CN-HN",
    "type": 0
  },
  "jar_name": "Lọ Tổng sản",
  "content": "Tạm ứng chi phí công tác",
  "payment_type": "CASH",
  "advance_amount": "5000000.00",
  "payment_code": "DNTT-001",
  "payment_id": "uuid-payment",
  "payment_amount": "10000000.00",
  "expense_target": "5000000.00",
  "status": "APPROVED",
  "status_name": "Đã duyệt",
  "created_at": "2025-01-15T10:00:00Z",
  "created_by": "Nguyễn Văn B"
}
```

### AdvanceRequestDetail

```typescript
interface AdvanceRequestDetail {
  id: string;
  code: string;
  jar: Jar;
  jar_category: JarCategory;
  requester: {
    id: string;
    name: string;
    sale: string;
  };
  date: string;                      // ISO 8601 format
  workplace: {                       // ← Có field code (khác với PaymentRequest)
    id: string;
    name: string;
    code: string;
    type: number;
  };
  accounting_date: string;           // ISO 8601 format
  disburser: {                       // Slightly different from PaymentRequest
    id: string;
    name: string;
    bank_account_number: string;     // ← Uses "number" not "code"
    bank_account_name: string;
    bank_name: string;
  };
  payment_type: string;
  advance_details: AdvanceDetail[];
  create_type: string;
  advance_approvals: any[];          // Legacy approval system
  advance_documents: PaymentDocument[]; // Same structure as PaymentDocument
  payment_code: string;
  payment_id: string;
  payment_amount: string;            // ← NOT total_amount!
  advance_total: string;             // ← Total of advance details
  previous_payments: string;
  status: string;
  status_name?: string;
  payment_voucher_id: string | null;
  content: string;
  total_final: string;
  created_by: string;
  invoices: Invoice[];
  contracts: Contract[];
  approvals: ApprovalStep[];
  files: any[];
  action: {
    is_edit: boolean;
    is_approve: boolean;
    is_create_update_invoice_contract?: boolean;
    is_edit_document?: boolean;
    is_create_payment?: boolean;
    is_edit_payment?: boolean;
  };
}
```

**Example:**
```json
{
  "id": "uuid-advance",
  "code": "DNTU-001",
  "date": "2025-01-15",
  "jar": { "id": "uuid-jar", "name": "Lọ Tổng sản" },
  "jar_category": { "id": "uuid-cat", "code": "TS", "name": "Tổng sản" },
  "requester": { "id": "uuid-emp", "name": "Nguyễn Văn A", "sale": "NV001" },
  "workplace": { "id": "uuid-store", "name": "Chi nhánh HN", "code": "CN-HN", "type": 0 },
  "disburser": {
    "id": "uuid-dis",
    "name": "Nguyễn Văn A",
    "bank_account_number": "123456789",
    "bank_account_name": "NGUYEN VAN A",
    "bank_name": "Vietcombank"
  },
  "payment_type": "CASH",
  "advance_details": [...],
  "advance_total": "5000000.00",
  "payment_amount": "10000000.00",
  "previous_payments": "0.00",
  "total_final": "5000000.00",
  "status": "APPROVED",
  "invoices": [...],
  "contracts": [...],
  "approvals": [...]
}
```

---

## Payment Voucher Interfaces

### PaymentVoucherListItem

```typescript
interface PaymentVoucherListItem {
  id: string;
  code: string;
  date: string;                      // ISO 8601 format
  method: string;                    // Payment method
  type: string;                      // Voucher type
  user: {
    id: string;
    name: string;
  };
  workplace: {
    id: string;
    name: string;
    type: number;                    // CATEGORY_OF_STORE
  };
  disburser: {
    id: string;
    name: string;
  };
  reason: string;
  amount: string;
  payment_amounts: string;
  expense_target: string;
  jar: {
    id: string;
    name: string;
  };
  detail: string;
  status: string;
  debit_account: string;
  credit_account: string;
  debit_disburser: string[];         // Array of disburser names
  credit_disburser: string;
  created_at: string;                // ISO 8601 format
  created_by: string;
  status_name?: string;
  actions?: {
    is_edit: boolean;
    is_approve: boolean;
    create_payment_voucher?: boolean;
    is_update_disbursement_date?: boolean;
  };
}
```

**Example:**
```json
{
  "id": "uuid-voucher",
  "code": "PC-001",
  "date": "2025-01-15",
  "method": "TRANSFER",
  "type": "CHI",
  "user": { "id": "uuid-user", "name": "Nguyễn Văn A" },
  "workplace": { "id": "uuid-store", "name": "Chi nhánh HN", "type": 0 },
  "disburser": { "id": "uuid-dis", "name": "Công ty ABC" },
  "reason": "Thanh toán tiền hàng",
  "amount": "10000000.00",
  "payment_amounts": "10000000.00",
  "expense_target": "0.00",
  "jar": { "id": "uuid-jar", "name": "Lọ Tổng sản" },
  "detail": "Chi tiết phiếu chi",
  "status": "APPROVED",
  "debit_account": "131",
  "credit_account": "111",
  "debit_disburser": ["Công ty ABC"],
  "credit_disburser": "Ngân hàng Vietcombank",
  "created_at": "2025-01-15T10:00:00Z",
  "created_by": "Nguyễn Văn B",
  "status_name": "Đã duyệt"
}
```

### PaymentVoucherDetail

```typescript
interface PaymentVoucherDetail {
  id: string;
  code: string;
  date: string;                      // ISO 8601 format
  method: string;
  user: {
    id: string;
    name: string;
  };
  workplace: {
    id: string;
    name: string;
    code: string;                    // ← Có code trong detail
    type: number;
  };
  disburser: {
    id: string;
    name: string;
    bank_account_number: string;
    bank_account_name: string;
    bank_name: string;
  };
  disbursement_date: string;         // ← NOT disbursement_receipt!
  reason: string;
  amount: string;
  payment_amounts: string;
  expense_target: string;
  jar: {
    id: string;
    name: string;
  };
  type: string;
  ref_id: string;
  detail: string;
  status: string;
  status_name?: string;
  debit_account: string;
  credit_account: string;
  debit_disburser: string[];
  credit_disburser: string;
  created_at: string;                // ISO 8601 format
  created_by: string;
  source_account: {                  // ← Full object, not just string
    id: string;
    name: string;
    date: string;
    bank_account_number: string;
    note?: string;
    bank_name: string;
  };
  files: any[];                      // File attachments
  statistic: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  approvals: ApprovalStep[];
  final_amount?: string;
  actions?: {
    is_edit?: boolean;
    is_approve: boolean;
    is_update_completed: boolean;
    is_update_disbursement_date?: boolean;
    create_payment_voucher?: boolean;
  };
}
```

**Example:**
```json
{
  "id": "uuid-voucher",
  "code": "PC-001",
  "date": "2025-01-15",
  "disbursement_date": "2025-01-16",
  "disburser": {
    "id": "uuid-dis",
    "name": "Công ty ABC",
    "bank_account_number": "123456789",
    "bank_account_name": "CONG TY ABC",
    "bank_name": "Vietcombank"
  },
  "amount": "10000000.00",
  "source_account": {
    "id": "uuid-acc",
    "name": "TK Vietcombank",
    "date": "2025-01-15",
    "bank_account_number": "987654321",
    "bank_name": "Vietcombank"
  },
  "status": "COMPLETED",
  "approvals": [...],
  "files": [...]
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
  month: number;
  year: number;
  ratio: number;
  status: 'pending' | 'approved' | 'rejected';
  step: number;
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
    total_amount: number;
    extracted_amount: number;
    status: 'approved' | 'pending';
  }[];
  total_extracted: number;
  generated_at: string;
}
```

---

## Request Body Interfaces

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

## Xem thêm

- [Overview](./OVERVIEW.md) - Tổng quan hệ thống
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test
