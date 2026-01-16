# Enums & Constants

Tài liệu này liệt kê tất cả các enum và constant được sử dụng trong module Promotional Programs.

## 📋 Table of Contents

- [PromotionType](#promotiontype)
- [DiscountType](#discounttype)
- [PromotionalProgramStatus](#promotionalprogramstatus)
- [PromotionFailReason](#promotionfailreason)
- [OrderOrigin (Kênh Áp Dụng)](#orderorigin-kênh-áp-dụng)
- [is_combinable (Cho Phép Dùng Chung)](#is_combinable-cho-phép-dùng-chung)
- [Condition Types](#condition-types)

---

## PromotionType

**Mục đích**: Định nghĩa các loại chương trình khuyến mãi

```typescript
enum PromotionType {
  BUY_X_GET_Y = 'buy_x_get_y', // Mua X Tặng Y
  DISCOUNT_PERCENTAGE = 'discount_percentage', // Giảm Giá Theo %
  DISCOUNT_AMOUNT = 'discount_amount', // Giảm Giá Cố Định
  COMBO = 'combo', // Combo
  BUNDLE = 'bundle', // Gói Sản Phẩm
}
```

### Giá trị và ý nghĩa

| Giá trị               | Label            | Mô tả                                        | Ví dụ                    |
| --------------------- | ---------------- | -------------------------------------------- | ------------------------ |
| `buy_x_get_y`         | Mua X Tặng Y     | Mua sản phẩm/combo, tặng sản phẩm/combo khác | Mua 2 cafe tặng 1 trà    |
| `discount_percentage` | Giảm Giá Theo %  | Giảm giá theo phần trăm                      | Giảm 20% đơn từ 200K     |
| `discount_amount`     | Giảm Giá Cố Định | Giảm số tiền cố định                         | Giảm 50K cho đơn từ 150K |
| `combo`               | Combo            | Khuyến mãi liên quan đến combo               | Giảm 30% combo VIP       |
| `bundle`              | Gói Sản Phẩm     | Gói nhiều sản phẩm với giá ưu đãi            | Bundle 3 món giá 99K     |

### Sử dụng trong API

```json
{
  "promotion_type": "buy_x_get_y"
}
```

**⚠️ Lưu ý quan trọng**:

- `promotion_type` **KHÔNG THỂ THAY ĐỔI** sau khi tạo chương trình
- Nếu cố gắng đổi promotion_type khi update sẽ báo lỗi 400

---

## DiscountType

**Mục đích**: Định nghĩa loại giảm giá

```typescript
enum DiscountType {
  PERCENTAGE = 'percentage', // Giảm theo phần trăm
  FIXED_AMOUNT = 'fixed_amount', // Giảm số tiền cố định
}
```

### Giá trị và ý nghĩa

| Giá trị        | Label           | Mô tả                      | discount_value | Ví dụ                |
| -------------- | --------------- | -------------------------- | -------------- | -------------------- |
| `percentage`   | Phần Trăm       | Giảm theo %                | Số từ 1-100    | 20 = giảm 20%        |
| `fixed_amount` | Số Tiền Cố Định | Giảm số tiền cố định (VNĐ) | Số tiền (VNĐ)  | 50000 = giảm 50,000đ |

### Sử dụng trong API

```json
{
  "discount_type": "percentage",
  "discount_value": 20,
  "max_discount_amount": 100000
}
```

```json
{
  "discount_type": "fixed_amount",
  "discount_value": 50000
}
```

---

## PromotionalProgramStatus

**Mục đích**: Trạng thái của chương trình khuyến mãi

- Status là **computed property** được tính tự động dựa vào:
  - Field `active` (boolean)
  - Field `start_date` (timestamp)
  - Field `end_date` (timestamp)
  - **Thời gian hiện tại của Vietnam (UTC+7)**

```typescript
enum PromotionalProgramStatus {
  ACTIVE = 'active', // Đang hoạt động
  INACTIVE = 'inactive', // Tạm dừng
  SCHEDULED = 'scheduled', // Đã lên lịch (chưa đến ngày bắt đầu)
  EXPIRED = 'expired', // Hết hạn (quá ngày kết thúc)
}
```

### Giá trị và ý nghĩa

| Giá trị     | Label          | Mô tả                        | Điều kiện Tính Toán                                            |
| ----------- | -------------- | ---------------------------- | -------------------------------------------------------------- |
| `inactive`  | Tạm Dừng       | Chương trình bị tắt thủ công | `active = false` (bỏ qua mọi điều kiện khác)                   |
| `scheduled` | Đã Lên Lịch    | Chương trình chưa bắt đầu    | `active = true` VÀ Giờ VN hiện tại < `start_date`              |
| `active`    | Đang Hoạt Động | Chương trình đang chạy       | `active = true` VÀ `start_date` ≤ Giờ VN hiện tại ≤ `end_date` |
| `expired`   | Hết Hạn        | Chương trình đã kết thúc     | `active = true` VÀ Giờ VN hiện tại > `end_date`                |

**Ví dụ date format:**

```
2024-01-07T14:30:00+07:00  ✅ (Khuyến nghị)
2024-01-07T07:30:00Z       ✅ (UTC - sẽ convert sang VN)
```

### Sử dụng trong API

**Response sẽ luôn có status computed:**

```json
{
  "id": "123",
  "name": "Giảm 50K Đơn Từ 200K",
  "active": true,
  "start_date": "2024-01-01T00:00:00+07:00",
  "end_date": "2024-12-31T23:59:59+07:00",
  "status": "active" // ← Computed tự động, KHÔNG lưu DB
}
```

---

## PromotionFailReason

**Mục đích**: Các lý do chương trình khuyến mãi không áp dụng được

```typescript
enum PromotionFailReason {
  PROGRAM_NOT_ACTIVE = 'Chương trình không hoạt động',
  PROGRAM_NOT_STARTED = 'Chương trình chưa bắt đầu',
  PROGRAM_EXPIRED = 'Chương trình đã hết hạn',
  STORE_NOT_APPLICABLE = 'Cửa hàng không áp dụng',
  MIN_ORDER_NOT_MET = 'Chưa đạt giá trị đơn hàng tối thiểu',
  USAGE_LIMIT_REACHED = 'Đã hết lượt sử dụng',
  PRODUCTS_NOT_MATCH = 'Sản phẩm không phù hợp',
  COMBOS_NOT_MATCH = 'Combo không phù hợp',
  QUANTITY_NOT_MET = 'Chưa đủ số lượng yêu cầu',
  TIME_RESTRICTION = 'Ngoài khung giờ áp dụng',
  CONDITION_NOT_MET = 'Không đáp ứng điều kiện',
  CHANNEL_NOT_APPLICABLE = 'Kênh đặt hàng không áp dụng',
}
```

### Sử dụng

Các lý do này xuất hiện trong response khi validate promotion:

```json
{
  "isValid": false,
  "message": "Chương trình không hoạt động",
  "failReasons": [
    "Chương trình không hoạt động",
    "Ngoài khung giờ áp dụng (14:00-16:00)"
  ]
}
```

---

## Condition Types

**Mục đích**: Các loại điều kiện áp dụng cho chương trình khuyến mãi

### time_range

Giới hạn khung giờ áp dụng trong ngày

```typescript
{
  "condition_type": "time_range",
  "condition_value": {
    "start_time": "14:00",  // HH:mm format
    "end_time": "16:00",
    "description": "Chỉ áp dụng từ 14h-16h"
  }
}
```

**Ví dụ**: Happy Hour từ 14h-16h

### day_of_week

Giới hạn theo ngày trong tuần

```typescript
{
  "condition_type": "day_of_week",
  "condition_value": {
    "days": ["saturday", "sunday"], // hoặc [6, 0] (0=Sunday, 6=Saturday)
    "description": "Chỉ áp dụng cuối tuần"
  }
}
```

**Giá trị hợp lệ**:

- String: `"monday"`, `"tuesday"`, `"wednesday"`, `"thursday"`, `"friday"`, `"saturday"`, `"sunday"`
- Number: `0` (Sunday), `1` (Monday), ..., `6` (Saturday)

### min_items

Giới hạn số lượng sản phẩm tối thiểu

```typescript
{
  "condition_type": "min_items",
  "condition_value": {
    "min_quantity": 5,
    "description": "Tối thiểu 5 sản phẩm"
  }
}
```

### first_order

Chỉ áp dụng cho đơn hàng đầu tiên của khách hàng

```typescript
{
  "condition_type": "first_order",
  "condition_value": {
    "is_first_order": true,
    "description": "Chỉ áp dụng cho khách hàng mới"
  }
}
```

---

## Type Data Structure

**Mục đích**: Cấu trúc dữ liệu động cho từng loại promotion

### buy_x_get_y với Combo

```typescript
{
  "type_data": {
    "buy_combo_ids": ["uuid-1", "uuid-2"],        // Combo phải mua
    "buy_combo_min_quantity": 1,                   // Số lượng tối thiểu (optional)
    "reward_product_ids": ["uuid-3", "uuid-4"],   // Sản phẩm được tặng
    "reward_quantity": 1                           // Số lượng tặng
  }
}
```

### buy_x_get_y với Product

```typescript
{
  "type_data": {
    "buy_product_ids": ["uuid-1", "uuid-2"],      // Sản phẩm phải mua
    "buy_product_min_quantity": 2,                 // Số lượng tối thiểu
    "buy_product_min_size": "L",                   // Size tối thiểu (S/M/L)
    "reward_combo_ids": ["uuid-3"],               // Combo được tặng
    "reward_quantity": 1                           // Số lượng tặng
  }
}
```

### combo_discount

```typescript
{
  "type_data": {
    "buy_combo_ids": ["uuid-1"],                  // Combo phải mua (optional)
    "discount_combo_ids": ["uuid-2", "uuid-3"],   // Combo được giảm giá
    "time_restriction": {                          // Giới hạn thời gian (optional)
      "start_time": "14:00",
      "end_time": "16:00"
    }
  }
}
```

### discount_percentage / discount_amount

```typescript
{
  "type_data": {
    "description": "Mô tả chi tiết"
  }
}
```

---

## OrderOrigin (Kênh Áp Dụng)

**Mục đích**: Xác định chương trình khuyến mãi áp dụng cho kênh nào

```typescript
enum OrderOrigin {
  POS = 'pos', // Chỉ tại cửa hàng
  APP = 'app', // Chỉ trên app Taco Sushi
  ALL = 'all', // Áp dụng cả hai kênh (mặc định)
}
```

### Giá trị và ý nghĩa

| Giá trị | Label             | Mô tả                                  | Ứng dụng                             |
| ------- | ----------------- | -------------------------------------- | ------------------------------------ |
| `pos`   | Tại Cửa Hàng      | CTKM chỉ áp dụng khi đặt hàng tại quầy | Khuyến mãi giờ cao điểm tại cửa hàng |
| `app`   | Trên App          | CTKM chỉ áp dụng khi đặt qua app       | Khuyến mãi online, freeship          |
| `all`   | Tất Cả (mặc định) | CTKM áp dụng cho cả POS và APP         | Chương trình khuyến mãi chung        |

### Sử dụng trong API

**Tạo CTKM chỉ áp dụng trên App:**

```json
{
  "name": "Freeship 0đ - Đặt Hàng Online",
  "promotion_type": "discount_amount",
  "order_origin": "app",
  "discount_value": 30000
}
```

**Tạo CTKM chỉ áp dụng tại cửa hàng:**

```json
{
  "name": "Happy Hour 14-16h Tại Quầy",
  "promotion_type": "discount_percentage",
  "order_origin": "pos",
  "discount_value": 20
}
```

**Tạo CTKM áp dụng cả hai kênh:**

```json
{
  "name": "Giảm 20% Đơn Từ 200K",
  "promotion_type": "discount_percentage",
  "order_origin": "all",
  "discount_value": 20
}
```

### Logic áp dụng khi checkout

```
1. Khi khách hàng checkout:
   - Xác định order_origin của đơn hàng (pos/app)
   - Lọc các CTKM có order_origin = 'all' HOẶC order_origin = order_origin_của_đơn_hàng

2. Ví dụ:
   - Đơn hàng từ APP → Áp dụng CTKM có order_origin = 'app' hoặc 'all'
   - Đơn hàng từ POS → Áp dụng CTKM có order_origin = 'pos' hoặc 'all'
```

### Fail Reason

Khi CTKM không áp dụng do sai kênh:

```json
{
  "isValid": false,
  "message": "Chương trình chỉ áp dụng cho đơn hàng đặt qua app",
  "failReasons": ["CHANNEL_NOT_APPLICABLE"]
}
```

### Best Practices

| Loại CTKM                | order_origin | Lý do                                     |
| ------------------------ | ------------ | ----------------------------------------- |
| Freeship, Voucher Online | `app`        | Khuyến khích đặt hàng qua app             |
| Happy Hour tại quầy      | `pos`        | Tăng traffic tại cửa hàng                 |
| Flash Sale lớn           | `all`        | Tối đa hóa doanh số trên mọi kênh         |
| Khuyến mãi cho khách mới | `app`        | Thu thập data khách hàng qua app          |
| Combo combo giờ cao điểm | `pos`        | Giảm tải app, tăng hiệu suất tại cửa hàng |

---

## is_combinable (Cho Phép Dùng Chung)

**Mục đích**: Cho phép hoặc không cho phép CTKM này được dùng đồng thời với các CTKM/voucher khác

```typescript
is_combinable: boolean; // Default: false
```

### Giá trị và ý nghĩa

| Giá trị | Label                | Mô tả                                        | Ứng dụng                    |
| ------- | -------------------- | -------------------------------------------- | --------------------------- |
| `true`  | Cho phép chồng       | CTKM có thể dùng chung với CTKM/voucher khác | Flash sale, khuyến mãi nhỏ  |
| `false` | Độc quyền (mặc định) | CTKM không thể dùng chung, phải chọn 1       | Giảm giá lớn, CTKM đặc biệt |

### Sử dụng trong API

**Tạo CTKM cho phép dùng chung:**

```json
{
  "name": "Giảm 10% Thành Viên Mới",
  "promotion_type": "discount_percentage",
  "is_combinable": true,
  "discount_value": 10
}
```

**Tạo CTKM độc quyền (không dùng chung):**

```json
{
  "name": "Black Friday - Giảm 50%",
  "promotion_type": "discount_percentage",
  "is_combinable": false,
  "discount_value": 50
}
```

### Logic áp dụng khi checkout

```
1. Nếu đơn hàng có nhiều CTKM/voucher áp dụng:
   - Lọc các CTKM có is_combinable = true → có thể chồng tất cả
   - Lọc các CTKM có is_combinable = false → chỉ được chọn 1

2. Ưu tiên:
   - Nếu khách chọn CTKM độc quyền (is_combinable = false):
     → Bỏ qua tất cả CTKM khác, chỉ áp dụng CTKM độc quyền
   - Nếu khách chọn nhiều CTKM cho phép chồng (is_combinable = true):
     → Áp dụng tất cả theo thứ tự priority
```

### Best Practices

| Loại CTKM             | is_combinable  | Lý do                                 |
| --------------------- | -------------- | ------------------------------------- |
| Flash Sale, Big Sale  | `false`        | Giảm giá đã lớn, không cần chồng thêm |
| Ưu đãi thành viên mới | `true`         | Khuyến khích khách mới, có thể chồng  |
| Mua X Tặng Y          | `true`/`false` | Tùy chiến lược                        |
| Giảm % nhỏ (5-15%)    | `true`         | Cho phép chồng với voucher khác       |
| Giảm % lớn (30-50%)   | `false`        | Độc quyền, tránh lỗ                   |
| Voucher sinh nhật     | `true`         | Đặc quyền khách hàng, có thể chồng    |

---

## Validation Rules

### Quy tắc chung

1. **promotion_type**: Bắt buộc khi tạo, không được đổi khi update
2. **discount_type**: Bắt buộc nếu có discount_value
3. **discount_value**: Phải > 0
4. **start_date < end_date**: Ngày kết thúc phải sau ngày bắt đầu
5. **priority**: Số càng cao càng ưu tiên (default: 0)
6. **is_combinable**: Mặc định `false` (độc quyền)
7. **order_origin**: Mặc định `all` (áp dụng cả POS và APP)

### Quy tắc theo loại

#### buy_x_get_y

- Phải có `type_data.buy_combo_ids` hoặc `type_data.buy_product_ids`
- Phải có `type_data.reward_combo_ids` hoặc `type_data.reward_product_ids`

#### combo_discount

- Phải có `type_data.discount_combo_ids`
- Phải có `discount_type` và `discount_value`

#### discount_percentage

- `discount_value` phải từ 1-100
- Nên có `max_discount_amount` để giới hạn số tiền giảm tối đa

#### discount_amount

- `discount_value` là số tiền (VNĐ)
- Nên có `min_order_amount` để đảm bảo đơn hàng đủ giá trị

---

## Error Codes

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": "Không thể thay đổi loại chương trình khuyến mãi"
}
```

```json
{
  "statusCode": 400,
  "message": "Ngày kết thúc phải sau ngày bắt đầu"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Không tìm thấy chương trình khuyến mãi"
}
```

---

## Best Practices

### 1. Đặt tên chương trình

- Rõ ràng, ngắn gọn
- Bao gồm loại khuyến mãi và điều kiện
- Ví dụ: "Mua 2 Tặng 1 - Cafe Phin", "Giảm 20% Đơn Từ 200K"

### 2. Priority

- Chương trình đặc biệt: 20-30
- Chương trình thông thường: 5-15
- Chương trình mặc định: 1-5

### 3. Usage Limit

- Luôn set usage_limit để tránh lạm dụng
- Flash sale: 50-100
- Chương trình thường: 1000-5000

### 4. Thời gian

- Set start_date và end_date rõ ràng
- Kiểm tra timezone (UTC)
- Để thời gian dư 1-2 giờ ở đầu/cuối ngày

### 5. Type Data

- Validate product_id và combo_id trước khi tạo
- Giữ structure nhất quán
- Thêm description để dễ hiểu

---

## Examples

### Tạo chương trình Mua 2 Tặng 1

```json
{
  "name": "Mua 2 Tặng 1 - Cafe Phin",
  "description": "Mua 2 ly Cafe Phin, tặng ngay 1 ly",
  "promotion_type": "buy_x_get_y",
  "discount_type": "fixed_amount",
  "discount_value": 0,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 10,
  "usage_limit": 1000,
  "order_origin": "all",
  "is_combinable": true,
  "type_data": {
    "buy_product_ids": ["231228ee-e9b7-4bae-8150-f24dfdb067f4"],
    "buy_product_min_quantity": 2,
    "reward_product_ids": ["231228ee-e9b7-4bae-8150-f24dfdb067f4"],
    "reward_quantity": 1
  }
}
```

### Tạo chương trình Giảm 20% Tổng Bill

```json
{
  "name": "Giảm 20% Đơn Từ 200K",
  "description": "Đơn hàng từ 200,000đ giảm ngay 20%",
  "promotion_type": "discount_percentage",
  "discount_type": "percentage",
  "discount_value": 20,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 5,
  "min_order_amount": 200000,
  "max_discount_amount": 100000,
  "usage_limit": 2000,
  "order_origin": "all",
  "is_combinable": false
}
```

### Tạo Happy Hour (Chỉ tại cửa hàng)

```json
{
  "name": "Happy Hour - Giảm 30% Combo",
  "description": "Từ 14h-16h giảm 30% tất cả combo - Chỉ tại quầy",
  "promotion_type": "combo",
  "discount_type": "percentage",
  "discount_value": 30,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 15,
  "max_discount_amount": 80000,
  "usage_limit": 1500,
  "order_origin": "pos",
  "is_combinable": false,
  "conditions": [
    {
      "condition_type": "time_range",
      "condition_value": {
        "start_time": "14:00",
        "end_time": "16:00"
      }
    }
  ],
  "type_data": {
    "discount_combo_ids": [
      "ed2236f0-023f-45f2-b5fc-99e81ff44d53",
      "94f7aa14-1b5a-4cad-a030-2d33dd7d451b"
    ]
  }
}
```

### Tạo Freeship cho App

```json
{
  "name": "Freeship 30K - Đặt Qua App",
  "description": "Miễn phí ship 30K cho đơn hàng đặt qua app Taco Sushi",
  "promotion_type": "discount_amount",
  "discount_type": "fixed_amount",
  "discount_value": 30000,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 8,
  "min_order_amount": 100000,
  "usage_limit": 5000,
  "order_origin": "app",
  "is_combinable": true
}
```
