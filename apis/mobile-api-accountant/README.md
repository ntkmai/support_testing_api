# Mobile API Documentation

Tài liệu API đầy đủ cho Ứng dụng Kế toán Mobile.

---

## Bắt đầu nhanh

### Authentication

Tất cả API requests cần header:
```
x-auth: YOUR_TOKEN
```

Tương tự như hệ thống icool-staff.

### Base URL

```
Development: http://localhost:3000
TEST: http://ketoan.vtcode.vn:3006
```

---

## Cấu trúc tài liệu

### 1. Tổng quan
- [OVERVIEW.md](./OVERVIEW.md) - Tổng quan hệ thống, khả năng của từng module

### 2. Tài liệu chung
- [COMMON-INTERFACES.md](./COMMON-INTERFACES.md) - Interfaces TypeScript chi tiết cho tất cả responses
- [TEST-ACCOUNTS.md](./TEST-ACCOUNTS.md) - Tài khoản test và quyền duyệt

### 3. Hướng dẫn từng module

| Module | File | Độ ưu tiên |
|--------|------|------------|
| 1. Tỷ lệ lọ | [1-JAR-RATIO-GUIDE.md](./1-JAR-RATIO-GUIDE.md) | Trung bình |
| 2. Đối tượng chi | [2-DISBURSER-GUIDE.md](./2-DISBURSER-GUIDE.md) | **Cao** (CRUD đầy đủ) |
| 3. Phiếu thanh toán | [3-PAYMENT-REQUEST-GUIDE.md](./3-PAYMENT-REQUEST-GUIDE.md) | **Cao** (Phức tạp) |
| 4. Phiếu tạm ứng | [4-ADVANCE-REQUEST-GUIDE.md](./4-ADVANCE-REQUEST-GUIDE.md) | Cao |
| 5a. Lịch chi | [5a-PAYMENT-VOUCHER-GUIDE.md](./5a-PAYMENT-VOUCHER-GUIDE.md) | **Cao** (Giai đoạn 1) |
| 5b. Phiếu chi | [5b-DISBURSEMENT-RECEIPT-GUIDE.md](./5b-DISBURSEMENT-RECEIPT-GUIDE.md) | **Cao** (Giai đoạn 2) |
| 5c. Phiếu thu | [5c-REVENUE-RECEIPT-GUIDE.md](./5c-REVENUE-RECEIPT-GUIDE.md) | Cao (Endpoint mới) |

### 4. Test Collections (JSON)

Các file JSON để import vào API testing tools (Postman, Insomnia, etc.):

```
../1-jar-ratio-api.json
../2-disburser-api.json
../3-payment-request-api.json
../4-advance-request-api.json
../5-payment-voucher-api.json
```

---

## Tính năng chính trên Mobile

| Module | Xem | Tạo | Sửa | Xóa | Duyệt |
|--------|-----|-----|-----|-----|-------|
| Tỷ lệ lọ | ✅ | ❌ | ❌ | ❌ | ✅ Bước 1 |
| Đối tượng chi | ✅ | ✅ | ✅ | ✅ | N/A |
| Phiếu thanh toán | ✅ | ❌ | ❌ | ❌ | ✅ Bước 1, 5-6 |
| Phiếu tạm ứng | ✅ | ❌ | ❌ | ❌ | ✅ Bước 1, 5-6 |
| Lịch chi | ✅ | ❌ | ❌ | ❌ | ✅ 3 bước |
| Phiếu chi | ✅ | ❌ | ❌ | ❌ | ✅ 3 bước + Hoàn thành |
| Phiếu thu | ✅ | ❌ | ❌ | ❌ | ✅ Tất cả |

### Chú thích:
- ✅ = Có thể thực hiện trên Mobile
- ❌ = Chỉ có thể thực hiện trên Web
- ⚠️ = Có thể thực hiện nhưng có cảnh báo

---

## Workflow hoàn chỉnh

### Flow 1: Phiếu thanh toán → Chi tiền

```
1. [WEB] Tạo Payment Request
   ↓
2. [MOBILE ✅] Trưởng bộ phận duyệt (Bước 1)
   ↓
3. [WEB] KT Tài sản/Hàng hóa duyệt (Bước 2)
   ↓
4. [WEB] KT Thuế duyệt (Bước 3)
   ↓
5. [WEB] KT Thanh toán tạo hạch toán (Bước 4)
   ↓
6. [MOBILE ⚠️] TBP KTTT duyệt (Bước 5 - Có cảnh báo)
   ↓
7. [MOBILE ⚠️] Kế toán trưởng duyệt (Bước 6)
   → Tạo Lịch chi tự động
   ↓
8. [MOBILE ✅] Ngân quỹ chọn ngày chi + tài khoản nguồn
   ↓
9. [MOBILE ✅] Giám đốc Tài chính duyệt lịch chi
   ↓
10. [MOBILE ✅] Tổng Giám đốc duyệt lịch chi
    → Tạo Phiếu chi tự động
    ↓
11. [MOBILE ✅] 3 người duyệt Phiếu chi (Ngân quỹ, GĐ TC, Tổng GĐ)
    ↓
12. [MOBILE ✅] Ngân quỹ cập nhật hoàn thành
    ✅ ĐÃ CHI TIỀN!
```

### Flow 2: Phiếu tạm ứng → Chi tiền

```
Tương tự Flow 1, nhưng:
- Phiếu tạm ứng KHÔNG có tax trong chi tiết
- Không có hóa đơn/hợp đồng ban đầu
- Sau khi chi tiền, nhân viên phải quyết toán trên Web
```

---

## Quyền duyệt trên Mobile

| Vai trò | Username | Password | Module | Bước |
|---------|----------|----------|--------|------|
| Trưởng bộ phận | 55555 | 55555 | Tỷ lệ lọ | Bước 1 ✅ |
| Trưởng bộ phận | 55555 | 55555 | Phiếu thanh toán/tạm ứng | Bước 1 ✅ |
| TBP KTTT | 22222 | 22222 | Phiếu thanh toán/tạm ứng | Bước 5 ⚠️ |
| Kế toán trưởng | 33333 | 33333 | Phiếu thanh toán/tạm ứng | Bước 6 ⚠️ |
| Ngân quỹ | 797979 | 666666 | Lịch chi | Chọn ngày + TK ✅ |
| GĐ Tài chính | 55555 | 55555 | Lịch chi | Bước 2 ✅ |
| Tổng GĐ | 0018 | 0018 | Lịch chi | Bước 3 ✅ |
| Ngân quỹ | 797979 | 666666 | Phiếu chi | Bước 1, Hoàn thành ✅ |
| GĐ Tài chính | 55555 | 55555 | Phiếu chi | Bước 2 ✅ |
| Tổng GĐ | 0018 | 0018 | Phiếu chi | Bước 3 ✅ |

Xem chi tiết: [TEST-ACCOUNTS.md](./TEST-ACCOUNTS.md)

---

## Lưu ý quan trọng

### 1. Endpoint đã thay đổi

**Phiếu thu** đã chuyển endpoint:
```diff
- GET /api/revenue-receipt
+ GET /api/payment-voucher?type=collect
```

### 2. Phân biệt loại phiếu

**Phiếu thanh toán vs Tạm ứng**:
```javascript
// Chỉ lấy phiếu thanh toán (KHÔNG bao gồm tạm ứng)
GET /api/payment-request?exclude_advance=true

// Chỉ lấy phiếu tạm ứng
GET /api/advance-request
```

**Lịch chi vs Phiếu thu**:
```javascript
// Lịch chi (disbursement)
GET /api/payment-voucher?type=disbursement

// Phiếu thu (collect)
GET /api/payment-voucher?type=collect
```

### 3. Cảnh báo khi duyệt Bước 5-6

Khi duyệt bước 5-6 của phiếu thanh toán/tạm ứng trên mobile, hiển thị popup cảnh báo:

```
⚠️ BẠN ĐANG DUYỆT TRÊN MOBILE

Không thể sửa hạch toán trên mobile.
Vui lòng kiểm tra kỹ trước khi duyệt.

[Hủy]  [Tiếp tục duyệt]
```

### 4. Web Only Steps

Một số bước chỉ có thể duyệt trên Web:
- KT Tài sản/Hàng hóa (Bước 2) - Phải chỉnh sửa chứng từ
- KT Thuế (Bước 3) - Phải thêm hóa đơn/hợp đồng
- KT Thanh toán (Bước 4) - Phải tạo hạch toán

API sẽ trả về error với `code: "WEB_ONLY_STEP"` khi cố gắng duyệt trên mobile.

### 5. Tự động tạo

Một số phiếu được tạo TỰ ĐỘNG, không thể tạo thủ công trên mobile:
- Lịch chi: Tự động tạo sau khi phiếu thanh toán/tạm ứng hoàn thành bước 6
- Phiếu chi: Tự động tạo sau khi Tổng GĐ duyệt lịch chi

---

## Response Format Chung

### Success Response

```typescript
{
  success: true;
  data: T;
  message?: string;
  warning?: string;  // Chỉ có khi duyệt bước 5-6
}
```

### Error Response

```typescript
{
  success: false;
  error: string;
  code: string;
  details?: any;
}
```

### Paginated Response

```typescript
{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

---

## Implement Priorities

### Phase 1 - Essential (Ưu tiên cao)

1. **Đối tượng chi** (CRUD đầy đủ)
   - [2-DISBURSER-GUIDE.md](./2-DISBURSER-GUIDE.md)
   - Cần thiết để tạo phiếu trên Web

2. **Phiếu thanh toán** (Xem và Duyệt)
   - [3-PAYMENT-REQUEST-GUIDE.md](./3-PAYMENT-REQUEST-GUIDE.md)
   - Module chính, workflow phức tạp nhất

3. **Lịch chi** (Xem và Duyệt)
   - [5a-PAYMENT-VOUCHER-GUIDE.md](./5a-PAYMENT-VOUCHER-GUIDE.md)
   - Giai đoạn 1: Chọn ngày chi, duyệt 3 bước

4. **Phiếu chi** (Xem, Duyệt và Hoàn thành)
   - [5b-DISBURSEMENT-RECEIPT-GUIDE.md](./5b-DISBURSEMENT-RECEIPT-GUIDE.md)
   - Giai đoạn 2: Duyệt 3 bước + hoàn thành

### Phase 2 - Important (Ưu tiên trung bình)

5. **Phiếu tạm ứng** (Xem và Duyệt)
   - [4-ADVANCE-REQUEST-GUIDE.md](./4-ADVANCE-REQUEST-GUIDE.md)
   - Tương tự phiếu thanh toán

6. **Phiếu thu** (Xem và Duyệt)
   - [5c-REVENUE-RECEIPT-GUIDE.md](./5c-REVENUE-RECEIPT-GUIDE.md)
   - **QUAN TRỌNG**: Endpoint mới `/payment-voucher?type=collect`

7. **Tỷ lệ lọ** (Xem và Duyệt bước 1)
   - [1-JAR-RATIO-GUIDE.md](./1-JAR-RATIO-GUIDE.md)
   - Ít thao tác nhất

### Phase 3 - Enhancement (Tương lai)

- Báo cáo trích lọ
- Thống kê
- Notifications
- Offline mode

---

## Support & Contact

- **API Documentation**: Xem các file guide trong thư mục này
- **Test Collections**: Import các file JSON ở thư mục cha
- **Issues**: Liên hệ team Backend

---

**Last Updated**: 2025-12-29
**Version**: 1.0.0
**Maintained by**: Backend Team
