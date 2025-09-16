'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { shippingApi, type ShippingConfig, type ShippingConfigMetadata } from '@/lib/api'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Loader2, Save, RotateCcw, Truck, RefreshCw, History, Shield } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function ShippingConfigPage() {
  const { user } = useAuth()
  const [config, setConfig] = useState<ShippingConfig | null>(null)
  const [originalConfig, setOriginalConfig] = useState<ShippingConfig | null>(null)
  const [metadata, setMetadata] = useState<ShippingConfigMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="container mx-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Access denied. Admin role required to manage shipping configuration.
              </AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Load shipping configuration
  useEffect(() => {
    loadShippingConfig()
  }, [])

  // Check for changes
  useEffect(() => {
    if (config && originalConfig) {
      const hasModifications = JSON.stringify(config) !== JSON.stringify(originalConfig)
      setHasChanges(hasModifications)
    }
  }, [config, originalConfig])

  const loadShippingConfig = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await shippingApi.getShippingConfig()
      
      if (response.success && response.data) {
        const data = response.data as any
        setConfig(data.config)
        setOriginalConfig(data.config)
        setMetadata(data.metadata)
      } else {
        setError('Failed to load shipping configuration')
      }
    } catch (error: any) {
      console.error('Error loading shipping config:', error)
      setError(error.message || 'Failed to load shipping configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfiguration = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const response = await shippingApi.updateShippingConfig(config)
      
      if (response.success && response.data) {
        const data = response.data as any
        setOriginalConfig(config)
        setHasChanges(false)
        
        // Update success message with user info if available
        if (data.updateInfo?.updatedBy?.email) {
          setSuccess(`Configuration updated successfully by ${data.updateInfo.updatedBy.email}`)
        } else {
          setSuccess('Configuration updated successfully')
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(response.message || 'Failed to update configuration')
      }
    } catch (error: any) {
      console.error('Error saving config:', error)
      setError(error.message || 'Failed to update configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const resetConfiguration = () => {
    if (originalConfig) {
      setConfig(originalConfig)
      setError(null)
      setSuccess(null)
    }
  }

  const resetToDefaultConfiguration = async () => {
    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const response = await shippingApi.resetShippingConfigToDefault()
      
      if (response.success && response.data) {
        const data = response.data as any
        setConfig(data.config)
        setOriginalConfig(data.config)
        if (data.metadata) {
          setMetadata(data.metadata)
        }
        setHasChanges(false)
        setSuccess('Configuration reset to default values successfully')
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000)
      } else {
        setError(response.message || 'Failed to reset configuration')
      }
    } catch (error: any) {
      console.error('Error resetting config:', error)
      setError(error.message || 'Failed to reset configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const validateConfiguration = async () => {
    if (!config) return

    try {
      const response = await shippingApi.validateShippingConfig(config)
      
      if (response.success || (response.data && response.data.success)) {
        setSuccess('Configuration is valid!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const validationResult = response.data || response as any
        const errors = validationResult.errors ? validationResult.errors.join(', ') : validationResult.message || 'Validation failed'
        setError(`Validation failed: ${errors}`)
      }
    } catch (error: any) {
      console.error('Error validating config:', error)
      setError(error.message || 'Failed to validate configuration')
    }
  }

  const updateConfig = (field: string, value: number | object) => {
    if (!config) return
    
    setConfig({
      ...config,
      [field]: value
    })
  }

  const updateNestedConfig = (parentField: string, childField: string, value: number) => {
    if (!config) return
    
    setConfig({
      ...config,
      [parentField]: {
        ...(config as any)[parentField],
        [childField]: value
      }
    })
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading shipping configuration...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!config) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="container mx-auto p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load shipping configuration. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  Shipping Configuration
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Shipping Configuration</h1>
              <p className="text-muted-foreground">
                Manage shipping rates, thresholds, and calculation parameters
              </p>
              {metadata && (
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Version: {metadata.version}</span>
                  <span>Status: {metadata.status}</span>
                  {metadata.configAge > 0 && (
                    <span>Last updated: {metadata.configAge} days ago</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="secondary" className="text-orange-600">
                  Unsaved Changes
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={validateConfiguration}
                disabled={!config || isLoading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Validate
              </Button>
              <Button 
                variant="outline" 
                onClick={resetConfiguration}
                disabled={!hasChanges}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button 
                variant="outline"
                onClick={loadShippingConfig}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                variant="outline"
                onClick={resetToDefaultConfiguration}
                disabled={isSaving}
              >
                <History className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button 
                onClick={saveConfiguration}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Configuration Tabs */}
          <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="rates">Shipping Rates</TabsTrigger>
          <TabsTrigger value="distance">Distance Limits</TabsTrigger>
          <TabsTrigger value="oversized">Oversized Items</TabsTrigger>
        </TabsList>

        {/* Basic Settings Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Basic Shipping Settings
              </CardTitle>
              <CardDescription>
                Core shipping configuration parameters that affect all calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseRate">Base Rate (฿)</Label>
                  <Input
                    id="baseRate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.baseRate}
                    onChange={(e) => updateConfig('baseRate', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Fixed base cost added to all shipments
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumCost">Minimum Cost (฿)</Label>
                  <Input
                    id="minimumCost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.minimumCost}
                    onChange={(e) => updateConfig('minimumCost', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum shipping cost regardless of calculations
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (฿)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.freeShippingThreshold}
                    onChange={(e) => updateConfig('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Order total required for free shipping
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volumetricDivisor">Volumetric Divisor</Label>
                  <Input
                    id="volumetricDivisor"
                    type="number"
                    min="1"
                    value={config.volumetricDivisor}
                    onChange={(e) => updateConfig('volumetricDivisor', parseFloat(e.target.value) || 5000)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used to calculate volumetric weight (L×W×H / divisor)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Rates Tab */}
        <TabsContent value="rates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Weight-based Rates (฿/kg)</CardTitle>
                <CardDescription>
                  Cost per kilogram for each shipping method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weightStandard">Standard Shipping</Label>
                  <Input
                    id="weightStandard"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.weightRates.standard}
                    onChange={(e) => updateNestedConfig('weightRates', 'standard', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightExpress">Express Shipping</Label>
                  <Input
                    id="weightExpress"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.weightRates.express}
                    onChange={(e) => updateNestedConfig('weightRates', 'express', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightSameDay">Same Day Delivery</Label>
                  <Input
                    id="weightSameDay"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.weightRates.same_day}
                    onChange={(e) => updateNestedConfig('weightRates', 'same_day', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Distance Rates */}
            <Card>
              <CardHeader>
                <CardTitle>Distance-based Rates (฿/km)</CardTitle>
                <CardDescription>
                  Cost per kilometer for each shipping method
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="distanceStandard">Standard Shipping</Label>
                  <Input
                    id="distanceStandard"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.distanceRates.standard}
                    onChange={(e) => updateNestedConfig('distanceRates', 'standard', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distanceExpress">Express Shipping</Label>
                  <Input
                    id="distanceExpress"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.distanceRates.express}
                    onChange={(e) => updateNestedConfig('distanceRates', 'express', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distanceSameDay">Same Day Delivery</Label>
                  <Input
                    id="distanceSameDay"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.distanceRates.same_day}
                    onChange={(e) => updateNestedConfig('distanceRates', 'same_day', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Distance Limits Tab */}
        <TabsContent value="distance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Delivery Distance (km)</CardTitle>
              <CardDescription>
                Maximum distance limits for each shipping method
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxDistanceStandard">Standard Shipping</Label>
                  <Input
                    id="maxDistanceStandard"
                    type="number"
                    min="1"
                    value={config.maxDeliveryDistance.standard}
                    onChange={(e) => updateNestedConfig('maxDeliveryDistance', 'standard', parseFloat(e.target.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground">
                    3-5 business days
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDistanceExpress">Express Shipping</Label>
                  <Input
                    id="maxDistanceExpress"
                    type="number"
                    min="1"
                    value={config.maxDeliveryDistance.express}
                    onChange={(e) => updateNestedConfig('maxDeliveryDistance', 'express', parseFloat(e.target.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground">
                    1-2 business days
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxDistanceSameDay">Same Day Delivery</Label>
                  <Input
                    id="maxDistanceSameDay"
                    type="number"
                    min="1"
                    value={config.maxDeliveryDistance.same_day}
                    onChange={(e) => updateNestedConfig('maxDeliveryDistance', 'same_day', parseFloat(e.target.value) || 1)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Same business day
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Oversized Items Tab */}
        <TabsContent value="oversized" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Oversized Threshold (cm)</CardTitle>
                <CardDescription>
                  Dimensions that trigger oversized surcharge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="thresholdLength">Length (cm)</Label>
                  <Input
                    id="thresholdLength"
                    type="number"
                    min="1"
                    value={config.oversizedThreshold.length}
                    onChange={(e) => updateNestedConfig('oversizedThreshold', 'length', parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thresholdWidth">Width (cm)</Label>
                  <Input
                    id="thresholdWidth"
                    type="number"
                    min="1"
                    value={config.oversizedThreshold.width}
                    onChange={(e) => updateNestedConfig('oversizedThreshold', 'width', parseFloat(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thresholdHeight">Height (cm)</Label>
                  <Input
                    id="thresholdHeight"
                    type="number"
                    min="1"
                    value={config.oversizedThreshold.height}
                    onChange={(e) => updateNestedConfig('oversizedThreshold', 'height', parseFloat(e.target.value) || 1)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oversized Surcharge</CardTitle>
                <CardDescription>
                  Additional cost for oversized items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="oversizedSurcharge">Surcharge Amount (฿)</Label>
                  <Input
                    id="oversizedSurcharge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={config.oversizedSurcharge}
                    onChange={(e) => updateConfig('oversizedSurcharge', parseFloat(e.target.value) || 0)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Added when any dimension exceeds threshold
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <h4 className="font-medium">Current Thresholds:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Length: {config.oversizedThreshold.length} cm</p>
                    <p>Width: {config.oversizedThreshold.width} cm</p>
                    <p>Height: {config.oversizedThreshold.height} cm</p>
                    <p className="font-medium text-foreground">
                      Surcharge: ฿{config.oversizedSurcharge}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

          {/* Configuration Information Card */}
          {metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Configuration Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-foreground">Version Info</h4>
                    <p className="text-muted-foreground">Version: {metadata.version}</p>
                    <p className="text-muted-foreground">Status: <Badge variant="outline">{metadata.status}</Badge></p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Last Updated</h4>
                    <p className="text-muted-foreground">
                      {metadata.configAge === 0 ? 'Today' : `${metadata.configAge} days ago`}
                    </p>
                    {metadata.updatedBy && (
                      <p className="text-muted-foreground">By: {metadata.updatedBy.email}</p>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Description</h4>
                    <p className="text-muted-foreground">
                      {metadata.description || config?.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Button (Fixed at bottom) */}
          {hasChanges && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button 
                size="lg"
                onClick={saveConfiguration}
                disabled={isSaving}
                className="shadow-lg"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}