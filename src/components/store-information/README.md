# Store Location Manager Component

## Overview
Component สำหรับจัดการตำแหน่งร้านค้าด้วย Google Maps พร้อมความสามารถในการเลือกพิกัดแบบ Interactive

## Features

### 🗺️ Google Maps Integration
- แผนที่ Google Maps แบบ Interactive
- Google Places Autocomplete สำหรับค้นหาสถานที่
- คลิกเพื่อวางเครื่องหมายตำแหน่ง
- ลากเครื่องหมายเพื่อปรับตำแหน่ง
- อัปเดตพิกัดแบบ Real-time

### 📍 Location Features
- หาตำแหน่งปัจจุบันจาก GPS
- ป้อนพิกัดด้วยตนเอง
- แสดงพิกัดปัจจุบัน
- เปิดใน Google Maps ภายนอก

### 🔧 Configuration Required

#### Environment Variables
```bash
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

#### Google Maps APIs ที่ต้องเปิดใช้งาน
1. **Maps JavaScript API** - สำหรับแสดงแผนที่
2. **Places API** - สำหรับ Autocomplete search
3. **Geocoding API** - สำหรับแปลงที่อยู่เป็นพิกัด

## Usage

```tsx
import { StoreLocationManager } from '@/components/store-information/store-location-manager'

function MyComponent() {
  const [storeLocation, setStoreLocation] = useState({
    latitude: 13.7563,
    longitude: 100.5018
  })

  const handleLocationUpdate = (location) => {
    setStoreLocation(location)
    console.log('New location:', location)
  }

  return (
    <StoreLocationManager
      currentLocation={storeLocation}
      onLocationUpdate={handleLocationUpdate}
    />
  )
}
```

## Props

### StoreLocationManagerProps
- `currentLocation?`: Object containing current latitude/longitude
- `onLocationUpdate`: Callback function when location changes

### LocationData (Callback Parameter)
- `latitude`: number - ละติจูด
- `longitude`: number - ลองจิจูด  
- `address?`: string - ที่อยู่ (ถ้ามี)

## API Key Security

⚠️ **สำคัญ**: Google Maps API Key ควรมีการจำกัดดังนี้:

### HTTP Referrers Restrictions
```
localhost:*
your-domain.com/*
```

### API Restrictions
- Maps JavaScript API
- Places API
- Geocoding API

## Dependencies

```json
{
  "@googlemaps/js-api-loader": "^1.16.2",
  "@types/google.maps": "^3.54.0"
}
```

## Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Notes
- Component จะโหลด Google Maps เมื่อผู้ใช้คลิก "แสดงแผนที่" เพื่อประหยัด API quota
- รองรับการใช้งานใน Thailand โดยเฉพาะ (Places Autocomplete)
- ใช้ระบบ GPS ของเบราว์เซอร์สำหรับตำแหน่งปัจจุบัน