# 🚀 ShadCN UI CMS Starter

A modern, production-ready **Content Management System (CMS) starter template** built with cutting-edge technologies and a complete UI component library.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.0-646CFF.svg)](https://vitejs.dev/)
[![ShadCN UI](https://img.shields.io/badge/ShadCN%20UI-New%20York-000000.svg)](https://ui.shadcn.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.11-38B2AC.svg)](https://tailwindcss.com/)

## ✨ Features

- 🎨 **42 Pre-installed ShadCN UI Components** - Complete design system ready to use
- 📊 **Advanced Data Tables** - Sorting, filtering, pagination, drag & drop
- 📈 **Interactive Charts** - Built with Recharts
- 🌙 **Dark/Light Mode** - Built-in theme switching
- 📱 **Fully Responsive** - Mobile-first design approach
- 🔧 **TypeScript** - Type-safe development experience
- ⚡ **Vite** - Lightning-fast development and build
- 🎯 **Modern Stack** - Latest React 19, TypeScript, and Tailwind CSS

## 🏗️ Tech Stack

### Core
- **React 19.1.1** - Latest React with new features
- **TypeScript 5.8.3** - Type safety and better DX
- **Vite 7.1.0** - Next generation frontend tooling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework

### UI & Components
- **ShadCN UI** - High-quality component library (New York style)
- **Lucide React** - Beautiful icons
- **Tabler Icons** - Additional icon set
- **Recharts** - Responsive chart library

### Data & Forms
- **TanStack Table** - Powerful data tables
- **React Hook Form** - Performant forms
- **Zod** - Schema validation
- **DND Kit** - Drag and drop functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/alekpr/shadcn-ui-cms.git

# Navigate to project
cd shadcn-ui-cms

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your CMS in action! 🎉

## 📁 Project Structure

```
shadcn-ui-cms/
├── src/
│   ├── app/
│   │   └── dashboard/           # Main dashboard page
│   ├── components/
│   │   ├── ui/                  # 42 ShadCN UI components
│   │   ├── app-sidebar.tsx      # Application sidebar
│   │   ├── data-table.tsx       # Advanced data table
│   │   ├── chart-area-interactive.tsx
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility functions
│   └── ...
├── components.json              # ShadCN UI configuration
└── PROJECT_CONTEXT.md          # Detailed project documentation
```

## 🧩 Available Components (42 Total)

### Layout & Navigation
- Sidebar, Sheet, Drawer, Breadcrumb, Menubar, Navigation Menu, Context Menu

### Data Display  
- Table, Chart, Card, Avatar, Badge, Separator, Skeleton, Scroll Area

### Forms & Input
- Form, Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Button, Toggle, Input OTP, Label

### Feedback & Overlay
- Dialog, Alert Dialog, Alert, Toast (Sonner), Tooltip, Popover, Hover Card, Progress

### Layout Components
- Tabs, Accordion, Collapsible, Aspect Ratio, Resizable, Carousel

### Advanced
- Command, Calendar, Pagination

## 🎨 Customization

### Adding New Components
```bash
# Add new ShadCN component
npx shadcn@latest add [component-name]
```

### Theme Customization
- Edit `src/index.css` for global styles
- Modify `components.json` for ShadCN configuration
- Use CSS variables for consistent theming

### Type-Safe Imports
```typescript
// Always use type imports for types
import { type ColumnDef } from "@tanstack/react-table"
import { type VariantProps } from "class-variance-authority"
import { type ChartConfig } from "@/components/ui/chart"
```

## 📊 Dashboard Features

- **Responsive Sidebar** - Collapsible navigation with mobile support
- **Data Visualization** - Interactive charts and graphs
- **Advanced Tables** - Sorting, filtering, search, pagination
- **Card Layouts** - Information display cards
- **Theme Switching** - Dark/light mode toggle

## 🔧 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Style
- ESLint configuration included
- TypeScript strict mode enabled
- Prettier-compatible formatting

## 🎯 Use Cases

Perfect for building:
- **Admin Dashboards** - Management interfaces
- **Content Management Systems** - Blog, CMS platforms  
- **Data Analytics Platforms** - Business intelligence tools
- **E-commerce Admin** - Store management systems
- **SaaS Applications** - Multi-tenant platforms

## 📚 Documentation

For detailed information about components, architecture, and development patterns, see [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ShadCN UI](https://ui.shadcn.com/) - For the amazing component library
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Vite](https://vitejs.dev/) - For the blazing fast build tool
- [React](https://reactjs.org/) - For the UI library

---

**Ready to build amazing CMS applications? Start with this template! 🚀**

[View Demo](https://github.com/alekpr/shadcn-ui-cms) • [Report Bug](https://github.com/alekpr/shadcn-ui-cms/issues) • [Request Feature](https://github.com/alekpr/shadcn-ui-cms/issues)
