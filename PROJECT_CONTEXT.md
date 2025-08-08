# ShadCN UI CMS Starter Project Context

## โครงสร้างโปรเจค (Project Overview)

โปรเจคนี้เป็น **CMS (Content Management System) Starter Template** ที่พร้อมใช้งาน พัฒนาด้วยเทคโนโลยีสมัยใหม่และมี UI Components ที่สมบูรณ์

### เทคโนโลยีหลัก (Core Technologies)
- **Frontend Framework**: React 19.1.1 + TypeScript
- **Build Tool**: Vite 7.1.0 
- **UI Framework**: ShadCN UI (สไตล์ New York)
- **Styling**: Tailwind CSS 4.1.11 + CSS Variables
- **Icon Library**: Lucide React + Tabler Icons

## โครงสร้างไฟล์ (File Structure)

```
shadcn-ui-cms/
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       ├── page.tsx          # หน้า Dashboard หลัก
│   │       └── data.json         # ข้อมูลตัวอย่าง
│   ├── components/
│   │   ├── ui/                   # ShadCN UI Components (42 components)
│   │   │   ├── sidebar.tsx       # Sidebar component
│   │   │   ├── chart.tsx         # Chart components
│   │   │   ├── table.tsx         # Table components
│   │   │   └── ...               # และ components อื่นๆ ครบ 42 ตัว
│   │   ├── app-sidebar.tsx       # Sidebar สำหรับแอป
│   │   ├── site-header.tsx       # Header หลัก
│   │   ├── data-table.tsx        # ตาราง Data Table
│   │   ├── chart-area-interactive.tsx # กราฟแบบ Interactive
│   │   └── section-cards.tsx     # การ์ดแสดงข้อมูล
│   ├── hooks/
│   │   └── use-mobile.ts         # Hook สำหรับตรวจสอบ Mobile
│   ├── lib/
│   │   └── utils.ts              # Utility functions
│   ├── App.tsx                   # Component หลัก
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── components.json               # ShadCN UI configuration
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies และ scripts
```

## ShadCN UI Components ที่ติดตั้งแล้ว (42 components)

### Layout & Navigation
- `sidebar` - Sidebar navigation พร้อม responsive design
- `sheet` - Slide-out panels
- `drawer` - Bottom drawer for mobile
- `breadcrumb` - Navigation breadcrumbs
- `menubar` - Application menu bar
- `navigation-menu` - Main navigation component
- `context-menu` - Right-click context menu

### Data Display
- `table` - Data tables พร้อม sorting/filtering
- `chart` - Chart components สำหรับ Recharts
- `card` - Display cards
- `avatar` - User avatars
- `badge` - Status badges
- `separator` - Visual separators
- `skeleton` - Loading placeholders
- `scroll-area` - Custom scrollable areas

### Forms & Input
- `form` - Form wrapper with validation
- `input` - Text inputs
- `textarea` - Multi-line text input
- `select` - Dropdown selects
- `checkbox` - Checkboxes
- `radio-group` - Radio button groups
- `switch` - Toggle switches
- `slider` - Range sliders
- `button` - Various button styles
- `toggle` - Toggle buttons
- `toggle-group` - Toggle button groups
- `input-otp` - OTP input fields
- `label` - Form labels

### Feedback & Overlay
- `dialog` - Modal dialogs
- `alert-dialog` - Confirmation dialogs
- `alert` - Alert messages
- `sonner` - Toast notifications
- `tooltip` - Hover tooltips
- `popover` - Popup content
- `hover-card` - Hover cards
- `progress` - Progress indicators

### Layout Components
- `tabs` - Tab navigation
- `accordion` - Collapsible content
- `collapsible` - Expandable sections
- `aspect-ratio` - Maintain aspect ratios
- `resizable` - Resizable panels
- `carousel` - Image/content carousels

### Advanced Components
- `command` - Command palette/search
- `calendar` - Date picker calendar
- `pagination` - Table pagination

## ไลบรารี่เสริม (Additional Libraries)

### Data Management
- `@tanstack/react-table` (8.21.3) - Advanced table functionality
- `react-hook-form` (7.62.0) - Form management
- `@hookform/resolvers` (5.2.1) - Form validation
- `zod` (4.0.15) - Schema validation

### UI Enhancement
- `@dnd-kit/core` - Drag and drop functionality
- `recharts` (2.15.4) - Chart and data visualization
- `next-themes` (0.4.6) - Theme management (dark/light mode)
- `class-variance-authority` - Utility for variant-based styling
- `tailwind-merge` - Merge Tailwind classes
- `clsx` - Conditional class names

### Date & Time
- `date-fns` (4.1.0) - Date manipulation
- `react-day-picker` (9.8.1) - Calendar component

## การตั้งค่าที่สำคัญ (Important Configurations)

### Path Aliases
```typescript
"@/*": ["./src/*"]  // @ ชี้ไปที่ src/
```

### ShadCN UI Configuration
- **Style**: New York
- **Base Color**: Neutral
- **CSS Variables**: Enabled
- **TypeScript**: Enabled

### Import Patterns ที่ถูกต้อง
```typescript
// Type imports (สำคัญมาก!)
import { type ColumnDef } from "@tanstack/react-table"
import { type VariantProps } from "class-variance-authority"
import { type ChartConfig } from "@/components/ui/chart"

// Component imports
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

## คุณสมบัติหลัก (Key Features)

### 1. Dashboard Layout
- Responsive sidebar พร้อม collapse/expand
- Header navigation
- Main content area
- Mobile-friendly design

### 2. Data Management
- Advanced data table พร้อม:
  - Sorting และ filtering
  - Column visibility control
  - Drag & drop reordering
  - Pagination
  - Search functionality

### 3. Data Visualization
- Interactive charts ด้วย Recharts
- Responsive chart containers
- Customizable chart themes

### 4. Theme System
- Dark/Light mode support
- CSS Variables สำหรับ theming
- Consistent color palette

## โครงสร้างการพัฒนา (Development Structure)

### หน้าหลัก (Main Page)
`src/app/dashboard/page.tsx` - Dashboard layout พร้อม:
- Sidebar navigation
- Header section
- Chart displays
- Data table
- Card components

### Component Organization
- `components/ui/` - Base ShadCN components
- `components/` - Custom application components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions

## การใช้งานเป็น Starter Template

### 1. การเริ่มต้น
```bash
npm install
npm run dev
```

### 2. การเพิ่ม Components ใหม่
- ใช้ ShadCN CLI: `npx shadcn@latest add [component-name]`
- Components พื้นฐานครบ 42 ตัวติดตั้งแล้ว

### 3. การปรับแต่ง Theme
- แก้ไขไฟล์ `src/index.css`
- ใช้ CSS Variables
- ปรับ `components.json` สำหรับ ShadCN config

### 4. Type Safety
- ใช้ TypeScript อย่างเข้มงวด
- Import types ด้วย `type` keyword
- Validation ด้วย Zod schema

## เทมเพลตสำหรับ CMS

### จุดแข็ง
✅ UI Components ครบถ้วน 42 ตัว  
✅ Data table พร้อมฟังก์ชัน advanced  
✅ Chart และ visualization  
✅ Responsive design  
✅ Dark/Light mode  
✅ TypeScript support เต็มรูปแบบ  
✅ Modern development stack  

### สิ่งที่พร้อมสำหรับการพัฒนาต่อ
- Authentication system
- API integration
- Content management features
- User management
- File upload system
- Advanced routing
- State management (Context/Zustand/Redux)

## สรุป

โปรเจคนี้เป็น **CMS Starter Template** ที่พร้อมใช้งาน มี UI Components ครบถ้วน และโครงสร้างที่เหมาะสำหรับการพัฒนา Content Management System สมัยใหม่ พร้อมด้วยเทคโนโลยีที่ทันสมัยและ Developer Experience ที่ดี
