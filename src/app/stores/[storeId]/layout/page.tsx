/**
 * Store Layout Management Page
 * Main page for store layout customization in CMS
 */
'use client'

import React from 'react'
import { StoreLayoutManager } from '@/components/store-layout/store-layout-manager'
import type { StoreLayout } from '@/hooks/use-store-layout-templates'

interface StoreLayoutPageProps {
  params: {
    storeId: string
  }
}

export default function StoreLayoutPage({ params }: StoreLayoutPageProps) {
  const { storeId } = params

  // Handle layout save
  const handleLayoutSave = (layout: StoreLayout) => {
    console.log('Layout saved:', layout)
    // You can add additional logic here like redirecting or showing notifications
  }

  // Handle layout preview
  const handleLayoutPreview = (layout: StoreLayout) => {
    console.log('Layout preview:', layout)
    // You can open a preview window or navigate to preview page
  }

  return (
    <div className="container mx-auto py-6">
      <StoreLayoutManager
        storeId={storeId}
        onSave={handleLayoutSave}
        onPreview={handleLayoutPreview}
      />
    </div>
  )
}