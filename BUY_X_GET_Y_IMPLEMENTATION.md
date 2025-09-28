# Buy X Get Y Promotion Implementation in CMS

## 🎯 Overview

ระบบ CMS ได้รับการอัปเกรดเพื่อรองรับการสร้าง **Buy X Get Y promotion** สำหรับ merchants แล้ว! โปรโมชั่นนี้เหมาะสำหรับ:

- การเพิ่มยอดขายผ่านการซื้อหลายชิ้น
- การกระตุ้นให้ลูกค้าซื้อในปริมาณมาก
- การสร้าง tier-based promotions (ซื้อมากได้มาก)

## ✨ Features ที่เพิ่มใหม่

### 1. **Promotion Type Selection**
```typescript
// เพิ่ม buy_x_get_y ใน promotion types
const promotionTypes = [
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'flash_sale', label: 'Flash Sale' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y' } // ← ใหม่!
]
```

### 2. **Buy X Get Y Configuration UI**
- **Buy Quantity**: จำนวนที่ลูกค้าต้องซื้อ
- **Get Quantity**: จำนวนที่ลูกค้าจะได้รับ
- **Get Type**: ประเภทของสิ่งที่ได้รับ
  - `Free` - ฟรี 100%
  - `Percentage discount` - ลดราคาเปอร์เซ็นต์
  - `Fixed amount discount` - ลดราคาจำนวนคงที่

### 3. **Real-time Preview**
```
"Buy 3 items, get 1 items FREE"
"Buy 5 items, get 2 items with percentage discount"
```

## 🎪 ตัวอย่างการใช้งาน

### **Scenario 1: Rice Package Promotion**
```json
{
  "title": "Buy 3 Get 1 Free - Rice Special",
  "type": "buy_x_get_y",
  "discount": {
    "type": "buy_x_get_y",
    "buyQuantity": 3,
    "getQuantity": 1,
    "getDiscountType": "free"
  }
}
```

### **Scenario 2: Snack Tier Promotion**
```json
{
  "title": "Buy 10 Get 3 Half Price",
  "type": "buy_x_get_y", 
  "discount": {
    "type": "buy_x_get_y",
    "buyQuantity": 10,
    "getQuantity": 3,
    "getDiscountType": "percentage",
    "getDiscountValue": 50
  }
}
```

## 📱 CMS Interface Updates

### **1. Promotion Form Enhanced**
- ✅ เพิ่ม Buy X Get Y option ใน promotion type dropdown
- ✅ เพิ่ม configuration section สำหรับ Buy X Get Y
- ✅ เพิ่ม real-time preview ของโปรโมชั่น
- ✅ เพิ่ม validation สำหรับ Buy X Get Y fields

### **2. Product Selection**
- ✅ รองรับการเลือกสินค้าสำหรับ Buy X Get Y
- ✅ แสดงรายการสินค้าที่เลือกพร้อม preview
- ✅ รองรับการเลือกหลายสินค้าในโปรโมชั่นเดียว

### **3. Promotion Management**
- ✅ แสดง Buy X Get Y ใน promotion list
- ✅ รองรับการแก้ไข Buy X Get Y promotions
- ✅ แสดงสถิติและประสิทธิภาพของ Buy X Get Y

## 🔧 Technical Implementation

### **Frontend Changes**
1. **PromotionFormSimplified.tsx**
   - เพิ่ม `buy_x_get_y` ใน promotionTypes
   - เพิ่ม Buy X Get Y fields ใน formData
   - เพิ่ม Buy X Get Y configuration UI
   - อัปเดต submission logic รองรับ Buy X Get Y

2. **ProductSelectorWithPricing.tsx**
   - อัปเดต interface รองรับ `buy_x_get_y` type
   - รองรับการเลือกสินค้าสำหรับ Buy X Get Y

3. **API Types (api.ts)**
   - ✅ รองรับ `buy_x_get_y` ใน Promotion type แล้ว
   - ✅ รองรับ PromotionDiscount fields แล้ว

### **Backend Integration**
- ✅ API Backend รองรับ Buy X Get Y แล้ว
- ✅ Promotion model รองรับ Buy X Get Y แล้ว
- ✅ Calculation logic รองรับ Buy X Get Y แล้ว

## 🚀 การใช้งานใน Production

### **1. สร้าง Buy X Get Y Promotion**
```typescript
// ใน CMS
1. ไปที่ Promotions → Create New Promotion
2. เลือก "Buy X Get Y" ใน Promotion Type
3. กำหนด Buy Quantity (เช่น 3)
4. กำหนด Get Quantity (เช่น 1)
5. เลือก Get Type (เช่น Free)
6. เลือกสินค้าที่ต้องการ
7. กำหนดวันเริ่มต้น/สิ้นสุด
8. บันทึก → ระบบจะสร้างโปรโมชั่นอัตโนมัติ
```

### **2. การทำงานใน Mobile App**
```javascript
// API จะส่งข้อมูล Buy X Get Y ไปยัง Mobile App
{
  "type": "buy_x_get_y",
  "discount": {
    "buyQuantity": 3,
    "getQuantity": 1,
    "getDiscountType": "free"
  }
}

// Mobile App จะคำนวณส่วนลดอัตโนมัติตอน checkout
```

### **3. การทำงานใน Website**
```javascript
// Website จะแสดงโปรโมชั่น Buy X Get Y
// และคำนวณราคาตอนเพิ่มสินค้าใส่ตะกร้า
```

## 🎯 Tier-Based Buy X Get Y Strategy

### **การสร้าง Multiple Tiers**
```javascript
// Tier 1: Buy 3 Get 1 Free
{
  title: "Starter Deal - Buy 3 Get 1",
  buyQuantity: 3,
  getQuantity: 1,
  priority: 1
}

// Tier 2: Buy 6 Get 3 Free  
{
  title: "Better Deal - Buy 6 Get 3",
  buyQuantity: 6,
  getQuantity: 3,
  priority: 2  // Higher priority
}

// Tier 3: Buy 12 Get 6 Free
{
  title: "Best Deal - Buy 12 Get 6", 
  buyQuantity: 12,
  getQuantity: 6,
  priority: 3  // Highest priority
}
```

### **Logic การเลือก Tier**
- ระบบจะเลือก promotion ที่ให้ประโยชน์สูงสุด
- ใช้ `priority` field เป็นตัวกำหนด
- Customer ซื้อ 15 ชิ้น = ได้ Tier 3 (12+6) + เหลือ 3 ชิ้นปกติ

## 📊 Analytics & Tracking

### **Metrics ที่ติดตาม**
- **Views**: จำนวนคนที่เห็นโปรโมชั่น
- **Clicks**: จำนวนคนที่คลิกดูรายละเอียด
- **Conversions**: จำนวนคนที่ใช้โปรโมชั่นจริง
- **Revenue**: รายได้ที่เกิดจากโปรโมชั่น
- **Average Order Value**: ยอดซื้อเฉลี่ยต่อออเดอร์

### **Success Metrics**
```javascript
{
  "promotionId": "buy3get1_rice",
  "analytics": {
    "views": 2450,
    "clicks": 380,
    "conversions": 127,
    "revenue": 45600,
    "conversionRate": "33.4%",
    "avgOrderValue": 359
  }
}
```

## ✅ Testing Checklist

### **CMS Testing**
- [ ] สร้าง Buy X Get Y promotion ได้
- [ ] แก้ไข Buy X Get Y promotion ได้  
- [ ] ลบ Buy X Get Y promotion ได้
- [ ] แสดงรายการ Buy X Get Y ได้
- [ ] กำหนด product selection ได้
- [ ] กำหนด schedule ได้
- [ ] Preview ทำงานถูกต้อง

### **API Testing**
- [ ] POST /promotions/merchant รองรับ Buy X Get Y
- [ ] GET /promotions/merchant แสดง Buy X Get Y
- [ ] PATCH /promotions/merchant/:id แก้ไข Buy X Get Y ได้
- [ ] DELETE /promotions/merchant/:id ลบ Buy X Get Y ได้

### **Integration Testing**
- [ ] Mobile App รับ Buy X Get Y ได้
- [ ] Website รับ Buy X Get Y ได้
- [ ] Checkout คำนวณส่วนลดถูกต้อง
- [ ] Order บันทึก Buy X Get Y promotion

## 🎉 Summary

**CMS ปัจจุบันรองรับการสร้าง Buy X Get Y promotion ใน merchant role แล้ว!**

### **ความสามารถที่ได้**:
✅ สร้าง Buy X Get Y promotion ผ่าน CMS  
✅ กำหนด tier-based promotions  
✅ เลือกสินค้าที่ต้องการ  
✅ กำหนดเงื่อนไขการใช้งาน  
✅ ติดตาม analytics  
✅ Integration กับ Mobile App & Website  

### **ขั้นตอนถัดไป**:
1. Test Buy X Get Y promotion ใน staging environment
2. Deploy ไป production environment  
3. Train merchants ให้ใช้งาน Buy X Get Y
4. Monitor performance และ feedback
5. Optimize และปรับปรุงตามผลการใช้งาน

**🚀 Buy X Get Y promotion พร้อมใช้งานแล้ว!**