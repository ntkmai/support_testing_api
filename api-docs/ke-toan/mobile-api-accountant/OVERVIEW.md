# Mobile API Documentation - Tổng quan

**Project**: Ứng dụng kế toán Mobile
**Base URL**: `http://localhost:3000`
**Version**: 1.0.0
**Last Updated**: 2025-12-29

---

## Giới thiệu

Tài liệu này mô tả các API endpoints dành cho ứng dụng mobile của hệ thống kế toán. Mobile app chủ yếu phục vụ cho việc **XEM** và **DUYỆT** các phiếu, không có tính năng tạo/sửa phức tạp.

## Authentication

Tất cả API đều yêu cầu `x-auth` token trong header (tương tự `icool-staff`):

```http
x-auth: YOUR_JWT_TOKEN
```

Token nhận được từ API đăng nhập (không nằm trong scope mobile API này).

---

## Cấu trúc tài liệu

### Modules API

Hệ thống gồm 7 modules chính, mỗi module có file hướng dẫn riêng:

1. **[Jar Ratio](./1-JAR-RATIO-GUIDE.md)** - Tỷ lệ lọ
   - Xem danh sách theo tháng/năm
   - Duyệt/Từ chối (3 bước)
   - Báo cáo trích lọ

2. **[Disburser](./2-DISBURSER-GUIDE.md)** - Đối tượng chi
   - CRUD đầy đủ (Create, Read, Update, Delete)
   - Tìm kiếm, phân trang

3. **[Payment Request](./3-PAYMENT-REQUEST-GUIDE.md)** - Phiếu đề nghị thanh toán
   - Xem danh sách (không bao gồm tạm ứng)
   - Duyệt/Từ chối (6 bước workflow)
   - Chỉ XEM và DUYỆT trên mobile

4. **[Advance Request](./4-ADVANCE-REQUEST-GUIDE.md)** - Phiếu đề nghị tạm ứng
   - Tương tự Payment Request
   - Workflow đơn giản hơn

5a. **[Payment Voucher](./5a-PAYMENT-VOUCHER-GUIDE.md)** - Lịch chi
   - Giai đoạn 1: Duyệt lịch chi (3 bước)
   - Chọn ngày chi + tài khoản nguồn
   - Tạo phiếu chi tự động

5b. **[Disbursement Receipt](./5b-DISBURSEMENT-RECEIPT-GUIDE.md)** - Phiếu chi
   - Giai đoạn 2: Duyệt phiếu chi (3 bước)
   - Cập nhật hoàn thành

5c. **[Revenue Receipt](./5c-REVENUE-RECEIPT-GUIDE.md)** - Phiếu thu
   - Xem và duyệt phiếu thu
   - **QUAN TRỌNG**: Endpoint mới `/payment-voucher?type=collect`

### Tài liệu tham khảo

- **[Common Interfaces](./COMMON-INTERFACES.md)** - Các interface response chung
- **[Test Accounts](./TEST-ACCOUNTS.md)** - Tài khoản test và quyền hạn
- **[Complete Flow](./COMPLETE-FLOW.md)** - Flow nghiệp vụ từ đầu đến cuối

---

## Tính năng chính trên Mobile

### Có thể làm trên Mobile

| Module | Xem | Tạo | Sửa | Xóa | Duyệt |
|--------|-----|-----|-----|-----|-------|
| Tỷ lệ lọ | ✅ | ❌ | ❌ | ❌ | ✅ Bước 1 |
| Đối tượng chi | ✅ | ✅ | ✅ | ✅ | N/A |
| Phiếu thanh toán | ✅ | ❌ | ❌ | ❌ | ✅ Bước 1, 5-6 |
| Phiếu tạm ứng | ✅ | ❌ | ❌ | ❌ | ✅ Bước 1, 5-6 |
| Lịch chi | ✅ | ❌ | ❌ | ❌ | ✅ 3 bước |
| Phiếu chi | ✅ | ❌ | ❌ | ❌ | ✅ 3 bước + Hoàn thành |
| Phiếu thu | ✅ | ❌ | ❌ | ❌ | ✅ Tất cả |

### Không thể làm trên Mobile

- Tạo/Sửa phiếu thanh toán và tạm ứng (Web only)
- Duyệt bước 2-4 của Payment Request (Web only - phải chỉnh sửa chứng từ)
- Tạo lịch chi, phiếu chi, phiếu thu (tự động từ hệ thống hoặc Web only)

---

## Quy trình duyệt tổng quan

### Payment Request / Advance Request (6 bước)

```
Bước 1: Trưởng bộ phận        → Mobile: ✅ Có thể duyệt
Bước 2: KT Tài sản/Hàng hóa   → Mobile: ❌ Web only (chỉnh sửa chứng từ)
Bước 2/3: KT Thuế             → Mobile: ❌ Web only (thêm hóa đơn)
Bước 4: KT Thanh toán         → Mobile: ❌ Web only (tạo hạch toán)
Bước 5: TBP KTTT              → Mobile: ⚠️ Có cảnh báo (không sửa hạch toán)
Bước 6: Kế toán trưởng        → Mobile: ⚠️ Có cảnh báo (duyệt cuối)
```

### Payment Voucher - Lịch chi (3 bước)

```
Bước 1: Ngân quỹ              → Chọn ngày chi + tài khoản
Bước 2: Giám đốc Tài chính    → Duyệt lịch chi
Bước 3: Tổng Giám đốc         → Duyệt cuối → Tạo Phiếu chi
```

### Disbursement Receipt - Phiếu chi (3 bước + hoàn thành)

```
Bước 1: Ngân quỹ              → Duyệt phiếu chi
Bước 2: Giám đốc Tài chính    → Duyệt
Bước 3: Tổng Giám đốc         → Duyệt cuối
Hoàn thành: Ngân quỹ          → Cập nhật đã chi tiền
```

### Revenue Receipt - Phiếu thu (2-3 bước)

```
Bước 1: Kế toán               → Duyệt phiếu thu
Bước 2: Kế toán trưởng        → Duyệt
Bước 3: Giám đốc TC (nếu cần) → Duyệt cuối
```

---

## Lưu ý quan trọng cho Mobile Developers

### 1. Phân biệt phiếu thanh toán và tạm ứng

```javascript
// Chỉ lấy phiếu thanh toán (không bao gồm tạm ứng)
GET /api/payment-request?exclude_advance=true

// Chỉ lấy phiếu tạm ứng
GET /api/advance-request
```

### 2. Endpoint phiếu thu đã thay đổi

```diff
- GET /api/revenue-receipt        (CŨ - deprecated)
+ GET /api/payment-voucher?type=collect  (MỚI)
```

### 3. Hiển thị cảnh báo khi duyệt bước 5-6

Khi TBP KTTT hoặc Kế toán trưởng duyệt trên mobile, hiển thị popup:

```
⚠️ BẠN ĐANG DUYỆT TRÊN MOBILE

Không thể sửa hạch toán trên mobile.
Vui lòng kiểm tra kỹ trước khi duyệt.

[Hủy]  [Tiếp tục duyệt]
```

### 4. Response có cảnh báo

```json
{
  "success": true,
  "message": "Duyệt thành công",
  "warning": "Bạn đang duyệt trên mobile. Không thể sửa hạch toán."
}
```

### 5. Phiếu chi không thể tạo trên mobile

- Phiếu chi được tạo **tự động** sau khi lịch chi được duyệt xong
- Mobile chỉ **XEM** và **DUYỆT** workflow phiếu chi

---

## Error Codes

| Code | Description | Example |
|------|-------------|---------|
| 200 | Success | Request thành công |
| 201 | Created | Tạo mới thành công |
| 400 | Bad Request | Thiếu field bắt buộc |
| 401 | Unauthorized | Token hết hạn/không hợp lệ |
| 403 | Forbidden | Không có quyền duyệt (Web only) |
| 404 | Not Found | Không tìm thấy resource |
| 500 | Server Error | Lỗi server |

---

## Response Format

### Success Response
```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  warning?: string; // Có khi duyệt bước 5-6
}
```

### Error Response
```typescript
interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}
```

### Paginated Response
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Xem thêm

- [Common Interfaces](./COMMON-INTERFACES.md) - Interface response mẫu chi tiết
- [Test Accounts](./TEST-ACCOUNTS.md) - Tài khoản test và quyền hạn
- [Complete Flow](./COMPLETE-FLOW.md) - Flow nghiệp vụ hoàn chỉnh

## Hỗ trợ

Liên hệ team Backend nếu có thắc mắc về API.
