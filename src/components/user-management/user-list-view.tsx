import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GenericDataTable } from "./generic-data-table"
import { Plus, MoreHorizontal, Edit, Eye, Trash, Lock, Unlock, UserCheck } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import type { User } from '@/lib/api'
import type { ColumnDef } from '@tanstack/react-table'

interface UserListViewProps {
  users: User[]
  loading: boolean
  onAdd: () => void
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onStatusChange: (userId: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => void
  onRoleChange: (userId: string, role: 'customer' | 'merchant' | 'admin', reason?: string) => void
  onAccountLock: (userId: string, action: 'lock' | 'unlock') => void
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

export const UserListView: React.FC<UserListViewProps> = ({
  users,
  loading,
  onAdd,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onRoleChange,
  onAccountLock
}) => {
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as User['role']
        const config = userRoleConfig[role]
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status || (row.original.active ? 'active' : 'inactive')
        const config = userStatusConfig[status as keyof typeof userStatusConfig] || userStatusConfig.inactive
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "profile",
      header: "Profile",
      cell: ({ row }) => {
        const profile = row.original.profile
        return profile ? (
          <div className="flex flex-col">
            {(profile.firstName || profile.lastName) && (
              <span className="text-sm font-medium">
                {[profile.firstName, profile.lastName].filter(Boolean).join(' ')}
              </span>
            )}
            {profile.phone && (
              <span className="text-xs text-muted-foreground">{profile.phone}</span>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No profile data</span>
        )
      },
    },
    {
      accessorKey: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const permissions = row.original.permissions
        return permissions && permissions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {permissions.slice(0, 2).map((permission, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {permission.replace(/_/g, ' ')}
              </Badge>
            ))}
            {permissions.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{permissions.length - 2} more
              </Badge>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No permissions</span>
        )
      },
    },
    {
      accessorKey: "security",
      header: "Security",
      cell: ({ row }) => {
        const security = row.original.security
        const isLocked = security?.accountLockedUntil && new Date(security.accountLockedUntil) > new Date()
        const twoFA = security?.twoFactorEnabled
        
        return (
          <div className="flex gap-1">
            {isLocked && (
              <Badge variant="destructive" className="text-xs">
                Locked
              </Badge>
            )}
            {twoFA && (
              <Badge variant="default" className="text-xs">
                2FA
              </Badge>
            )}
            {!isLocked && !twoFA && (
              <span className="text-sm text-muted-foreground">Normal</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        return (
          <span className="text-sm">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original
        const isLocked = user.security?.accountLockedUntil && new Date(user.security.accountLockedUntil) > new Date()
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(user)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Status Actions */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Change Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onStatusChange(user._id, 'active')}>
                    Set Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(user._id, 'inactive')}>
                    Set Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(user._id, 'suspended')}>
                    Suspend User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(user._id, 'pending')}>
                    Set Pending
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Role Actions */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Change Role
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onRoleChange(user._id, 'customer')}>
                    Set Customer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRoleChange(user._id, 'merchant')}>
                    Set Merchant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRoleChange(user._id, 'admin')}>
                    Set Admin
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Account Lock Actions */}
              <DropdownMenuItem 
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
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onDelete(user)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across the platform
          </p>
        </div>
        <Button onClick={() => {
          console.log('🔧 Add User button clicked')
          onAdd()
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.status === 'active' || (user.active && !user.status)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'merchant').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => user.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first user to the platform.
              </p>
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          ) : (
            <GenericDataTable 
              columns={columns} 
              data={users} 
              searchKey="name"
              searchPlaceholder="Search users..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
