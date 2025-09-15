import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, Search } from 'lucide-react'
import { toast } from 'sonner'

interface LocationData {
  latitude: number
  longitude: number
  address?: string
}

interface StoreLocationManagerProps {
  currentLocation?: {
    latitude?: number
    longitude?: number
  }
  onLocationUpdate: (location: LocationData) => void
}

export function StoreLocationManager({ currentLocation, onLocationUpdate }: StoreLocationManagerProps) {
  const [latitude, setLatitude] = useState(currentLocation?.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(currentLocation?.longitude?.toString() || '')
  const [searchAddress, setSearchAddress] = useState('')
  const [loading, setLoading] = useState(false)

  // Update local state when currentLocation prop changes
  useEffect(() => {
    setLatitude(currentLocation?.latitude?.toString() || '')
    setLongitude(currentLocation?.longitude?.toString() || '')
  }, [currentLocation?.latitude, currentLocation?.longitude])

  // Get current location from browser
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('เบราว์เซอร์ไม่รองรับการหาตำแหน่ง')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setLatitude(lat.toString())
        setLongitude(lng.toString())
        
        onLocationUpdate({
          latitude: lat,
          longitude: lng
        })
        
        toast.success('ได้รับตำแหน่งปัจจุบันแล้ว')
        setLoading(false)
      },
      (error) => {
        toast.error('ไม่สามารถหาตำแหน่งปัจจุบันได้: ' + error.message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }, [onLocationUpdate])

  // Search address using Nominatim (OpenStreetMap)
  const searchLocation = useCallback(async () => {
    if (!searchAddress.trim()) {
      toast.error('กรุณาใส่ที่อยู่ที่ต้องการค้นหา')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress + ', Thailand')}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const location = data[0]
        const lat = parseFloat(location.lat)
        const lng = parseFloat(location.lon)
        
        setLatitude(lat.toString())
        setLongitude(lng.toString())
        
        onLocationUpdate({
          latitude: lat,
          longitude: lng,
          address: location.display_name
        })
        
        toast.success('พบตำแหน่งจากการค้นหาแล้ว')
      } else {
        toast.error('ไม่พบตำแหน่งจากการค้นหา')
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการค้นหาตำแหน่ง')
    } finally {
      setLoading(false)
    }
  }, [searchAddress, onLocationUpdate])

  // Manual coordinate input
  const handleManualInput = useCallback(() => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('กรุณาใส่ค่าพิกัดที่ถูกต้อง')
      return
    }
    
    if (lat < -90 || lat > 90) {
      toast.error('ละติจูดต้องอยู่ระหว่าง -90 ถึง 90')
      return
    }
    
    if (lng < -180 || lng > 180) {
      toast.error('ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180')
      return
    }

    onLocationUpdate({
      latitude: lat,
      longitude: lng
    })
    
    toast.success('อัปเดตตำแหน่งแล้ว')
  }, [latitude, longitude, onLocationUpdate])

  // Open location in Google Maps
  const openInGoogleMaps = useCallback(() => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('กรุณาระบุพิกัดก่อน')
      return
    }
    
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, '_blank')
  }, [latitude, longitude])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          จัดการตำแหน่งร้านค้า
        </CardTitle>
        <CardDescription>
          ระบุตำแหน่งร้านค้าเพื่อให้ลูกค้าสามารถค้นหาและนำทางมาได้
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Current Location Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">ตำแหน่งปัจจุบัน</h4>
            <Button 
              variant="outline" 
              size="sm"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              <Navigation className="h-4 w-4 mr-2" />
              หาตำแหน่งปัจจุบัน
            </Button>
          </div>
        </div>

        {/* Address Search Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">ค้นหาจากที่อยู่</h4>
          <div className="flex gap-2">
            <Input
              placeholder="ใส่ที่อยู่ เช่น 'ถนนสีลม กรุงเทพ'"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
            />
            <Button 
              variant="outline"
              onClick={searchLocation}
              disabled={loading}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Manual Coordinates Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">ระบุพิกัดตำแหน่ง</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">ละติจูด (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="เช่น 13.7563"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">ลองจิจูด (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="เช่น 100.5018"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="secondary"
              onClick={handleManualInput}
              disabled={!latitude || !longitude}
            >
              อัปเดตตำแหน่ง
            </Button>
            <Button 
              variant="outline"
              onClick={openInGoogleMaps}
              disabled={!latitude || !longitude}
            >
              ดูใน Google Maps
            </Button>
          </div>
        </div>

        {/* Current Coordinates Display */}
        {latitude && longitude && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">พิกัดปัจจุบัน</h4>
            <div className="text-sm text-muted-foreground">
              <p>ละติจูด: {latitude}</p>
              <p>ลองจิจูด: {longitude}</p>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 เคล็ดลับ:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>ใช้ "หาตำแหน่งปัจจุบัน" หากคุณอยู่ที่ร้านค้า</li>
            <li>ค้นหาจากที่อยู่เพื่อความแม่นยำ</li>
            <li>ตรวจสอบตำแหน่งใน Google Maps ก่อนบันทึก</li>
            <li>ตำแหน่งที่ถูกต้องจะช่วยให้ลูกค้าหาร้านได้ง่าย</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}