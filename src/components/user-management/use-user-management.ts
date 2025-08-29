import { useState, useMemo, useEffect } from 'react'
import { userApi } from '@/lib/api'
import type { User } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

export type ViewMode = 'list' | 'add' | 'edit' | 'view'

export interface UserFormData {
  name: string
  email: string
  password?: string
  passwordConfirm?: string
  role: 'customer' | 'merchant' | 'admin'
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other'
    address?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
  }
  permissions?: string[]
  tags?: string[]
}

export interface UserActivityRequest {
  lastLogin?: string
  loginCount?: number
  failedLoginAttempts?: number
}

export interface AdminNoteRequest {
  note: string
}

export interface BulkOperationRequest {
  userIds: string[]
  operation: 'activate' | 'deactivate' | 'lock' | 'unlock' | 'delete'
  data?: any
}

// Simple toast replacement - you can implement proper toast later
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message)
}

export const useUserManagement = () => {
  const { user: currentUser } = useAuth() // Get current authenticated user
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 10,
  })
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'customer',
    profile: {
      firstName: '',
      lastName: '',
      phone: '',
      dateOfBirth: '',
      gender: 'male',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Thailand'
      }
    },
    permissions: [],
    tags: []
  })

  // Fetch users data
  const fetchUsers = async () => {
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

      if (filterRole !== 'all') {
        params.role = filterRole
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      const response = await userApi.getUsers(params) as any
      console.log('User API Response:', response) // Debug logging
      
      // The API returns the raw response structure directly
      if (response.success && response.data) {
        setUsers(response.data)
        setPagination({
          total: response.pagination?.total || response.results || 0,
          page: response.pagination?.page || currentPage,
          pages: response.pagination?.pages || 1,
          limit: response.pagination?.limit || pagination.limit,
        })
      } else {
        setError('Failed to fetch users')
      }
    } catch (error: any) {
      console.error('Failed to fetch users:', error)
      setError('Failed to connect to server. Please check if the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount and when filters change
  useEffect(() => {
    fetchUsers()
  }, [currentPage, filterStatus, filterRole, searchTerm])

  // Filter and search logic (for client-side filtering if needed)
  const filteredUsers = useMemo(() => {
    if (currentView !== 'list') return users
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus
      const matchesRole = filterRole === 'all' || user.role === filterRole
      
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [users, searchTerm, filterStatus, filterRole, currentView])

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      role: 'customer',
      profile: {
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        gender: 'male',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Thailand'
        }
      },
      permissions: [],
      tags: []
    })
  }

  // Handle add user
  const handleAdd = () => {
    console.log('🔧 handleAdd called - changing view to add')
    setCurrentView('add')
    resetForm()
    setSelectedUser(null)
  }

  // Handle edit user
  const handleEdit = (user: User) => {
    setCurrentView('edit')
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      profile: {
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        phone: user.profile?.phone || '',
        dateOfBirth: user.profile?.dateOfBirth || '',
        gender: user.profile?.gender || 'male',
        address: {
          street: user.profile?.address?.street || '',
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          zipCode: user.profile?.address?.zipCode || '',
          country: user.profile?.address?.country || 'Thailand'
        }
      },
      permissions: user.permissions || [],
      tags: user.tags || []
    })
  }

  // Handle view user
  const handleView = (user: User) => {
    setCurrentView('view')
    setSelectedUser(user)
  }

  // Handle save (add/edit)
  const handleSave = async () => {
    console.log('🔍 handleSave called with formData:', formData)
    
    if (!formData.name.trim() || !formData.email.trim()) {
      console.log('❌ Please fill in required fields')
      toast.error("Please fill in all required fields")
      return
    }

    if (currentView === 'add' && (!formData.password || !formData.passwordConfirm)) {
      toast.error("Password is required for new users")
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      
      const userData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        profile: formData.profile,
        permissions: formData.permissions,
        tags: formData.tags
      }

      // Add password only for new users
      if (currentView === 'add' && formData.password) {
        userData.password = formData.password
        userData.passwordConfirm = formData.passwordConfirm
      }

      console.log('🔧 User data to submit:', userData)

      if (currentView === 'edit' && selectedUser) {
        console.log('🔄 Updating user with ID:', selectedUser._id)
        const response = await userApi.updateUser(selectedUser._id, userData)
        console.log('📥 Update user response:', response)
        if (response.success === true || response.status === 'success') {
          toast.success('User updated successfully')
          console.log('✅ User updated successfully')
        } else {
          console.log('❌ Failed to update user:', response)
          toast.error(response.message || 'Failed to update user')
          return
        }
      } else {
        console.log('🔄 Creating new user')
        const response = await userApi.createUser(userData)
        console.log('📥 Create user response:', response)
        if (response.success === true || response.status === 'success') {
          toast.success('User created successfully')
          console.log('✅ User created successfully')
        } else {
          console.log('❌ Failed to create user:', response)
          toast.error(response.message || 'Failed to create user')
          return
        }
      }

      setCurrentView('list')
      resetForm()
      setSelectedUser(null)
      fetchUsers() // Refresh the list
      
    } catch (error: any) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle delete user
  const handleDelete = async (id: string) => {
    try {
      const response = await userApi.deleteUser(id)
      if (response.status === 'success' || response.success) {
        toast.success('User deleted successfully')
        fetchUsers() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to delete user')
      }
    } catch (error: any) {
      console.error('Failed to delete user:', error)
      toast.error('Failed to delete user. Please try again.')
    }
  }

  // Handle status change
  const handleStatusChange = async (userId: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => {
    try {
      const response = await userApi.updateUserStatus(userId, { status })
      if (response.status === 'success' || response.success) {
        toast.success(`User status updated to ${status}`)
        fetchUsers() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to update user status')
      }
    } catch (error: any) {
      console.error('Failed to update user status:', error)
      toast.error('Failed to update user status. Please try again.')
    }
  }

  // Handle role change
  const handleRoleChange = async (userId: string, role: 'customer' | 'merchant' | 'admin', reason?: string) => {
    try {
      const response = await userApi.assignRole(userId, { role, reason })
      if (response.status === 'success' || response.success) {
        toast.success(`User role updated to ${role}`)
        fetchUsers() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to update user role')
      }
    } catch (error: any) {
      console.error('Failed to update user role:', error)
      toast.error('Failed to update user role. Please try again.')
    }
  }

  // Handle account lock/unlock
  const handleAccountLock = async (userId: string, action: 'lock' | 'unlock') => {
    try {
      const response = await userApi.toggleAccountLock(userId, { action })
      if (response.status === 'success' || response.success) {
        toast.success(`User account ${action}ed successfully`)
        fetchUsers() // Refresh the list
      } else {
        toast.error(response.message || `Failed to ${action} user account`)
      }
    } catch (error: any) {
      console.error(`Failed to ${action} user account:`, error)
      toast.error(`Failed to ${action} user account. Please try again.`)
    }
  }

  // Handle add admin note
  const handleAddNote = async (userId: string, note: string) => {
    try {
      const response = await userApi.addAdminNote(userId, { note })
      if (response.status === 'success' || response.success) {
        toast.success('Admin note added successfully')
        fetchUsers() // Refresh the list
      } else {
        toast.error(response.message || 'Failed to add admin note')
      }
    } catch (error: any) {
      console.error('Failed to add admin note:', error)
      toast.error('Failed to add admin note. Please try again.')
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

  // Handle role filter change
  const handleRoleFilter = (role: string) => {
    setFilterRole(role)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterRole('all')
    setCurrentPage(1)
  }

  // Handle cancel form
  const handleCancel = () => {
    setCurrentView('list')
    resetForm()
    setSelectedUser(null)
  }

  return {
    // State
    users,
    loading,
    error,
    setError,
    currentView,
    selectedUser,
    searchTerm,
    filterStatus,
    filterRole,
    formData,
    filteredUsers,
    currentPage,
    pagination,
    
    // Setters
    setSearchTerm: handleSearch,
    setFilterStatus: handleStatusFilter,
    setFilterRole: handleRoleFilter,
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
    handleStatusChange,
    handleRoleChange,
    handleAccountLock,
    handleAddNote,
    fetchUsers
  }
}
