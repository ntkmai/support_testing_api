# API Documentation - Advance Request (Phiếu Đề Nghị Tạm Ứng)

Tài liệu API cho module Phiếu Đề Nghị Tạm Ứng - Hệ thống Kế Toán

## 📋 Overview

**Module**: Advance Request (Phiếu Đề Nghị Tạm Ứng)  
**Base URL**: `http://localhost:3000`  
**Module Path**: `apps/api-gateway/src/modules/advance-request`  
**Version**: 1.0.0

## 🔐 Authentication & Roles

### Các tài khoản trong hệ thống

| Role                   | Username/Password | Mô tả                      |
| ---------------------- | ----------------- | -------------------------- |
| Trưởng bộ phận Đào Tạo | 55555/55555       | Tạo và duyệt bước 1        |
| Kế toán Tài Sản        | 0025/0001         | Duyệt lọ tài sản (bước 2)  |
| Kế toán Hàng Hóa       | 0091/0091         | Duyệt lọ hàng hóa (bước 2) |
| Kế toán Thuế           | 44444/44444       | Duyệt lọ thường (bước 2)   |
| Kế toán Thanh Toán     | 11111/11111       | Tạo hạch toán (bước 3)     |
| Trưởng BP Kế toán TT   | 22222/22222       | Duyệt bước 4               |
| Kế toán Trưởng         | 33333/33333       | Duyệt cuối (bước 5)        |

### Authentication Flow

```
POST /api/auth/login
Body: { "username": "55555", "password": "55555" }
Response: { "token": "jwt_token_here" }
```

---

## 🔄 Complete Workflow

### Quy trình phê duyệt phiếu tạm ứng

```
1. Tạo phiếu (55555/55555)
   ↓
2. Duyệt bước 1 - Trưởng bộ phận (55555/55555)
   ↓
3. Duyệt bước 2 - Kế toán (tùy loại lọ):
   - Lọ Tài Sản → 0025/0001
   - Lọ Hàng Hóa → 0091/0091
   - Lọ Khác → 44444/44444
   ↓
4. Tạo hạch toán - Kế toán Thanh Toán (11111/11111)
   ↓
5. Duyệt bước 3 - Kế toán Thanh Toán (11111/11111)
   ↓
6. Duyệt bước 4 - Trưởng BP Kế toán TT (22222/22222)
   ↓
7. Duyệt bước 5 - Kế toán Trưởng (33333/33333)
   ↓
8. Hoàn thành ✅
```

---

## 📦 API Endpoints

### 1. Tạo Phiếu Đề Nghị Tạm Ứng

**Endpoint**: `POST /api/advance-request`

**Headers**:

```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

**Request Body**:

```json
{
  "workplace_type": 1,
  "workplace_id": "e92cf911-b543-4638-b996-2c4441ca0480",
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "amount": 5000000,
  "description": "Tạm ứng mua thiết bị văn phòng",
  "documents": [
    {
      "type_document_id": "893721b5-f83a-4b20-8a41-215c99d2cef5",
      "ref_id": ["11111111-1111-1111-1111-111111111111"],
      "ref_code": ["REF001"]
    }
  ]
}
```

**Response**: `201 Created`

```json
{
  "id": "uuid",
  "status": "pending",
  "created_at": "2025-12-17T15:30:00Z"
}
```

**Test Cases**:

| Case | Jar Type                   | Expected                        |
| ---- | -------------------------- | ------------------------------- |
| TC01 | Lọ Tài Sản (a9656a3d-...)  | ✅ 201 - Kế toán tài sản duyệt  |
| TC02 | Lọ Hàng Hóa (7ce3b31a-...) | ✅ 201 - Kế toán hàng hóa duyệt |
| TC03 | Lọ Thường (2d3adfdf-...)   | ✅ 201 - Kế toán thuế duyệt     |
| TC04 | Thiếu workplace_id         | ❌ 400 Validation error         |
| TC05 | Thiếu documents            | ❌ 400 Validation error         |

---

### 2. Sửa Phiếu Đề Nghị Tạm Ứng

**Endpoint**: `PUT /api/advance-request/{id}`

**Lưu ý quan trọng**:

- DTO kế thừa từ DTO tạo phiếu, có thể cập nhật tất cả các field
- Có thể sửa một vài field hoặc toàn bộ thông tin
- Khi sửa sau khi bị từ chối, có thể chọn người hỗ trợ duyệt qua field `approved_id`

**Request Body (Full fields)**:

```json
{
  "workplace_type": 1,
  "workplace_id": "e92cf911-b543-4638-b996-2c4441ca0480",
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "amount": 7000000,
  "description": "Cập nhật số tiền tạm ứng",
  "documents": [
    {
      "type_document_id": "893721b5-f83a-4b20-8a41-215c99d2cef5",
      "ref_id": ["11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222"],
      "ref_code": ["REF001", "REF002"]
    }
  ]
}
```

**Request Body (Partial update)**:

```json
{
  "amount": 8000000,
  "description": "Chỉ cập nhật số tiền"
}
```

**Request Body (Sau khi từ chối - Có người hỗ trợ)**:

```json
{
  "workplace_type": 1,
  "workplace_id": "e92cf911-b543-4638-b996-2c4441ca0480",
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "amount": 9000000,
  "description": "Đã bổ sung đầy đủ chứng từ theo yêu cầu",
  "approved_id": "d24f5b81-61f0-e711-80da-00155d0a0504",
  "documents": [
    {
      "type_document_id": "893721b5-f83a-4b20-8a41-215c99d2cef5",
      "ref_id": ["11111111-1111-1111-1111-111111111111", "22222222-2222-2222-2222-222222222222", "33333333-3333-3333-3333-333333333333"],
      "ref_code": ["REF001", "REF002", "REF003"]
    }
  ]
}
```

**Response**: `200 OK`

**Test Cases**:

| Case | Scenario                                | Expected                    |
| ---- | --------------------------------------- | --------------------------- |
| TC06 | Update amount only                      | ✅ 200 Updated              |
| TC07 | Update description only                 | ✅ 200 Updated              |
| TC08 | Update full fields                      | ✅ 200 Updated              |
| TC09 | Update after rejection with approver    | ✅ 200 Updated              |
| TC10 | Update after rejection without approver | ✅ 200 Updated              |
| TC11 | Change jar_id                           | ✅ 200 Updated              |
| TC12 | ID not exists                           | ❌ 404 Not Found            |
| TC13 | Đã duyệt rồi                            | ❌ 403 Cannot edit approved |

---

### 3. Kế Toán Tài Sản - Sửa Tài Liệu Đính Kèm

**Endpoint**: `PUT /api/payment-request/documents/{id}`

**Role**: Kế toán Tài Sản (0025/0001)

**Request Body**:

```json
[
  {
    "ids": ["f595aed4-29d4-4074-8684-aac1f073330f"],
    "type_document_id": "893721b5-f83a-4b20-8a41-215c99d2cef5",
    "ref_id": ["11111111-1111-1111-1111-111111111111"],
    "ref_code": ["REF001"]
  }
]
```

**Response**: `200 OK`

**Test Cases**:

| Case | Scenario                | Expected         |
| ---- | ----------------------- | ---------------- |
| TC10 | Sửa 1 loại tài liệu     | ✅ 200 Updated   |
| TC11 | Sửa nhiều loại tài liệu | ✅ 200 Updated   |
| TC12 | Không phải KT tài sản   | ❌ 403 Forbidden |

---

### 4. Kế Toán Hàng Hóa - Sửa Tài Liệu Đính Kèm

**Endpoint**: `PUT /api/payment-request/documents/{id}`

**Role**: Kế toán Hàng Hóa (0091/0091)

**Request Body**: Giống như Kế toán Tài Sản

**Test Cases**:

| Case | Scenario                 | Expected         |
| ---- | ------------------------ | ---------------- |
| TC13 | Sửa tài liệu lọ hàng hóa | ✅ 200 Updated   |
| TC14 | Không phải KT hàng hóa   | ❌ 403 Forbidden |

---

### 5. Kế Toán Thuế - Thêm Hóa Đơn

**Endpoint**: `POST /api/payment-request/invoices/{id}`

**Role**: Kế toán Thuế (44444/44444)

**Request Body**:

```json
[
  {
    "code": "HD-001",
    "date": "2025-01-11",
    "company_id": "9e2ba481-7040-404a-9da0-d612d28303f5",
    "file_id": "f267fb77-f8bc-452b-be6a-7177adf87174",
    "place": "Công ty VTCODE",
    "amount": "200000"
  }
]
```

**Response**: `201 Created`

**Test Cases**:

| Case | Scenario                 | Expected                 |
| ---- | ------------------------ | ------------------------ |
| TC15 | Thêm 1 hóa đơn           | ✅ 201 Created           |
| TC16 | Thêm nhiều hóa đơn       | ✅ 201 Created           |
| TC17 | Thiếu code               | ❌ 400 Validation error  |
| TC18 | company_id không tồn tại | ❌ 404 Company not found |

---

### 6. Kế Toán Thuế - Thêm Hợp Đồng

**Endpoint**: `POST /api/payment-request/contracts/{id}`

**Role**: Kế toán Thuế (44444/44444)

**Request Body**:

```json
[
  {
    "code": "HĐ-001",
    "date": "2025-01-10",
    "company_id": "9e2ba481-7040-404a-9da0-d612d28303f5",
    "file_id": "f267fb77-f8bc-452b-be6a-7177adf87174",
    "place": "Công ty VTCODE",
    "amount": "10000000"
  }
]
```

**Response**: `201 Created`

**Test Cases**:

| Case | Scenario            | Expected       |
| ---- | ------------------- | -------------- |
| TC19 | Thêm 1 hợp đồng     | ✅ 201 Created |
| TC20 | Thêm nhiều hợp đồng | ✅ 201 Created |

---

### 7. Kế Toán Thanh Toán - Tạo Hạch Toán

**Endpoint**: `POST /api/payment-request/accounting/{id}`

**Role**: Kế toán Thanh Toán (11111/11111)

**Request Body**:

```json
{
  "jar_category_id": "69f31527-ba0d-499e-838d-f775c3f37690",
  "items": [
    {
      "debit_account_id": "4ffd48e4-2f4f-4a6c-9687-300b7eb9b482",
      "credit_account_id": "ddb52d80-84d9-47bf-aecc-a13578d1741c",
      "debit_disburser_type": "employee",
      "credit_disburser_type": "bank_account",
      "debit_disburser_id": "d24f5b81-61f0-e711-80da-00155d0a0504",
      "credit_disburser_id": "74eb3886-f8eb-4e92-963a-3c6efaf54cf4",
      "unit_id": "4ccc730d-3dd2-441a-b6b6-0eff23d9c16b",
      "quantity": 10,
      "price": 5000000,
      "tax": 10,
      "description": "Thanh toán tiền mua thiết bị",
      "expense_code": "BTRIIT"
    }
  ]
}
```

**Response**: `201 Created`

**Lưu ý quan trọng**:

- `jar_category_id` phải khớp với `jar_id` của phiếu:
  - Lọ Tài Sản: jar_id `a9656a3d-...` → jar_category_id `69f31527-...`
  - Lọ Hàng Hóa: jar_id `7ce3b31a-...` → jar_category_id `8e8c4e1a-...`
  - Lọ Thường: jar_id `2d3adfdf-...` → jar_category_id `72e8b13a-...`

**Test Cases**:

| Case | Scenario                  | Expected                |
| ---- | ------------------------- | ----------------------- |
| TC21 | Tạo hạch toán lọ tài sản  | ✅ 201 Created          |
| TC22 | Tạo hạch toán lọ hàng hóa | ✅ 201 Created          |
| TC23 | Tạo nhiều khoản hạch toán | ✅ 201 Created          |
| TC24 | Sai jar_category_id       | ❌ 400 Invalid category |
| TC25 | Thiếu required fields     | ❌ 400 Validation error |

---

### 8. Duyệt Phiếu

**Endpoint**: `POST /api/advance-request/{id}/approve`

**Headers**:

```json
{
  "Authorization": "Bearer {token}"
}
```

**Response**: `200 OK`

```json
{
  "id": "uuid",
  "status": "approved_step_1",
  "message": "Phiếu đã được duyệt"
}
```

**Test Cases**:

| Case | Role          | Step             | Expected              |
| ---- | ------------- | ---------------- | --------------------- |
| TC26 | 55555/55555   | Bước 1           | ✅ 200 Approved       |
| TC27 | 0025/0001     | Bước 2 (Lọ TS)   | ✅ 200 Approved       |
| TC28 | 0091/0091     | Bước 2 (Lọ HH)   | ✅ 200 Approved       |
| TC29 | 44444/44444   | Bước 2 (Lọ khác) | ✅ 200 Approved       |
| TC30 | 11111/11111   | Bước 3           | ✅ 200 Approved       |
| TC31 | 22222/22222   | Bước 4           | ✅ 200 Approved       |
| TC32 | 33333/33333   | Bước 5           | ✅ 200 Final Approved |
| TC33 | Sai role      | Any              | ❌ 403 Forbidden      |
| TC34 | Chưa đến lượt | Any              | ❌ 403 Not your turn  |

---

### 9. Từ Chối Phiếu

**Endpoint**: `POST /api/advance-request/{id}/reject`

**Request Body**:

```json
{
  "reason": "Thiếu chứng từ đính kèm"
}
```

**Response**: `200 OK`

**Test Cases**:

| Case | Scenario            | Expected               |
| ---- | ------------------- | ---------------------- |
| TC35 | Từ chối với lý do   | ✅ 200 Rejected        |
| TC36 | Từ chối không lý do | ❌ 400 Reason required |
| TC37 | Không có quyền      | ❌ 403 Forbidden       |

---

## 📊 Test Data

### Workplace (Phòng ban Đào Tạo)

```json
{
  "workplace_type": 1,
  "workplace_id": "e92cf911-b543-4638-b996-2c4441ca0480"
}
```

### Jar IDs (Lọ)

#### Lọ Tài Sản

```json
{
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "jar_category_id": "69f31527-ba0d-499e-838d-f775c3f37690",
  "approver": "0025/0001"
}
```

#### Lọ Hàng Hóa

```json
{
  "jar_id": "7ce3b31a-ba53-4fd3-a565-3ddbce1bb03b",
  "jar_category_id": "8e8c4e1a-6605-4652-b81c-945feab01392",
  "approver": "0091/0091"
}
```

#### Lọ Thường (Kế toán thuế duyệt)

```json
{
  "jar_id": "2d3adfdf-2617-42d5-99bd-be98feda7b08",
  "jar_category_id": "72e8b13a-d21a-4770-b50e-0bb9771df48d",
  "approver": "44444/44444"
}
```

### Unit IDs (Đơn vị tính)

```
4ccc730d-3dd2-441a-b6b6-0eff23d9c16b
79f97729-fbe2-4492-bacf-68a0809321b5
c3061db2-a12c-46bb-9cf4-7413d5695e96
5c970aad-63d2-4032-beb9-84a723dc89a7
5e97508e-24ed-44a4-b967-7869135043cc
```

### Company IDs (Công ty)

```
9e2ba481-7040-404a-9da0-d612d28303f5
e41e24c6-215e-43d5-83bf-94cba481daa2
23b5c8b4-12f5-4189-94ed-101a43b16ba5
46077b44-248a-4dc6-8bcd-4e5594adb92f
50acf336-e414-42bd-aba0-ec0ed13eb71a
```

### Account IDs (Tài khoản kế toán)

```
4ffd48e4-2f4f-4a6c-9687-300b7eb9b482
ddb52d80-84d9-47bf-aecc-a13578d1741c
f65016bc-e66f-4d0d-b14b-041c799e8675
0762acc1-bf60-48a5-8e62-e9b0ccf39e03
074c2ec5-e7c1-478d-924b-82b2418c6e20
```

### Disburser IDs (Người chi/Tài khoản ngân hàng)

```
74eb3886-f8eb-4e92-963a-3c6efaf54cf4
8c367d7a-229e-4a8d-918e-c1975650e160
0f43bbe8-c264-405e-a8a7-d05fb88865c3
4aa7a8be-48de-473b-9953-f16372f70459
a8eb8907-17bb-460a-9380-2f9982212540
```

### Expense Codes (Mã chi phí)

```
DATXE    - Đặt xe
BAOTRI   - Bảo trì
BAOVE    - Bảo vệ
BENTO    - Bento
BHCNO    - Bảo hiểm cho nợ
BHTN     - Bảo hiểm thân nhân
BHVAY    - Bảo hiểm vay
BHXH     - Bảo hiểm xã hội
BTMAYIN  - Bảo trì máy in
BTRIIT   - Bảo trì IT
CDC      - Cước điện thoại cố định
CDCKTT   - Cước điện thoại di động KTT
CDCNCAP  - Cước điện thoại cấp
DIEN     - Điện
COMNV    - Cơm nhân viên
```

---

## 🔄 Complete Test Scenario

### Scenario 1: Tạo và duyệt phiếu tạm ứng Lọ Tài Sản

```
Step 1: Login Trưởng BP Đào Tạo
POST /api/auth/login
Body: { "username": "55555", "password": "55555" }
→ Save token_1

Step 2: Tạo phiếu tạm ứng
POST /api/advance-request
Headers: { "Authorization": "Bearer {token_1}" }
Body: {
  "workplace_type": 1,
  "workplace_id": "e92cf911-b543-4638-b996-2c4441ca0480",
  "jar_id": "a9656a3d-c43a-4fe9-8fe6-bcfc060de6cd",
  "amount": 10000000,
  "description": "Mua tài sản cố định",
  "documents": [...]
}
→ Save advance_request_id

Step 3: Duyệt bước 1
POST /api/advance-request/{advance_request_id}/approve
Headers: { "Authorization": "Bearer {token_1}" }
→ Status: approved_step_1

Step 4: Login Kế toán Tài Sản
POST /api/auth/login
Body: { "username": "0025", "password": "0001" }
→ Save token_2

Step 5: Sửa tài liệu đính kèm
PUT /api/payment-request/documents/{advance_request_id}
Headers: { "Authorization": "Bearer {token_2}" }
Body: [...]

Step 6: Duyệt bước 2
POST /api/advance-request/{advance_request_id}/approve
Headers: { "Authorization": "Bearer {token_2}" }
→ Status: approved_step_2

Step 7: Login Kế toán Thanh Toán
POST /api/auth/login
Body: { "username": "11111", "password": "11111" }
→ Save token_3

Step 8: Tạo hạch toán
POST /api/payment-request/accounting/{advance_request_id}
Headers: { "Authorization": "Bearer {token_3}" }
Body: {
  "jar_category_id": "69f31527-ba0d-499e-838d-f775c3f37690",
  "items": [...]
}

Step 9: Duyệt bước 3
POST /api/advance-request/{advance_request_id}/approve
Headers: { "Authorization": "Bearer {token_3}" }
→ Status: approved_step_3

Step 10: Login Trưởng BP Kế toán TT
POST /api/auth/login
Body: { "username": "22222", "password": "22222" }
→ Save token_4

Step 11: Duyệt bước 4
POST /api/advance-request/{advance_request_id}/approve
Headers: { "Authorization": "Bearer {token_4}" }
→ Status: approved_step_4

Step 12: Login Kế toán Trưởng
POST /api/auth/login
Body: { "username": "33333", "password": "33333" }
→ Save token_5

Step 13: Duyệt cuối
POST /api/advance-request/{advance_request_id}/approve
Headers: { "Authorization": "Bearer {token_5}" }
→ Status: completed ✅
```

### Scenario 2: Tạo và duyệt phiếu tạm ứng Lọ Hàng Hóa

```
Tương tự Scenario 1, nhưng:
- jar_id: "7ce3b31a-ba53-4fd3-a565-3ddbce1bb03b"
- jar_category_id: "8e8c4e1a-6605-4652-b81c-945feab01392"
- Bước 2 duyệt bởi: 0091/0091 (Kế toán Hàng Hóa)
```

### Scenario 3: Tạo và duyệt phiếu tạm ứng Lọ Thường (Kế toán Thuế)

```
Tương tự Scenario 1, nhưng:
- jar_id: "2d3adfdf-2617-42d5-99bd-be98feda7b08"
- jar_category_id: "72e8b13a-d21a-4770-b50e-0bb9771df48d"
- Bước 2 duyệt bởi: 44444/44444 (Kế toán Thuế)
- Kế toán Thuế cần thêm hóa đơn và hợp đồng trước khi duyệt
```

---

## ⚠️ Error Codes

| Code | Description  | Example                                    |
| ---- | ------------ | ------------------------------------------ |
| 400  | Bad Request  | Thiếu field bắt buộc, dữ liệu không hợp lệ |
| 401  | Unauthorized | Token không hợp lệ hoặc hết hạn            |
| 403  | Forbidden    | Không có quyền thực hiện action này        |
| 404  | Not Found    | Phiếu không tồn tại, ID không tìm thấy     |
| 409  | Conflict     | Phiếu đã được duyệt, không thể sửa         |
| 500  | Server Error | Lỗi database, lỗi hệ thống                 |

---

## 📝 Notes for Frontend

### 1. Token Management

- Lưu token sau khi login
- Gửi token trong header `Authorization: Bearer {token}`
- Token có thời gian sống 24h
- Refresh token khi hết hạn

### 2. Workflow UI

- Hiển thị step hiện tại của phiếu
- Disable nút duyệt nếu không phải lượt của user
- Hiển thị lịch sử duyệt (ai duyệt, khi nào)
- Highlight step hiện tại

### 3. Form Validation

- Validate workplace_id (bắt buộc)
- Validate jar_id (bắt buộc)
- Validate amount > 0
- Validate documents không rỗng
- Validate jar_category_id khớp với jar_id khi tạo hạch toán

### 4. Dynamic Fields

- Hiển thị form "Sửa tài liệu" nếu user là KT Tài Sản/Hàng Hóa
- Hiển thị form "Thêm hóa đơn/hợp đồng" nếu user là KT Thuế
- Hiển thị form "Tạo hạch toán" nếu user là KT Thanh Toán

### 5. Error Handling

- Hiển thị message lỗi từ API
- Retry khi gặp lỗi 500
- Redirect về login khi 401
- Hiển thị thông báo khi 403 (không có quyền)

### 6. Data Display

- Format số tiền: 5,000,000 VNĐ
- Format ngày: DD/MM/YYYY
- Hiển thị tên công ty thay vì ID
- Hiển thị tên đơn vị thay vì ID
- Hiển thị tên expense code thay vì mã

---

## 🎯 Testing Checklist

### Basic CRUD

- [ ] TC01-05: Tạo phiếu với các loại lọ khác nhau
- [ ] TC06-09: Sửa phiếu

### Approval Flow

- [ ] TC26-34: Test toàn bộ quy trình duyệt
- [ ] TC35-37: Test từ chối phiếu

### Role-based Actions

- [ ] TC10-12: Kế toán Tài Sản sửa tài liệu
- [ ] TC13-14: Kế toán Hàng Hóa sửa tài liệu
- [ ] TC15-20: Kế toán Thuế thêm hóa đơn/hợp đồng
- [ ] TC21-25: Kế toán Thanh Toán tạo hạch toán

### Complete Scenarios

- [ ] Scenario 1: Full flow Lọ Tài Sản
- [ ] Scenario 2: Full flow Lọ Hàng Hóa
- [ ] Scenario 3: Full flow Lọ Thường

### Edge Cases

- [ ] Duyệt không đúng thứ tự
- [ ] Sửa phiếu đã duyệt
- [ ] Tạo hạch toán sai jar_category_id
- [ ] Thêm hóa đơn với company_id không tồn tại

---

**Last Updated**: 2025-12-17  
**Maintained by**: Backend Team
