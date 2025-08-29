import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'
import { ROLE_DESCRIPTIONS, type UserRole } from '@/lib/constants/roles'
import type { UserFormData, ViewMode } from './use-user-management'

interface UserFormViewProps {
  currentView: ViewMode
  formData: UserFormData
  onFormDataChange: (data: UserFormData) => void
  onSave: () => void
  onCancel: () => void
}

export const UserFormView: React.FC<UserFormViewProps> = ({
  currentView,
  formData,
  onFormDataChange,
  onSave,
  onCancel
}) => {
  const isEditing = currentView === 'edit'
  const title = isEditing ? 'Edit User' : 'Add New User'

  const [newTag, setNewTag] = useState('')

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('profile.address.')) {
      const addressField = field.replace('profile.address.', '')
      onFormDataChange({
        ...formData,
        profile: {
          ...formData.profile,
          address: {
            ...formData.profile?.address,
            [addressField]: value
          }
        }
      })
    } else if (field.startsWith('profile.')) {
      const profileField = field.replace('profile.', '')
      onFormDataChange({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value
        }
      })
    } else {
      onFormDataChange({
        ...formData,
        [field]: value
      })
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      onFormDataChange({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      })
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onFormDataChange({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
            Back to User List
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update user information and permissions' : 'Create a new user account'}
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
            {isEditing ? 'Update User' : 'Create User'}
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
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">User Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="merchant">Merchant</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Password Information (for new users) */}
        {!isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Password Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter password"
                  required={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirm Password *</Label>
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm || ''}
                  onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                  placeholder="Confirm password"
                  required={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <Card className={!isEditing ? "md:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.profile?.firstName || ''}
                  onChange={(e) => handleInputChange('profile.firstName', e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.profile?.lastName || ''}
                  onChange={(e) => handleInputChange('profile.lastName', e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.profile?.phone || ''}
                  onChange={(e) => handleInputChange('profile.phone', e.target.value)}
                  placeholder="02-123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.profile?.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('profile.dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.profile?.gender || 'male'} 
                  onValueChange={(value) => handleInputChange('profile.gender', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  value={formData.profile?.address?.street || ''}
                  onChange={(e) => handleInputChange('profile.address.street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.profile?.address?.city || ''}
                  onChange={(e) => handleInputChange('profile.address.city', e.target.value)}
                  placeholder="Bangkok"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.profile?.address?.state || ''}
                  onChange={(e) => handleInputChange('profile.address.state', e.target.value)}
                  placeholder="Bangkok"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Postal Code</Label>
                <Input
                  id="zipCode"
                  value={formData.profile?.address?.zipCode || ''}
                  onChange={(e) => handleInputChange('profile.address.zipCode', e.target.value)}
                  placeholder="10110"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.profile?.address?.country || 'Thailand'}
                  onChange={(e) => handleInputChange('profile.address.country', e.target.value)}
                  placeholder="Thailand"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Information & Permissions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Role Information & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.role && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    {ROLE_DESCRIPTIONS[formData.role as UserRole]?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {ROLE_DESCRIPTIONS[formData.role as UserRole]?.description}
                  </p>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Permissions:</h5>
                    <ul className="text-sm space-y-1">
                      {ROLE_DESCRIPTIONS[formData.role as UserRole]?.permissions.map((permission, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {permission}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {formData.role === 'customer' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Customer users cannot access the CMS. They can only use the mobile application.
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button onClick={handleAddTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
