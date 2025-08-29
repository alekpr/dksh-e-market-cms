import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard, AdminRoute, StoreManagementRoute, UserManagementRoute, ProductManagementRoute } from '@/components/guards/role-guard'
import DashboardPage from "@/app/dashboard/page"
import ContentManagement from "@/app/content/page"
import StoresPage from "@/app/stores/page"
import ProductsPage from "@/app/products/page"
import UsersPage from "@/app/users/page"
import LoginPage from "@/app/login/page"
import UnauthorizedPage from "@/app/unauthorized/page"

// Component to handle redirect logic
function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return isAuthenticated ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Protected routes - All CMS users (Admin + Merchant) */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Admin-only routes */}
          <Route path="/stores" element={
            <StoreManagementRoute>
              <StoresPage />
            </StoreManagementRoute>
          } />
          <Route path="/users" element={
            <UserManagementRoute>
              <UsersPage />
            </UserManagementRoute>
          } />
          
          {/* Merchant-only routes */}
          <Route path="/products" element={
            <ProductManagementRoute>
              <ProductsPage />
            </ProductManagementRoute>
          } />
          <Route path="/categories" element={
            <RoleGuard requiredPermission="categories">
              <div>Categories Page - Coming Soon</div>
            </RoleGuard>
          } />
          <Route path="/promotions" element={
            <RoleGuard requiredPermission="promotions">
              <div>Promotions Page - Coming Soon</div>
            </RoleGuard>
          } />
          <Route path="/orders" element={
            <RoleGuard requiredPermission="orders">
              <div>Orders Page - Coming Soon</div>
            </RoleGuard>
          } />
          <Route path="/inventory" element={
            <RoleGuard requiredPermission="inventory">
              <div>Inventory Page - Coming Soon</div>
            </RoleGuard>
          } />
          <Route path="/analytics" element={
            <RoleGuard requiredPermission="analytics">
              <div>Analytics Page - Coming Soon</div>
            </RoleGuard>
          } />
          <Route path="/settings" element={
            <RoleGuard requiredPermission="settings">
              <div>Settings Page - Coming Soon</div>
            </RoleGuard>
          } />
          
          {/* Legacy routes (can be removed later) */}
          <Route path="/content" element={
            <AdminRoute>
              <ContentManagement />
            </AdminRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<AuthRedirect />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App