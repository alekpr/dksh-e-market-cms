#!/bin/bash

# Quick Promotion Filtering Test
# This script tests the API endpoints quickly

echo "🎯 Quick Promotion Filtering Test"
echo "=================================="

# Configuration - Update these values
API_URL="http://54.251.126.43:3000"
MERCHANT_TOKEN="YOUR_MERCHANT_TOKEN_HERE"
STORE_ID="YOUR_STORE_ID_HERE"

if [ "$MERCHANT_TOKEN" = "YOUR_MERCHANT_TOKEN_HERE" ]; then
    echo "❌ Please update MERCHANT_TOKEN and STORE_ID in this script"
    echo "   1. Get a merchant JWT token from CMS login"
    echo "   2. Get the store ID from merchant profile"
    echo "   3. Update the variables at the top of this script"
    echo "   4. Run: chmod +x quick-test.sh && ./quick-test.sh"
    exit 1
fi

echo "API URL: $API_URL"
echo "Store ID: $STORE_ID"
echo ""

# Test 1: Merchant endpoint
echo "=== Test 1: Merchant Endpoint ==="
echo "Testing: GET /api/v1/promotions/merchant"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  "$API_URL/api/v1/promotions/merchant")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP 200 - Success"
    RESULT_COUNT=$(echo "$BODY" | grep -o '"results":[0-9]*' | grep -o '[0-9]*')
    echo "📊 Found $RESULT_COUNT promotions"
    
    # Check if response contains other store IDs
    OTHER_STORES=$(echo "$BODY" | grep -o "\"storeId\":\"[^\"]*\"" | grep -v "\"storeId\":\"$STORE_ID\"" | wc -l)
    if [ "$OTHER_STORES" -eq 0 ]; then
        echo "✅ All promotions belong to correct store"
    else
        echo "❌ Found $OTHER_STORES promotions from other stores!"
    fi
else
    echo "❌ HTTP $HTTP_CODE - Error"
    echo "Response: $BODY"
fi

echo ""

# Test 2: General endpoint with storeId
echo "=== Test 2: General Endpoint with StoreId ==="
echo "Testing: GET /api/v1/promotions?storeId=$STORE_ID"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  "$API_URL/api/v1/promotions?storeId=$STORE_ID")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ HTTP 200 - Success"
    RESULT_COUNT=$(echo "$BODY" | grep -o '"results":[0-9]*' | grep -o '[0-9]*')
    echo "📊 Found $RESULT_COUNT promotions"
else
    echo "❌ HTTP $HTTP_CODE - Error"
    echo "Response: $BODY"
fi

echo ""

# Test 3: General endpoint without filter (should be restricted for merchants)
echo "=== Test 3: General Endpoint without Filter ==="
echo "Testing: GET /api/v1/promotions"

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -H "Authorization: Bearer $MERCHANT_TOKEN" \
  -H "Content-Type: application/json" \
  "$API_URL/api/v1/promotions")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    RESULT_COUNT=$(echo "$BODY" | grep -o '"results":[0-9]*' | grep -o '[0-9]*')
    echo "📊 HTTP 200 - Found $RESULT_COUNT total promotions (all stores)"
    echo "⚠️  This might show all promotions - check if this is intended for merchants"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "✅ HTTP 403 - Forbidden (good - merchants shouldn't access all promotions)"
else
    echo "❌ HTTP $HTTP_CODE - Unexpected response"
    echo "Response: $BODY"
fi

echo ""
echo "🎉 Quick test completed!"
echo ""
echo "📋 Next steps:"
echo "1. If tests pass ✅, the filtering is working correctly"
echo "2. If tests fail ❌, check the API server logs"
echo "3. Test with CMS interface to confirm frontend works"
echo "4. Deploy to production when satisfied"