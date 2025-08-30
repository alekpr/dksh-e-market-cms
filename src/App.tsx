import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RoleGuard, AdminRoute, StoreManagementRoute, UserManagementRoute, ProductManagementRoute } from '@/components/guards/role-guard'
import { AuthGuard } from '@/components/AuthGuard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import DashboardPage from "@/app/dashboard/page"
import ContentManagement from "@/app/content/page"
import StoresPage from "@/app/stores/page"
import ProductsPage from "@/app/products/page"
import UsersPage from "@/app/users/page"
import CategoriesPage from "@/app/categories/page"
import InventoryManagementPage from "@/app/inventory-management/page"
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
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={
              <AuthGuard requireAuth={false}>
                <LoginPage />
              </AuthGuard>
            } />
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
                <CategoriesPage />
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
                <InventoryManagementPage />
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
    </ErrorBoundary>
  )
}

export default App