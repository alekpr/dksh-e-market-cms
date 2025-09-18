'use client'

import { useState } from 'react'
import { StoreLocationManager } from '@/components/store-information/store-location-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LocationData {
  latitude: number
  longitude: number
  address?: string
}

export default function TestLocationPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | undefined>()

  const handleLocationUpdate = (location: LocationData) => {
    setCurrentLocation(location)
    console.log('Location updated:', location)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">ทดสอบ Store Location Manager</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <StoreLocationManager
            currentLocation={currentLocation}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลตำแหน่งปัจจุบัน</CardTitle>
            </CardHeader>
            <CardContent>
              {currentLocation ? (
                <div className="space-y-2">
                  <p><strong>Latitude:</strong> {currentLocation.latitude}</p>
                  <p><strong>Longitude:</strong> {currentLocation.longitude}</p>
                  {currentLocation.address && (
                    <p><strong>Address:</strong> {currentLocation.address}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">ยังไม่ได้เลือกตำแหน่ง</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}