import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  MapPin, 
  Phone, 
  UserIcon, 
  Shield, 
  Settings,
  Lock,
  Unlock,
  UserCheck,
  MessageSquare,
  Activity
} from 'lucide-react'
import type { User } from '@/lib/api'

interface UserDetailViewProps {
  user: User
  onEdit: (user: User) => void
  onBack: () => void
  onStatusChange: (userId: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => void
  onRoleChange: (userId: string, role: 'customer' | 'merchant' | 'admin', reason?: string) => void
  onAccountLock: (userId: string, action: 'lock' | 'unlock') => void
  onAddNote: (userId: string, note: string) => void
}

// User status configuration
const userStatusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const },
  active: { label: 'Active', variant: 'default' as const },
  suspended: { label: 'Suspended', variant: 'destructive' as const },
  inactive: { label: 'Inactive', variant: 'outline' as const },
}

// User role configuration
const userRoleConfig = {
  customer: { label: 'Customer', variant: 'outline' as const },
  merchant: { label: 'Merchant', variant: 'secondary' as const },
  admin: { label: 'Admin', variant: 'default' as const },
}

export const UserDetailView: React.FC<UserDetailViewProps> = ({
  user,
  onEdit,
  onBack,
  onStatusChange,
  onRoleChange,
  onAccountLock,
  onAddNote
}) => {
  const [newNote, setNewNote] = useState('')
  const [roleChangeReason, setRoleChangeReason] = useState('')
  const [selectedNewRole, setSelectedNewRole] = useState<'customer' | 'merchant' | 'admin'>('customer')

  const currentStatus = user.status || (user.active ? 'active' : 'inactive')
  const statusConfig = userStatusConfig[currentStatus as keyof typeof userStatusConfig] || userStatusConfig.inactive
  const roleConfig = userRoleConfig[user.role as keyof typeof userRoleConfig]
  const isLocked = user.security?.accountLockedUntil && new Date(user.security.accountLockedUntil) > new Date()

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(user._id, newNote.trim())
      setNewNote('')
    }
  }

  const handleRoleChange = () => {
    onRoleChange(user._id, selectedNewRole, roleChangeReason.trim() || undefined)
    setRoleChangeReason('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to User List
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onEdit(user)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit User
          </Button>
        </div>
      </div>

      {/* User Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Role:</span>
              <Badge variant={roleConfig.variant}>
                {roleConfig.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
            </div>

            {user.profile && (
              <div className="space-y-2">
                {(user.profile.firstName || user.profile.lastName) && (
                  <div>
                    <span className="text-sm font-medium">Full Name: </span>
                    <span className="text-sm">
                      {[user.profile.firstName, user.profile.lastName].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}
                {user.profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.profile.phone}</span>
                  </div>
                )}
                {user.profile.dateOfBirth && (
                  <div>
                    <span className="text-sm font-medium">Date of Birth: </span>
                    <span className="text-sm">{new Date(user.profile.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
                {user.profile.gender && (
                  <div>
                    <span className="text-sm font-medium">Gender: </span>
                    <span className="text-sm capitalize">{user.profile.gender}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {isLocked && (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">Account Locked</span>
                  <Badge variant="destructive">Locked until {new Date(user.security!.accountLockedUntil!).toLocaleDateString()}</Badge>
                </div>
              )}
              
              {user.security?.twoFactorEnabled && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Two-Factor Authentication</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              )}
              
              {user.security?.lastLogin && (
                <div>
                  <span className="text-sm font-medium">Last Login: </span>
                  <span className="text-sm">{new Date(user.security.lastLogin).toLocaleString()}</span>
                </div>
              )}
              
              {user.security?.loginCount && (
                <div>
                  <span className="text-sm font-medium">Login Count: </span>
                  <span className="text-sm">{user.security.loginCount}</span>
                </div>
              )}
              
              {user.security?.failedLoginAttempts && user.security.failedLoginAttempts > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Failed Login Attempts: </span>
                  <Badge variant="destructive">{user.security.failedLoginAttempts}</Badge>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Change Status
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change User Status</DialogTitle>
                    <DialogDescription>
                      Select a new status for {user.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => onStatusChange(user._id, 'active')}
                      className="justify-start"
                    >
                      Set Active
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onStatusChange(user._id, 'inactive')}
                      className="justify-start"
                    >
                      Set Inactive
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onStatusChange(user._id, 'suspended')}
                      className="justify-start"
                    >
                      Suspend User
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => onStatusChange(user._id, 'pending')}
                      className="justify-start"
                    >
                      Set Pending
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Change Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change User Role</DialogTitle>
                    <DialogDescription>
                      Change the role for {user.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="newRole">New Role</Label>
                      <Select value={selectedNewRole} onValueChange={(value) => setSelectedNewRole(value as typeof selectedNewRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="merchant">Merchant</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason (optional)</Label>
                      <Textarea
                        id="reason"
                        value={roleChangeReason}
                        onChange={(e) => setRoleChangeReason(e.target.value)}
                        placeholder="Enter reason for role change..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleRoleChange}>Change Role</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onAccountLock(user._id, isLocked ? 'unlock' : 'lock')}
              >
                {isLocked ? (
                  <>
                    <Unlock className="mr-2 h-4 w-4" />
                    Unlock Account
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        {user.profile?.address && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.profile.address.street && (
                <div>
                  <span className="text-sm font-medium">Street: </span>
                  <span className="text-sm">{user.profile.address.street}</span>
                </div>
              )}
              {user.profile.address.city && (
                <div>
                  <span className="text-sm font-medium">City: </span>
                  <span className="text-sm">{user.profile.address.city}</span>
                </div>
              )}
              {user.profile.address.state && (
                <div>
                  <span className="text-sm font-medium">State: </span>
                  <span className="text-sm">{user.profile.address.state}</span>
                </div>
              )}
              {user.profile.address.zipCode && (
                <div>
                  <span className="text-sm font-medium">Postal Code: </span>
                  <span className="text-sm">{user.profile.address.zipCode}</span>
                </div>
              )}
              {user.profile.address.country && (
                <div>
                  <span className="text-sm font-medium">Country: </span>
                  <span className="text-sm">{user.profile.address.country}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {user.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline">
                    {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No permissions assigned</p>
            )}
          </CardContent>
        </Card>

        {/* User Tags */}
        {user.tags && user.tags.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>User Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Summary */}
        {user.activitySummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.activitySummary.orderCount && (
                <div>
                  <span className="text-sm font-medium">Total Orders: </span>
                  <span className="text-sm">{user.activitySummary.orderCount}</span>
                </div>
              )}
              {user.activitySummary.totalSpent && (
                <div>
                  <span className="text-sm font-medium">Total Spent: </span>
                  <span className="text-sm">฿{user.activitySummary.totalSpent.toLocaleString()}</span>
                </div>
              )}
              {user.activitySummary.avgOrderValue && (
                <div>
                  <span className="text-sm font-medium">Avg Order Value: </span>
                  <span className="text-sm">฿{user.activitySummary.avgOrderValue.toLocaleString()}</span>
                </div>
              )}
              {user.activitySummary.lastOrderDate && (
                <div>
                  <span className="text-sm font-medium">Last Order: </span>
                  <span className="text-sm">{new Date(user.activitySummary.lastOrderDate).toLocaleDateString()}</span>
                </div>
              )}
              {user.activitySummary.loyaltyPoints && (
                <div>
                  <span className="text-sm font-medium">Loyalty Points: </span>
                  <span className="text-sm">{user.activitySummary.loyaltyPoints}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Admin Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Note */}
            <div className="space-y-2">
              <Label htmlFor="newNote">Add Note</Label>
              <div className="flex gap-2">
                <Textarea
                  id="newNote"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add an admin note..."
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>
            </div>

            {/* Existing Notes */}
            {user.adminNotes && user.adminNotes.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium">Previous Notes</h4>
                {user.adminNotes.map((note, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <p className="text-sm">{note.note}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Added on {new Date(note.addedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>By: {note.addedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No admin notes yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
