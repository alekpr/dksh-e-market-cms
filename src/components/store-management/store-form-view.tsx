import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, X, Loader2, User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { StoreFormData, ViewMode } from './use-store-management'
import { useAvailableMerchants } from '../../hooks/use-available-merchants'

interface StoreFormViewProps {
  currentView: ViewMode
  formData: StoreFormData
  onFormDataChange: (data: StoreFormData) => void
  onSave: () => void
  onCancel: () => void
}

export const StoreFormView: React.FC<StoreFormViewProps> = ({
  currentView,
  formData,
  onFormDataChange,
  onSave,
  onCancel
}) => {
  const isEditing = currentView === 'edit'
  const title = isEditing ? 'Edit Store' : 'Add New Store'
  const { merchants, loading: merchantsLoading, error: merchantsError } = useAvailableMerchants()

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.replace('address.', '')
      onFormDataChange({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      })
    } else {
      onFormDataChange({
        ...formData,
        [field]: value
      })
    }
  }

  const getSelectedMerchantDisplay = () => {
    if (!formData.owner) return null
    const merchant = merchants.find(m => m.id === formData.owner)
    if (!merchant) return null
    
    const displayName = merchant.name
    
    return `${displayName} (${merchant.email})`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
            Back to Store List
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update store information' : 'Create a new store in the marketplace'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            {isEditing ? 'Update Store' : 'Create Store'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter store name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter store description"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="store@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone *</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                placeholder="02-123-4567"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={formData.address.street}
                  onChange={(e) => handleInputChange('address.street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="Bangkok"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="Bangkok"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Postal Code</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="10110"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="Thailand"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Store Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {merchantsError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {merchantsError}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="owner">Select Store Owner *</Label>
              <Select 
                value={formData.owner} 
                onValueChange={(value) => handleInputChange('owner', value)}
                disabled={merchantsLoading}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      merchantsLoading 
                        ? "Loading merchants..." 
                        : merchants.length === 0 
                          ? "No available merchants"
                          : "Select a merchant"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {merchants.map((merchant) => {
                    const displayName = merchant.name
                    
                    return (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{displayName}</span>
                          <span className="text-sm text-muted-foreground">{merchant.email}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              
              {merchantsLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading available merchants...
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                {merchants.length === 0 && !merchantsLoading
                  ? "All merchants already have stores assigned. Create a new merchant user first."
                  : "Select a merchant who will own this store. Only merchants without existing stores are shown."
                }
              </p>
            </div>

            {/* Display selected merchant info */}
            {formData.owner && getSelectedMerchantDisplay() && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Selected Owner: </span>
                  {getSelectedMerchantDisplay()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
