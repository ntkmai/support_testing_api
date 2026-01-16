# API Reference - TypeScript Interfaces

## Table of Contents

- [Promotional Programs API](#promotional-programs-api)
  - [GET List](#get-list-promotional-programs)
  - [GET Detail](#get-detail-promotional-program)
  - [POST Create](#create-promotional-program)
  - [PUT Update](#update-promotional-program)
  - [PATCH Toggle Active](#toggle-active)
  - [DELETE Remove](#delete-promotional-program)
- [Combos API](#combos-api)
  - [GET List](#get-list-combos)
  - [GET Detail](#get-detail-combo)
  - [GET Search](#search-combos)
- [Enums & Constants](#enums--constants)

---

## Promotional Programs API

### Ví dụ chi tiết - Request & Response / Detailed Examples

#### Request Example - Tạo Chương Trình Khuyến Mãi (Create Promotional Program)

```json
{
  "name": "Mua 1 Combo Trà Sữa Tặng 1 Trà Đào",
  // Tên chương trình khuyến mãi (bắt buộc)
  // The promotional program name (required)

  "description": "Áp dụng từ 14h-16h các ngày trong tuần tại chi nhánh Quận 1",
  // Mô tả chi tiết về chương trình (không bắt buộc)
  // Detailed description of the program (optional)

  "promotion_type": "buy_x_get_y",
  // Loại khuyến mãi (bắt buộc)
  // Type of promotion (required)
  // Các giá trị: 'buy_x_get_y', 'discount_percentage', 'discount_fixed_amount', 'combo_discount', 'bundle'

  "discount_type": "percentage",
  // Loại giảm giá (không bắt buộc, dùng khi có discount_value)
  // Type of discount (optional, used when discount_value is provided)
  // Các giá trị: 'percentage' (%), 'fixed_amount' (số tiền cố định)

  "discount_value": 100,
  // Giá trị giảm giá (không bắt buộc)
  // Discount value (optional)
  // Nếu discount_type = 'percentage': giá trị từ 0-100
  // Nếu discount_type = 'fixed_amount': số tiền VNĐ

  "start_date": "2024-01-15T00:00:00.000Z",
  // Ngày bắt đầu chương trình (bắt buộc)
  // Program start date (required)
  // Format: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

  "end_date": "2024-01-31T23:59:59.999Z",
  // Ngày kết thúc chương trình (bắt buộc)
  // Program end date (required)
  // Format: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

  "priority": 10,
  // Độ ưu tiên của chương trình (không bắt buộc, mặc định: 0)
  // Program priority (optional, default: 0)
  // Giá trị: 0-100, số càng cao càng ưu tiên

  "min_order_amount": 50000,
  // Giá trị đơn hàng tối thiểu để áp dụng khuyến mãi (không bắt buộc)
  // Minimum order amount to apply promotion (optional)
  // Đơn vị: VNĐ

  "max_discount_amount": 100000,
  // Số tiền giảm giá tối đa (không bắt buộc)
  // Maximum discount amount (optional)
  // Đơn vị: VNĐ, chỉ áp dụng khi discount_type = 'percentage'

  "usage_limit": 1000,
  // Giới hạn số lần sử dụng chương trình (không bắt buộc)
  // Usage limit for the program (optional)
  // Sau khi đạt giới hạn, chương trình sẽ không còn áp dụng

  "order_origin": "all",
  // Kênh áp dụng chương trình (không bắt buộc, mặc định: "all")
  // Channel where promotion applies (optional, default: "all")
  // Các giá trị: 'pos' (tại cửa hàng), 'app' (trên app), 'all' (cả hai)

  "is_combinable": false,
  // Cho phép dùng chung với CTKM/voucher khác (không bắt buộc, mặc định: false)
  // Allow combining with other promotions/vouchers (optional, default: false)
  // true = có thể chồng với CTKM khác, false = độc quyền

  "products": [
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440001",
      // ID sản phẩm (bắt buộc)
      // Product ID (required)
      // Format: UUID

      "store_product_id": "550e8400-e29b-41d4-a716-446655440002",
      // ID sản phẩm tại cửa hàng cụ thể (không bắt buộc)
      // Store-specific product ID (optional)
      // Format: UUID

      "quantity": 1,
      // Số lượng sản phẩm (không bắt buộc, mặc định: 1)
      // Product quantity (optional, default: 1)

      "is_free_item": false,
      // Đánh dấu sản phẩm là quà tặng miễn phí (không bắt buộc, mặc định: false)
      // Mark product as free gift (optional, default: false)
      // true = sản phẩm tặng, false = sản phẩm mua

      "discount_type": "percentage",
      // Loại giảm giá cho sản phẩm này (không bắt buộc)
      // Discount type for this product (optional)

      "discount_value": 50
      // Giá trị giảm giá cho sản phẩm này (không bắt buộc)
      // Discount value for this product (optional)
    },
    {
      "product_id": "550e8400-e29b-41d4-a716-446655440003",
      "quantity": 1,
      "is_free_item": true
      // Sản phẩm tặng kèm
    }
  ],
  // Danh sách sản phẩm áp dụng cho chương trình (không bắt buộc)
  // List of products for the program (optional)

  "stores": [
    {
      "store_id": "550e8400-e29b-41d4-a716-446655440010",
      // ID cửa hàng (bắt buộc)
      // Store ID (required)
      // Format: UUID

      "active": true
      // Trạng thái kích hoạt tại cửa hàng này (không bắt buộc, mặc định: true)
      // Active status at this store (optional, default: true)
    }
  ],
  // Danh sách cửa hàng áp dụng chương trình (không bắt buộc)
  // List of stores where program applies (optional)
  // Nếu không truyền = áp dụng tất cả cửa hàng

  "conditions": [
    {
      "condition_type": "time_range",
      // Loại điều kiện (bắt buộc)
      // Condition type (required)
      // Các loại: 'time_range', 'day_of_week', 'min_items', v.v.

      "condition_value": {
        "start_time": "14:00",
        "end_time": "16:00"
      }
      // Giá trị điều kiện (bắt buộc)
      // Condition value (required)
      // Cấu trúc phụ thuộc vào condition_type
    },
    {
      "condition_type": "day_of_week",
      "condition_value": {
        "days": [1, 2, 3, 4, 5]
        // 0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7
        // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      }
    }
  ],
  // Danh sách điều kiện áp dụng (không bắt buộc)
  // List of application conditions (optional)

  "type_data": {
    "buy_combo_ids": ["550e8400-e29b-41d4-a716-446655440020"],
    // Danh sách ID combo cần mua
    // List of combo IDs to buy

    "buy_combo_min_quantity": 1,
    // Số lượng combo tối thiểu cần mua
    // Minimum combo quantity to buy

    "reward_product_ids": ["550e8400-e29b-41d4-a716-446655440003"],
    // Danh sách ID sản phẩm được tặng
    // List of reward product IDs

    "reward_quantity": 1
    // Số lượng sản phẩm được tặng
    // Reward product quantity
  }
  // Dữ liệu động theo loại khuyến mãi (không bắt buộc)
  // Dynamic data based on promotion type (optional)
  // Cấu trúc phụ thuộc vào promotion_type
}
```

#### Response Example - Chi tiết Chương Trình Khuyến Mãi (Promotional Program Detail)

```json
{
  "status": true,
  // Trạng thái API call
  // API call status
  // true = thành công, false = thất bại

  "data": {
    "id": "650e8400-e29b-41d4-a716-446655440099",
    // ID duy nhất của chương trình khuyến mãi
    // Unique promotional program ID
    // Format: UUID v4

    "name": "Mua 1 Combo Trà Sữa Tặng 1 Trà Đào",
    // Tên chương trình khuyến mãi
    // Promotional program name

    "description": "Áp dụng từ 14h-16h các ngày trong tuần tại chi nhánh Quận 1",
    // Mô tả chi tiết về chương trình
    // Detailed program description

    "promotion_type": "buy_x_get_y",
    // Loại khuyến mãi
    // Promotion type
    // 'buy_x_get_y' = Mua X tặng Y
    // 'discount_percentage' = Giảm giá theo %
    // 'discount_fixed_amount' = Giảm giá số tiền cố định
    // 'combo_discount' = Giảm giá combo
    // 'bundle' = Nhóm sản phẩm

    "discount_type": "percentage",
    // Loại giảm giá
    // Discount type
    // 'percentage' = Phần trăm (%)
    // 'fixed_amount' = Số tiền cố định (VNĐ)

    "discount_value": 100,
    // Giá trị giảm giá
    // Discount value
    // Nếu discount_type = 'percentage': 0-100
    // Nếu discount_type = 'fixed_amount': số tiền VNĐ

    "start_date": "2024-01-15T00:00:00.000Z",
    // Ngày giờ bắt đầu chương trình
    // Program start date and time
    // Format: ISO 8601

    "end_date": "2024-01-31T23:59:59.999Z",
    // Ngày giờ kết thúc chương trình
    // Program end date and time
    // Format: ISO 8601

    "status": "active",
    // Trạng thái chương trình
    // Program status
    // 'active' = Đang hoạt động
    // 'inactive' = Tạm dừng
    // 'expired' = Đã hết hạn

    "priority": 10,
    // Độ ưu tiên của chương trình
    // Program priority
    // 0-100, số càng cao = ưu tiên càng cao
    // Khi nhiều CTKM cùng áp dụng, ưu tiên chương trình có priority cao hơn

    "min_order_amount": 50000,
    // Giá trị đơn hàng tối thiểu (VNĐ)
    // Minimum order amount (VND)
    // Đơn hàng phải >= giá trị này mới áp dụng được CTKM

    "max_discount_amount": 100000,
    // Số tiền giảm giá tối đa (VNĐ)
    // Maximum discount amount (VND)
    // Giới hạn số tiền tối đa được giảm (áp dụng cho discount_type = 'percentage')

    "usage_limit": 1000,
    // Giới hạn số lần sử dụng
    // Usage limit
    // Tổng số lần tối đa CTKM có thể được sử dụng

    "usage_count": 127,
    // Số lần đã sử dụng
    // Current usage count
    // Số lần CTKM đã được áp dụng thành công

    "active": true,
    // Trạng thái kích hoạt
    // Active status
    // true = Đang bật, false = Đang tắt
    // Admin có thể bật/tắt thủ công

    "order_origin": "all",
    // Kênh áp dụng chương trình
    // Channel where promotion applies
    // 'pos' = Chỉ tại cửa hàng, 'app' = Chỉ trên app, 'all' = Cả hai kênh

    "is_combinable": false,
    // Cho phép dùng chung với CTKM/voucher khác
    // Allow combining with other promotions/vouchers
    // false = Độc quyền (chỉ dùng 1 CTKM), true = Có thể chồng nhiều CTKM

    "created_by": "650e8400-e29b-41d4-a716-446655440100",
    // ID người tạo
    // Creator user ID
    // UUID của admin/user đã tạo CTKM

    "created_at": "2024-01-10T08:30:00.000Z",
    // Thời gian tạo
    // Creation timestamp
    // Format: ISO 8601

    "updated_at": "2024-01-12T14:20:00.000Z",
    // Thời gian cập nhật gần nhất
    // Last update timestamp
    // Format: ISO 8601

    "updated_by": "650e8400-e29b-41d4-a716-446655440101",
    // ID người cập nhật gần nhất
    // Last updater user ID
    // UUID của admin/user đã cập nhật CTKM lần cuối

    "type_data": {
      "buy_combo_ids": ["550e8400-e29b-41d4-a716-446655440020"],
      "buy_combo_min_quantity": 1,
      "reward_product_ids": ["550e8400-e29b-41d4-a716-446655440003"],
      "reward_quantity": 1
    },
    // Dữ liệu động theo loại khuyến mãi
    // Dynamic data based on promotion type
    // Cấu trúc thay đổi tùy vào promotion_type

    "products": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440200",
        // ID quan hệ giữa CTKM và sản phẩm
        // Promotional program - product relationship ID

        "product_id": "550e8400-e29b-41d4-a716-446655440001",
        // ID sản phẩm
        // Product ID

        "product_name": "Trà Sữa Trân Châu Đường Đen",
        // Tên sản phẩm
        // Product name

        "product_code": "TSTCDD",
        // Mã sản phẩm
        // Product code

        "store_product_id": "550e8400-e29b-41d4-a716-446655440002",
        // ID sản phẩm tại cửa hàng cụ thể
        // Store-specific product ID
        // null nếu áp dụng cho tất cả cửa hàng

        "quantity": 1,
        // Số lượng sản phẩm
        // Product quantity

        "is_free_item": false,
        // Sản phẩm tặng miễn phí?
        // Is free gift item?
        // false = Sản phẩm mua, true = Sản phẩm tặng

        "discount_type": "percentage",
        // Loại giảm giá cho sản phẩm này
        // Discount type for this product

        "discount_value": 50
        // Giá trị giảm giá cho sản phẩm này
        // Discount value for this product
      },
      {
        "id": "750e8400-e29b-41d4-a716-446655440201",
        "product_id": "550e8400-e29b-41d4-a716-446655440003",
        "product_name": "Trà Đào Cam Sả",
        "product_code": "TDCS",
        "store_product_id": null,
        "quantity": 1,
        "is_free_item": true,
        // Đây là sản phẩm tặng
        // This is a free gift item
        "discount_type": null,
        "discount_value": null
      }
    ],
    // Danh sách sản phẩm liên kết với CTKM
    // List of products associated with the program

    "stores": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440300",
        // ID quan hệ giữa CTKM và cửa hàng
        // Promotional program - store relationship ID

        "store_id": "550e8400-e29b-41d4-a716-446655440010",
        // ID cửa hàng
        // Store ID

        "store_name": "Chi nhánh Quận 1",
        // Tên cửa hàng
        // Store name

        "active": true
        // CTKM có đang kích hoạt tại cửa hàng này không
        // Is program active at this store
      }
    ],
    // Danh sách cửa hàng áp dụng CTKM
    // List of stores where program applies
    // Rỗng = áp dụng tất cả cửa hàng

    "conditions": [
      {
        "id": "750e8400-e29b-41d4-a716-446655440400",
        // ID điều kiện
        // Condition ID

        "condition_type": "time_range",
        // Loại điều kiện
        // Condition type
        // 'time_range' = Khung giờ trong ngày
        // 'day_of_week' = Ngày trong tuần
        // 'min_items' = Số lượng sản phẩm tối thiểu

        "condition_value": {
          "start_time": "14:00",
          "end_time": "16:00"
        }
        // Giá trị điều kiện
        // Condition value
        // Chỉ áp dụng CTKM từ 14:00 đến 16:00
      },
      {
        "id": "750e8400-e29b-41d4-a716-446655440401",
        "condition_type": "day_of_week",
        "condition_value": {
          "days": [1, 2, 3, 4, 5]
        }
        // Chỉ áp dụng thứ 2-6 (Monday-Friday)
        // Only applies Monday-Friday
      }
    ]
    // Danh sách điều kiện để áp dụng CTKM
    // List of conditions to apply the program
  },

  "message": "Lấy thông tin chương trình khuyến mãi thành công"
  // Thông báo kết quả
  // Result message
}
```

---

### GET List Promotional Programs

**Endpoint:** `GET /api/promotional-programs`

#### Query Parameters

```typescript
interface FilterPromotionalProgramDto {
  // Pagination
  page?: number; // Default: 1
  size?: number; // Default: 10

  // Search
  search?: string; // Tìm kiếm theo tên hoặc mô tả

  // Filters
  promotion_type?: PromotionType;
  status?: PromotionalProgramStatus;
  store_id?: string; // UUID
  product_id?: string; // UUID
  active?: boolean;
  order_origin?: string; // 'pos' | 'app' | 'all'
  is_combinable?: boolean; // true | false

  // Date range
  start_date_from?: string; // ISO 8601
  start_date_to?: string; // ISO 8601
  end_date_from?: string; // ISO 8601
  end_date_to?: string; // ISO 8601
}
```

#### Response

```typescript
interface GetPromotionalProgramsResponse {
  status: true;
  data: {
    items: PromotionalProgramResponse[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
  message: string;
}

interface PromotionalProgramResponse {
  id: string;
  name: string;
  description?: string;
  promotion_type: string; // 'buy_x_get_y', 'discount_percentage', etc.
  discount_type?: string; // 'percentage', 'fixed_amount'
  discount_value?: number;
  start_date: Date;
  end_date: Date;
  status: string; // 'active', 'inactive', 'expired'
  priority: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  active: boolean;
  order_origin: string; // 'pos' | 'app' | 'all'
  is_combinable: boolean; // true = allow stacking, false = exclusive
  created_by: string;
  created_at: Date;
  updated_at: Date;
  updated_by: string;
  type_data?: Record<string, any>; // Dynamic data for different promotion types
}
```

---

### GET Detail Promotional Program

**Endpoint:** `GET /api/promotional-programs/{id}`

#### Response

```typescript
interface GetPromotionalProgramDetailResponse {
  status: true;
  data: PromotionalProgramDetailResponse;
  message: string;
}

interface PromotionalProgramDetailResponse extends PromotionalProgramResponse {
  products: PromotionalProgramProductResponse[];
  stores: PromotionalProgramStoreResponse[];
  conditions: PromotionalProgramConditionResponse[];
}

interface PromotionalProgramProductResponse {
  id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  store_product_id?: string;
  quantity: number;
  is_free_item: boolean;
  discount_type?: string;
  discount_value?: number;
}

interface PromotionalProgramStoreResponse {
  id: string;
  store_id: string;
  store_name: string;
  active: boolean;
}

interface PromotionalProgramConditionResponse {
  id: string;
  condition_type: string; // 'time_range', 'day_of_week', 'min_items', etc.
  condition_value: Record<string, any>;
}
```

---

### Create Promotional Program

**Endpoint:** `POST /api/promotional-programs`

#### Request Body

```typescript
interface CreatePromotionalProgramRequest {
  // Required fields
  name: string;
  promotion_type: PromotionType;
  start_date: string; // ISO 8601
  end_date: string; // ISO 8601

  // Optional fields
  description?: string;
  discount_type?: DiscountType;
  discount_value?: number;
  priority?: number; // 0-100, default: 0
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  order_origin?: string; // 'pos' | 'app' | 'all' (default: 'all')
  is_combinable?: boolean; // Allow combining with other promotions (default: false)

  // Relations
  products?: PromotionalProgramProductDto[];
  stores?: PromotionalProgramStoreDto[];
  conditions?: PromotionalProgramConditionDto[];

  // Dynamic data
  type_data?: Record<string, any>;
}

interface PromotionalProgramProductDto {
  product_id: string; // UUID (required)
  store_product_id?: string; // UUID (optional)
  quantity?: number; // Default: 1
  is_free_item?: boolean; // Default: false
  discount_type?: DiscountType;
  discount_value?: number;
}

interface PromotionalProgramStoreDto {
  store_id: string; // UUID (required)
  active?: boolean; // Default: true
}

interface PromotionalProgramConditionDto {
  condition_type: string; // Required
  condition_value: Record<string, any>; // Required
}
```

---

## Chi tiết type_data theo từng loại CTKM (Detailed type_data by Promotion Type)

### 1. BUY_X_GET_Y (`buy_x_get_y`) - Mua X Tặng Y

Đây là loại CTKM phức tạp nhất với nhiều biến thể. Dưới đây là TẤT CẢ các trường hợp:

#### 1.1. Mua Combo → Tặng Sản Phẩm

**Mô tả:** Khách mua combo trong danh sách → được tặng sản phẩm

```json
{
  "name": "Mua Combo Sáng - Tặng Cafe Phin",
  "description": "Mua combo sáng bất kỳ, tặng 1 ly Cafe Phin Sữa Đá",
  "promotion_type": "buy_x_get_y",
  "discount_type": "fixed_amount",
  "discount_value": 0,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 10,
  "usage_limit": 1000,
  "type_data": {
    "buy_combo_ids": ["ed2236f0-023f-45f2-b5fc-99e81ff44d53"],
    "buy_combo_min_quantity": 1,
    "reward_product_ids": ["231228ee-e9b7-4bae-8150-f24dfdb067f4"],
    "reward_quantity": 1,
    "description": "Mua 1 combo → Tặng 1 sản phẩm"
  }
}
```

**Giải thích type_data:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `buy_combo_ids` | `string[]` | ✅ | Danh sách UUID combo cần mua |
| `buy_combo_min_quantity` | `number` | ❌ | Số lượng combo tối thiểu (default: 1) |
| `reward_product_ids` | `string[]` | ✅ | Danh sách UUID sản phẩm được tặng |
| `reward_quantity` | `number` | ❌ | Số lượng sản phẩm tặng mỗi món (default: 1) |
| `description` | `string` | ❌ | Mô tả ngắn logic áp dụng |

#### 1.2. Mua Sản Phẩm → Tặng Combo

**Mô tả:** Khách mua đủ số lượng sản phẩm → được tặng combo

```json
{
  "name": "Mua 2 Đồ Uống Size L - Tặng Combo Trưa",
  "description": "Mua 2 ly đồ uống bất kỳ size L, tặng 1 combo trưa",
  "promotion_type": "buy_x_get_y",
  "discount_type": "fixed_amount",
  "discount_value": 0,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 12,
  "min_order_amount": 100000,
  "usage_limit": 500,
  "products": [
    {
      "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "quantity": 1,
      "is_free_item": false
    },
    {
      "product_id": "11e3e792-5014-4574-b096-d86f07cab248",
      "quantity": 1,
      "is_free_item": false
    }
  ],
  "type_data": {
    "buy_product_ids": [
      "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "11e3e792-5014-4574-b096-d86f07cab248"
    ],
    "buy_product_min_quantity": 2,
    "buy_product_min_size": "L",
    "reward_combo_ids": ["94f7aa14-1b5a-4cad-a030-2d33dd7d451b"],
    "reward_quantity": 1
  }
}
```

**Giải thích type_data:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `buy_product_ids` | `string[]` | ✅ | Danh sách UUID sản phẩm cần mua |
| `buy_product_min_quantity` | `number` | ✅ | Tổng số lượng sản phẩm tối thiểu |
| `buy_product_min_size` | `string` | ❌ | Size tối thiểu: `"S"`, `"M"`, `"L"` |
| `reward_combo_ids` | `string[]` | ✅ | Danh sách UUID combo được tặng |
| `reward_quantity` | `number` | ❌ | Số lượng combo tặng (default: 1) |

#### 1.3. Mua Sản Phẩm → Tặng Sản Phẩm

**Mô tả:** Mua đủ số lượng sản phẩm A → được tặng sản phẩm B

```json
{
  "name": "Mua 3 Tặng 1 - Trà Sữa",
  "description": "Mua 3 ly trà sữa bất kỳ, tặng 1 ly size S",
  "promotion_type": "buy_x_get_y",
  "discount_type": "fixed_amount",
  "discount_value": 0,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 8,
  "products": [
    {
      "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "quantity": 3,
      "is_free_item": false
    },
    {
      "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "quantity": 1,
      "is_free_item": true
    }
  ],
  "type_data": {
    "buy_product_ids": ["231228ee-e9b7-4bae-8150-f24dfdb067f4"],
    "buy_product_min_quantity": 3,
    "reward_product_ids": ["231228ee-e9b7-4bae-8150-f24dfdb067f4"],
    "reward_quantity": 1,
    "reward_size": "S"
  }
}
```

**Giải thích type_data:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `buy_product_ids` | `string[]` | ✅ | Sản phẩm cần mua |
| `buy_product_min_quantity` | `number` | ✅ | Số lượng tối thiểu phải mua |
| `reward_product_ids` | `string[]` | ✅ | Sản phẩm được tặng |
| `reward_quantity` | `number` | ❌ | Số lượng tặng (default: 1) |
| `reward_size` | `string` | ❌ | Size sản phẩm tặng: `"S"`, `"M"`, `"L"` |

---

### 2. DISCOUNT_PERCENTAGE (`discount_percentage`) - Giảm Giá %

**Mô tả:** Giảm % trên giá sản phẩm cụ thể

```json
{
  "name": "Giảm 30% Cafe Phin",
  "description": "Cafe Phin Sữa Đá giảm 30% trong tháng 1",
  "promotion_type": "discount_percentage",
  "discount_type": "percentage",
  "discount_value": 30,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-01-31T23:59:59Z",
  "priority": 10,
  "max_discount_amount": 20000,
  "usage_limit": 1000,
  "products": [
    {
      "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "discount_type": "percentage",
      "discount_value": 30
    }
  ],
  "type_data": {
    "description": "Giảm 30% cho Cafe Phin Sữa Đá"
  }
}
```

**Lưu ý quan trọng:**

- `discount_value` ở level program: Áp dụng nếu không có `discount_value` trong products
- `discount_value` ở level product: Override giá trị chung
- `max_discount_amount`: Giới hạn số tiền giảm tối đa

---

### 3. DISCOUNT_AMOUNT (`discount_amount`) - Giảm Giá Cố Định

**Mô tả:** Giảm số tiền cố định trên đơn hàng

```json
{
  "name": "Giảm 50K cho đơn từ 200K",
  "description": "Giảm ngay 50,000đ cho đơn hàng từ 200,000đ",
  "promotion_type": "discount_amount",
  "discount_type": "fixed_amount",
  "discount_value": 50000,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-01-31T23:59:59Z",
  "priority": 5,
  "min_order_amount": 200000,
  "usage_limit": 500,
  "type_data": {
    "description": "Giảm 50K cho đơn từ 200K"
  }
}
```

**Giải thích:**
| Field | Mô tả |
|-------|-------|
| `discount_value` | Số tiền giảm (VNĐ) |
| `min_order_amount` | Giá trị đơn tối thiểu để áp dụng |

---

### 4. COMBO (`combo`) - Giảm Giá Combo

**Mô tả:** Giảm giá cho combo cụ thể

```json
{
  "name": "Giảm 20% Combo Trưa",
  "description": "Combo trưa giảm 20% trong giờ vàng",
  "promotion_type": "combo",
  "discount_type": "percentage",
  "discount_value": 20,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 15,
  "max_discount_amount": 50000,
  "usage_limit": 1000,
  "conditions": [
    {
      "condition_type": "time_range",
      "condition_value": {
        "start_time": "11:00",
        "end_time": "14:00"
      }
    }
  ],
  "type_data": {
    "discount_combo_ids": [
      "ed2236f0-023f-45f2-b5fc-99e81ff44d53",
      "94f7aa14-1b5a-4cad-a030-2d33dd7d451b"
    ],
    "description": "Giảm 20% cho combo trưa trong khung giờ 11h-14h"
  }
}
```

**Giải thích type_data:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `discount_combo_ids` | `string[]` | ✅ | Danh sách UUID combo được giảm |

---

### 5. BUNDLE (`bundle`) - Gói Sản Phẩm

**Mô tả:** Mua nhiều sản phẩm theo gói với giá ưu đãi

```json
{
  "name": "Bundle Tiết Kiệm - 3 Đồ Uống",
  "description": "Mua 3 đồ uống bất kỳ chỉ với 99K",
  "promotion_type": "bundle",
  "discount_type": "fixed_amount",
  "discount_value": 99000,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "priority": 20,
  "usage_limit": 500,
  "products": [
    {
      "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "quantity": 1,
      "is_free_item": false
    },
    {
      "product_id": "11e3e792-5014-4574-b096-d86f07cab248",
      "quantity": 1,
      "is_free_item": false
    }
  ],
  "type_data": {
    "bundle_price": 99000,
    "bundle_products": [
      {
        "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
        "quantity": 1
      },
      {
        "product_id": "11e3e792-5014-4574-b096-d86f07cab248",
        "quantity": 1
      },
      {
        "product_id": "any",
        "quantity": 1
      }
    ],
    "description": "Mua 3 đồ uống với giá cố định 99K"
  }
}
```

---

## Chi tiết conditions (JSONB) - Điều kiện áp dụng CTKM

### 1. time_range - Khung Giờ Trong Ngày

**Mô tả:** Chỉ áp dụng trong khung giờ cụ thể

```json
{
  "condition_type": "time_range",
  "condition_value": {
    "start_time": "14:00",
    "end_time": "18:00",
    "description": "Khung giờ vàng buổi chiều"
  }
}
```

**Giải thích:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `start_time` | `string` | ✅ | Giờ bắt đầu (HH:mm, 24h format) |
| `end_time` | `string` | ✅ | Giờ kết thúc (HH:mm, 24h format) |
| `description` | `string` | ❌ | Mô tả ngắn |

**Các ví dụ thực tế:**

```json
// Giờ cao điểm sáng
{ "start_time": "07:00", "end_time": "09:00" }

// Giờ vàng buổi chiều
{ "start_time": "14:00", "end_time": "16:00" }

// Đêm khuya
{ "start_time": "22:00", "end_time": "02:00" }
```

---

### 2. day_of_week - Ngày Trong Tuần

**Mô tả:** Chỉ áp dụng vào các ngày cụ thể trong tuần

```json
{
  "condition_type": "day_of_week",
  "condition_value": {
    "days": [1, 2, 3, 4, 5],
    "description": "Áp dụng thứ 2 đến thứ 6"
  }
}
```

**Giải thích:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `days` | `number[]` | ✅ | Mảng số ngày (0=CN, 1=T2, ..., 6=T7) |

**Mapping ngày:**

```
0 = Chủ nhật (Sunday)
1 = Thứ hai (Monday)
2 = Thứ ba (Tuesday)
3 = Thứ tư (Wednesday)
4 = Thứ năm (Thursday)
5 = Thứ sáu (Friday)
6 = Thứ bảy (Saturday)
```

**Các ví dụ thực tế:**

```json
// Ngày trong tuần (T2-T6)
{ "days": [1, 2, 3, 4, 5] }

// Cuối tuần (T7, CN)
{ "days": [0, 6] }

// Chỉ thứ 4 (Wednesday)
{ "days": [3] }

// T2, T4, T6
{ "days": [1, 3, 5] }
```

---

### 3. min_items - Số Lượng Sản Phẩm Tối Thiểu

**Mô tả:** Đơn hàng phải có tối thiểu số lượng sản phẩm

```json
{
  "condition_type": "min_items",
  "condition_value": {
    "min_quantity": 3,
    "description": "Đơn hàng phải có ít nhất 3 sản phẩm"
  }
}
```

**Giải thích:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `min_quantity` | `number` | ✅ | Số lượng items tối thiểu trong đơn |

---

### 4. customer_tier - Hạng Khách Hàng

**Mô tả:** Chỉ áp dụng cho khách hàng thuộc hạng cụ thể

```json
{
  "condition_type": "customer_tier",
  "condition_value": {
    "tiers": ["gold", "diamond"],
    "description": "Chỉ dành cho thành viên Gold và Diamond"
  }
}
```

**Giải thích:**
| Field | Type | Required | Mô tả |
|-------|------|----------|-------|
| `tiers` | `string[]` | ✅ | Danh sách hạng khách hàng |

**Các hạng khách hàng:**

```
"member"   = Thành viên thường
"silver"   = Bạc
"gold"     = Vàng
"diamond"  = Kim cương
```

---

### 5. first_order - Đơn Hàng Đầu Tiên

**Mô tả:** Chỉ áp dụng cho đơn hàng đầu tiên của khách

```json
{
  "condition_type": "first_order",
  "condition_value": {
    "enabled": true,
    "description": "Ưu đãi dành cho khách hàng mới"
  }
}
```

---

### 6. payment_method - Phương Thức Thanh Toán

**Mô tả:** Chỉ áp dụng khi thanh toán bằng phương thức cụ thể

```json
{
  "condition_type": "payment_method",
  "condition_value": {
    "methods": ["momo", "vnpay", "zalopay"],
    "description": "Áp dụng khi thanh toán qua ví điện tử"
  }
}
```

**Các phương thức:**

```
"cash"      = Tiền mặt
"card"      = Thẻ
"momo"      = Ví MoMo
"vnpay"     = VNPay
"zalopay"   = ZaloPay
"transfer"  = Chuyển khoản
```

---

### 7. order_type - Loại Đơn Hàng

**Mô tả:** Chỉ áp dụng cho loại đơn hàng cụ thể

```json
{
  "condition_type": "order_type",
  "condition_value": {
    "types": ["delivery", "takeaway"],
    "description": "Chỉ áp dụng cho đơn giao hàng và mang đi"
  }
}
```

**Các loại đơn:**

```
"dine_in"   = Ăn tại chỗ
"takeaway"  = Mang đi
"delivery"  = Giao hàng
```

---

### Kết Hợp Nhiều Điều Kiện

Có thể kết hợp nhiều điều kiện - TẤT CẢ điều kiện phải thỏa mãn:

```json
{
  "conditions": [
    {
      "condition_type": "time_range",
      "condition_value": {
        "start_time": "11:00",
        "end_time": "14:00"
      }
    },
    {
      "condition_type": "day_of_week",
      "condition_value": {
        "days": [1, 2, 3, 4, 5]
      }
    },
    {
      "condition_type": "customer_tier",
      "condition_value": {
        "tiers": ["gold", "diamond"]
      }
    },
    {
      "condition_type": "min_items",
      "condition_value": {
        "min_quantity": 2
      }
    }
  ]
}
```

**Kết quả:** CTKM chỉ áp dụng khi:

- ✅ Thời gian 11h-14h VÀ
- ✅ Ngày thứ 2-6 VÀ
- ✅ Khách hàng Gold/Diamond VÀ
- ✅ Đơn có ít nhất 2 sản phẩm

---

## Chi tiết products và stores

### Products - Sản Phẩm Áp Dụng

```json
{
  "products": [
    {
      "product_id": "231228ee-e9b7-4bae-8150-f24dfdb067f4",
      "store_product_id": null,
      "quantity": 2,
      "is_free_item": false,
      "discount_type": "percentage",
      "discount_value": 20
    },
    {
      "product_id": "11e3e792-5014-4574-b096-d86f07cab248",
      "store_product_id": null,
      "quantity": 1,
      "is_free_item": true,
      "discount_type": null,
      "discount_value": null
    }
  ]
}
```

**Giải thích chi tiết:**

| Field              | Type      | Required | Mô tả                                                               |
| ------------------ | --------- | -------- | ------------------------------------------------------------------- |
| `product_id`       | `string`  | ✅       | UUID sản phẩm từ bảng products                                      |
| `store_product_id` | `string`  | ❌       | UUID sản phẩm cụ thể tại cửa hàng (null = tất cả cửa hàng)          |
| `quantity`         | `number`  | ❌       | Số lượng (default: 1). Dùng cho buy X get Y                         |
| `is_free_item`     | `boolean` | ❌       | `true` = sản phẩm tặng, `false` = sản phẩm mua (default: false)     |
| `discount_type`    | `string`  | ❌       | `"percentage"` hoặc `"fixed_amount"`. Override discount của program |
| `discount_value`   | `number`  | ❌       | Giá trị giảm. % nếu percentage, VNĐ nếu fixed_amount                |

**Trường hợp sử dụng:**

1. **Sản phẩm MUA (is_free_item: false):**

```json
{
  "product_id": "xxx",
  "quantity": 2,
  "is_free_item": false
}
// Khách cần MUA 2 sản phẩm này
```

2. **Sản phẩm TẶNG (is_free_item: true):**

```json
{
  "product_id": "xxx",
  "quantity": 1,
  "is_free_item": true
}
// Khách được TẶNG 1 sản phẩm này
```

3. **Sản phẩm được GIẢM GIÁ:**

```json
{
  "product_id": "xxx",
  "discount_type": "percentage",
  "discount_value": 30
}
// Sản phẩm này được giảm 30%
```

4. **Sản phẩm tại CHI NHÁNH CỤ THỂ:**

```json
{
  "product_id": "xxx",
  "store_product_id": "yyy"
}
// Chỉ áp dụng cho sản phẩm này tại chi nhánh có store_product_id = yyy
```

---

### Stores - Cửa Hàng Áp Dụng

```json
{
  "stores": [
    {
      "store_id": "f3e2c02f-5ca1-4f63-9843-4a0ae8d6f262",
      "active": true
    },
    {
      "store_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "active": true
    }
  ]
}
```

**Giải thích:**

| Field      | Type      | Required | Mô tả                                                         |
| ---------- | --------- | -------- | ------------------------------------------------------------- |
| `store_id` | `string`  | ✅       | UUID cửa hàng từ bảng stores                                  |
| `active`   | `boolean` | ❌       | CTKM có đang kích hoạt tại cửa hàng này không (default: true) |

**Quy tắc:**

- **Không gửi stores** hoặc **stores: []** = Áp dụng TẤT CẢ cửa hàng
- **Gửi danh sách stores** = Chỉ áp dụng cho các cửa hàng trong danh sách
- **active: false** = Tạm tắt CTKM tại cửa hàng đó (không xóa)

---

## Ví dụ hoàn chỉnh - Full Example

### CTKM phức tạp: Mua Combo Trưa T2-T6 11h-14h → Tặng Trà Đào (Chỉ Gold/Diamond)

```json
{
  "name": "Happy Lunch - Gold Member",
  "description": "Thành viên Gold/Diamond mua combo trưa tặng Trà Đào. Áp dụng T2-T6, 11h-14h.",
  "promotion_type": "buy_x_get_y",
  "discount_type": "fixed_amount",
  "discount_value": 0,
  "start_date": "2025-01-06T00:00:00Z",
  "end_date": "2025-03-31T23:59:59Z",
  "priority": 15,
  "min_order_amount": 0,
  "usage_limit": 1000,

  "products": [
    {
      "product_id": "11e3e792-5014-4574-b096-d86f07cab248",
      "quantity": 1,
      "is_free_item": true
    }
  ],

  "stores": [
    {
      "store_id": "f3e2c02f-5ca1-4f63-9843-4a0ae8d6f262",
      "active": true
    }
  ],

  "conditions": [
    {
      "condition_type": "time_range",
      "condition_value": {
        "start_time": "11:00",
        "end_time": "14:00"
      }
    },
    {
      "condition_type": "day_of_week",
      "condition_value": {
        "days": [1, 2, 3, 4, 5]
      }
    },
    {
      "condition_type": "customer_tier",
      "condition_value": {
        "tiers": ["gold", "diamond"]
      }
    }
  ],

  "type_data": {
    "buy_combo_ids": ["94f7aa14-1b5a-4cad-a030-2d33dd7d451b"],
    "buy_combo_min_quantity": 1,
    "reward_product_ids": ["11e3e792-5014-4574-b096-d86f07cab248"],
    "reward_quantity": 1,
    "description": "Mua 1 combo trưa → Tặng 1 Trà Đào Cam Sả"
  }
}
```

#### Response

```typescript
interface CreatePromotionalProgramResponse {
  status: true;
  data: PromotionalProgramDetailResponse;
  message: string;
}
```

---

### Update Promotional Program

**Endpoint:** `PUT /api/promotional-programs/{id}`

#### Request Body

```typescript
interface UpdatePromotionalProgramRequest {
  // All fields are optional (partial update)
  name?: string;
  description?: string;
  promotion_type?: PromotionType;
  discount_type?: DiscountType;
  discount_value?: number;
  start_date?: string; // ISO 8601
  end_date?: string; // ISO 8601
  priority?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;

  // Relations (will replace completely if provided)
  products?: PromotionalProgramProductDto[];
  stores?: PromotionalProgramStoreDto[];
  conditions?: PromotionalProgramConditionDto[];

  type_data?: Record<string, any>;
}
```

#### Response

```typescript
interface UpdatePromotionalProgramResponse {
  status: true;
  data: PromotionalProgramDetailResponse;
  message: string;
}
```

#### ⚠️ Lưu ý quan trọng về Update Behavior / Important Update Notes

**Smart Update Logic (Tối ưu hiệu suất):**

API sử dụng **Smart Update** - chỉ cập nhật những gì thay đổi, giữ nguyên những gì không đổi:

1. **Các trường đơn giản** (`name`, `description`, `discount_value`, v.v.):
   - Chỉ cập nhật nếu field được gửi lên
   - Không gửi field = giữ nguyên giá trị cũ

2. **Arrays (`products`, `stores`, `conditions`):**
   - API tự động so sánh và xác định: INSERT / UPDATE / DELETE
   - **Không cần gửi tất cả fields cũ** - chỉ cần gửi full list hiện tại
   - API sẽ tự động:
     - ✅ **Giữ lại** records không thay đổi (giữ nguyên `id`, `created_at`)
     - 🔄 **Cập nhật** records có thay đổi
     - ➕ **Thêm mới** records chưa có
     - ❌ **Xóa** records không còn trong list

**Ví dụ Smart Update:**

```json
// Giả sử chương trình có 3 sản phẩm: A, B, C

// Request update: Gửi list [A-modified, C, D]
{
  "name": "Tên mới",
  "products": [
    { "product_id": "A", "quantity": 5 }, // A có quantity thay đổi
    { "product_id": "C", "quantity": 1 }, // C không đổi
    { "product_id": "D", "quantity": 2 } // D là mới
  ]
}

// Kết quả:
// - Product A: UPDATE (quantity: 3 → 5), GIỮ NGUYÊN id và created_at
// - Product B: DELETE (không có trong list)
// - Product C: GIỮ NGUYÊN (không đổi gì)
// - Product D: INSERT (record mới)
```

**Unique Keys để so sánh:**

- **Products**: `product_id` + `store_product_id`
- **Stores**: `store_id`
- **Conditions**: `condition_type` + `condition_value` (JSON comparison)

**Best Practices cho Frontend:**

✅ **ĐÚNG** - Luôn gửi full list hiện tại:

```typescript
// User sửa quantity của product A từ 3 → 5
const updatedProducts = [
  { product_id: 'A', quantity: 5 }, // Đã sửa
  { product_id: 'B', quantity: 2 }, // Không đổi
  { product_id: 'C', quantity: 1 }, // Không đổi
];

await updateProgram(id, { products: updatedProducts });
// ✅ API sẽ chỉ UPDATE record A, giữ nguyên B và C
```

❌ **SAI** - Chỉ gửi item thay đổi:

```typescript
// KHÔNG LÀM NHƯ NÀY!
await updateProgram(id, {
  products: [
    { product_id: 'A', quantity: 5 }, // Chỉ gửi A
  ],
});
// ❌ API sẽ hiểu là: XÓA B và C, chỉ giữ A
```

**Không muốn thay đổi array:**

```typescript
// Không gửi field = giữ nguyên
await updateProgram(id, {
  name: 'Tên mới',
  // Không gửi products/stores/conditions = giữ nguyên hết
});
```

**Muốn xóa tất cả:**

```typescript
// Gửi array rỗng = xóa hết
await updateProgram(id, {
  products: [], // Xóa hết sản phẩm
  stores: [], // Xóa hết cửa hàng
  conditions: [], // Xóa hết điều kiện
});
```

**Lưu ý đặc biệt:**

- 🚫 **KHÔNG THỂ đổi `promotion_type`** sau khi tạo (sẽ trả về lỗi)
- 📊 `status` là computed field (tự động tính từ `active` + date range)
- 🔒 `usage_count` không thể update thủ công (chỉ tăng khi apply CTKM)

---

### Toggle Active

**Endpoint:** `PATCH /api/promotional-programs/{id}/toggle-active`

#### Request Body

```typescript
interface ToggleActiveRequest {
  active: boolean;
}
```

#### Response

```typescript
interface ToggleActiveResponse {
  status: true;
  message: string;
}
```

---

### Delete Promotional Program

**Endpoint:** `DELETE /api/promotional-programs/{id}`

#### Response

```typescript
interface DeletePromotionalProgramResponse {
  status: true;
  message: string;
}
```

---

## Combos API

### GET List Combos

**Endpoint:** `GET /api/combos`

#### Query Parameters

```typescript
interface GetComboRequest {
  page?: number; // Default: 1
  size?: number; // Default: 10
  search?: string; // Search by code or name
  active?: boolean; // Filter by active status
}
```

#### Response

```typescript
interface GetComboResponse {
  status: true;
  data: {
    items: ComboItemResponse[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  };
  message: string;
}

interface ComboItemResponse {
  id: string;
  code: string;
  name: string;
  active: boolean;
  flag?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### GET Detail Combo

**Endpoint:** `GET /api/combos/{id}`

#### Response

```typescript
interface GetComboDetailResponse {
  status: true;
  data: ComboItemResponse;
  message: string;
}
```

---

### Search Combos

**Endpoint:** `GET /api/combos/search`

#### Query Parameters

```typescript
interface SearchComboRequest {
  keyword: string; // Required: search by code or name
  active?: boolean; // Optional: filter by active status
}
```

#### Response

```typescript
interface SearchComboResponse {
  status: true;
  data: ComboItemResponse[];
  message: string;
}
```

---

## Enums & Constants

### PromotionType

```typescript
enum PromotionType {
  BUY_X_GET_Y = 'buy_x_get_y',
  DISCOUNT_PERCENTAGE = 'discount_percentage',
  DISCOUNT_FIXED_AMOUNT = 'discount_fixed_amount',
  COMBO_DISCOUNT = 'combo_discount',
  BUNDLE = 'bundle',
}
```

### DiscountType

```typescript
enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}
```

### PromotionalProgramStatus

```typescript
enum PromotionalProgramStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
}
```

### OrderOrigin

```typescript
enum OrderOrigin {
  POS = 'pos', // Tại cửa hàng
  APP = 'app', // Trên app Taco Sushi
  ALL = 'all', // Áp dụng cả hai kênh
}
```

**Mô tả:**

- `pos`: CTKM chỉ áp dụng khi đặt hàng tại quầy cửa hàng
- `app`: CTKM chỉ áp dụng khi đặt hàng qua ứng dụng mobile
- `all`: CTKM áp dụng cho cả hai kênh (mặc định)

**Ví dụ sử dụng:**

```json
{
  "name": "Freeship 30K - Đặt Qua App",
  "order_origin": "app",
  "discount_value": 30000
}
```

### is_combinable (Boolean Flag)

**Mô tả:** Xác định chương trình khuyến mãi có thể dùng chung với các CTKM/voucher khác hay không.

- `false` (mặc định): **Độc quyền** - Khách hàng chỉ được chọn 1 CTKM duy nhất
- `true`: **Cho phép chồng** - Có thể áp dụng đồng thời với CTKM/voucher khác

**Logic áp dụng:**

```
Nếu đơn hàng có nhiều CTKM:
  - Lọc CTKM có is_combinable = true → Áp dụng tất cả
  - Lọc CTKM có is_combinable = false → Chỉ chọn 1 (ưu tiên priority cao nhất)

Không được chồng:
  - CTKM độc quyền (is_combinable=false) với CTKM khác
  - Nhiều CTKM độc quyền cùng lúc

Được chồng:
  - Nhiều CTKM có is_combinable=true
```

**Ví dụ:**

```json
// CTKM độc quyền (Big Sale)
{
  "name": "Black Friday - Giảm 50%",
  "is_combinable": false,
  "discount_value": 50
}

// CTKM cho phép chồng (Ưu đãi nhỏ)
{
  "name": "Giảm 10% Thành Viên Mới",
  "is_combinable": true,
  "discount_value": 10
}
```

---

## Error Responses

### Validation Error

```typescript
interface ValidationErrorResponse {
  status: false;
  message: string;
  errors: Array<{
    field: string;
    message: string;
  }>;
}
```

### Not Found Error

```typescript
interface NotFoundErrorResponse {
  status: false;
  message: string;
}
```

### Business Logic Error

```typescript
interface BusinessErrorResponse {
  status: false;
  message: string;
}
```

---

## Notes

- All dates use ISO 8601 format
- All UUIDs are version 4
- Base URL: `http://localhost:9000`
- Authentication required: `Authorization: Bearer {access_token}`
- All responses include `status` field (true/false)
