# Testing Shipping Configuration in CMS

## Setup Instructions

1. **Start the API Server**
```bash
cd /Users/alekpr/node-projects/dksh-emarket-api
npm start
```

2. **Start the CMS Development Server**
```bash
cd /Users/alekpr/react-projects/dksh-emarket-cms
npm run dev
```

3. **Login as Admin**
- Email: `admin@dksh.com`
- Password: `admin123`

## Testing Steps

### 1. Navigate to Shipping Configuration
- Login to CMS as admin
- Check that "Shipping Configuration" appears in the sidebar navigation
- Click on "Shipping Configuration" menu item
- Verify navigation to `/admin/shipping`

### 2. Test Configuration Loading
- Verify that current shipping configuration loads successfully
- Check that all configuration values are displayed correctly:
  - Base Rate
  - Minimum Cost
  - Free Shipping Threshold
  - Volumetric Divisor
  - Weight Rates (Standard/Express/Same Day)
  - Distance Rates (Standard/Express/Same Day)
  - Max Delivery Distance
  - Oversized Thresholds and Surcharge

### 3. Test Configuration Updates
- Modify any configuration value
- Verify "Unsaved Changes" badge appears
- Check that Save/Reset buttons become enabled
- Click Save and verify success message
- Verify audit log shows admin email and timestamp

### 4. Test Input Validation
- Try entering negative values → should show validation errors
- Try entering invalid data types → should be prevented
- Verify all fields have proper validation

### 5. Test Tab Navigation
- Test all tabs: Basic Settings, Shipping Rates, Distance Limits, Oversized Items
- Verify all sections save and load correctly
- Check responsive design on different screen sizes

## Expected API Calls

### GET Configuration
```http
GET /api/v1/shipping/config
Authorization: Bearer <admin_token>
```

### PUT Update Configuration
```http
PUT /api/v1/shipping/config
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "config": {
    "baseRate": 50,
    "minimumCost": 25,
    // ... other config values
  }
}
```

## Success Criteria

✅ Admin can access Shipping Configuration page  
✅ Current configuration loads successfully  
✅ All tabs and sections display correctly  
✅ Configuration updates save successfully  
✅ Input validation works properly  
✅ Audit logging shows admin details  
✅ Success/error messages display appropriately  
✅ Responsive design works on mobile/tablet  

## Troubleshooting

### Common Issues

1. **"Access Denied" Error**
   - Verify user has admin role
   - Check JWT token is valid
   - Ensure adminAuth middleware is working

2. **Configuration Not Loading**
   - Check API server is running
   - Verify API endpoint `/api/v1/shipping/config` is accessible
   - Check browser console for API errors

3. **Save Operation Fails**
   - Verify admin authentication
   - Check PUT endpoint permissions
   - Review API logs for validation errors

4. **Navigation Item Missing**
   - Verify user role is 'admin'
   - Check navigation permissions in roles.ts
   - Ensure icon mapping is correct

### Debug Commands

```bash
# Check API server logs
cd /Users/alekpr/node-projects/dksh-emarket-api
npm run dev

# Check CMS console for errors
# Open browser DevTools > Console tab

# Test API directly
curl -X GET http://localhost:3000/api/v1/shipping/config
```

## Additional Features to Test

1. **Responsive Design**: Test on mobile, tablet, desktop
2. **Browser Compatibility**: Test on Chrome, Firefox, Safari
3. **Performance**: Check loading times and responsiveness
4. **Accessibility**: Test keyboard navigation and screen readers
5. **Data Persistence**: Refresh page and verify changes are saved