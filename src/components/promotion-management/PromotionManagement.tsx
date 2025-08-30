/**
 * Promotion Management Component
 * Main component for managing promotions with list, form, and detail views
 */
import { useState, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PromotionList } from './PromotionList'
import { PromotionDetail } from './PromotionDetail'
import { PromotionFormSimplified } from './PromotionFormSimplified'
import { usePromotionManagement } from './use-promotion-management'
import type { Promotion, CreatePromotionRequest, UpdatePromotionRequest } from '@/lib/api'

type ViewMode = 'list' | 'create' | 'edit' | 'view'

export function PromotionManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  
  const {
    createPromotion,
    updatePromotion,
    fetchPromotion,
    saving
  } = usePromotionManagement({ autoFetch: false })

  const handleCreate = useCallback(() => {
    setSelectedPromotion(null)
    setViewMode('create')
  }, [])

  const handleEdit = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setViewMode('edit')
  }, [])

  const handleView = useCallback((promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setViewMode('view')
  }, [])

  const handleCancel = useCallback(() => {
    if (viewMode === 'edit' && selectedPromotion) {
      // When canceling edit, go back to detail view
      setViewMode('view')
    } else {
      // When canceling create or from detail view, go back to list
      setSelectedPromotion(null)
      setViewMode('list')
    }
  }, [viewMode, selectedPromotion])

  const handleSubmit = useCallback(async (data: CreatePromotionRequest | UpdatePromotionRequest) => {
    try {
      if (viewMode === 'create') {
        console.log('Creating promotion with data:', data)
        const result = await createPromotion(data as CreatePromotionRequest)
        console.log('Create promotion result:', result)
        // Navigate back to list after creating new promotion
        setViewMode('list')
      } else if (viewMode === 'edit' && selectedPromotion) {
        console.log('Updating promotion with data:', data)
        const result = await updatePromotion(selectedPromotion._id, data as UpdatePromotionRequest)
        console.log('Update promotion result:', result)
        
        // Refetch the updated promotion data
        if (result) {
          const updatedPromotion = await fetchPromotion(selectedPromotion._id)
          if (updatedPromotion) {
            setSelectedPromotion(updatedPromotion)
          }
        }
        
        // Navigate back to detail view after editing promotion
        setViewMode('view')
      }
    } catch (error) {
      console.error('Error submitting promotion:', error)
      // Keep on current view if there's an error
    }
  }, [viewMode, selectedPromotion, createPromotion, updatePromotion, fetchPromotion])

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New Promotion</h1>
                <p className="text-muted-foreground">
                  Set up a new promotional campaign
                </p>
              </div>
            </div>
            <PromotionFormSimplified
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
            />
          </div>
        )

      case 'edit':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Edit Promotion</h1>
                <p className="text-muted-foreground">
                  Update {selectedPromotion?.title}
                </p>
              </div>
            </div>
            <PromotionFormSimplified
              promotion={selectedPromotion || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
            />
          </div>
        )

      case 'view':
        if (!selectedPromotion) {
          return (
            <div className="p-8 text-center text-muted-foreground">
              No promotion selected
            </div>
          )
        }
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Promotion Details</h1>
                <p className="text-muted-foreground">
                  View and manage promotion information
                </p>
              </div>
            </div>
            <PromotionDetail
              promotion={selectedPromotion}
              onEdit={() => setViewMode('edit')}
              onDelete={() => {
                // TODO: Implement delete functionality
                console.log('Delete promotion:', selectedPromotion._id)
              }}
              onDuplicate={() => {
                // TODO: Implement duplicate functionality
                console.log('Duplicate promotion:', selectedPromotion._id)
              }}
            />
          </div>
        )

      case 'list':
      default:
        return (
          <PromotionList
            onEdit={handleEdit}
            onView={handleView}
            onCreate={handleCreate}
          />
        )
    }
  }

  return (
    <>
      {renderContent()}
    </>
  )
}
