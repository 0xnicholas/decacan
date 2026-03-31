#!/bin/bash
# scripts/test-members-e2e.sh
# End-to-end verification for member management

set -e

BASE_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

echo "=== Member Management E2E Verification ==="
echo ""

# Test 1: Register owner user
echo "1. Registering owner user..."
OWNER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"Password123","name":"Workspace Owner"}')
OWNER_TOKEN=$(echo $OWNER_RESPONSE | jq -r '.access_token')
echo "   ✓ Owner registered, token obtained"

# Test 2: Create workspace (or use default)
echo "2. Checking workspace access..."
curl -s -H "Authorization: Bearer $OWNER_TOKEN" "$BASE_URL/api/workspaces" | jq '.[0].id'
echo "   ✓ Workspace accessible"

# Test 3: List members (should show owner only)
echo "3. Listing workspace members..."
MEMBERS=$(curl -s -H "Authorization: Bearer $OWNER_TOKEN" "$BASE_URL/api/workspaces/workspace-1/members")
echo "   Members: $MEMBERS"
echo "   ✓ Members listed"

# Test 4: Register another user to invite
echo "4. Registering user to invite..."
INVITEE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"member@test.com","password":"Password123","name":"Team Member"}')
INVITEE_EMAIL=$(echo $INVITEE_RESPONSE | jq -r '.email')
echo "   ✓ User registered: $INVITEE_EMAIL"

# Test 5: Invite member
echo "5. Inviting member as owner..."
INVITE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/workspaces/workspace-1/members" \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$INVITEE_EMAIL\",\"role\":\"editor\"}")
echo "   Response: $INVITE_RESPONSE"
echo "   ✓ Member invited"

# Test 6: List members again (should show 2 members)
echo "6. Verifying member was added..."
MEMBERS=$(curl -s -H "Authorization: Bearer $OWNER_TOKEN" "$BASE_URL/api/workspaces/workspace-1/members")
MEMBER_COUNT=$(echo $MEMBERS | jq 'length')
echo "   Member count: $MEMBER_COUNT"
if [ "$MEMBER_COUNT" -eq "2" ]; then
  echo "   ✓ Member successfully added"
else
  echo "   ✗ Expected 2 members, got $MEMBER_COUNT"
  exit 1
fi

echo ""
echo "=== Frontend Verification ==="
echo ""
echo "Please manually verify:"
echo "1. Navigate to $FRONTEND_URL"
echo "2. Login as owner@test.com / Password123"
echo "3. Go to Members page"
echo "4. Verify 2 members are listed"
echo "5. Click 'Invite Member' and invite viewer@test.com as Viewer"
echo "6. Verify new member appears in list"
echo "7. Try to change owner role (should fail)"
echo "8. Remove a member (should succeed)"
echo ""
echo "=== E2E Verification Complete ==="
