#!/bin/bash

echo "=== Cart Operation Tests ==="

# Login to get token
echo "1. Getting auth token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"frontend@test.com","password":"password123"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Token obtained: ${TOKEN:0:50}..."

# Get cart first
echo ""
echo "2. Getting cart..."
CART=$(curl -s http://localhost:8080/api/v1/cart \
  -H "Authorization: Bearer $TOKEN")
echo "Current cart: $CART"

# Add to cart
echo ""
echo "3. Adding product 1 to cart..."
ADD_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"product_id":1,"quantity":1}')
echo "Add to cart response: $ADD_RESPONSE"

# Get product details to verify
echo ""
echo "4. Verifying product exists..."
PRODUCT=$(curl -s http://localhost:8080/api/v1/products/1)
echo "Product 1: $PRODUCT"

echo ""
echo "=== Test Complete ==="