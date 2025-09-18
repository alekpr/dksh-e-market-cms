'use client'

import { useState, useEffect } from 'react'
import { StoreLocationManager } from '@/components/store-information/store-location-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LocationData {
  latitude: number
  longitude: number
  address?: string
}

export default function DebugLocationPage() {
  const [currentLocation, setCurrentLocation] = useState<LocationData | undefined>()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    // Collect debug information
    const info = {
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
      apiKeyLength: import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.length || 0,
      environment: import.meta.env.MODE,
      navigatorGeolocation: typeof navigator !== 'undefined' && navigator.geolocation,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      usingReactGoogleMaps: true
    }
    setDebugInfo(info)
  }, [])

  const handleLocationUpdate = (location: LocationData) => {
    setCurrentLocation(location)
    console.log('Location updated:', location)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Debug: React Google Maps Integration</h1>
      
      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Key Status:</strong> {debugInfo.apiKey}
            </div>
            <div>
              <strong>API Key Length:</strong> {debugInfo.apiKeyLength}
            </div>
            <div>
              <strong>Environment:</strong> {debugInfo.environment}
            </div>
            <div>
              <strong>Using React Google Maps:</strong> {debugInfo.usingReactGoogleMaps ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Geolocation Support:</strong> {debugInfo.navigatorGeolocation ? 'Yes' : 'No'}
            </div>
            <div className="col-span-2">
              <strong>User Agent:</strong> <span className="text-xs">{debugInfo.userAgent}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded">
            <p className="text-sm text-green-800">
              ✅ <strong>อัปเกรดเรียบร้อย!</strong> ตอนนี้ใช้ @react-google-maps/api แทน manual integration
            </p>
            <ul className="text-xs text-green-700 mt-1 list-disc list-inside">
              <li>Component-based approach ที่เสถียรกว่า</li>
              <li>React hooks integration ที่ดีกว่า</li>
              <li>TypeScript support ที่สมบูรณ์</li>
              <li>Autocomplete ที่ทำงานได้เสถียร</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      
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
                  <div className="mt-4 p-3 bg-green-50 rounded">
                    <p className="text-sm text-green-800">
                      ✓ ระบบ React Google Maps ทำงานได้ปกติ!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-500">ยังไม่ได้เลือกตำแหน่ง</p>
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm text-blue-800">
                      💡 การใช้งาน React Google Maps:
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 list-disc list-inside">
                      <li>คลิก "แสดงแผนที่" ด้านซ้าย</li>
                      <li>ใช้ช่องค้นหาเพื่อหาสถานที่</li>
                      <li>คลิกหรือลากเครื่องหมายบนแผนที่</li>
                      <li>ลองใช้ "หาตำแหน่งปัจจุบัน"</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* React Google Maps Benefits */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>ข้อดีของ React Google Maps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                <p><strong>🚀 ประสิทธิภาพดีขึ้น:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs ml-4">
                  <li>Component lifecycle ที่เหมาะสมกับ React</li>
                  <li>Memory management ที่ดีกว่า</li>
                  <li>Re-rendering ที่เป็น optimize</li>
                </ul>
                
                <p className="mt-3"><strong>🛠️ Developer Experience:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs ml-4">
                  <li>TypeScript support ที่สมบูรณ์</li>
                  <li>React hooks integration</li>
                  <li>Declarative API ที่ง่ายต่อการใช้</li>
                </ul>

                <div className="mt-3 p-2 bg-green-50 rounded">
                  <p className="text-xs text-green-800">
                    <strong>API Key ปัจจุบัน:</strong> {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
                      `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY.substring(0, 10)}...` : 
                      'ไม่พบ API Key'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}