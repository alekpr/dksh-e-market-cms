import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Navigation, Search, Map } from 'lucide-react'
import { toast } from 'sonner'
import { 
  GoogleMap, 
  LoadScript, 
  Marker, 
  Autocomplete 
} from '@react-google-maps/api'

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

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: 13.7563,
  lng: 100.5018
}

const mapOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: false,
}

export function StoreLocationManager({ currentLocation, onLocationUpdate }: StoreLocationManagerProps) {
  const [latitude, setLatitude] = useState(currentLocation?.latitude?.toString() || '')
  const [longitude, setLongitude] = useState(currentLocation?.longitude?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)
  const [isUpdatingFromProps, setIsUpdatingFromProps] = useState(false)
  const [mapCenter, setMapCenter] = useState(() => ({
    lat: currentLocation?.latitude || defaultCenter.lat,
    lng: currentLocation?.longitude || defaultCenter.lng
  }))
  const [markerPosition, setMarkerPosition] = useState(() => ({
    lat: currentLocation?.latitude || defaultCenter.lat,
    lng: currentLocation?.longitude || defaultCenter.lng
  }))
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update local state when currentLocation prop changes
  useEffect(() => {
    setIsUpdatingFromProps(true)
    setLatitude(currentLocation?.latitude?.toString() || '')
    setLongitude(currentLocation?.longitude?.toString() || '')
    if (currentLocation?.latitude && currentLocation?.longitude) {
      const newPos = {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude
      }
      setMapCenter(newPos)
      setMarkerPosition(newPos)
    }
    setIsUpdatingFromProps(false)
  }, [currentLocation?.latitude, currentLocation?.longitude])

  // Update map when coordinates change manually with debounce
  useEffect(() => {
    if (isUpdatingFromProps) return // ป้องกัน update จาก props
    
    if (latitude && longitude) {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        const newPosition = { lat, lng }
        setMapCenter(newPosition)
        setMarkerPosition(newPosition)
        
        // Debounce auto update เพื่อป้องกัน infinite loop
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current)
        }
        
        updateTimeoutRef.current = setTimeout(() => {
          onLocationUpdate({
            latitude: lat,
            longitude: lng
          })
        }, 500) // debounce 500ms
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [latitude, longitude, isUpdatingFromProps, onLocationUpdate])

  // Handle map click
  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      setLatitude(lat.toString())
      setLongitude(lng.toString())
      setMarkerPosition({ lat, lng })
      
      // Auto update location
      onLocationUpdate({
        latitude: lat,
        longitude: lng
      })

      toast.success('อัปเดตตำแหน่งจากแผนที่แล้ว')
    }
  }, [onLocationUpdate])

  // Handle marker drag
  const onMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()
      
      setLatitude(lat.toString())
      setLongitude(lng.toString())
      setMarkerPosition({ lat, lng })
      
      // Auto update location
      onLocationUpdate({
        latitude: lat,
        longitude: lng
      })

      toast.success('ลากเครื่องหมายเพื่อเปลี่ยนตำแหน่งแล้ว')
    }
  }, [onLocationUpdate])

  // Handle autocomplete place selection
  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        
        setLatitude(lat.toString())
        setLongitude(lng.toString())
        setMapCenter({ lat, lng })
        setMarkerPosition({ lat, lng })
        
        // Auto update location
        onLocationUpdate({
          latitude: lat,
          longitude: lng,
          address: place.formatted_address || place.name
        })

        toast.success('พบตำแหน่งจากการค้นหาแล้ว')
      }
    }
  }, [onLocationUpdate])

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
        
        const newPosition = { lat, lng }
        setMapCenter(newPosition)
        setMarkerPosition(newPosition)
        
        // Auto update location
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

    const newPosition = { lat, lng }
    setMapCenter(newPosition)
    setMarkerPosition(newPosition)

    // Auto update location immediately
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

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // ตรวจสอบว่า Google Maps API พร้อมใช้งาน
  const isGoogleMapsReady = () => {
    return typeof window !== 'undefined' && window.google && window.google.maps
  }

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
        
        {/* Google Maps Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">แผนที่ Google Maps</h4>
            <div className="flex items-center gap-2">
              {apiKey ? (
                <span className="text-xs text-green-600">✓ API Key OK</span>
              ) : (
                <span className="text-xs text-red-600">⚠️ No API Key</span>
              )}
            </div>
          </div>
          
          {apiKey && (
            <div className="space-y-4">
              <LoadScript 
                googleMapsApiKey={apiKey}
                libraries={libraries}
                region="TH"
                onLoad={() => {
                  setMapsLoaded(true)
                  setMapError(null)
                  console.log('Google Maps LoadScript completed successfully')
                }}
                onError={(error) => {
                  setMapError('ไม่สามารถโหลด Google Maps ได้')
                  setMapsLoaded(false)
                  console.error('Google Maps LoadScript Error:', error)
                }}
                loadingElement={
                  <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">กำลังโหลด Google Maps...</p>
                    </div>
                  </div>
                }
              >
                {/* Address Search with Google Places */}
                {mapsLoaded && isGoogleMapsReady() && (
                  <div className="space-y-2">
                    <Label htmlFor="address-search">ค้นหาสถานที่</Label>
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        if (isGoogleMapsReady()) {
                          autocomplete.setComponentRestrictions({ country: 'th' })
                          autocompleteRef.current = autocomplete
                        }
                      }}
                      onPlaceChanged={onPlaceChanged}
                    >
                      <Input
                        id="address-search"
                        placeholder="ใส่ชื่อสถานที่หรือที่อยู่..."
                      />
                    </Autocomplete>
                    <p className="text-xs text-muted-foreground">
                      💡 ใช้ Google Places Autocomplete - พิมพ์เพื่อค้นหาสถานที่
                    </p>
                  </div>
                )}
                
                {/* Error Display */}
                {mapError && (
                  <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-center p-4">
                      <div className="text-red-500 mb-2">⚠️</div>
                      <p className="text-sm text-red-600 mb-2">{mapError}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setMapError(null)
                          window.location.reload()
                        }}
                      >
                        โหลดใหม่
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Map Container */}
                {mapsLoaded && !mapError && isGoogleMapsReady() && (
                  <div className="relative border rounded-lg overflow-hidden">
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={mapCenter}
                      zoom={15}
                      options={mapOptions}
                      onClick={onMapClick}
                      onLoad={(map) => {
                        mapRef.current = map
                        console.log('Google Map loaded successfully')
                      }}
                    >
                      <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={onMarkerDragEnd}
                        title="ตำแหน่งร้านค้า"
                      />
                    </GoogleMap>
                    
                    <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded shadow-sm text-xs text-green-600">
                      ✓ แผนที่พร้อมใช้งาน
                    </div>
                  </div>
                )}
                
                {/* Loading State */}
                {!mapsLoaded && !mapError && (
                  <div className="flex items-center justify-center h-96 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-sm text-blue-600 mb-2">กำลังโหลด Google Maps...</p>
                      <p className="text-xs text-blue-500">โปรดรอสักครู่</p>
                    </div>
                  </div>
                )}
                
                {/* Map not ready fallback */}
                {mapsLoaded && !mapError && !isGoogleMapsReady() && (
                  <div className="flex items-center justify-center h-96 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-center p-4">
                      <div className="text-yellow-500 mb-2">⚠️</div>
                      <p className="text-sm text-yellow-600 mb-2">Google Maps ยังไม่พร้อมใช้งาน</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        โหลดใหม่
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                  <p className="font-medium mb-1">วิธีใช้แผนที่:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>คลิกบนแผนที่เพื่อวางเครื่องหมาย</li>
                    <li>ลากเครื่องหมายเพื่อปรับตำแหน่ง</li>
                    <li>ใช้ช่องค้นหาเพื่อหาสถานที่โดยใช้ Google Places</li>
                    <li>ตำแหน่งจะอัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลง</li>
                  </ul>
                </div>
              </LoadScript>
            </div>
          )}

          {!apiKey && (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border border-red-200">
              <div className="text-center p-4">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-sm text-red-600 mb-2">ไม่พบ Google Maps API Key</p>
                <p className="text-xs text-red-500">กรุณาตั้งค่า VITE_GOOGLE_MAPS_API_KEY ในไฟล์ .env</p>
              </div>
            </div>
          )}
        </div>

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
              {loading ? 'กำลังค้นหา...' : 'หาตำแหน่งปัจจุบัน'}
            </Button>
          </div>
        </div>

        {/* Manual Coordinates Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">ระบุพิกัดตำแหน่ง (อัปเดตอัตโนมัติ)</h4>
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
              ตรวจสอบพิกัด
            </Button>
            <Button 
              variant="outline"
              onClick={openInGoogleMaps}
              disabled={!latitude || !longitude}
            >
              ดูใน Google Maps
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-blue-600">
            💡 ตำแหน่งจะอัปเดตอัตโนมัติเมื่อใส่พิกัดที่ถูกต้อง
          </p>
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
            <li>แผนที่จะแสดงอัตโนมัติพร้อม Google Maps integration</li>
            <li>คลิกหรือลาก marker บนแผนที่เพื่อเปลี่ยนตำแหน่ง</li>
            <li>ใส่พิกัดใน input field จะอัปเดตตำแหน่งอัตโนมัติ</li>
            <li>ใช้ "หาตำแหน่งปัจจุบัน" หากคุณอยู่ที่ร้านค้า</li>
            <li>ค้นหาจากชื่อสถานที่ด้วย Google Places Autocomplete</li>
            <li>ตำแหน่งที่ถูกต้องจะช่วยให้ลูกค้าหาร้านได้ง่าย</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}