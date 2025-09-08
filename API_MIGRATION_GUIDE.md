# CMS API Server Migration - Troubleshooting Guide

## 🔍 **Issue Analysis:**
You encountered a 404 error when trying to access product ID `68be464c19b83c5880f9fb11`. This is **expected behavior** when switching API servers.

## 📊 **Server Status:**
- ✅ **API Server**: `http://54.251.126.43:3000` is online and working
- ✅ **Available Products**: 8 products found on the new server  
- ✅ **Sample Product ID**: `68be47d019b83c5880f9fc73` (GAVISCON)

## 🛠️ **Resolution Steps:**

### 1. Clear Browser Data
Open browser console and run:
```javascript
clearServerData()  // Clears localStorage and sessionStorage
```

### 2. Verify API Connection
```javascript
showApiInfo()  // Shows current API configuration and tests connectivity
```

### 3. Refresh Application
- Hard refresh the page (Ctrl+F5 / Cmd+Shift+R)
- Clear browser cache
- Re-login to the CMS

## 📝 **What Changed:**
- **Old Server**: localhost:3000 (had different product IDs)
- **New Server**: 54.251.126.43:3000 (has different products)
- **Expected**: URLs/bookmarks with old product IDs will show 404

## 🎯 **Working Product IDs on New Server:**
- `68be47d019b83c5880f9fc73` - GAVISCON Suspension Mint Flavor
- `68be469219b83c5880f9fb20` - GAVISCON Suspension Mint  
- `68be467919b83c5880f9fb18` - กาวิสคอน ดับเบิ้ล แอคชั่น
- `68b7e0e1492bb40106fd7cf5` - Test Product - Playwright Testing
- `68b7db6a492bb40106fd7c28` - Ichitan Green Tea Honey Lemon

## ✅ **Verification:**
```bash
# Test product endpoint
curl "http://54.251.126.43:3000/api/v1/products/68be469219b83c5880f9fb20"

# List all products  
curl "http://54.251.126.43:3000/api/v1/products?limit=10"
```

## 🚀 **Next Steps:**
1. Use the CMS product list to browse available products
2. Any bookmarked URLs with old product IDs need to be updated
3. The CMS will now show products from the new server

---
**Status**: ✅ Migration successful - ready to use new server!
