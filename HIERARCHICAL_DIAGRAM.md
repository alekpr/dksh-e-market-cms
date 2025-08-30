## 🔄 **Hierarchical Category Workflow Diagram**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HIERARCHICAL CATEGORY SYSTEM                         │
└─────────────────────────────────────────────────────────────────────────────┘

📱 MERCHANT WORKFLOW                           👨‍💼 ADMIN WORKFLOW
┌─────────────────────────┐                   ┌─────────────────────────┐
│                         │                   │                         │
│  1. สร้าง Category      │                   │  1. สร้าง Master        │
│     ในร้านตัวเอง        │                   │     Categories          │
│                         │                   │                         │
│  "สมาร์ทโฟน"           │                   │  "อิเล็กทรอนิกส์"      │
│  isMaster: false        │                   │  isMaster: true         │
│  parent: null           │◄──────────────────┤  store: null            │
│                         │                   │                         │
└─────────────────────────┘                   └─────────────────────────┘
            │                                              │
            ▼                                              ▼
┌─────────────────────────┐                   ┌─────────────────────────┐
│                         │                   │                         │
│  🔴 ORPHAN STATUS       │                   │  🟢 MASTER CREATED      │
│                         │                   │                         │
│  Category ถูกสร้างแล้ว   │                   │  Master พร้อมใช้งาน     │
│  แต่ยังไม่ได้จัดกลุ่ม    │                   │                         │
│                         │                   │                         │
└─────────────────────────┘                   └─────────────────────────┘
            │                                              │
            └──────────────────┐        ┌──────────────────┘
                               ▼        ▼
                    ┌─────────────────────────┐
                    │                         │
                    │  2. 🔗 ASSIGNMENT       │
                    │                         │
                    │  Admin assign store     │
                    │  category ให้ master    │
                    │                         │
                    │  parent: masterID       │
                    └─────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │                         │
                    │  🟡 HIERARCHICAL        │
                    │                         │
                    │  Structure สมบูรณ์      │
                    │  พร้อมแสดงใน Public     │
                    │                         │
                    └─────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🌐 PUBLIC VIEW                                    │
│                                                                             │
│  📂 อิเล็กทรอนิกส์                                                          │
│  ├── 🏪 ร้าน Tech World                                                     │
│  │   ├── 📱 สมาร์ทโฟน (25 สินค้า)                                          │
│  │   └── 💻 แท็บเล็ต (15 สินค้า)                                           │
│  ├── 🏪 ร้าน Gadget Store                                                   │
│  │   ├── 🎧 หูฟัง (10 สินค้า)                                              │
│  │   └── 📷 กล้อง (8 สินค้า)                                               │
│  └── รวม: 5 ร้าน, 150 สินค้า                                               │
└─────────────────────────────────────────────────────────────────────────────┘

📋 LEGEND:
🔴 Orphan Category - Category ที่ยังไม่ได้ assign
🟢 Master Category - Category หลักระดับระบบ  
🟡 Assigned Category - Category ที่ได้ assign แล้ว
🏪 Store - ร้านค้า
📱 Store Category - Category ระดับร้าน
```

## 🎯 **สิ่งที่ Admin ต้องทำเพิ่มเติม**

### **1. 👀 Monitor Orphan Categories**
```sql
-- ดู categories ที่ยังไม่ได้ assign
SELECT * FROM categories 
WHERE isMaster = false 
AND parent IS NULL 
AND store IS NOT NULL
```

### **2. 🏗️ สร้าง Master Categories ตามความเหมาะสม**
- วิเคราะห์ประเภทสินค้าที่มีอยู่
- สร้าง Master Categories ที่ครอบคลุม
- ตั้งชื่อให้เข้าใจง่าย

### **3. 🔗 Assign Store Categories เข้า Masters**
- จัดกลุ่ม categories ที่คล้ายคลึงกัน
- ใช้ Admin Panel ในการ assign
- ตรวจสอบความถูกต้องของการจัดกลุ่ม

### **4. 📊 Monitor และปรับปรุง**
- ดูสถิติการใช้งาน
- ปรับปรุง structure ตามความเหมาะสม
- เพิ่ม Master Categories ใหม่เมื่อจำเป็น
