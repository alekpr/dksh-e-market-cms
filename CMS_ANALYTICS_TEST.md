# 🧪 CMS Analytics Integration Test

## Test Objective
ตรวจสอบว่า CMS Analytics page เรียกใช้ API endpoints ที่ถูกต้องตาม role:

1. **Merchant Role** → ควรเรียกใช้ `/api/v1/analytics/merchant/*` (auto-filtered)
2. **Admin Role** → ควรเรียกใช้ `/api/v1/analytics/*` (platform-wide)

## Test Steps

### 1. Start API Server
```bash
cd /Users/alekpr/node-projects/dksh-emarket-api
npm start
```

### 2. Start CMS Frontend
```bash
cd /Users/alekpr/react-projects/dksh-emarket-cms
npm run dev
```

### 3. Test Merchant Role Analytics

#### 3.1 Login as Merchant
- Navigate to: http://localhost:5173/login
- Login with merchant credentials
- Verify role shows as "merchant" in sidebar

#### 3.2 Access Analytics Page
- Click "Analytics" in merchant sidebar
- Navigate to: http://localhost:5173/analytics

#### 3.3 Check Network Requests (Browser DevTools)
Open Browser Developer Tools → Network tab and verify:

**Expected Merchant API Calls:**
```
✅ GET /api/v1/analytics/merchant/best-sellers?period=30d
✅ GET /api/v1/analytics/merchant/trending?period=30d
✅ GET /api/v1/analytics/merchant/summary?period=30d
✅ GET /api/v1/analytics/merchant/top-rated?period=30d
✅ GET /api/v1/analytics/merchant/users?period=30d
✅ GET /api/v1/analytics/merchant/inventory?period=30d
✅ GET /api/v1/analytics/merchant/financial?period=30d
✅ GET /api/v1/analytics/merchant/performance?period=30d
```

**Request Headers Should Include:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### 3.4 Verify Auto-Filtering
- Check API responses contain only merchant's store data
- Verify "Analytics Mode: Merchant (Store-Filtered)" displays in UI
- Verify "Using API: /api/v1/analytics/merchant" shows in blue info card

### 4. Test Admin Role Analytics (Optional)

#### 4.1 Login as Admin
- Login with admin credentials
- Note: Admin role doesn't have analytics permission by default

#### 4.2 Verify No Analytics Access
- Admin should NOT see "Analytics" in sidebar
- Direct navigation to /analytics should redirect to unauthorized

## Expected Results

### ✅ Success Criteria
1. **Merchant Analytics Access:**
   - ✅ Merchant can access /analytics page
   - ✅ All API calls use `/api/v1/analytics/merchant/*` endpoints
   - ✅ JWT token included in Authorization header
   - ✅ Data is auto-filtered by merchant's store
   - ✅ UI shows "Merchant (Store-Filtered)" mode

2. **Data Security:**
   - ✅ Merchant only sees their store data
   - ✅ No data from other stores visible
   - ✅ API responses properly filtered

3. **Authentication:**
   - ✅ Protected endpoints require valid JWT
   - ✅ Unauthorized requests return 401
   - ✅ Invalid tokens rejected

### ❌ Failure Indicators
- API calls to `/api/v1/analytics/*` instead of `/api/v1/analytics/merchant/*`
- Missing Authorization headers
- Data from multiple stores visible to merchant
- 401/403 errors in network tab
- UI showing wrong API base URL

## Manual Test Checklist

```
□ API server running on port 3000
□ CMS frontend running on port 5173
□ Merchant login successful
□ Analytics page accessible
□ Network tab shows protected merchant endpoints
□ Authorization headers present
□ Data properly filtered by store
□ UI displays correct analytics mode
□ No errors in browser console
□ All 8 analytics endpoints working
```

## Debugging Tips

### If Analytics Page Doesn't Load:
1. Check browser console for errors
2. Verify merchant has `analytics` permission in roles.ts
3. Check authentication state in AuthContext

### If API Calls Fail:
1. Verify merchant user has `merchantInfo.storeId` in database
2. Check JWT token validity
3. Confirm API server is running
4. Test merchant endpoints manually with curl

### If Data Not Filtered:
1. Check `injectMerchantStoreId` middleware
2. Verify merchant's storeId injection
3. Check MongoDB aggregation pipelines

## Success Confirmation

When test passes, you should see:
1. **CMS UI:** Analytics dashboard with merchant-specific data
2. **Network Tab:** All calls to `/api/v1/analytics/merchant/*`
3. **Console:** "Merchant analytics request - filtering by store: [storeId]"
4. **Data:** Only merchant's store products, orders, financial data

---

**🎯 Test Goal:** Confirm CMS properly uses role-based analytics APIs with auto-filtering for data security.
