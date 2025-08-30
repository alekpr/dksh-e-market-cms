# Hierarchical Category System - Step by Step Guide

## 🎯 **การทำงานของ Hierarchical Category System**

### **Step 1: 🛒 Merchant สร้าง Category ในร้าน**

```javascript
// Merchant เพิ่ม category ใหม่
POST /api/v1/categories
{
  "name": "สมาร์ทโฟน",
  "description": "โทรศัพท์มือถือสมาร์ท",
  "store": "608a1b234d5e6f7890123456", // Store ID ของ merchant
  "isMaster": false,  // ⭐ สำคัญ: category ปกติไม่ใช่ master
  "parent": null      // ยังไม่ได้ assign ให้ master category
}
```

**🔴 สถานะหลังสร้าง:**
- Category จะอยู่ในสถานะ **"Orphan"** 
- ยังไม่ได้เชื่อมกับ Master Category ใดๆ
- จะแสดงใน store ปกติ แต่ไม่ปรากฏใน hierarchical structure

---

### **Step 2: 👨‍💼 Admin สร้าง Master Categories**

```javascript
// Admin สร้าง master category
POST /api/v1/categories
{
  "name": "อิเล็กทรอนิกส์",
  "description": "สินค้าอิเล็กทรอนิกส์ทุกประเภท", 
  "isMaster": true,   // ⭐ Master category
  "store": null,      // ไม่ผูกกับร้านใดเฉพาะ
  "icon": "fas fa-laptop"
}
```

**🟢 สถานะหลังสร้าง:**
- จะได้ Master Category ที่สามารถจัดกลุ่ม store categories ได้

---

### **Step 3: 🔗 Admin Assign Store Categories เข้า Master**

```javascript
// Admin assign store category เข้า master category
PUT /api/v1/categories/608a1b234d5e6f7890123457
{
  "parent": "608a1b234d5e6f7890123999" // Master category ID
}
```

**🟡 สถานะหลังจัดกลุ่ม:**
- Store category "สมาร์ทโฟน" จะอยู่ภายใต้ Master "อิเล็กทรอนิกส์"
- จะปรากฏใน hierarchical structure
- Public API จะแสดงการจัดกลุ่มนี้

---

### **Step 4: 🌐 Public แสดงผลแบบ Hierarchical**

```javascript
// Public API เรียกดู hierarchical structure
GET /api/v1/categories/public?hierarchical=true

// ผลลัพธ์
{
  "data": [
    {
      "masterCategory": {
        "name": "อิเล็กทรอนิกส์",
        "icon": "fas fa-laptop"
      },
      "storeCount": 5,
      "totalProductCount": 150,
      "stores": [
        {
          "storeId": "608a1b234d5e6f7890123456",
          "storeName": "ร้าน Tech World",
          "categories": [
            {
              "name": "สมาร์ทโฟน",
              "productCount": 25
            },
            {
              "name": "แท็บเล็ต", 
              "productCount": 15
            }
          ]
        }
      ]
    }
  ]
}
```
