# API Documentation - Phiếu đề nghị thanh toán

Tài liệu mô tả flow nghiệp vụ và test cases cho chức năng Phiếu đề nghị thanh toán.

## 📋 Overview

**Project**: Accounting System
**Module**: Payment Request (Phiếu đề nghị thanh toán)
**Base URL**: `http://localhost:3000`
**Version**: 1.0.0

---

## 🔐 Tài khoản Test

### Danh sách tài khoản theo vai trò

| Bước | Vai trò | Username | Password | Chức năng |
|------|---------|----------|----------|-----------|
| 0 | Người tạo phiếu | 55555 | 55555 | Tạo phiếu đề nghị thanh toán |
| 1 | Trưởng đơn vị/Bộ phận | 140290 | 1900779936 | Duyệt bước 1 |
| 2 | Kế toán hàng hóa | 0091 | 0091 | Duyệt nếu là lọ hàng hóa |
| 3 | Kế toán tài sản | 0025 | 0001 | Duyệt nếu là lọ tài sản |
| 4 | Kế toán thuế | 44444 | 44444 | Duyệt thuế |
| 5 | Kế toán thanh toán | 11111 | 11111 | Tạo hạch toán và duyệt |
| 6 | TBP KTTT | 22222 | 22222 | Duyệt/sửa hạch toán |
| 7 | Kế toán trưởng | 33333 | 33333 | Duyệt cuối (tạo lịch chi) |

---

### Loại thanh toán

- **cash**: Tiền mặt (không cần thông tin đối tượng chi)
- **bank_transfer**: Chuyển khoản (cần thông tin đối tượng chi)

### Workplace Type

- **0**: Cửa hàng / Chi nhánh (Branch/Store)
- **1**: Phòng ban / Bộ phận (Department)

---

## 🔄 Flow nghiệp vụ đầy đủ

### Workflow: Tạo và duyệt phiếu đề nghị thanh toán

```
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 0: TẠO PHIẾU                                          │
│ User: 55555/55555                                          │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login                                                   │
│ 2. Lấy thông tin cần thiết:                               │
│    - Danh sách Jar (lọ ngân sách)                         │
│    - Danh sách đơn vị tính                                │
│    - Danh sách đối tượng chi (nếu chuyển khoản)           │
│ 3. Upload file đính kèm (nếu có)                          │
│ 4. Tạo phiếu đề nghị thanh toán                           │
│    POST /api/payment-request                              │
│ 5. Lưu lại payment_request_id                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 1: TRƯỞNG ĐƠN VỊ DUYỆT                               │
│ User: 140290/1900779936                                    │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Trưởng đơn vị                      │
│ 2. Xem chi tiết phiếu                                      │
│    GET /api/payment-request/detail/{id}                   │
│ 3. Duyệt hoặc từ chối                                      │
│    PUT /api/payment-request/status/{id}                   │
│    Body: { "status": "approved" }                         │
│         hoặc { "status": "rejected", "reason": "..." }    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 2: KẾ TOÁN HÀNG HÓA DUYỆT (Nếu là lọ hàng hóa)       │
│ User: 0091/0091                                            │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Kế toán hàng hóa                   │
│ 2. Kiểm tra phiếu thuộc lọ hàng hóa                       │
│ 3. Tạo hóa đơn/hợp đồng (nếu cần)                         │
│    PUT /api/payment-request/invoices/{id}                 │
│    PUT /api/payment-request/contracts/{id}                │
│ 4. Duyệt phiếu                                             │
│    PUT /api/payment-request/status/{id}                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 3: KẾ TOÁN TÀI SẢN DUYỆT (Nếu là lọ tài sản)         │
│ User: 0025/0001                                            │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Kế toán tài sản                    │
│ 2. Kiểm tra phiếu thuộc lọ tài sản                        │
│ 3. Tạo hóa đơn/hợp đồng (nếu cần)                         │
│ 4. Duyệt phiếu                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 4: KẾ TOÁN THUẾ DUYỆT                                │
│ User: 44444/44444                                          │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Kế toán thuế                       │
│ 2. Kiểm tra thông tin thuế                                │
│ 3. Duyệt phiếu                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 5: KẾ TOÁN THANH TOÁN TẠO HẠCH TOÁN VÀ DUYỆT        │
│ User: 11111/11111                                          │
│ ─────────────────────────────────────────────────────────  │
│ ⚠️  QUAN TRỌNG: Phải tạo hạch toán trước khi duyệt        │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Kế toán thanh toán                 │
│ 2. Tạo hóa đơn (bắt buộc)                                 │
│    PUT /api/payment-request/invoices/{id}                 │
│ 3. Tạo hợp đồng (tùy chọn)                                │
│    PUT /api/payment-request/contracts/{id}                │
│ 4. Duyệt phiếu                                             │
│    PUT /api/payment-request/status/{id}                   │
│                                                            │
│ ❌ Lỗi nếu chưa tạo hạch toán:                            │
│    "Hạch toán phải được tạo trước khi duyệt ở bước này"   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 6: TBP KTTT DUYỆT/SỬA HẠCH TOÁN                      │
│ User: 22222/22222                                          │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Trưởng bộ phận KTTT                │
│ 2. Kiểm tra hạch toán                                      │
│ 3. Sửa hạch toán nếu cần                                   │
│ 4. Duyệt phiếu                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ BƯỚC 7: KẾ TOÁN TRƯỞNG DUYỆT CUỐI (TẠO LỊCH CHI)          │
│ User: 33333/33333                                          │
│ ─────────────────────────────────────────────────────────  │
│ ⚠️  QUAN TRỌNG: Sau khi duyệt sẽ tự động tạo lịch chi     │
│ ─────────────────────────────────────────────────────────  │
│ 1. Login với tài khoản Kế toán trưởng                     │
│ 2. Kiểm tra toàn bộ phiếu                                  │
│ 3. Chọn ngày chi (disbursement_date)                      │
│ 4. Duyệt phiếu                                             │
│    PUT /api/payment-request/status/{id}                   │
│    Body: {                                                │
│      "status": "approved",                                │
│      "disbursement_date": "2025-12-20"                    │
│    }                                                      │
│                                                            │
│ ✅ Kết quả:                                               │
│    - Phiếu được duyệt hoàn tất                            │
│    - Tự động tạo lịch chi (trạng thái chờ)                │
│                                                            │
│ ❌ Lỗi có thể xảy ra:                                     │
│    - "Vui lòng chọn ngày chi trước khi duyệt"             │
│    - "Lịch chi không được trước ngày hiện tại"            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Test Cases chi tiết

### TC01: Tạo phiếu thanh toán bằng tiền mặt

**Mục đích**: Tạo phiếu đề nghị thanh toán với hình thức tiền mặt

**Precondition**:
- Đã login với tài khoản 55555/55555
- Có token hợp lệ

**Steps**:
1. Lấy danh sách đơn vị tính: `GET /api/units`
2. Tạo phiếu: `POST /api/payment-request`

**Request Body**:
```json
{
  "date": "2025-12-15",
  "has_advance": false,
  "requester_id": "3d9caa7b-52f0-e711-10da-00155d0a0504",
  "workplace_id": "5ca2799b-8bd8-e711-80d9-00155d0a0504",
  "workplace_type": 0,
  "jar_id": "38fef5aa-c952-49d7-8c0a-9d717668b07a",
  "content": "Thanh toán văn phòng phẩm",
  "payment_type": "cash",
  "previous_payments": 0,
  "payment_details": [
    {
      "description": "Giấy A4",
      "unit_id": "{unit_id_from_api}",
      "quantity": 10,
      "price": 50000,
      "tax": 10,
      "amount": 550000
    }
  ]
}
```

**Expected Result**:
- ✅ Status: 201 Created
- Response: `{ "id": "{payment_request_id}" }`

---

### TC02: Tạo phiếu thanh toán bằng chuyển khoản

**Mục đích**: Tạo phiếu với hình thức chuyển khoản (có đối tượng chi)

**Precondition**:
- Đã login với tài khoản 55555/55555
- Đã lấy danh sách đối tượng chi

**Steps**:
1. Lấy danh sách đối tượng chi: `GET /api/disburser/all`
2. Tạo phiếu với payment_type = "bank_transfer"

**Request Body**:
```json
{
  "date": "2025-12-15",
  "has_advance": false,
  "requester_id": "3d9caa7b-52f0-e711-10da-00155d0a0504",
  "workplace_id": "5ca2799b-8bd8-e711-80d9-00155d0a0504",
  "workplace_type": 0,
  "jar_id": "38fef5aa-c952-49d7-8c0a-9d717668b07a",
  "content": "Thanh toán nhà cung cấp",
  "payment_type": "bank_transfer",
  "disburser_id": "{disburser_id}",
  "disburser_name": "Công ty TNHH ABC",
  "disburser_bank_account_number": "1234567890",
  "disburser_bank_account_name": "CONG TY TNHH ABC",
  "disburser_bank_name": "Vietcombank",
  "payment_details": [...]
}
```

**Expected Result**:
- ✅ Status: 201 Created

**Validation**:
- ❌ Thiếu thông tin ngân hàng → 400 "Với hình thức chuyển khoản, các trường thông tin người chi và tài khoản ngân hàng là bắt buộc"

---

### TC03: Tạo phiếu có tạm ứng

**Mục đích**: Tạo phiếu tham chiếu đến phiếu tạm ứng

**Request Body**:
```json
{
  "date": "2025-12-15",
  "has_advance": true,
  "advance_code": ["PTU0001", "PTU0002"],
  "previous_payments": 5000000,
  ...
}
```

**Validation**:
- ❌ has_advance = true nhưng không có advance_code → 400 "Yêu cầu tạm ứng là bắt buộc khi tạo phiếu thanh toán có tạm ứng"
- ❌ Tạm ứng không tồn tại hoặc chưa hoàn thành → 400 "Yêu cầu tạm ứng không tồn tại hoặc chưa hoàn thành"

---

### TC04: Upload file đính kèm

**Mục đích**: Upload file và đính kèm vào phiếu

**Steps**:
1. Upload file: `POST /api/files/upload`
   - Content-Type: multipart/form-data
   - Field: 'file'
2. Lấy file_id từ response
3. Tạo/cập nhật phiếu với file_ids: ["{file_id}"]

**Expected Result**:
- ✅ File được upload thành công
- Response: `{ "id": "{file_id}", "filename": "...", "url": "..." }`

---

### TC05: Duyệt phiếu - Trưởng đơn vị (Bước 1)

**Mục đích**: Trưởng đơn vị duyệt phiếu

**Precondition**:
- Phiếu đã được tạo
- Login với tài khoản 140290/1900779936

**Request**:
```http
PUT /api/payment-request/status/{id}
Body: { "status": "approved" }
```

**Expected Result**:
- ✅ Status: 200 OK
- Phiếu chuyển sang bước tiếp theo

---

### TC06: Từ chối phiếu

**Mục đích**: Người duyệt từ chối phiếu

**Request**:
```http
PUT /api/payment-request/status/{id}
Body: {
  "status": "rejected",
  "reason": "Thiếu chứng từ đính kèm"
}
```

**Validation**:
- ❌ Từ chối nhưng không có reason → 400 "Vui lòng ghi rõ lý do từ chối"

**Expected Result**:
- ✅ Status: 200 OK
- Phiếu bị từ chối, trả về người tạo

---

### TC07: Tạo hóa đơn - Kế toán thanh toán (Bước 5)

**Mục đích**: Kế toán thanh toán tạo hạch toán (bắt buộc)

**Precondition**:
- Phiếu đã qua bước 4
- Login với tài khoản 11111/11111

**Request**:
```http
PUT /api/payment-request/invoices/{id}
Body: [
  {
    "code": "HD001",
    "date": "2025-12-15",
    "amount": 11000000,
    "description": "Hóa đơn văn phòng phẩm"
  }
]
```

**Expected Result**:
- ✅ Status: 201 Created
- Hóa đơn được tạo thành công

---

### TC08: Duyệt thiếu hạch toán (Lỗi)

**Mục đích**: Kiểm tra validation khi duyệt mà chưa tạo hạch toán

**Precondition**:
- Login với tài khoản 11111/11111 (Kế toán thanh toán)
- CHƯA tạo hóa đơn

**Request**:
```http
PUT /api/payment-request/status/{id}
Body: { "status": "approved" }
```

**Expected Result**:
- ❌ Status: 400 Bad Request
- Error: "Hạch toán phải được tạo trước khi duyệt ở bước này"

---

### TC09: Duyệt cuối - Kế toán trưởng (Bước 7)

**Mục đích**: Kế toán trưởng duyệt cuối và tạo lịch chi

**Precondition**:
- Phiếu đã qua tất cả bước duyệt
- Login với tài khoản 33333/33333

**Request**:
```http
PUT /api/payment-request/status/{id}
Body: {
  "status": "approved",
  "disbursement_date": "2025-12-20"
}
```

**Expected Result**:
- ✅ Status: 200 OK
- Phiếu được duyệt hoàn tất
- Tự động tạo lịch chi với trạng thái chờ

**Validation**:
- ❌ Không có disbursement_date → 400 "Vui lòng chọn ngày chi trước khi duyệt"
- ❌ disbursement_date < ngày hiện tại → 400 "Lịch chi không được trước ngày hiện tại"

---

### TC10: Cập nhật phiếu đang duyệt (Lỗi)

**Mục đích**: Kiểm tra không cho sửa phiếu đang trong quá trình duyệt

**Request**:
```http
PUT /api/payment-request/{id}
Body: { ... }
```

**Expected Result**:
- ❌ Status: 400 Bad Request
- Error: "Đang trong quá trình duyệt không thể sửa"

---

### TC11: Cập nhật phiếu đã hoàn thành (Lỗi)

**Expected Result**:
- ❌ Status: 400 Bad Request
- Error: "Bạn không được phép sửa yêu cầu đã hoàn thành"

---

### TC12: Thay đổi nơi làm việc sau khi Trưởng BP đã duyệt (Lỗi)

**Expected Result**:
- ❌ Status: 400 Bad Request
- Error: "Không thể thay đổi nơi làm việc khi trưởng bộ phận hiện tại đã duyệt, nếu sai bộ phận vui lòng từ chối yêu cầu và tạo lại"

---

### TC13: Thêm comment vào phiếu

**Mục đích**: Trao đổi thông tin giữa các bước duyệt

**Request**:
```http
POST /api/payment-request/{id}/comments
Body: {
  "content": "Vui lòng bổ sung chứng từ",
  "parent_id": null
}
```

**Expected Result**:
- ✅ Status: 201 Created
- Comment được thêm thành công

---

### TC14: In phiếu PDF

**Request**:
```http
GET /api/payment-request/print/{id}
```

**Expected Result**:
- ✅ Status: 200 OK
- Content-Type: application/pdf
- File PDF được download

---

### TC15: Lấy danh sách phiếu với filter

**Request**:
```http
GET /api/payment-request?page=1&limit=10&status=approved&from_date=2025-12-01&to_date=2025-12-31
```

**Expected Result**:
- ✅ Status: 200 OK
- Danh sách phiếu với phân trang
- Tổng số tiền (total_final_sum)

---

## ⚠️ Error Codes và Messages

| Code | Message | Nguyên nhân |
|------|---------|-------------|
| 400 | Đang trong quá trình duyệt không thể sửa | Sửa phiếu đang duyệt |
| 400 | Bạn không được phép sửa yêu cầu đã hoàn thành | Sửa phiếu đã hoàn thành |
| 400 | Hạch toán phải được tạo trước khi duyệt ở bước này | Duyệt bước 5 chưa tạo hóa đơn |
| 400 | Với hình thức chuyển khoản, các trường thông tin người chi và tài khoản ngân hàng là bắt buộc | Thiếu thông tin đối tượng chi |
| 400 | Vui lòng ghi rõ lý do từ chối | Từ chối không có lý do |
| 400 | Vui lòng chọn ngày chi trước khi duyệt | Bước 7 thiếu ngày chi |
| 400 | Lịch chi không được trước ngày hiện tại | Ngày chi không hợp lệ |
| 400 | Yêu cầu tạm ứng không tồn tại hoặc chưa hoàn thành | Tạm ứng không hợp lệ |
| 400 | Không thể thay đổi nơi làm việc... | Sửa workplace sau khi BP duyệt |
| 400 | Yêu cầu tạm ứng là bắt buộc... | has_advance=true nhưng thiếu advance_code |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 404 | Yêu cầu thanh toán không tồn tại | ID không tồn tại |

---

## 📌 Lưu ý quan trọng

### 1. Workflow duyệt

- **Bước 2 và 3**: Chỉ áp dụng nếu phiếu thuộc lọ hàng hóa hoặc tài sản tương ứng
- **Bước 5**: BẮT BUỘC phải tạo hóa đơn trước khi duyệt
- **Bước 7**: Sau khi duyệt sẽ tự động tạo lịch chi

### 2. Validation quan trọng

- Hình thức **chuyển khoản** phải có đầy đủ thông tin đối tượng chi
- Không thể sửa phiếu khi đang trong quá trình duyệt
- Không thể thay đổi nơi làm việc sau khi Trưởng BP đã duyệt
- Phiếu có tạm ứng phải tham chiếu đến phiếu tạm ứng đã hoàn thành

### 3. Business Rules

- **previous_payments**: Tổng tiền đã thanh toán từ các phiếu tạm ứng
- **payment_details**: Chi tiết các khoản thanh toán (description, unit, quantity, price, tax, amount)
- **payment_documents**: Chứng từ đính kèm (hóa đơn, hợp đồng)
- **file_ids**: Danh sách file đính kèm (scan chứng từ gốc)

### 4. Permissions

- Mỗi bước duyệt chỉ có người có quyền tương ứng mới được duyệt
- Người tạo có thể sửa phiếu khi chưa vào quá trình duyệt
- Comment có thể được thêm bởi bất kỳ ai liên quan đến phiếu

---

## 🔗 API Dependencies

Các API cần thiết để tạo phiếu:

1. **GET /api/jar** - Lấy danh sách lọ ngân sách
2. **GET /api/disburser/all** - Lấy danh sách đối tượng chi
3. **GET /api/units** - Lấy danh sách đơn vị tính
4. **POST /api/files/upload** - Upload file đính kèm
5. **GET /api/document-type** - Lấy loại chứng từ (cho payment_documents)

---

## 📊 Response Format

### Success Response (Create)
```json
{
  "id": "uuid-string",
  "message": "Success"
}
```

### Success Response (Detail)
```json
{
  "id": "uuid",
  "code": "PDNTT001",
  "date": "2025-12-15",
  "content": "Thanh toán văn phòng phẩm",
  "payment_type": "cash",
  "jar": { "id": "...", "name": "..." },
  "requester": { "id": "...", "name": "..." },
  "workplace": { "id": "...", "name": "..." },
  "payment_details": [...],
  "payment_documents": [...],
  "file_ids": [...],
  "approval_status": "in_progress",
  "created_at": "2025-12-15T10:00:00Z"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

---

## 📅 Timeline

- Token expiration: 24 giờ
- Timestamps: ISO 8601 format
- Date format: YYYY-MM-DD

---

**Last Updated**: 2025-12-15
**Version**: 1.0.0
