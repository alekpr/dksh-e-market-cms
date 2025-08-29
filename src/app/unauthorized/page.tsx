import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { ROLE_DESCRIPTIONS, canAccessCMS, type UserRole } from "@/lib/constants/roles"
import { ShieldOff, AlertTriangle } from "lucide-react"

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleGoBack = () => {
    navigate(-1)
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const canUserAccessCMS = user ? canAccessCMS(user.role as UserRole) : false
  const roleInfo = user ? ROLE_DESCRIPTIONS[user.role as UserRole] : null

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            {canUserAccessCMS ? (
              <ShieldOff className="h-6 w-6 text-red-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            )}
          </div>
          <CardTitle className="text-2xl text-red-600">
            {canUserAccessCMS ? 'Access Denied' : 'CMS Access Restricted'}
          </CardTitle>
          <CardDescription>
            {canUserAccessCMS 
              ? "You don't have permission to access this page"
              : "This page is only available to Administrators and Merchants"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
              <div className="flex justify-between">
                <strong>Current User:</strong> 
                <span>{user.name}</span>
              </div>
              <div className="flex justify-between">
                <strong>Role:</strong> 
                <span className="capitalize font-medium">{roleInfo?.name}</span>
              </div>
              <div className="flex justify-between">
                <strong>Email:</strong> 
                <span>{user.email}</span>
              </div>
            </div>
          )}

          {roleInfo && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Your Role Permissions:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {roleInfo.permissions.map((permission, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!canUserAccessCMS && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> Customer accounts are designed for mobile app access only. 
                To access the CMS, you need an Administrator or Merchant account.
              </p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            {canUserAccessCMS && (
              <Button onClick={handleGoBack} variant="outline">
                Go Back
              </Button>
            )}
            {canUserAccessCMS && (
              <Button onClick={handleGoHome}>
                Go to Dashboard
              </Button>
            )}
            <Button onClick={handleLogout} variant="destructive">
              Logout & Switch Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
