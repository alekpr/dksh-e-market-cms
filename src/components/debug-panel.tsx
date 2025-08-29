'use client'

import { useAuth } from '@/contexts/AuthContext'
import { getNavigationItems } from '@/lib/constants/roles'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DebugPanel() {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading auth state...</div>
  }

  const navItems = user ? getNavigationItems(user.role as any) : []

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug Panel - Auth & Navigation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Authentication Status:</h3>
          <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
        </div>

        {user && (
          <div>
            <h3 className="font-semibold">User Details:</h3>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>Active: {user.active ? 'Yes' : 'No'}</p>
            {user.merchantInfo && (
              <div>
                <p>Store ID: {user.merchantInfo.storeId}</p>
                <p>Store Name: {user.merchantInfo.storeName}</p>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="font-semibold">Available Navigation Items:</h3>
          <ul className="list-disc list-inside">
            {navItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Categories should appear if user role is 'merchant'
          </p>
        </div>

        <div>
          <h3 className="font-semibold">LocalStorage Data:</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify({
              access_token: localStorage.getItem('access_token') ? 'exists' : 'missing',
              refresh_token: localStorage.getItem('refresh_token') ? 'exists' : 'missing',
              user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}') : 'missing'
            }, null, 2)}
          </pre>
        </div>

        <Button 
          onClick={() => {
            console.log('Current user:', user)
            console.log('Navigation items:', navItems)
            console.log('LocalStorage user:', localStorage.getItem('user'))
          }}
        >
          Log Debug Info to Console
        </Button>
      </CardContent>
    </Card>
  )
}
