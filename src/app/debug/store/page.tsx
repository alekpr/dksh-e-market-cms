import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from '@/contexts/AuthContext'

export default function StoreDebugPage() {
  const { user, userStore, hasValidStore, refreshUserStore } = useAuth()

  // Function to handle refresh
  const handleRefreshStore = async () => {
    await refreshUserStore()
  }
  
  // Function to fix store access using debug endpoint
  const handleFixStore = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/debug/fix-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = await response.json();
      console.log('Fix store response:', data);
      
      if (data.success) {
        alert('Store access fixed successfully! Please refresh the page.');
        window.location.reload();
      } else {
        alert(`Failed to fix store access: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error fixing store:', error);
      alert('Error fixing store access. Check console for details.');
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Store Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current authenticated user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user ? (
              <>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Name:</span>
                  <span>{user.name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Role:</span>
                  <span>{user.role}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">ID:</span>
                  <span>{user._id}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Has Valid Store:</span>
                  <span>{hasValidStore ? '✅ Yes' : '❌ No'}</span>
                </div>

                {user.merchantInfo ? (
                  <div className="mt-4 border p-3 rounded-md bg-muted/50">
                    <h3 className="font-semibold mb-2">Merchant Info</h3>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Store ID:</span>
                      <span>{user.merchantInfo.storeId || 'Not set'}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Store Name:</span>
                      <span>{user.merchantInfo.storeName || 'Not set'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No merchant info available</p>
                )}
              </>
            ) : (
              <p>Not authenticated</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Current merchant's store details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {userStore ? (
              <>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Name:</span>
                  <span>{userStore.name}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">ID:</span>
                  <span>{userStore._id}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Status:</span>
                  <span className="font-semibold">{userStore.status}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Owner ID:</span>
                  <span>{userStore.owner?._id || (typeof userStore.owner === 'string' ? userStore.owner : 'Not set')}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="font-medium">Store Contact:</span>
                  <span>{userStore.contactEmail}</span>
                </div>
                
                {userStore.metrics && (
                  <div className="mt-4 border p-3 rounded-md bg-muted/50">
                    <h3 className="font-semibold mb-2">Store Metrics</h3>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Product Count:</span>
                      <span>{userStore.metrics.productCount || 0}</span>
                    </div>
                    <div className="grid grid-cols-2">
                      <span className="font-medium">Total Orders:</span>
                      <span>{userStore.metrics.totalOrders || 0}</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>No store found for current user</p>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={handleRefreshStore} variant="outline">
                Refresh Store Data
              </Button>
              {user?.role === 'merchant' && (
                <Button onClick={handleFixStore} variant="destructive">
                  Fix Store Access
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Store Debug Information</CardTitle>
          <CardDescription>Detailed store validation info</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="font-semibold mb-2">Store Validation Logic:</h3>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
{`// Current hasValidStore Logic:
const hasValidStore = useMemo(() => {
  if (!user || user.role !== 'merchant') return true // Non-merchants don't need store
  
  // A merchant has a valid store if either:
  // 1. userStore exists and is active, OR
  // 2. merchantInfo.storeId exists (store still loading or being activated)
  const storeIdPresent = !!user.merchantInfo?.storeId;
  const storeLoaded = !!userStore;
  const storeActive = storeLoaded && userStore.status === 'active';
  
  // Allow access if store ID exists in merchantInfo, even if store isn't loaded yet
  const hasStore = storeActive || (!storeLoaded && storeIdPresent);
  
  return hasStore;
}, [user, userStore])

// Current user: ${user?.email || 'Not logged in'}
// User role: ${user?.role || 'N/A'}
// User has merchantInfo: ${user?.merchantInfo ? 'Yes' : 'No'}
// User merchantInfo.storeId: ${user?.merchantInfo?.storeId || 'Not set'}
// User merchantInfo.storeName: ${user?.merchantInfo?.storeName || 'Not set'}

// userStore exists: ${userStore ? 'Yes' : 'No'}
// userStore status: ${userStore?.status || 'N/A'}
// userStore ID: ${userStore?._id || 'N/A'}
// userStore owner: ${userStore?.owner?._id || (userStore?.owner ? 'Set but not populated' : 'Not set')}

// hasValidStore result: ${hasValidStore ? 'true' : 'false'}
`}
          </pre>
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Direct API Tests:</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/debug/store`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                      }
                    });
                    const data = await response.json();
                    console.log('Debug Store API Response:', data);
                    alert(JSON.stringify(data, null, 2));
                  } catch (error) {
                    console.error('API test error:', error);
                    alert('API test failed. See console for details.');
                  }
                }}
              >
                Test Debug API
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/stores/my-store`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                      }
                    });
                    const data = await response.json();
                    console.log('My Store API Response:', data);
                    alert(JSON.stringify(data, null, 2));
                  } catch (error) {
                    console.error('API test error:', error);
                    alert('API test failed. See console for details.');
                  }
                }}
              >
                Test My Store API
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/stores/merchant`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                      }
                    });
                    const data = await response.json();
                    console.log('Get Merchant Store API Response:', data);
                    alert(JSON.stringify(data, null, 2));
                  } catch (error) {
                    console.error('API test error:', error);
                    alert('API test failed. See console for details.');
                  }
                }}
              >
                Test Get Merchant Store
              </Button>
              
              {user?.merchantInfo?.storeId && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    try {
                      const storeId = user?.merchantInfo?.storeId;
                      if (!storeId) {
                        alert('No store ID available');
                        return;
                      }
                      
                      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'}/stores/${storeId}`, {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        }
                      });
                      const data = await response.json();
                      console.log('Get Store By ID API Response:', data);
                      alert(JSON.stringify(data, null, 2));
                    } catch (error) {
                      console.error('API test error:', error);
                      alert('API test failed. See console for details.');
                    }
                  }}
                >
                  Test Get Store By ID
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    await refreshUserStore();
                    alert('Store refresh complete! Check console for logs');
                  } catch (error) {
                    console.error('Store refresh error:', error);
                    alert('Error refreshing store. See console for details.');
                  }
                }}
              >
                Force RefreshUserStore()
              </Button>
            </div>
            
            <div className="mt-4 bg-muted p-4 rounded-md">
              <h3 className="font-semibold mb-2">Token Information:</h3>
              <div className="grid grid-cols-2">
                <span className="font-medium">Access Token:</span>
                <span className="break-all">{localStorage.getItem('access_token') ? 
                  `${localStorage.getItem('access_token')?.substring(0, 20)}...` : 
                  'Not found'}</span>
              </div>
              <div className="grid grid-cols-2 mt-2">
                <span className="font-medium">Refresh Token:</span>
                <span className="break-all">{localStorage.getItem('refresh_token') ? 
                  `${localStorage.getItem('refresh_token')?.substring(0, 20)}...` : 
                  'Not found'}</span>
              </div>
              
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const stored = localStorage.getItem('user');
                    alert(`Stored user data: ${stored ? JSON.stringify(JSON.parse(stored), null, 2) : 'None found'}`);
                  }}
                >
                  Show Stored User Data
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
