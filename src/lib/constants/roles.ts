// Role-based constants and permissions for DKSH E-Market CMS

export const USER_ROLES = {
  ADMIN: 'admin',
  MERCHANT: 'merchant', 
  CUSTOMER: 'customer'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// CMS Access Control
export const CMS_ACCESS_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MERCHANT];

// Role-based navigation permissions
export const NAVIGATION_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'dashboard',
    'stores',      // Store Management - เฉพาะ Admin
    'users',       // User Management - เฉพาะ Admin
    'categories-admin', // Hierarchical Category Management - เฉพาะ Admin
    'shipping-config', // Shipping Configuration - เฉพาะ Admin
    'analytics'    // Analytics - Admin สามารถดูได้ทั้งระบบ
  ],
  [USER_ROLES.MERCHANT]: [
    'dashboard',
    'store-info',   // Store Information - เฉพาะ Merchant
    'products',    // Product Management - เฉพาะ Merchant
    'categories',  // Store Category Management - เฉพาะ Merchant
    'promotions',  // Promotion Management - เฉพาะ Merchant
    'orders',      // Order Management - เฉพาะ Merchant
    'inventory',   // Inventory Management - เฉพาะ Merchant
    'analytics'    // Analytics - เฉพาะ Merchant
  ],
  [USER_ROLES.CUSTOMER]: [] // Customer ไม่สามารถเข้า CMS ได้
} as const;

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: {
    name: 'Administrator',
    description: 'System administrator with access to store and user management',
    permissions: [
      'Manage all stores',
      'Manage users and roles',
      'Configure system settings'
    ]
  },
  [USER_ROLES.MERCHANT]: {
    name: 'Merchant',
    description: 'Store owner with full control over their store operations',
    permissions: [
      'Manage store products',
      'Manage categories',
      'Create and manage promotions',
      'Process orders',
      'Manage inventory',
      'View store analytics'
    ]
  },
  [USER_ROLES.CUSTOMER]: {
    name: 'Customer',
    description: 'End user with mobile app access only (no CMS access)',
    permissions: [
      'Browse products (mobile app)',
      'Place orders (mobile app)',
      'View order history (mobile app)',
      'Manage profile (mobile app)'
    ]
  }
} as const;

// Helper functions
export const canAccessCMS = (role: UserRole): boolean => {
  return (CMS_ACCESS_ROLES as readonly string[]).includes(role);
};

export const getNavigationItems = (role: UserRole): readonly string[] => {
  return NAVIGATION_PERMISSIONS[role] || [];
};

export const hasPermission = (userRole: UserRole, requiredPermission: string): boolean => {
  const userPermissions = NAVIGATION_PERMISSIONS[userRole] || [];
  return (userPermissions as readonly string[]).includes(requiredPermission);
};

export const getRoleDescription = (role: UserRole) => {
  return ROLE_DESCRIPTIONS[role];
};

// Navigation item configurations
export const NAVIGATION_CONFIG = {
  dashboard: {
    title: 'Dashboard',
    icon: 'dashboard',
    path: '/'
  },
  stores: {
    title: 'Store Management',
    icon: 'store',
    path: '/stores'
  },
  'store-info': {
    title: 'Store Information',
    icon: 'store-info',
    path: '/store-information'
  },
  users: {
    title: 'User Management', 
    icon: 'users',
    path: '/users'
  },
  products: {
    title: 'Product Management',
    icon: 'package',
    path: '/products'
  },
  categories: {
    title: 'Store Categories',
    icon: 'categories',
    path: '/categories'
  },
  'categories-admin': {
    title: 'Category System',
    icon: 'categories',
    path: '/admin/categories/hierarchical'
  },
  'shipping-config': {
    title: 'Shipping Configuration',
    icon: 'truck',
    path: '/admin/shipping'
  },
  promotions: {
    title: 'Promotion Management',
    icon: 'percent',
    path: '/promotions'
  },
  orders: {
    title: 'Order Management',
    icon: 'shopping-cart',
    path: '/orders'
  },
  inventory: {
    title: 'Inventory Management',
    icon: 'boxes',
    path: '/inventory'
  },
  analytics: {
    title: 'Analytics',
    icon: 'bar-chart',
    path: '/analytics'
  },
  settings: {
    title: 'Settings',
    icon: 'settings',
    path: '/settings'
  }
} as const;
