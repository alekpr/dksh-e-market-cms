# การทดสอบระบบ Promotion Filtering

## 📋 สรุปการแก้ไข

✅ **ปัญหา:** หน้า Promotion List ใน CMS แสดงโปรโมชันของร้านอื่นๆ ด้วย
✅ **การแก้ไข:** แก้ไข API Controller ให้ใช้ strict filtering เฉพาะ storeId ของ merchant
✅ **ผลลัพธ์:** Merchants จะเห็นเฉพาะโปรโมชันของร้านตัวเองเท่านั้น

## 🧪 การทดสอบ

### 1. ทดสอบด่วน (Quick Test)
```bash
# แก้ไขค่าในไฟล์ก่อน
vim quick-test.sh

# อัปเดต:
MERCHANT_TOKEN="your-actual-jwt-token"
STORE_ID="your-actual-store-id"

# รันทดสอบ
./quick-test.sh
```

### 2. ทดสอบครอบคลุม (Comprehensive Test)
```bash
# แก้ไขค่าในไฟล์ก่อน
vim comprehensive-promotion-test.js

# อัปเดต testConfig section
merchantUser: {
  token: 'your-actual-jwt-token',
  storeId: 'your-actual-store-id',
  email: 'merchant@example.com'
}

# รันทดสอบ
node comprehensive-promotion-test.js
```

### 3. ทดสอบ API โดยตรง
```bash
# แก้ไขค่าในไฟล์ก่อน
vim test-api-filtering.js

# อัปเดต:
const TEST_STORE_ID = 'your-actual-store-id'
const TEST_TOKEN = 'your-actual-jwt-token'

# รันทดสอบ
node test-api-filtering.js
```

## 🔑 การหา Token และ Store ID

### หา JWT Token
1. เข้า CMS ด้วย merchant account
2. เปิด Developer Tools (F12)
3. ไป Application/Storage → localStorage
4. หา key `token` หรือ `authToken`
5. Copy ค่า JWT token

### หา Store ID
1. ในหน้า CMS ให้ดูที่ Network tab
2. หา API call ที่มี `/promotions/merchant`
3. ดู Request Headers หรือ Response
4. หรือดูที่หน้า Profile/Store settings

## 📊 ผลการทดสอบที่คาดหวัง

### ✅ กรณีที่ควรผ่าน
- Merchant endpoint returns only merchant's promotions
- All returned promotions have correct storeId
- Response status is 200
- No promotions from other stores appear

### ❌ กรณีที่ต้องแก้ไข
- Promotions from other stores appear
- HTTP errors (401, 403, 500)
- Empty results when should have data
- Wrong store IDs in response

## 🚀 การ Deploy

### Pre-deployment Checklist
- [ ] ทดสอบใน development environment ผ่าน
- [ ] ทดสอบกับ merchant user จริงผ่าน
- [ ] ทดสอบกับ admin user ยังเข้าถึงได้ครบ
- [ ] ตรวจสอบ performance ไม่ช้าลง

### การ Deploy
```bash
# API Backend
cd /Users/alekpr/node-projects/dksh-emarket-api
git add .
git commit -m "Fix promotion filtering - restrict to merchant's store only"
git push

# CMS Frontend (ถ้ามีการแก้ไข)
cd /Users/alekpr/react-projects/dksh-emarket-cms
npm run build
# Deploy build files to server
```

### Post-deployment Testing
1. ทดสอบ CMS ใน production
2. ให้ merchant ทดสอบการใช้งานจริง
3. Monitor server logs สำหรับ errors
4. ตรวจสอบ performance metrics

## 🚨 Rollback Plan

หากพบปัญหาใน production:

### Immediate Rollback (API)
```bash
cd /Users/alekpr/node-projects/dksh-emarket-api
git revert HEAD
git push
```

### Alternative Fix (Frontend)
หากไม่สามารถ rollback API ได้ สามารถเพิ่ม client-side filtering:

```typescript
// ใน use-promotion-management.ts
const filteredPromotions = promotions.filter(promo => 
  !promo.storeId || promo.storeId === currentUser.storeId
)
```

## 📞 Support

หากพบปัญหา:
1. ตรวจสอบ server logs
2. ใช้ทดสอบ scripts เพื่อ debug
3. ตรวจสอบ JWT token ยังใช้ได้อยู่
4. ตรวจสอบ API endpoint accessibility

## 📝 Files ที่เกี่ยวข้อง

### Backend
- `src/controllers/promotion.controller.js` - แก้ไข getAllPromotions method

### Frontend
- `src/lib/api.ts` - API client configuration
- `src/components/promotion-management/use-promotion-management.ts` - React hook
- `src/components/promotion-management/PromotionList.tsx` - UI component

### Testing
- `quick-test.sh` - ทดสอบด่วนด้วย curl
- `comprehensive-promotion-test.js` - ทดสอบครอบคลุม
- `test-api-filtering.js` - ทดสอบ API โดยตรง
- `PROMOTION_LIST_FILTERING_FIX.md` - เอกสารเทคนิค