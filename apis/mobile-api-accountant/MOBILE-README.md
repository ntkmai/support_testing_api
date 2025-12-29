# Mobile API Test Collection - Hướng dẫn sử dụng

Thư mục này chứa tài liệu API và test collection cho **Ứng dụng Kế toán Mobile**.

## 📁 Cấu trúc file

```
mobile-api-accountant/
├── 📚 Tài liệu chính (docs/)
│   ├── README.md                           # Tổng quan tài liệu
│   ├── OVERVIEW.md                         # Giới thiệu hệ thống
│   ├── COMMON-INTERFACES.md                # Interface TypeScript
│   ├── TEST-ACCOUNTS.md                    # Tài khoản test
│   ├── 1-JAR-RATIO-GUIDE.md               # Hướng dẫn Tỷ lệ lọ
│   ├── 2-DISBURSER-GUIDE.md               # Hướng dẫn Đối tượng chi
│   ├── 3-PAYMENT-REQUEST-GUIDE.md         # Hướng dẫn Phiếu thanh toán
│   ├── 4-ADVANCE-REQUEST-GUIDE.md         # Hướng dẫn Phiếu tạm ứng
│   ├── 5a-PAYMENT-VOUCHER-GUIDE.md        # Hướng dẫn Lịch chi
│   ├── 5b-DISBURSEMENT-RECEIPT-GUIDE.md   # Hướng dẫn Phiếu chi
│   └── 5c-REVENUE-RECEIPT-GUIDE.md        # Hướng dẫn Phiếu thu
├── 🧪 Test Collections (JSON)
│   ├── 1-jar-ratio-api.json               # API test Tỷ lệ lọ
│   ├── 2-disburser-api.json               # API test Đối tượng chi
│   ├── 3-payment-request-api.json         # API test Phiếu thanh toán
│   ├── 4-advance-request-api.json         # API test Phiếu tạm ứng
│   └── 5-payment-voucher-api.json         # API test Lịch chi & Phiếu chi
├── MOBILE-README.md                        # File này
└── manifest.json                           # Metadata và cấu hình
```

## 🚀 Quick Start

### 1. Đọc tài liệu API

**Bắt đầu tại đây**: [`README.md`](./README.md) (trong folder này)

Hoặc xem tổng quan: [`OVERVIEW.md`](./OVERVIEW.md)

Tài liệu bao gồm:
- ✅ Hướng dẫn chi tiết từng module (7 files guide riêng)
- ✅ Interface TypeScript đầy đủ
- ✅ Test cases cụ thể
- ✅ Tài khoản test và quyền
- ✅ Workflow nghiệp vụ hoàn chỉnh
- ✅ Lưu ý quan trọng cho Mobile

### 2. Import vào API Tester

Sử dụng các file JSON để test API:

```bash
# Tỷ lệ lọ
1-jar-ratio-api.json

# Đối tượng chi (CRUD đầy đủ)
2-disburser-api.json

# Phiếu thanh toán (chỉ xem và duyệt)
3-payment-request-api.json

# Phiếu tạm ứng (chỉ xem và duyệt)
4-advance-request-api.json

# Lịch chi (Giai đoạn 1)
5a-payment-voucher-api.json

# Phiếu chi (Giai đoạn 2)
5b-disbursement-receipt-api.json

# Phiếu thu
5c-revenue-receipt-api.json
```

## 📋 Modules Overview

| Module | Guide | Test JSON | Tính năng Mobile | Duyệt |
|--------|-------|-----------|------------------|-------|
| 1. Tỷ lệ lọ | [1-JAR-RATIO-GUIDE.md](./1-JAR-RATIO-GUIDE.md) | `1-jar-ratio-api.json` | Xem, Duyệt, Báo cáo | Bước 1 |
| 2. Đối tượng chi | [2-DISBURSER-GUIDE.md](./2-DISBURSER-GUIDE.md) | `2-disburser-api.json` | **CRUD đầy đủ** | N/A |
| 3. Phiếu thanh toán | [3-PAYMENT-REQUEST-GUIDE.md](./3-PAYMENT-REQUEST-GUIDE.md) | `3-payment-request-api.json` | Xem, Duyệt | Bước 1, 5-6 |
| 4. Phiếu tạm ứng | [4-ADVANCE-REQUEST-GUIDE.md](./4-ADVANCE-REQUEST-GUIDE.md) | `4-advance-request-api.json` | Xem, Duyệt | Bước 1, 5-6 |
| 5a. Lịch chi | [5a-PAYMENT-VOUCHER-GUIDE.md](./5a-PAYMENT-VOUCHER-GUIDE.md) | `5a-payment-voucher-api.json` | Xem, Duyệt (3 bước) | Tất cả |
| 5b. Phiếu chi | [5b-DISBURSEMENT-RECEIPT-GUIDE.md](./5b-DISBURSEMENT-RECEIPT-GUIDE.md) | `5b-disbursement-receipt-api.json` | Xem, Duyệt, Hoàn thành | Tất cả |
| 5c. Phiếu thu | [5c-REVENUE-RECEIPT-GUIDE.md](./5c-REVENUE-RECEIPT-GUIDE.md) | `5c-revenue-receipt-api.json` | Xem, Duyệt | Tất cả |

## 🎯 Tính năng chính

### ✅ Có thể làm trên Mobile

1. **Tỷ lệ lọ**
   - Xem danh sách theo tháng/năm
   - Xem chi tiết
   - Duyệt/Từ chối (Bước 1 - Trưởng bộ phận)
   - Xem báo cáo trích lọ

2. **Đối tượng chi**
   - Xem danh sách (phân trang)
   - Tìm kiếm
   - **Tạo mới** ✨
   - **Sửa** ✨
   - **Xóa** ✨

3. **Phiếu đề nghị thanh toán**
   - Xem danh sách (không bao gồm tạm ứng)
   - Xem danh sách chờ duyệt (`only_my_turn=true`)
   - Xem chi tiết đầy đủ
   - Duyệt/Từ chối (Bước 1, 5-6)

4. **Phiếu đề nghị tạm ứng**
   - Xem danh sách
   - Xem danh sách chờ duyệt
   - Xem chi tiết
   - Duyệt/Từ chối

5. **Lịch chi** (Giai đoạn 1)
   - Xem danh sách lịch chi
   - Ngân quỹ chọn ngày chi + tài khoản nguồn
   - GĐ Tài chính duyệt
   - Tổng GĐ duyệt → Tạo phiếu chi tự động

6. **Phiếu chi** (Giai đoạn 2)
   - Xem danh sách phiếu chi
   - Duyệt phiếu chi (3 bước: Ngân quỹ, GĐ TC, Tổng GĐ)
   - Ngân quỹ cập nhật hoàn thành

7. **Phiếu thu**
   - Xem danh sách phiếu thu
   - Duyệt phiếu thu (2-3 bước)
   - **QUAN TRỌNG**: Endpoint mới `/payment-voucher?type=collect`

### ❌ KHÔNG thể làm trên Mobile

1. **Tỷ lệ lọ**
   - Tạo/Sửa tỷ lệ (Web only)
   - Duyệt bước 2-3 (KT Tài sản, KT Thuế)

2. **Phiếu đề nghị thanh toán/tạm ứng**
   - Tạo phiếu mới (Web only)
   - Sửa phiếu (Web only)
   - Duyệt bước 2-4 (Web only - phải chỉnh sửa chứng từ)

3. **Lịch chi, Phiếu chi, Phiếu thu**
   - Tạo lịch chi (tự động từ phiếu thanh toán/tạm ứng)
   - Tạo phiếu chi (tự động từ lịch chi)
   - Tạo phiếu thu (Web only)

## ⚠️ Lưu ý quan trọng

### 1. Phân biệt phiếu thanh toán và tạm ứng

```javascript
// Chỉ lấy phiếu thanh toán (KHÔNG bao gồm tạm ứng)
GET /api/payment-request?exclude_advance=true

// Chỉ lấy phiếu tạm ứng
GET /api/advance-request
```

### 2. Endpoint phiếu thu đã thay đổi

```diff
- GET /api/revenue-receipt        ❌ CŨ (deprecated)
+ GET /api/payment-voucher?type=collect  ✅ MỚI
```

### 3. Hiển thị cảnh báo khi duyệt bước 5-6

Khi Trưởng bộ phận KT hoặc Kế toán trưởng duyệt trên mobile, cần hiển thị popup cảnh báo:

```
⚠️ BẠN ĐANG DUYỆT TRÊN MOBILE

Không thể sửa hạch toán trên mobile.
Vui lòng kiểm tra kỹ trước khi duyệt.

[Hủy]  [Tiếp tục duyệt]
```

### 4. Quyền duyệt trên Mobile

| Bước | Vai trò | Mobile | Lý do nếu không duyệt được |
|------|---------|--------|----------------------------|
| 1 | Trưởng bộ phận | ✅ Có | - |
| 2 | KT Tài sản | ❌ Không | Phải chỉnh sửa chứng từ đính kèm |
| 2 | KT Hàng hóa | ❌ Không | Phải chỉnh sửa chứng từ đính kèm |
| 2/3 | KT Thuế | ❌ Không | Phải thêm hóa đơn/hợp đồng |
| 4 | KT Thanh toán | ❌ Không | Phải tạo hạch toán |
| 5 | TBP KTTT | ⚠️ Có (cảnh báo) | Không sửa được hạch toán |
| 6 | Kế toán trưởng | ⚠️ Có (cảnh báo) | Duyệt cuối |

## 🔑 Test Accounts

```
┌─────────────────────┬──────────┬──────────┬─────────────────────┐
│ Vai trò             │ Username │ Password │ Quyền duyệt         │
├─────────────────────┼──────────┼──────────┼─────────────────────┤
│ Trưởng bộ phận      │ 55555    │ 55555    │ ✅ Bước 1 (Mobile)  │
│ KT Tài sản          │ 0025     │ 0001     │ ❌ Bước 2 (Web)     │
│ KT Hàng hóa         │ 0091     │ 0091     │ ❌ Bước 2 (Web)     │
│ KT Thuế             │ 44444    │ 44444    │ ❌ Bước 2/3 (Web)   │
│ KT Thanh toán       │ 11111    │ 11111    │ ❌ Bước 4 (Web)     │
│ TBP KTTT            │ 22222    │ 22222    │ ⚠️ Bước 5 (Mobile) │
│ Kế toán trưởng      │ 33333    │ 33333    │ ⚠️ Bước 6 (Mobile) │
│ Ngân quỹ            │ 797979   │ 666666   │ ✅ Lịch chi         │
│ GĐ Tài chính        │ 55555    │ 55555    │ ✅ Lịch chi         │
│ Tổng GĐ             │ 0018     │ 0018     │ ✅ Lịch chi         │
└─────────────────────┴──────────┴──────────┴─────────────────────┘
```

## 📖 Workflow hoàn chỉnh

Xem chi tiết workflow tại:
- [`README.md`](./README.md) - Tổng quan
- [`3-PAYMENT-REQUEST-GUIDE.md`](./3-PAYMENT-REQUEST-GUIDE.md) - Workflow phiếu thanh toán
- [`5a-PAYMENT-VOUCHER-GUIDE.md`](./5a-PAYMENT-VOUCHER-GUIDE.md) - Workflow lịch chi
- [`5b-DISBURSEMENT-RECEIPT-GUIDE.md`](./5b-DISBURSEMENT-RECEIPT-GUIDE.md) - Workflow phiếu chi

### Flow tóm tắt: Từ tạo phiếu đến chi tiền

```
1. [WEB] Tạo Payment Request
   ↓
2. [MOBILE] Trưởng bộ phận duyệt
   ↓
3-5. [WEB] KT Tài sản/Thuế/Thanh toán duyệt
   ↓
6-7. [MOBILE ⚠️] TBP KTTT + Kế toán trưởng duyệt
   → Tạo Lịch chi tự động
   ↓
8. [MOBILE] Ngân quỹ chọn ngày chi
   ↓
9-10. [MOBILE] GĐ TC + Tổng GĐ duyệt
   → Tạo Phiếu chi tự động
   ↓
11. [MOBILE] 3 người duyệt Phiếu chi
   ↓
12. [MOBILE] Ngân quỹ hoàn thành
   ✅ ĐÃ CHI TIỀN!
```

## 🧪 Test Scenarios

### Scenario 1: Duyệt phiếu thanh toán

```
1. Login với TK Trưởng bộ phận (55555/55555)
2. GET /payment-request?only_my_turn=true
   → Lấy danh sách phiếu chờ duyệt
3. GET /payment-request/:id
   → Xem chi tiết phiếu
4. POST /payment-request/:id/approve
   body: { "action": "approve", "note": "Đồng ý" }
   → Duyệt thành công
```

### Scenario 2: Tạo đối tượng chi

```
1. Login với TK bất kỳ
2. POST /disburser
   body: {
     "name": "Nguyen Van A",
     "bank_account_name": "NGUYEN VAN A",
     "bank_account_number": "123456789",
     "bank_name": "Vietcombank"
   }
   → Tạo thành công
3. GET /disburser?search=Nguyen
   → Tìm thấy đối tượng vừa tạo
```

### Scenario 3: Duyệt lịch chi và phiếu chi

```
1. Login với TK Ngân quỹ (797979/666666)
2. GET /payment-voucher?type=disbursement
   → Xem lịch chi
3. POST /payment-voucher/:id/select-payment-info
   → Chọn ngày chi + TK nguồn
4. Login với TK GĐ TC (55555/55555)
5. POST /payment-voucher/:id/approve
   → Duyệt
6. Login với TK Tổng GĐ (0018/0018)
7. POST /payment-voucher/:id/approve
   → Duyệt → Tạo phiếu chi
8. Duyệt phiếu chi (3 người)
9. POST /payment-voucher/:id/complete
   → Hoàn thành!
```

## 📞 Support

- **API Documentation**: [`MOBILE-API-DOCUMENT.md`](./MOBILE-API-DOCUMENT.md)
- **Template Reference**: [`api-json-template.json`](./api-json-template.json)
- **Issues**: Liên hệ team Backend

---

**Last Updated**: 2025-12-29
**Version**: 1.0.0
