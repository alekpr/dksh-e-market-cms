# Category System Architecture

## 🏗️ **ระบบจัดการ Category แบบแยกชัดเจน**

เราได้แยกระบบจัดการ Category ออกเป็น 2 ระบบที่แตกต่างกันตามบทบาทของผู้ใช้:

---

## 🔐 **1. Hierarchical Category System (Admin Only)**

### **🎯 เป้าหมาย**
- จัดการ Master Categories ระดับระบบ
- กำหนดโครงสร้างหมวดหมู่แบบลำดับชั้น
- ควบคุมการจัดกลุ่ม Categories ของ Store ต่างๆ

### **👥 ผู้ใช้งาน**
- **Admin เท่านั้น** (`user.role === 'admin'`)

### **📍 เส้นทางการเข้าถึง**
```
/admin/categories/hierarchical
```

### **🛠️ คุณสมบัติ**
- ✅ สร้าง Master Categories
- ✅ จัดการโครงสร้างลำดับชั้น  
- ✅ ดู Overview ของ Store Categories ทั้งหมด
- ✅ Assign Store Categories เข้า Master Categories
- ✅ สถิติระดับระบบ

### **🔒 การควบคุมสิทธิ์**
```typescript
const canManageMaster = user?.role === 'admin'
```

---

## 🏪 **2. Store Category Management (Merchant Only)**

### **🎯 เป้าหมาย**
- จัดการ Categories ของร้านค้าตัวเอง
- CRUD Operations สำหรับ Categories
- จัดการสินค้าภายใน Categories

### **👥 ผู้ใช้งาน**
- **Merchant เท่านั้น** (`user.role === 'merchant'`)
- ต้องมี Store ที่ Active

### **📍 เส้นทางการเข้าถึง**
```
/categories
```

### **🛠️ คุณสมบัติ**
- ✅ สร้าง/แก้ไข/ลบ Categories ของร้านตัวเอง
- ✅ จัดการรูปภาพและคำอธิบาย
- ✅ ตั้งค่าการมองเห็น (Active/Inactive)
- ✅ จัดเรียงและจัดหมวดหมู่
- ❌ **ไม่สามารถจัดการ Master Categories ได้**

### **🔒 การควบคุมสิทธิ์**
```typescript
const canManageCategories = user?.role === 'merchant' && hasValidStore
```

---

## 📊 **เปรียบเทียบสิทธิ์การเข้าถึง**

| ฟีเจอร์ | Admin | Merchant |
|---------|--------|----------|
| **Master Categories** | ✅ Full Control | ❌ View Only |
| **Store Categories** | ✅ View All Stores | ✅ Own Store Only |
| **Hierarchical View** | ✅ Full Access | ❌ No Access |
| **Category Assignment** | ✅ Can Assign | ❌ Cannot Assign |
| **Global Statistics** | ✅ All Data | ❌ Own Store Only |

---

## 🗂️ **ไฟล์ที่สำคัญ**

### **Admin Components**
```
📁 src/app/admin/categories/hierarchical/
├── page.tsx                     # Admin-only page
└── 📁 components/
    ├── hierarchical-category-view.tsx
    └── use-hierarchical-categories.ts
```

### **Merchant Components**
```
📁 src/app/categories/
├── page.tsx                     # Merchant category page
└── 📁 components/
    ├── category-list-view.tsx
    ├── category-form-view.tsx
    └── use-category-management.ts
```

### **Shared Types & APIs**
```
📁 src/lib/
├── api.ts                       # Category API functions
└── 📁 constants/
    └── roles.ts                 # Role-based permissions
```

---

## 🔄 **Navigation Structure**

### **Admin Navigation**
```typescript
'categories-admin': {
  title: 'Category System',
  icon: 'categories',
  path: '/admin/categories/hierarchical'
}
```

### **Merchant Navigation**
```typescript
'categories': {
  title: 'Store Categories',
  icon: 'categories', 
  path: '/categories'
}
```

---

## 🚀 **การใช้งาน**

### **สำหรับ Admin**
1. เข้าใช้งานด้วย Admin account
2. ไปที่ `Category System` ใน sidebar
3. จัดการ Master Categories และ Hierarchical structure

### **สำหรับ Merchant**
1. เข้าใช้งานด้วย Merchant account
2. ไปที่ `Store Categories` ใน sidebar  
3. จัดการ Categories ของร้านตัวเอง

---

## 🔧 **Technical Implementation**

### **Role-based Access Control**
```typescript
// In useHierarchicalCategories hook
const isAdmin = user?.role === 'admin'
const canManageMaster = isAdmin

// In navigation permissions
[USER_ROLES.ADMIN]: ['categories-admin', ...]
[USER_ROLES.MERCHANT]: ['categories', ...]
```

### **Component Protection**
```typescript
// Admin page protection
if (!isAdmin) {
  return <AccessDeniedMessage />
}
```

### **API Permissions**
- Master Category operations จำกัดเฉพาะ Admin
- Store Category operations ถูกจำกัดตาม Store ownership

---

## ✅ **Benefits ของการแยกระบบ**

1. **🔒 Security**: ป้องกันไม่ให้ Merchant เข้าถึง Master Category system
2. **🎯 User Experience**: UI ที่เหมาะสมกับแต่ละ role
3. **⚡ Performance**: โหลดเฉพาะข้อมูลที่จำเป็น
4. **🛠️ Maintainability**: แยก codebase ตาม responsibility
5. **📈 Scalability**: ง่ายต่อการขยายระบบในอนาคต

---

## 📝 **Next Steps**

- [ ] เพิ่ม API validation สำหรับ role-based permissions
- [ ] สร้าง audit log สำหรับ Master Category changes
- [ ] เพิ่ม batch operations สำหรับ category assignment
- [ ] สร้าง migration tools สำหรับ existing categories
