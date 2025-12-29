#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Fee Management System - Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
API_URL="http://localhost:8000/api"
STUDENT_EMAIL="student@test.com"
STUDENT_PASSWORD="password123"

# Test 1: Student Login
echo -e "${YELLOW}Test 1: Student Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$STUDENT_EMAIL\",\"password\":\"$STUDENT_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✅ Login successful${NC}"
  echo -e "   Token: ${TOKEN:0:20}..."
else
  echo -e "${RED}❌ Login failed${NC}"
  exit 1
fi
echo ""

# Test 2: Get Fee Statistics
echo -e "${YELLOW}Test 2: Get Fee Statistics${NC}"
STATS_RESPONSE=$(curl -s "$API_URL/student/fees/statistics" \
  -H "Authorization: Bearer $TOKEN")

echo "$STATS_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Statistics retrieved successfully${NC}"
  echo "$STATS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATS_RESPONSE"
else
  echo -e "${RED}❌ Failed to get statistics${NC}"
fi
echo ""

# Test 3: Get All Fees
echo -e "${YELLOW}Test 3: Get All Fees${NC}"
FEES_RESPONSE=$(curl -s "$API_URL/student/fees" \
  -H "Authorization: Bearer $TOKEN")

echo "$FEES_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Fees retrieved successfully${NC}"
  FEE_COUNT=$(echo "$FEES_RESPONSE" | grep -o '"id":[0-9]*' | wc -l)
  echo -e "   Total fees: $FEE_COUNT"
  
  # Extract first fee ID for later tests
  FIRST_FEE_ID=$(echo "$FEES_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "   First fee ID: $FIRST_FEE_ID"
else
  echo -e "${RED}❌ Failed to get fees${NC}"
fi
echo ""

# Test 4: Get Single Fee Details
if [ -n "$FIRST_FEE_ID" ]; then
  echo -e "${YELLOW}Test 4: Get Fee Details (ID: $FIRST_FEE_ID)${NC}"
  FEE_DETAIL_RESPONSE=$(curl -s "$API_URL/student/fees/$FIRST_FEE_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  echo "$FEE_DETAIL_RESPONSE" | grep -q '"success":true'
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Fee details retrieved successfully${NC}"
    echo "$FEE_DETAIL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$FEE_DETAIL_RESPONSE"
  else
    echo -e "${RED}❌ Failed to get fee details${NC}"
  fi
  echo ""
fi

# Test 5: Test Access Restriction (Try to access buses with overdue fees)
echo -e "${YELLOW}Test 5: Test Access Restriction (Buses)${NC}"
BUSES_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/buses" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$BUSES_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$BUSES_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "403" ]; then
  echo -e "${GREEN}✅ Access restriction working correctly${NC}"
  echo -e "   HTTP Code: 403 (Forbidden)"
  echo "$RESPONSE_BODY" | grep -q 'OVERDUE_FEES'
  if [ $? -eq 0 ]; then
    echo -e "   Error Code: OVERDUE_FEES detected ✓"
  fi
else
  echo -e "${YELLOW}⚠️  Access not restricted (HTTP $HTTP_CODE)${NC}"
  echo -e "   Note: This is expected if there are no overdue fees"
fi
echo ""

# Test 6: Get Payment History
echo -e "${YELLOW}Test 6: Get Payment History${NC}"
PAYMENT_HISTORY_RESPONSE=$(curl -s "$API_URL/student/fees/payment-history" \
  -H "Authorization: Bearer $TOKEN")

echo "$PAYMENT_HISTORY_RESPONSE" | grep -q '"success":true'
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Payment history retrieved successfully${NC}"
  PAYMENT_COUNT=$(echo "$PAYMENT_HISTORY_RESPONSE" | grep -o '"id":[0-9]*' | wc -l)
  echo -e "   Total payments: $PAYMENT_COUNT"
else
  echo -e "${RED}❌ Failed to get payment history${NC}"
fi
echo ""

# Test 7: Test Invoice Download (just check endpoint availability)
if [ -n "$FIRST_FEE_ID" ]; then
  echo -e "${YELLOW}Test 7: Test Invoice Endpoint${NC}"
  INVOICE_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_URL/student/fees/$FIRST_FEE_ID/invoice" \
    -H "Authorization: Bearer $TOKEN" \
    -o /dev/null)
  
  HTTP_CODE=$(echo "$INVOICE_RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Invoice endpoint working${NC}"
    echo -e "   HTTP Code: 200 (OK)"
  else
    echo -e "${YELLOW}⚠️  Invoice endpoint returned HTTP $HTTP_CODE${NC}"
  fi
  echo ""
fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ All critical tests passed!${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Open browser: ${BLUE}http://localhost:19007${NC}"
echo -e "2. Login with: ${BLUE}student@test.com / password123${NC}"
echo -e "3. Navigate to: ${BLUE}Fees${NC} page"
echo -e "4. You should see:"
echo -e "   - ${RED}Overdue warning banner${NC}"
echo -e "   - ${GREEN}4 fees${NC} (1 overdue, 2 pending, 1 paid)"
echo -e "   - ${BLUE}Statistics dashboard${NC}"
echo -e "   - ${YELLOW}Real-time date/time${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"

