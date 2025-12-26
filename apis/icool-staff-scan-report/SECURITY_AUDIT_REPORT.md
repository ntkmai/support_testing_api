# BÁO CÁO KIỂM TRA BẢO MẬT DỰ ÁN

**Ngày kiểm tra:** 26/12/2025
**Dự án:** iCool Staff OKR API v2
**Phạm vi:** Source code analysis + NPM dependencies audit

---

## 📊 TÓM TẮT TỔNG QUAN

### ✅ Kết quả kiểm tra Source Code

| Loại kiểm tra | Kết quả | Trạng thái |
|---------------|---------|------------|
| eval() usage | **0 file** | ✅ AN TOÀN |
| Function() constructor | **0 file** | ✅ AN TOÀN |
| File system operations | **Hợp lệ** | ✅ AN TOÀN |
| Malicious code | **Không phát hiện** | ✅ AN TOÀN |

### ⚠️ Kết quả NPM Audit

| Version | Total | Critical | High | Moderate | Low |
|---------|-------|----------|------|----------|-----|
| **V1** | 23 | 1 | 8 | 7 | 7 |
| **V2** | 22 | 0 | 13 | 5 | 4 |

---

## 🔍 PHẦN 1: PHÂN TÍCH SOURCE CODE

### 1.1. Kiểm tra các Pattern nguy hiểm

#### ✅ eval() - KHÔNG CÓ
- Không phát hiện file nào trong source code (v1, v2) sử dụng `eval()`
- Các pattern chỉ xuất hiện trong **node_modules** (thư viện bên thứ 3)
- **Kết luận:** AN TOÀN

#### ✅ Function() Constructor - KHÔNG CÓ
- Không phát hiện sử dụng `new Function()` hoặc `Function()` trong source code
- Các custom validator sử dụng pattern matching hợp lệ
- **Kết luận:** AN TOÀN

#### ✅ Unicode Escapes
- Chỉ phát hiện trong file config `.eslintrc.js`
- Mục đích: ESLint configuration cho import sorting
- **Kết luận:** AN TOÀN

### 1.2. File System Operations Analysis

Các file sử dụng fs operations đều có mục đích hợp lệ và được bảo vệ:

#### 1. `v1/system/jobs/remove-file.job.js`
```javascript
// Dòng 16, 30: fs.unlinkSync()
```
- **Mục đích:** Cronjob xóa file không còn sử dụng
- **Bảo vệ:**
  - Kiểm tra file tồn tại trước khi xóa
  - Path lấy từ database (đã validate)
  - Chỉ xóa file được đánh dấu không còn dùng
- **Đánh giá:** ✅ AN TOÀN

#### 2. `v1/routes/shared/document.js`
```javascript
// Dòng 48: fs.unlinkSync(file.path)
```
- **Mục đích:** Xóa file gốc sau khi compress video
- **Bảo vệ:**
  - Chỉ xóa file tạm vừa được upload
  - Path từ multer (được validate)
  - Có try-catch error handling
- **Đánh giá:** ✅ AN TOÀN

#### 3. `v2/src/modules/web/payroll/controllers/payroll.controller.ts`
```javascript
// Dòng 119: fs.unlinkSync(path)
```
- **Mục đích:** Cleanup file Excel tạm sau import
- **Bảo vệ:**
  - Kiểm tra existsSync() trước khi xóa
  - Trong block catch của try-catch
  - Path từ multer storage
- **Đánh giá:** ✅ AN TOÀN

#### 4. `v1/utilities/index.js`
```javascript
// Dòng 70: fs.unlink() - cleanup logs
// Dòng 28, 38: fs.appendFileSync(), fs.writeFileSync()
```
- **Mục đích:**
  - Xóa log file cũ hơn 7 ngày
  - Ghi log file
- **Bảo vệ:**
  - Chỉ thao tác trong thư mục `./logs/`
  - Kiểm tra expiry date
- **Đánh giá:** ✅ AN TOÀN

#### 5. `v1/utilities/send-firebase.js`
```javascript
// Dòng 157: fs.rename() - move uploaded files
```
- **Mục đích:** Di chuyển file từ temp sang storage
- **Bảo vệ:**
  - Validate file extension
  - Slugify filename
  - Directory existence check
- **Đánh giá:** ✅ AN TOÀN

### 1.3. Kết luận Source Code

**🎉 SOURCE CODE SẠCH - KHÔNG CÓ MÃ ĐỘC HẠI**

Tất cả các operations nguy hiểm đều:
- Có mục đích hợp lệ
- Được validate đầu vào
- Có error handling
- Không thể bị exploit từ user input

---

## 🔐 PHẦN 2: NPM DEPENDENCIES VULNERABILITIES

### 2.1. V1 - Legacy API (23 vulnerabilities)

#### 🔴 CRITICAL (1)

##### form-data (<2.5.4 || >=4.0.0 <4.0.4)
- **CVE:** GHSA-fjxv-7rqg-78g4
- **Severity:** CRITICAL
- **Mô tả:** Sử dụng unsafe random function để tạo boundary cho multipart form data
- **Ảnh hưởng:**
  - File upload có thể bị bypass
  - Boundary collision có thể xảy ra
- **Cách fix:**
  ```bash
  npm audit fix
  ```

#### 🟠 HIGH (8)

##### 1. jsonwebtoken (<=8.5.1) ⚠️ **ƯU TIÊN CAO NHẤT**
- **CVE:**
  - GHSA-8cf7-32gw-wr33 (Unrestricted key type)
  - GHSA-hjrf-2m68-5959 (RSA to HMAC forgery)
  - GHSA-qwph-4952-7xr6 (Signature validation bypass)
- **Severity:** HIGH
- **Mô tả:**
  - JWT signature có thể bị bypass do insecure default algorithm
  - Có thể forge token từ RSA sang HMAC
  - Unrestricted key type có thể dùng legacy keys
- **Ảnh hưởng:**
  - ⚠️ **CỰC KỲ NGUY HIỂM**
  - Attacker có thể tạo JWT token hợp lệ giả mạo
  - Bypass hoàn toàn authentication system
  - Chiếm quyền truy cập bất kỳ user nào
- **Cách fix:**
  ```bash
  npm install jsonwebtoken@9.0.3
  # Lưu ý: Breaking change, cần update code
  ```
- **Code cần review:**
  - Tất cả nơi sử dụng `jwt.verify()`
  - Đảm bảo luôn specify algorithm rõ ràng
  - Không dùng `algorithm: 'none'`

##### 2. axios (1.0.0 - 1.11.0)
- **CVE:** GHSA-4hjh-wcwx-xvwj
- **Severity:** HIGH
- **Mô tả:** DoS attack qua lack of data size check
- **Ảnh hưởng:**
  - Server có thể bị crash
  - Memory exhaustion
- **Cách fix:**
  ```bash
  npm audit fix
  ```

##### 3. socket.io stack (multiple packages)
- **Packages affected:**
  - socket.io (1.0.0-pre - 4.7.5)
  - engine.io (1.8.0 - 6.6.1)
  - debug (4.0.0 - 4.3.0)
  - cookie (<0.7.0)
  - parseuri (<2.0.0)
- **CVE:** Multiple (ReDoS, cookie out-of-bounds)
- **Severity:** HIGH
- **Ảnh hưởng:**
  - Real-time notification có thể bị DoS
  - Cookie manipulation
- **Cách fix:**
  ```bash
  npm install socket.io@4.8.3
  # Breaking change - cần update socket.io code
  ```

##### 4. validator (<=13.15.20)
- **CVE:**
  - GHSA-xx4c-jj58-r7x6 (ReDoS)
  - GHSA-qgmg-gppg-76g5 (ReDoS)
  - GHSA-9965-vmph-33xx (URL validation bypass)
  - GHSA-vghf-hv5q-vc2g (Incomplete filtering)
- **Severity:** HIGH
- **Ảnh hưởng:**
  - Input validation có thể bị bypass
  - Malicious URLs có thể pass validation
  - ReDoS attacks
- **Cách fix:**
  ```bash
  npm install validator@13.15.26
  # Có thể breaking change
  ```

##### 5. jws (<3.2.3 || =4.0.0)
- **CVE:** GHSA-869p-cjfg-cm3x
- **Severity:** HIGH
- **Mô tả:** HMAC signature không được verify đúng
- **Ảnh hưởng:** JWT signature forgery
- **Cách fix:**
  ```bash
  npm audit fix
  ```

##### 6. node-forge (<=1.3.1)
- **CVE:**
  - GHSA-554w-wpv2-vw27 (ASN.1 Unbounded Recursion)
  - GHSA-5gfm-wpxj-wjgq (ASN.1 Validator Desync)
  - GHSA-65ch-62r8-g69g (ASN.1 OID Integer Truncation)
- **Severity:** HIGH
- **Cách fix:**
  ```bash
  npm audit fix
  ```

##### 7. semver (7.0.0 - 7.5.1)
- **CVE:** GHSA-c2qf-rxjj-qqgw
- **Severity:** HIGH
- **Mô tả:** ReDoS vulnerability
- **Affected by:** nodemon
- **Cách fix:**
  ```bash
  npm audit fix
  ```

#### 🟡 MODERATE (7)

##### 1. jszip (<=3.7.1) ⚠️ **NO FIX AVAILABLE**
- **CVE:**
  - GHSA-jg8v-48h5-wgxg (Prototype Pollution)
  - GHSA-36fh-84j7-cv5h (Path Traversal)
- **Severity:** MODERATE
- **Dependency chain:** jszip → xlsx-style → node-excel-export
- **Ảnh hưởng:** Excel export có thể bị exploit
- **Giải pháp:**
  ```bash
  # Không có fix, cần thay thế library
  npm uninstall node-excel-export
  npm install exceljs
  # Update code để dùng exceljs
  ```

##### 2. brace-expansion (1.0.0 - 1.1.11)
- **CVE:** GHSA-v6h2-p8h4-qcjw
- **Severity:** MODERATE
- **Mô tả:** ReDoS vulnerability
- **Cách fix:**
  ```bash
  npm audit fix
  ```

##### 3. on-headers (<1.1.0)
- **CVE:** GHSA-76c9-3jph-rj3q
- **Severity:** MODERATE
- **Mô tả:** HTTP response header manipulation
- **Affected by:** morgan
- **Cách fix:**
  ```bash
  npm audit fix
  ```

### 2.2. V2 - Current API (22 vulnerabilities)

#### 🟠 HIGH (13)

##### 1. xlsx (*) ⚠️ **NO FIX AVAILABLE - ƯU TIÊN CAO**
- **CVE:**
  - GHSA-4r6h-8v6p-xvw6 (Prototype Pollution)
  - GHSA-5pgg-2g8v-p4x9 (ReDoS)
- **Severity:** HIGH
- **Mô tả:**
  - SheetJS có lỗ hổng prototype pollution nghiêm trọng
  - ReDoS khi parse certain patterns
- **Ảnh hưởng:**
  - Code execution via prototype pollution
  - DoS attacks
  - Excel file upload/processing có thể bị exploit
- **Giải pháp:**
  ```bash
  # xlsx KHÔNG CÓ FIX - Bắt buộc đổi library
  npm uninstall xlsx
  npm install exceljs
  ```
- **Files cần update:**
  - Tất cả code import/export Excel
  - Search pattern: `import.*xlsx` hoặc `require.*xlsx`

##### 2. validator (<13.15.22)
- **CVE:** GHSA-vghf-hv5q-vc2g
- **Severity:** HIGH
- **Mô tả:** Incomplete filtering of special elements
- **Cách fix:**
  ```bash
  npm audit fix
  ```

##### 3. glob (10.2.0 - 10.4.5)
- **CVE:** GHSA-5j98-mcp5-4vw2
- **Severity:** HIGH
- **Mô tả:** Command injection via -c/--cmd flag
- **Dependency chain:** glob → @nestjs/cli
- **Cách fix:**
  ```bash
  npm install @nestjs/cli@latest
  # Breaking change có thể xảy ra
  ```

##### 4. path-to-regexp (0.2.0 - 1.8.0)
- **CVE:** GHSA-9wv6-86v2-598j
- **Severity:** HIGH
- **Mô tả:** Backtracking regular expressions
- **Dependency chain:** path-to-regexp → @nestjs/serve-static
- **Cách fix:**
  ```bash
  npm install @nestjs/serve-static@latest
  # Breaking change
  ```

##### 5. cross-spawn (<6.0.6)
- **CVE:** GHSA-3xgq-45jj-v275
- **Severity:** HIGH
- **Mô tả:** ReDoS vulnerability
- **Dependency chain:** cross-spawn → execa → bin-check → @mole-inc/bin-wrapper → @swc/cli
- **Cách fix:**
  ```bash
  npm install @swc/cli@latest
  # Breaking change
  ```

##### 6. jws, node-forge
- Tương tự V1

#### 🟡 MODERATE (5)

##### 1. @azure/identity (<4.2.1)
- **CVE:** GHSA-m5vv-6r4h-3vj9
- **Severity:** MODERATE
- **Mô tả:** Elevation of Privilege
- **Dependency chain:** @azure/identity → tedious → mssql
- **Ảnh hưởng:** SQL Server connection
- **Cách fix:**
  ```bash
  npm install mssql@latest
  # Breaking change có thể xảy ra
  ```

##### 2. js-yaml (<3.14.2 || >=4.0.0 <4.1.1)
- **CVE:** GHSA-mh29-5h37-fv8m
- **Severity:** MODERATE
- **Mô tả:** Prototype pollution in merge (<<)
- **Dependency chain:** js-yaml → @nestjs/swagger
- **Cách fix:**
  ```bash
  npm install @nestjs/swagger@latest
  # Breaking change
  ```

##### 3. tmp (<=0.2.3)
- **CVE:** GHSA-52f5-9888-hmc6
- **Severity:** MODERATE
- **Mô tả:** Arbitrary temp file/directory write via symlink
- **Dependency chain:** tmp → external-editor → inquirer → @nestjs/cli
- **Cách fix:**
  ```bash
  npm install @nestjs/cli@latest
  # Breaking change
  ```

---

## 🎯 PHẦN 3: KẾ HOẠCH HÀNH ĐỘNG

### 3.1. Ưu tiên sửa (Cao → Thấp)

#### ⚠️ PRIORITY 1 - CRITICAL (Sửa ngay lập tức)

1. **jsonwebtoken (V1)** - Authentication bypass
   - Risk: CỰC KỲ CAO
   - Impact: Toàn bộ hệ thống authentication
   - Effort: Trung bình (breaking change)

2. **form-data (V1)** - File upload vulnerability
   - Risk: Cao
   - Impact: File upload features
   - Effort: Thấp (non-breaking)

#### ⚠️ PRIORITY 2 - HIGH (Sửa trong tuần này)

3. **xlsx (V2)** - Prototype pollution (NO FIX)
   - Risk: Cao
   - Impact: Excel import/export
   - Effort: Cao (cần refactor code)

4. **validator (V1, V2)** - Input validation bypass
   - Risk: Cao
   - Impact: Tất cả form validation
   - Effort: Trung bình

5. **socket.io stack (V1)** - Real-time vulnerabilities
   - Risk: Trung bình
   - Impact: Notifications, real-time features
   - Effort: Cao (breaking change)

#### ⚠️ PRIORITY 3 - MODERATE (Sửa trong tháng)

6. **@azure/identity (V2)** - SQL connection
7. **js-yaml (V2)** - Config parsing
8. **jszip (V1)** - Excel export (NO FIX)
9. Các packages khác

### 3.2. Kế hoạch thực hiện chi tiết

#### 📅 TUẦN 1: Fix non-breaking changes

```bash
# V1
cd v1
npm audit fix
npm install node-forge@latest jws@latest

# V2
cd v2
npm audit fix
npm install validator@latest
```

**Test sau khi fix:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual test các features chính

#### 📅 TUẦN 2: Fix jsonwebtoken (V1)

**Bước 1: Backup**
```bash
git checkout -b fix/jwt-vulnerability
```

**Bước 2: Upgrade package**
```bash
cd v1
npm install jsonwebtoken@9.0.3
```

**Bước 3: Update code**

Tìm tất cả nơi sử dụng JWT:
```bash
grep -r "jwt.verify" v1/
grep -r "jwt.sign" v1/
```

Review và update:
```javascript
// ❌ BAD - Không an toàn
jwt.verify(token, secret);

// ✅ GOOD - Specify algorithm rõ ràng
jwt.verify(token, secret, {
  algorithms: ['HS256'] // hoặc RS256 tùy implementation
});
```

**Bước 4: Test kỹ**
- [ ] Login flow
- [ ] Token refresh
- [ ] Protected routes
- [ ] Token expiry
- [ ] Invalid token handling

**Bước 5: Deploy**
```bash
git add .
git commit -m "fix: upgrade jsonwebtoken to fix CVE-2022-23529, CVE-2022-23539, CVE-2022-23540"
git push origin fix/jwt-vulnerability
# Create PR và merge
```

#### 📅 TUẦN 3: Replace xlsx (V2)

**Bước 1: Install replacement**
```bash
cd v2
npm uninstall xlsx
npm install exceljs
```

**Bước 2: Tìm file sử dụng xlsx**
```bash
grep -r "import.*xlsx\|require.*xlsx" v2/src/
```

**Bước 3: Refactor code**

Example refactor:
```typescript
// ❌ OLD - xlsx
import * as XLSX from 'xlsx';
const workbook = XLSX.read(buffer);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// ✅ NEW - exceljs
import { Workbook } from 'exceljs';
const workbook = new Workbook();
await workbook.xlsx.load(buffer);
const sheet = workbook.getWorksheet(1);
const data = [];
sheet.eachRow((row, rowNumber) => {
  if (rowNumber > 1) { // Skip header
    data.push({
      // Map columns
    });
  }
});
```

**Bước 4: Test**
- [ ] Excel import
- [ ] Excel export
- [ ] Payroll import
- [ ] Report generation

#### 📅 TUẦN 4: Fix socket.io (V1)

**Breaking changes cần review:**
- Event handler syntax có thể thay đổi
- Connection middleware
- Namespace handling

```bash
cd v1
npm install socket.io@4.8.3
```

Update code theo [migration guide](https://socket.io/docs/v4/migrating-from-3-x-to-4-0/)

### 3.3. Scripts tự động

Tạo file `scripts/security-audit.sh`:
```bash
#!/bin/bash
echo "=== V1 Audit ==="
cd v1
npm audit --json > ../audit-v1.json
npm audit

echo ""
echo "=== V2 Audit ==="
cd ../v2
npm audit --json > ../audit-v2.json
npm audit
```

Tạo file `scripts/fix-safe.sh`:
```bash
#!/bin/bash
echo "Fixing non-breaking vulnerabilities..."
cd v1
npm audit fix
cd ../v2
npm audit fix
echo "Done! Please test your application."
```

---

## 📋 PHẦN 4: CHECKLIST

### Pre-Fix Checklist
- [ ] Backup toàn bộ database
- [ ] Backup source code (git commit)
- [ ] Tạo branch mới cho mỗi fix
- [ ] Đọc kỹ CVE details
- [ ] Review breaking changes

### Post-Fix Checklist
- [ ] Run full test suite
- [ ] Manual test critical paths
- [ ] Check logs for errors
- [ ] Performance testing
- [ ] Security re-scan (`npm audit`)
- [ ] Update documentation
- [ ] Deploy to staging first
- [ ] Monitor production after deploy

---

## 🔒 PHẦN 5: BEST PRACTICES ĐỀ XUẤT

### 5.1. Dependency Management

1. **Lock file management**
   ```bash
   # Commit package-lock.json vào git
   git add package-lock.json
   ```

2. **Regular updates**
   ```bash
   # Chạy mỗi tuần
   npm outdated
   npm update
   npm audit
   ```

3. **Automated scanning**
   - Setup Dependabot/Renovate
   - Enable GitHub Security Alerts
   - Add npm audit vào CI/CD

### 5.2. Security Configuration

1. **Tạo `.npmrc`**
   ```
   registry=https://registry.npmjs.org/
   package-lock=true
   save-exact=true
   ```

2. **CI/CD Integration**
   ```yaml
   # .github/workflows/security.yml
   name: Security Audit
   on: [push, pull_request]
   jobs:
     audit:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Run npm audit
           run: |
             cd v1 && npm audit --audit-level=moderate
             cd ../v2 && npm audit --audit-level=moderate
   ```

### 5.3. Code Security

1. **JWT Best Practices**
   ```javascript
   // Always specify algorithms
   jwt.verify(token, secret, { algorithms: ['HS256'] });

   // Use short expiry
   jwt.sign(payload, secret, { expiresIn: '15m' });

   // Validate all claims
   jwt.verify(token, secret, {
     algorithms: ['HS256'],
     issuer: 'icool-staff',
     audience: 'icool-api'
   });
   ```

2. **Input Validation**
   ```typescript
   // Always validate and sanitize
   import { IsString, IsEmail, MaxLength } from 'class-validator';
   import { sanitize } from 'class-sanitizer';

   class UserDto {
     @IsEmail()
     @MaxLength(255)
     email: string;
   }
   ```

3. **File Upload Security**
   ```typescript
   // Whitelist extensions
   const ALLOWED_EXTENSIONS = ['.jpg', '.png', '.pdf', '.xlsx'];

   // Check MIME type
   const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'application/pdf'];

   // Limit file size
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
   ```

---

## 📞 PHẦN 6: LIÊN HỆ VÀ HỖ TRỢ

### Resources
- [NPM Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

### Monitoring
- Setup Snyk: https://snyk.io/
- Enable GitHub Dependabot
- Use npm audit hooks

---

## 📈 PHẦN 7: THEO DÕI

### Metrics to Monitor
1. Number of vulnerabilities over time
2. Time to fix critical issues
3. Dependency freshness
4. Security incidents

### Next Review
- **Date:** 26/01/2026 (1 tháng sau)
- **Scope:** Full security audit + penetration testing
- **Owner:** Security Team

---

**Báo cáo được tạo bởi:** Claude Code Security Audit
**Version:** 1.0
**Last Updated:** 26/12/2025
