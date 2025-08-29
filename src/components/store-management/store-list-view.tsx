import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GenericDataTable } from "./generic-data-table"
import { Plus, MoreHorizontal, Edit, Eye, Trash } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Store } from '@/lib/api'
import type { ColumnDef } from '@tanstack/react-table'

interface StoreListViewProps {
  stores: Store[]
  loading: boolean
  onAdd: () => void
  onView: (store: Store) => void
  onEdit: (store: Store) => void
  onDelete: (store: Store) => void
}

// Store status configuration
const storeStatusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const },
  active: { label: 'Active', variant: 'default' as const },
  suspended: { label: 'Suspended', variant: 'destructive' as const },
  inactive: { label: 'Inactive', variant: 'outline' as const },
}

export const StoreListView: React.FC<StoreListViewProps> = ({
  stores,
  loading,
  onAdd,
  onView,
  onEdit,
  onDelete
}) => {
  const columns: ColumnDef<Store>[] = [
    {
      accessorKey: "name",
      header: "Store Name",
      cell: ({ row }) => {
        const store = row.original
        return (
          <div className="flex flex-col">
            <span className="font-medium">{store.name}</span>
            {store.description && (
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {store.description}
              </span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as Store['status']
        const config = storeStatusConfig[status]
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "contactEmail",
      header: "Contact Email",
      cell: ({ row }) => {
        return (
          <span className="text-sm">{row.getValue("contactEmail")}</span>
        )
      },
    },
    {
      accessorKey: "contactPhone",
      header: "Contact Phone",
      cell: ({ row }) => {
        return (
          <span className="text-sm">{row.getValue("contactPhone")}</span>
        )
      },
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => {
        const owner = row.getValue("owner") as Store['owner']
        return owner ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{owner.name}</span>
            <span className="text-xs text-muted-foreground">{owner.email}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No owner assigned</span>
        )
      },
    },
    {
      accessorKey: "businessInfo.businessType",
      header: "Business Type",
      cell: ({ row }) => {
        const businessType = row.original.businessInfo?.businessType
        return businessType ? (
          <Badge variant="outline">
            {businessType.charAt(0).toUpperCase() + businessType.slice(1)}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
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
        const store = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(store)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(store)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Store
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(store)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Store
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
              <p className="text-muted-foreground">Loading stores...</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Store Management</h1>
          <p className="text-muted-foreground">
            Manage and monitor your marketplace stores
          </p>
        </div>
        <Button onClick={() => {
          console.log('🔧 Add Store button clicked')
          onAdd()
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter(store => store.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter(store => store.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stores.filter(store => store.status === 'suspended').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
        </CardHeader>
        <CardContent>
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">No stores found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first store to the marketplace.
              </p>
              <Button onClick={onAdd}>
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </div>
          ) : (
            <GenericDataTable 
              columns={columns} 
              data={stores} 
              searchKey="name"
              searchPlaceholder="Search stores..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
