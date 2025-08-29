'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/lib/api'

export function TestLoginPanel() {
  const { user } = useAuth()
  const [testUser, setTestUser] = useState<User | null>(null)

  const createTestMerchant = () => {
    const mockMerchant: User = {
      _id: 'test-merchant-123',
      name: 'Test Merchant',
      email: 'merchant@test.com',
      role: 'merchant',
      active: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      merchantInfo: {
        storeId: 'store-123',
        storeName: 'Test Store'
      }
    }

    // Save to localStorage for testing
    localStorage.setItem('user', JSON.stringify(mockMerchant))
    localStorage.setItem('access_token', 'test-token-123')
    
    setTestUser(mockMerchant)
    window.location.reload()
  }

  const createTestAdmin = () => {
    const mockAdmin: User = {
      _id: 'test-admin-123',
      name: 'Test Admin',
      email: 'admin@test.com',
      role: 'admin',
      active: true,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage for testing
    localStorage.setItem('user', JSON.stringify(mockAdmin))
    localStorage.setItem('access_token', 'test-token-123')
    
    setTestUser(mockAdmin)
    window.location.reload()
  }

  const clearAuth = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setTestUser(null)
    window.location.reload()
  }

  return (
    <Card className="w-full max-w-md mx-auto border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">🧪 Test Login Panel</CardTitle>
        <p className="text-sm text-yellow-700">For development testing only</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p><strong>Current User:</strong> {user ? `${user.name} (${user.role})` : 'None'}</p>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={createTestMerchant}
            className="w-full"
            variant="outline"
          >
            Login as Test Merchant
          </Button>
          
          <Button 
            onClick={createTestAdmin}
            className="w-full"
            variant="outline"
          >
            Login as Test Admin
          </Button>
          
          <Button 
            onClick={clearAuth}
            className="w-full"
            variant="destructive"
            size="sm"
          >
            Clear Auth & Logout
          </Button>
        </div>

        <p className="text-xs text-yellow-600">
          ⚠️ This panel should be removed in production
        </p>
      </CardContent>
    </Card>
  )
}
