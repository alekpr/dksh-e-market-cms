# Promotion List Filtering Fix

## ปัญหาที่พบ
หน้า Promotion List ใน CMS แสดงโปรโมชันของร้านอื่นๆ ด้วย ทำให้ merchant เห็นข้อมูลที่ไม่ควรเห็น

## การแก้ไข

### 1. Backend API Controller Fix
**ไฟล์:** `/Users/alekpr/node-projects/dksh-emarket-api/src/controllers/promotion.controller.js`

**ปัญหา:** ใน method `getAllPromotions` ใช้ filtering logic ที่ซับซ้อนเกินไป
```javascript
// เดิม - ปัญหา: อนุญาตให้แสดง promotions ที่ไม่มี storeId
queryFilter.$or = [
  { storeId: req.query.storeId },
  { storeId: { $exists: false } },
  { storeId: null }
]
```

**การแก้ไข:** ใช้ strict filtering
```javascript
// ใหม่ - แสดงเฉพาะ promotions ของ store นั้นๆ
if (req.query.storeId && 
    req.query.storeId !== 'undefined' && 
    req.query.storeId !== 'null' && 
    req.query.storeId.trim() !== '') {
  queryFilter.storeId = req.query.storeId;
}
```

### 2. Frontend API Integration
**ไฟล์:** `/Users/alekpr/react-projects/dksh-emarket-cms/src/lib/api.ts`

CMS ใช้ role-based endpoint selection:
- **Merchant users:** `/promotions/merchant` (มี middleware auto-inject storeId)
- **Admin users:** `/promotions` (เห็นทุก store)

```typescript
const user = tokenStorage.getUser()
const isMerchant = user?.role === 'merchant'

const endpoint = isMerchant 
  ? `/promotions/merchant${query ? `?${query}` : ''}` 
  : `/promotions${query ? `?${query}` : ''}`
```

## การทดสอบ

### ไฟล์ทดสอบที่สร้าง

1. **test-merchant-promotion-filtering.js** - ทดสอบ API endpoint โดยตรง
2. **test-api-filtering.js** - ทดสอบ HTTP requests ง่ายๆ
3. **comprehensive-promotion-test.js** - ทดสอบครอบคลุมทั้ง API และ frontend logic

### วิธีการทดสอบ

```bash
# 1. อัปเดตค่า configuration ในไฟล์ test
# แก้ไข TEST_MERCHANT_TOKEN และ TEST_STORE_ID

# 2. รันการทดสอบ
cd /Users/alekpr/react-projects/dksh-emarket-cms
node comprehensive-promotion-test.js

# 3. ตรวจสอบผลลัพธ์
# ✅ = ผ่าน, ❌ = ไม่ผ่าน
```

### สิ่งที่ควรทดสอบ

1. **API Endpoint Tests:**
   - `/promotions/merchant` - ควรแสดงเฉพาะโปรโมชันของ merchant
   - `/promotions?storeId=XXX` - ควร filter ตาม storeId ที่ระบุ
   - Admin access - ควรเห็นโปรโมชันทุก store

2. **Frontend Logic Tests:**
   - Role-based endpoint selection
   - Query parameter building
   - Response data structure handling

## ผลกระทบ

### ✅ ข้อดี
- **Security:** Merchants ไม่สามารถเห็นข้อมูลของร้านอื่น
- **Performance:** Filtering ที่ database level ลดการโหลดข้อมูลที่ไม่จำเป็น
- **Data Integrity:** ป้องกันการเข้าถึงข้อมูลข้าม store

### ⚠️ สิ่งที่ต้องระวัง
- ตรวจสอบให้แน่ใจว่า Admin users ยังเข้าถึงได้ครบ
- ทดสอบกับ promotions ที่ไม่มี storeId (ถ้ามี)
- ตรวจสอบ pagination และ sorting ยังทำงานถูกต้อง

## Deployment Checklist

- [ ] ทดสอบใน development environment
- [ ] ทดสอบกับ merchant user จริง
- [ ] ทดสอบกับ admin user
- [ ] ตรวจสอบ API response times
- [ ] ตรวจสอบ CMS loading performance
- [ ] Deploy to staging
- [ ] User Acceptance Testing
- [ ] Deploy to production
- [ ] Monitor for issues

## Rollback Plan

หากพบปัญหา สามารถ rollback โดย:

1. **API Controller:** กลับไปใช้ logic เดิม (แต่ไม่แนะนำ)
2. **Frontend:** เพิ่ม additional filtering ใน frontend
3. **Database:** ตรวจสอบ promotions ที่ไม่มี storeId

## Log Files

การแก้ไขมี console.log เพื่อ debug:
- `🎯 getAllPromotions called with query`
- `🏪 Applying STRICT store filter`
- `✅ STRICT Store filter applied`

สามารถดูใน server logs เพื่อ monitor การทำงาน