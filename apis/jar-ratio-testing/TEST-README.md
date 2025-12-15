# 📚 Hướng Dẫn Sử Dụng File Test - Quản Lý Tỷ Lệ Lọ

## 📁 Cấu Trúc File Test

```
accounting-system/
├── JAR-RATIO-COMPLETE-TEST-GUIDE.md    # Hướng dẫn test chi tiết với checklist
├── jar-ratio-test.http                  # File REST Client để test nhanh
├── jar-ratio-test-data.json             # Dữ liệu mẫu cho test
├── TEST-README.md                       # File này - hướng dẫn sử dụng
│
├── test-report-12.12/                   # Thư mục template test cases
│   ├── 01-CRUD-jar-ratio.md
│   ├── 02-approval-workflow.md
│   ├── 03-jar-report.md
│   ├── 04-validations.md
│   └── 05-edge-cases.md
│
└── test-results-12.12/                  # Thư mục kết quả test
    ├── 01-CRUD-results.md
    ├── 03-jar-report-results.md
    └── test-summary.md
```

---

## 🚀 Cách Sử Dụng

### Option 1: Sử dụng REST Client trong VS Code (Khuyến nghị)

**Bước 1: Cài đặt Extension**
```
1. Mở VS Code
2. Vào Extensions (Ctrl+Shift+X)
3. Tìm "REST Client" by Huachao Mao
4. Click Install
```

**Bước 2: Mở File Test**
```
1. Mở file: jar-ratio-test.http
2. File này chứa tất cả API requests
```

**Bước 3: Lấy Jar IDs**
```
1. Chạy request "1.1. Login - Nhân viên (55555)" để lấy token
2. Token sẽ tự động lưu vào biến @token_55555
3. Chạy request "2.1. Lấy danh sách Jar"
4. Copy jar_id từ response
5. Paste vào các biến:
   @jar_id_1 = paste_jar_id_1_here
   @jar_id_2 = paste_jar_id_2_here
   @jar_id_3 = paste_jar_id_3_here
```

**Bước 4: Chạy Test Theo Thứ Tự**
```
Section 1: Login tất cả users → lưu tokens
Section 2: Lấy jar_id
Section 3: Test CRUD operations
Section 4: Test approval workflow (3 cấp)
Section 5: Test report
Section 6: Test comment
Section 7: Test export
Section 8: Test edge cases
Section 9: Delete (cuối cùng)
```

**Bước 5: Click "Send Request"**
```
- Hover chuột lên mỗi request
- Click "Send Request" để chạy
- Xem kết quả ở panel bên phải
- Biến sẽ tự động được lưu và dùng cho request tiếp theo
```

---

### Option 2: Sử dụng Postman

**Bước 1: Import Collection**
```
1. Mở file JAR-RATIO-COMPLETE-TEST-GUIDE.md
2. Copy từng request vào Postman
3. Tạo Environment với biến:
   - token_55555
   - token_0018
   - token_0025
   - token_44444
   - jar_ratio_id
   - jar_id_1, jar_id_2, jar_id_3
   - comment_id
```

**Bước 2: Setup Environment Variables**
```
1. Chạy Login requests
2. Copy token từ response
3. Paste vào Environment variable
4. Sử dụng {{token_55555}} trong các request khác
```

**Bước 3: Chạy Collection**
```
- Chạy từng request theo thứ tự
- Hoặc dùng Collection Runner để chạy tự động
```

---

### Option 3: Sử dụng cURL (Terminal)

**Bước 1: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"55555","password":"55555"}'
```

**Bước 2: Lưu Token**
```bash
# Copy access_token từ response
TOKEN="eyJhbGc..."
```

**Bước 3: Chạy Request**
```bash
# Lấy danh sách jar ratios
curl -X GET "http://localhost:3000/api/jar-ratios?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Tạo jar ratio
curl -X POST http://localhost:3000/api/jar-ratios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @request-body.json
```

---

## 📋 Thứ Tự Test Chi Tiết

### 1. Setup & Chuẩn Bị (5-10 phút)

```
✅ Login user 55555 (Nhân viên)
✅ Login user 0018 (Giám đốc)
✅ Login user 0025 (Chủ tịch)
✅ Login user 44444 (Chủ tịch HĐQT)
✅ Lấy danh sách jar_id
✅ Thay jar_id vào test data
```

### 2. Test CRUD Operations (15-20 phút)

```
✅ Tạo tỷ lệ lọ hợp lệ (tổng ratio = 100%)
❌ Tạo tỷ lệ lọ không hợp lệ (tổng ratio ≠ 100%)
❌ Tạo tỷ lệ lọ trùng tháng/năm
❌ Tạo tỷ lệ lọ trùng jar_id
📖 Xem danh sách tỷ lệ lọ (pagination)
📖 Xem chi tiết tỷ lệ lọ
📖 Xem danh sách mobile
📖 Lấy danh sách người tạo
✏️ Cập nhật tỷ lệ lọ (status = waiting_director)
```

### 3. Test Approval Workflow (10-15 phút)

```
Flow: waiting_director → waiting_president → waiting_board_chairman → approved

CẤP 1 - Giám đốc (0018):
  ✅ Duyệt: waiting_director → waiting_president
  ❌ Từ chối: waiting_director → rejected

CẤP 2 - Chủ tịch (0025):
  ✅ Duyệt: waiting_president → waiting_board_chairman
  ❌ Từ chối: waiting_president → rejected

CẤP 3 - Chủ tịch HĐQT (44444):
  ✅ Duyệt: waiting_board_chairman → approved (FINAL)
  ❌ Từ chối: waiting_board_chairman → rejected
```

### 4. Test Report (10-15 phút)

```
⚠️ Điều kiện: Tỷ lệ lọ phải có status = approved

📊 Lấy báo cáo tỷ lệ lọ (month=12, year=2025)
❌ Báo cáo tháng không có dữ liệu
❌ Validation month = 13
❌ Validation month = 0
❌ Thiếu tham số month
❌ Thiếu tham số year
```

### 5. Test Comment & Export (5-10 phút)

```
💬 Thêm comment
📖 Xem danh sách comment
✏️ Cập nhật comment
🗑️ Xóa comment
📥 Export Excel
```

### 6. Test Edge Cases (5-10 phút)

```
❌ Cập nhật khi status ≠ waiting_director
❌ Xóa jar ratio không tồn tại
❌ Xem jar ratio không tồn tại
❌ Duyệt với user không có quyền
```

### 7. Cleanup (2-5 phút)

```
🗑️ Xóa tỷ lệ lọ (soft delete)
```

**Tổng thời gian test: ~60-90 phút**

---

## 📊 Checklist Test

### Pre-Test Checklist

- [ ] Server đang chạy ở http://localhost:3000
- [ ] Database có dữ liệu jar (lọ)
- [ ] Database có dữ liệu users (55555, 0018, 0025, 44444)
- [ ] REST Client extension đã được cài đặt (nếu dùng VS Code)
- [ ] Đã đọc file JAR-RATIO-COMPLETE-TEST-GUIDE.md

### Test Execution Checklist

**CRUD Operations:**
- [ ] Tạo jar ratio hợp lệ - PASS
- [ ] Validation tổng ratio ≠ 100% - FAIL as expected
- [ ] Validation trùng tháng/năm - FAIL as expected
- [ ] Validation trùng jar_id - FAIL as expected
- [ ] Xem danh sách pagination - PASS
- [ ] Xem chi tiết - PASS
- [ ] Xem danh sách mobile - PASS
- [ ] Lấy danh sách người tạo - PASS
- [ ] Cập nhật jar ratio - PASS

**Approval Workflow:**
- [ ] Giám đốc duyệt cấp 1 - PASS
- [ ] Giám đốc từ chối - PASS
- [ ] Chủ tịch duyệt cấp 2 - PASS
- [ ] Chủ tịch từ chối - PASS
- [ ] Chủ tịch HĐQT duyệt cấp 3 - PASS
- [ ] Chủ tịch HĐQT từ chối - PASS

**Report:**
- [ ] Lấy báo cáo thành công - PASS
- [ ] Báo cáo tháng không có data - FAIL as expected
- [ ] Validation month/year - FAIL as expected
- [ ] Công thức tính toán chính xác - PASS

**Comment & Export:**
- [ ] Thêm comment - PASS
- [ ] Xem danh sách comment - PASS
- [ ] Cập nhật comment - PASS
- [ ] Xóa comment - PASS
- [ ] Export Excel - PASS

**Edge Cases:**
- [ ] Cập nhật khi approved - FAIL as expected
- [ ] Xóa non-existent - FAIL as expected
- [ ] Xem non-existent - FAIL as expected
- [ ] Duyệt không có quyền - FAIL as expected

**Cleanup:**
- [ ] Xóa jar ratio - PASS

---

## 🔍 Kiểm Tra Kết Quả

### Kết quả PASS khi:

**Status Code:**
- ✅ 200 OK - Request thành công
- ✅ 201 Created - Tạo mới thành công
- ✅ 400 Bad Request - Validation lỗi (expected)
- ✅ 403 Forbidden - Không có quyền (expected)
- ✅ 404 Not Found - Không tìm thấy (expected)

**Response Body:**
- ✅ Có `status: "success"`
- ✅ Có `data` hoặc `message`
- ✅ Validation errors có message rõ ràng tiếng Việt

**Business Logic:**
- ✅ Status chuyển đúng theo workflow
- ✅ Tổng ratio luôn = 100%
- ✅ Công thức tính toán chính xác
- ✅ Soft delete: is_deleted = true

### Kết quả FAIL khi:

- ❌ Status code không đúng mong đợi
- ❌ Response body không đúng format
- ❌ Status không chuyển đúng workflow
- ❌ Công thức tính toán sai
- ❌ Có thể tạo jar ratio với tổng ratio ≠ 100%
- ❌ Có thể update/delete khi không có quyền
- ❌ Hard delete thay vì soft delete

---

## 📝 Ghi Chú Quan Trọng

### Quy tắc business:

1. **Tổng ratio phải = 100%**
   - Sum của tất cả `ratio` trong `details` phải = 100
   - Nếu không, API sẽ trả về 400 Bad Request

2. **Workflow duyệt 3 cấp:**
   ```
   Tạo mới → waiting_director
           ↓ (Giám đốc approve)
   waiting_president
           ↓ (Chủ tịch approve)
   waiting_board_chairman
           ↓ (Chủ tịch HĐQT approve)
   approved (FINAL)
   ```

3. **Chỉ update khi status = waiting_director**
   - Nếu đã được duyệt (status khác), không thể update
   - Phải reject về lại waiting_director mới update được

4. **Chỉ tạo báo cáo khi status = approved**
   - Báo cáo chỉ lấy jar ratio đã được phê duyệt cuối cùng

5. **Soft delete:**
   - Xóa = set `is_deleted = true`
   - Record vẫn còn trong database
   - Không hiển thị trong danh sách

### Công thức tính toán trong báo cáo:

```javascript
// 1. Doanh thu kế hoạch
planned_revenue = totalKPIRevenue * targetRate / 100

// 2. Doanh thu thực tế cho lọ
actual_revenue = totalCollected + (totalRevenueOtherInMonth * targetRate / 100)

// 3. Tỷ lệ thực tế
actual_rate = actualTotalRevenue > 0
  ? (totalDisbursed / actualTotalRevenue) * 100
  : 0

// 4. Độ lệch
deviation = actualRate - targetRate

// 5. Điều chỉnh
adjustment = deviation > 0
  ? actualRate - deviation
  : actualRate + Math.abs(deviation)

// 6. Tỷ lệ đề xuất sau điều chỉnh
proposed_rate = deviation < 0 && plannedRevenue > 0
  ? targetRate + Math.abs(adjustment / plannedRevenue) / 100
  : actualRate
```

---

## 🐛 Troubleshooting

### Lỗi thường gặp:

**1. "Token expired" hoặc 401 Unauthorized**
```
Giải pháp: Login lại để lấy token mới
```

**2. "Jar not found"**
```
Giải pháp: Kiểm tra jar_id có tồn tại trong database
Chạy: GET /api/jars để lấy danh sách jar
```

**3. "Cannot update jar ratio"**
```
Giải pháp: Kiểm tra status của jar ratio
Chỉ có thể update khi status = waiting_director
```

**4. "Tổng tỉ lệ phải bằng 100%"**
```
Giải pháp: Kiểm tra lại sum của ratio trong details
Ví dụ: 40 + 35 + 25 = 100 ✓
        40 + 35 = 75 ✗
```

**5. "Permission denied"**
```
Giải pháp: Sử dụng đúng user có quyền
- Duyệt cấp 1: user 0018
- Duyệt cấp 2: user 0025
- Duyệt cấp 3: user 44444
```

**6. "Tỉ lệ lọ cho tháng này chưa được báo cáo"**
```
Giải pháp: Đảm bảo jar ratio đã được approved
Chỉ jar ratio có status = approved mới tạo được báo cáo
```

---

## 📞 Liên Hệ & Hỗ Trợ

**Nếu gặp vấn đề:**
1. Kiểm tra server đang chạy: http://localhost:3000
2. Kiểm tra database có dữ liệu
3. Đọc lại hướng dẫn trong file này
4. Xem log error trong response body
5. Tham khảo file [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md)

---

## 📚 Tài Liệu Tham Khảo

- [JAR-RATIO-COMPLETE-TEST-GUIDE.md](JAR-RATIO-COMPLETE-TEST-GUIDE.md) - Hướng dẫn test chi tiết
- [jar-ratio-test.http](jar-ratio-test.http) - File REST Client
- [jar-ratio-test-data.json](jar-ratio-test-data.json) - Dữ liệu mẫu
- [test-report-12.12/](test-report-12.12/) - Template test cases
- [test-results-12.12/](test-results-12.12/) - Kết quả test

---

**Version:** 1.0
**Last Updated:** 2025-12-15
**Author:** Claude AI Assistant
