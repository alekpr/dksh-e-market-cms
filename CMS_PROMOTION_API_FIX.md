# 🔧 CMS Promotion API Integration Fix

## 📋 ปัญหาเดิม
เมื่อ merchant เปลี่ยน account จะเห็น promotions ของร้านอื่นๆ ติดมาในร้านใหม่ด้วย เนื่องจาก:

1. **CMS ใช้ generic promotion endpoints** (`/api/v1/promotions/*`)
2. **ไม่มี automatic store filtering** สำหรับ merchant users
3. **ไม่สอดคล้องกับ analytics system** ที่มี merchant-specific routes แล้ว

## ✅ การแก้ไขที่ทำ

### 1. Backend: เพิ่ม Merchant-Specific Routes
```javascript
// File: src/routes/promotion.merchant.routes.js
// Routes with auto-filtering middleware สำหรับ merchant users

GET /api/v1/promotions/merchant              // ✅ Auto-filtered by store
GET /api/v1/promotions/merchant/active       // ✅ Auto-filtered by store  
GET /api/v1/promotions/merchant/featured-products
GET /api/v1/promotions/merchant/flash-sales
GET /api/v1/promotions/merchant/banners
GET /api/v1/promotions/merchant/stats
GET /api/v1/promotions/merchant/:id
POST /api/v1/promotions/merchant
PATCH /api/v1/promotions/merchant/:id
DELETE /api/v1/promotions/merchant/:id
```

### 2. CMS: อัพเดท API Client
```typescript
// File: src/lib/api.ts
// Role-based endpoint selection

const user = tokenStorage.getUser()
const isMerchant = user?.role === 'merchant'

const endpoint = isMerchant 
  ? `/promotions/merchant${query ? `?${query}` : ''}` 
  : `/promotions${query ? `?${query}` : ''}`
```

## 🔐 Security Features

### Auto-Filtering Middleware
```javascript
const injectMerchantStoreId = async (req, res, next) => {
  if (req.user.role === 'merchant') {
    // Force filter by merchant's store
    req.query.storeId = req.user.merchantInfo.storeId.toString();
    console.log(`🏪 Auto-filtering promotions by store: ${req.query.storeId}`);
  }
  next();
};
```

### Role-Based Access Control
- **Merchants**: เห็นเฉพาะ promotions ของร้านตัวเอง
- **Admins**: เห็น promotions ทั้งหมด
- **Automatic filtering**: ไม่ต้องส่ง storeId parameter

## 📊 API Endpoints ที่ปรับปรุง

| Endpoint | Merchant Route | Admin Route | Auto-Filter |
|----------|---------------|-------------|------------|
| Get Promotions | `/promotions/merchant` | `/promotions` | ✅ |
| Get Active | `/promotions/merchant/active` | `/promotions/active` | ✅ |
| Featured Products | `/promotions/merchant/featured-products` | `/promotions/featured-products` | ✅ |
| Flash Sales | `/promotions/merchant/flash-sales` | `/promotions/flash-sales` | ✅ |
| Banners | `/promotions/merchant/banners` | `/promotions/banners` | ✅ |
| Statistics | `/promotions/merchant/stats` | `/promotions/stats` | ✅ |
| Create | `/promotions/merchant` | `/promotions` | ✅ |
| Update | `/promotions/merchant/:id` | `/promotions/:id` | ✅ |
| Delete | `/promotions/merchant/:id` | `/promotions/:id` | ✅ |

## 🧪 การทดสอบ

### Manual Testing
```bash
# ใน CMS directory
cd /Users/alekpr/react-projects/dksh-emarket-cms
node test-promotion-api.js
```

### Expected Results
- Merchant A เห็นเฉพาะ promotions ของร้าน A
- Merchant B เห็นเฉพาะ promotions ของร้าน B  
- Admin เห็น promotions ทั้งหมด
- ไม่มี cross-store data leakage

## 🎯 Benefits

1. **Security**: Merchants ไม่เห็นข้อมูลของร้านอื่น
2. **Consistency**: สอดคล้องกับ analytics system architecture
3. **Automatic**: ไม่ต้องแก้ CMS components
4. **Backward Compatible**: Admin endpoints ยังใช้งานได้ปกติ
5. **Maintainable**: Role-based routing pattern สำหรับ future features

## 🔄 Migration Notes

- **CMS**: อัพเดทแล้ว ใช้ role-based endpoints
- **Mobile App**: ยังใช้ public endpoints ปกติ (ไม่กระทบ)
- **Web App**: ยังใช้ public endpoints ปกติ (ไม่กระทบ)
- **Admin Panel**: ใช้ admin endpoints (ไม่กระทบ)

## 📝 Log Messages

เมื่อ CMS เรียก API จะเห็น logs แบบนี้:
```
🎯 Using promotion endpoint: /promotions/merchant?page=1&limit=10 (role: merchant)
🏪 Auto-filtering promotions by store: 123
```

## ✅ Status: FIXED

ปัญหา "merchant เห็น promotions ของร้านอื่น" ได้รับการแก้ไขแล้วด้วย merchant-specific routes และ auto-filtering middleware
