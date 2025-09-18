/**
 * Banner Management Component
 * Main component for managing banners with list, form, and detail views
 */
import { useState, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BannerList } from './BannerList'
import { BannerDetail } from './BannerDetail'
import { BannerForm } from './BannerForm'
import { useBannerManagement, type Banner, type CreateBannerRequest, type UpdateBannerRequest } from './use-banner-management'
import { useAuth } from '@/contexts/AuthContext'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export function BannerManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const { user } = useAuth()
  
  const {
    selectedBanner,
    createBanner,
    updateBanner,
    selectBanner,
    setSelectedBanner,
    loading
  } = useBannerManagement()

  const handleCreate = useCallback(() => {
    setSelectedBanner(null)
    setViewMode('create')
  }, [])

  const handleEdit = useCallback((banner: Banner) => {
    setSelectedBanner(banner)
    setViewMode('edit')
  }, [])

  const handleView = useCallback((banner: Banner) => {
    setSelectedBanner(banner)
    setViewMode('view')
  }, [])

  const handleCancel = useCallback(() => {
    if (viewMode === 'edit' && selectedBanner) {
      // When canceling edit, go back to detail view
      setViewMode('view')
    } else {
      // When canceling create or from detail view, go back to list
      setSelectedBanner(null)
      setViewMode('list')
    }
  }, [viewMode, selectedBanner])

  const handleSubmit = useCallback(async (data: CreateBannerRequest | UpdateBannerRequest) => {
    try {
      if (viewMode === 'create') {
        console.log('Creating banner with data:', data)
        const result = await createBanner(data as CreateBannerRequest)
        console.log('Create banner result:', result)
        // Navigate back to list after creating new banner
        setViewMode('list')
      } else if (viewMode === 'edit' && selectedBanner) {
        console.log('Updating banner with data:', data)
        const result = await updateBanner(selectedBanner._id, data as UpdateBannerRequest)
        console.log('Update banner result:', result)
        
        // Refresh banner data after successful update
        await selectBanner(selectedBanner._id)
        
        // Navigate back to detail view after editing banner
        setViewMode('view')
      }
    } catch (error) {
      console.error('Error submitting banner:', error)
      // Keep on current view if there's an error
    }
  }, [viewMode, selectedBanner, createBanner, updateBanner, selectBanner, setSelectedBanner])

  // Show form for create/edit modes
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {viewMode === 'create' ? 'Create New Banner' : 'Edit Banner'}
          </h1>
        </div>

        <BannerForm
          banner={viewMode === 'edit' ? selectedBanner || undefined : undefined}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    )
  }

  // Show detail view
  if (viewMode === 'view' && selectedBanner) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <h1 className="text-2xl font-bold">Banner Details</h1>
        </div>

        <BannerDetail
          banner={selectedBanner}
          onEdit={() => handleEdit(selectedBanner)}
          onDelete={async () => {
            // TODO: Implement delete functionality
            console.log('Delete banner:', selectedBanner._id)
          }}
          onToggleStatus={async () => {
            // TODO: Implement toggle status functionality
            console.log('Toggle status for banner:', selectedBanner._id)
          }}
        />
      </div>
    )
  }

  // Show list view (default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banner Management</h1>
        <Button onClick={handleCreate}>
          Create New Banner
        </Button>
      </div>

      <BannerList
        onEdit={handleEdit}
        onView={handleView}
        onCreate={handleCreate}
      />
    </div>
  )
}