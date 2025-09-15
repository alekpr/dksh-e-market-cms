'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { storeApi, type UpdateStoreRequest } from '@/lib/api'
import { useStoreManagement } from '@/hooks/use-store-management'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MapPin, Store, Phone, Mail, Building, IdCard, CreditCard } from 'lucide-react'
import { StoreLocationManager } from './store-location-manager'

interface FormData {
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
    latitude?: number
    longitude?: number
    location?: {
      type: 'Point'
      coordinates: [number, number] // [longitude, latitude]
    }
  }
  businessInfo: {
    businessType: 'individual' | 'corporation' | 'partnership'
    taxId: string
    registrationNumber: string
  }
  payoutInfo: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

export function MerchantStoreForm() {
  const { user } = useAuth()
  const { store, loading: storeLoading, refreshStore } = useStoreManagement()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Thailand',
      latitude: undefined,
      longitude: undefined
    },
    businessInfo: {
      businessType: 'individual',
      taxId: '',
      registrationNumber: ''
    },
    payoutInfo: {
      bankName: '',
      accountNumber: '',
      accountName: ''
    }
  })

  // Load store data when component mounts or store changes
  useEffect(() => {
    if (store) {
      setFormData({
        name: store.name || '',
        description: store.description || '',
        contactEmail: store.contactEmail || '',
        contactPhone: store.contactPhone || '',
        address: {
          street: store.address?.street || '',
          city: store.address?.city || '',
          state: store.address?.state || '',
          zipCode: store.address?.zipCode || '',
          country: store.address?.country || 'Thailand',
          latitude: store.address?.latitude,
          longitude: store.address?.longitude,
          location: store.address?.location || (
            store.address?.latitude && store.address?.longitude ? {
              type: 'Point',
              coordinates: [store.address.longitude, store.address.latitude]
            } : undefined
          )
        },
        businessInfo: {
          businessType: store.businessInfo?.businessType || 'individual',
          taxId: store.businessInfo?.taxId || '',
          registrationNumber: store.businessInfo?.registrationNumber || ''
        },
        payoutInfo: {
          bankName: store.payoutInfo?.bankName || '',
          accountNumber: store.payoutInfo?.accountNumber || '',
          accountName: store.payoutInfo?.accountName || ''
        }
      })
    }
  }, [store])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!store) {
      toast.error('ไม่พบข้อมูลร้านค้า')
      return
    }

    setLoading(true)
    try {
      const updateData: UpdateStoreRequest = {
        name: formData.name,
        description: formData.description,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
        businessInfo: formData.businessInfo,
        payoutInfo: formData.payoutInfo
      }

      const response = await storeApi.updateMerchantStore(updateData)
      
      if (response.success === true || response.status === 'success') {
        toast.success('อัปเดตข้อมูลร้านค้าสำเร็จ')
        await refreshStore() // Refresh store data
      } else {
        toast.error(response.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
      }
    } catch (error: any) {
      console.error('Error updating store:', error)
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    const keys = field.split('.')
    if (keys.length === 1) {
      setFormData(prev => ({ ...prev, [field]: value }))
    } else if (keys.length === 2) {
      setFormData(prev => {
        const newData = {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0] as keyof FormData] as any,
            [keys[1]]: value
          }
        }

        // Update location coordinates when lat/lng changes
        if (keys[0] === 'address' && (keys[1] === 'latitude' || keys[1] === 'longitude')) {
          const lat = keys[1] === 'latitude' ? parseFloat(value) : newData.address.latitude
          const lng = keys[1] === 'longitude' ? parseFloat(value) : newData.address.longitude
          
          if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
            newData.address.location = {
              type: 'Point',
              coordinates: [lng, lat] // [longitude, latitude] for GeoJSON
            }
          }
        }

        return newData
      })
    }
  }

  const handleLocationUpdate = (locationData: { latitude: number; longitude: number; address?: string }) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location: {
          type: 'Point',
          coordinates: [locationData.longitude, locationData.latitude] // [longitude, latitude] for GeoJSON
        },
        ...(locationData.address && { street: locationData.address })
      }
    }))
  }

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>กำลังโหลดข้อมูลร้านค้า...</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">ไม่พบข้อมูลร้านค้า</h3>
          <p className="text-muted-foreground">กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่าร้านค้า</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Store Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                ข้อมูลร้านค้า
              </CardTitle>
              <CardDescription>
                จัดการข้อมูลร้านค้าและตำแหน่งที่ตั้ง
              </CardDescription>
            </div>
            <Badge variant={store.status === 'active' ? 'default' : 'secondary'}>
              {store.status === 'active' ? 'เปิดใช้งาน' : store.status}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              ข้อมูลพื้นฐาน
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อร้านค้า *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="ใส่ชื่อร้านค้า"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">ประเภทธุรกิจ</Label>
                <Select 
                  value={formData.businessInfo.businessType} 
                  onValueChange={(value) => handleInputChange('businessInfo.businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">ขายปลีก</SelectItem>
                    <SelectItem value="restaurant">ร้านอาหาร</SelectItem>
                    <SelectItem value="electronics">อิเล็กทรอนิกส์</SelectItem>
                    <SelectItem value="fashion">แฟชั่น</SelectItem>
                    <SelectItem value="health">สุขภาพและความงาม</SelectItem>
                    <SelectItem value="services">บริการ</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 xl:col-span-1">
                <Label htmlFor="contactPhone">เบอร์โทรติดต่อ *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">คำอธิบายร้านค้า</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="บรรยายร้านค้าของคุณ..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              ข้อมูลติดต่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">อีเมลติดต่อ *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              ที่อยู่ร้านค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">ที่อยู่</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="เลขที่ ซอย ถนน"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">เขต/อำเภอ</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="เขต/อำเภอ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">จังหวัด</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="จังหวัด"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">รหัสไปรษณีย์</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="รหัสไปรษณีย์"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">ประเทศ</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="ประเทศ"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Location Manager */}
        <StoreLocationManager
          currentLocation={{
            latitude: formData.address.latitude,
            longitude: formData.address.longitude
          }}
          onLocationUpdate={handleLocationUpdate}
        />

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="h-5 w-5" />
              ข้อมูลธุรกิจ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">ประเภทธุรกิจ</Label>
                <Select 
                  value={formData.businessInfo.businessType} 
                  onValueChange={(value) => handleInputChange('businessInfo.businessType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">บุคคลธรรมดา</SelectItem>
                    <SelectItem value="corporation">บริษัทจำกัด</SelectItem>
                    <SelectItem value="partnership">ห้างหุ้นส่วน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                <Input
                  id="taxId"
                  value={formData.businessInfo.taxId}
                  onChange={(e) => handleInputChange('businessInfo.taxId', e.target.value)}
                  placeholder="เลขประจำตัวผู้เสียภาษี"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">เลขทะเบียนการค้า</Label>
                <Input
                  id="registrationNumber"
                  value={formData.businessInfo.registrationNumber}
                  onChange={(e) => handleInputChange('businessInfo.registrationNumber', e.target.value)}
                  placeholder="เลขทะเบียนการค้า"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payout Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              ข้อมูลบัญชีเงินได้
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">ธนาคาร</Label>
                <Select 
                  value={formData.payoutInfo.bankName} 
                  onValueChange={(value) => handleInputChange('payoutInfo.bankName', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกธนาคาร" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="กสิกรไทย">ธนาคารกสิกรไทย</SelectItem>
                    <SelectItem value="กรุงเทพ">ธนาคารกรุงเทพ</SelectItem>
                    <SelectItem value="กรุงไทย">ธนาคารกรุงไทย</SelectItem>
                    <SelectItem value="ไทยพาณิชย์">ธนาคารไทยพาณิชย์</SelectItem>
                    <SelectItem value="กรุงศรีอยุธยา">ธนาคารกรุงศรีอยุธยา</SelectItem>
                    <SelectItem value="ทหารไทยธนชาต">ธนาคารทหารไทยธนชาต</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">เลขที่บัญชี</Label>
                <Input
                  id="accountNumber"
                  value={formData.payoutInfo.accountNumber}
                  onChange={(e) => handleInputChange('payoutInfo.accountNumber', e.target.value)}
                  placeholder="เลขที่บัญชี"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">ชื่อบัญชี</Label>
                <Input
                  id="accountName"
                  value={formData.payoutInfo.accountName}
                  onChange={(e) => handleInputChange('payoutInfo.accountName', e.target.value)}
                  placeholder="ชื่อบัญชี"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={loading || storeLoading}>
            {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </Button>
        </div>
      </form>
    </div>
  )
}