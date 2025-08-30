import { useState, useMemo, useEffect } from 'react'
import { storeApi } from '@/lib/api'
import type { Store, StoreApiResponse } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export type ViewMode = 'list' | 'add' | 'edit' | 'view'

export interface StoreFormData {
  name: string
  description: string
  contactEmail: string
  contactPhone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  owner: string
}

// Simple toast replacement - you can implement proper toast later
const toast = {
  success: (message: string) => {
    console.log('✅', message)
    alert(`✅ ${message}`) // Make the message visible to the user
  },
  error: (message: string) => {
    console.error('❌', message)
    alert(`❌ ${message}`) // Make the error visible to the user
  }
}

export const useStoreManagement = () => {
  const { user } = useAuth() // Get current authenticated user
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  })
  
  const [formData, setFormData] = useState<StoreFormData>({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Thailand'
    },
    owner: ''
  })

  // Fetch stores data
  const fetchStores = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      }

      if (filterStatus !== 'all') {
        params.status = filterStatus
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      const response = await storeApi.getStores(params) as any
      console.log('API Response:', response) // Debug logging
      
      // The API returns the raw response structure directly
      if (response.success && response.data) {
        setStores(response.data)
        setPagination({
          total: response.pagination.total,
          page: response.pagination.page,
          pages: response.pagination.pages,
          limit: response.pagination.limit,
        })
      } else {
        setError('Failed to fetch stores')
      }
    } catch (error: any) {
      console.error('Failed to fetch stores:', error)
      setError('Failed to connect to server. Please check if the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Load stores on component mount and when filters change
  useEffect(() => {
    fetchStores()
  }, [currentPage, filterStatus, searchTerm])

  // Filter and search logic (for client-side filtering if needed)
  const filteredStores = useMemo(() => {
    if (currentView !== 'list') return stores
    return stores.filter(store => {
      const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (store.description && store.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === 'all' || store.status === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [stores, searchTerm, filterStatus, currentView])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contactEmail: '',
      contactPhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Thailand'
      },
      owner: ''
    })
  }

  // Handle add store
  const handleAdd = () => {
    console.log('🔧 handleAdd called - changing view to add')
    setCurrentView('add')
    resetForm()
    setSelectedStore(null)
  }

  // Handle edit store
  const handleEdit = (store: Store) => {
    setCurrentView('edit')
    setSelectedStore(store)
    setFormData({
      name: store.name,
      description: store.description || '',
      contactEmail: store.contactEmail,
      contactPhone: store.contactPhone,
      address: {
        street: store.address?.street || '',
        city: store.address?.city || '',
        state: store.address?.state || '',
        zipCode: store.address?.zipCode || '',
        country: store.address?.country || 'Thailand'
      },
      owner: store.owner?._id || ''
    })
  }

  // Handle view store
  const handleView = (store: Store) => {
    setCurrentView('view')
    setSelectedStore(store)
  }

  // Handle save (add/edit)
  const handleSave = async () => {
    console.log('🔍 handleSave called with formData:', formData)
    console.log('🔍 name:', formData.name, 'trimmed:', formData.name.trim())
    console.log('🔍 contactEmail:', formData.contactEmail, 'trimmed:', formData.contactEmail.trim())
    
    if (!formData.name.trim() || !formData.contactEmail.trim()) {
      console.log('❌ Please fill in required fields')
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      
      // Use current user's ID if owner is not specified
      const ownerIdToUse = formData.owner.trim() || user?._id || ''
      
      const storeData = {
        name: formData.name,
        description: formData.description,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        owner: ownerIdToUse
      }

      console.log('🔧 Store data to submit:', storeData)

      if (currentView === 'edit' && selectedStore) {
        console.log('🔄 Updating store with ID:', selectedStore._id)
        const response = await storeApi.updateStore(selectedStore._id, storeData)
        console.log('📥 Update store response:', response)
        if (response.success === true || response.status === 'success') {
          toast.success('Store updated successfully')
          console.log('✅ Store updated successfully')
        } else {
          console.log('❌ Failed to update store:', response)
          toast.error(response.message || 'Failed to update store')
          return
        }
      } else {
        console.log('🔄 Creating new store')
        const response = await storeApi.createStore(storeData)
        console.log('📥 Create store response:', response)
        if (response.success === true || response.status === 'success') {
          toast.success('Store created successfully')
          console.log('✅ Store created successfully')
        } else {
          console.log('❌ Failed to create store:', response)
          toast.error(response.message || 'Failed to create store')
          return
        }
      }

      setCurrentView('list')
      resetForm()
      setSelectedStore(null)
      fetchStores() // Refresh the list
      
    } catch (error: any) {
      console.error('Failed to save store:', error)
      toast.error('Failed to save store. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete store
  const handleDelete = async (id: string) => {
    try {
      // Confirm deletion with the user
      if (!window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
        return;
      }
      
      console.log('Attempting to delete store with ID:', id)
      const response = await storeApi.deleteStore(id)
      console.log('Delete store response:', response)
      
      if (response.success === true) {
        toast.success(response.message || 'Store deleted successfully')
        fetchStores() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to delete store')
      }
    } catch (error: any) {
      console.error('Failed to delete store:', error)
      toast.error(`Failed to delete store: ${error.message || 'Unknown error'}`)
    }
  }

  // Handle search input
  const handleSearch = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle status filter change
  const handleStatusFilter = (status: string) => {
    setFilterStatus(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setCurrentPage(1)
  }

  // Handle cancel form
  const handleCancel = () => {
    setCurrentView('list')
    resetForm()
    setSelectedStore(null)
  }

  return {
    // State
    stores,
    loading,
    error,
    setError,
    currentView,
    selectedStore,
    searchTerm,
    filterStatus,
    formData,
    filteredStores,
    currentPage,
    pagination,
    
    // Setters
    setSearchTerm: handleSearch,
    setFilterStatus: handleStatusFilter,
    setFormData,
    setCurrentPage,
    
    // Actions
    handleAdd,
    handleEdit,
    handleView,
    handleSave,
    handleDelete,
    handleClearFilters,
    handleCancel,
    fetchStores
  }
}
