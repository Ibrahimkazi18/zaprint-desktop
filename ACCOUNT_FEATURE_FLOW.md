# Account Management Feature - Flow Diagrams

## Change Password Flow

```
User Opens Settings → Account Tab
         ↓
Enters Current Password
         ↓
Enters New Password (min 6 chars)
         ↓
Confirms New Password
         ↓
Clicks "Change Password"
         ↓
    Validation
         ├─→ Empty fields? → Show Error
         ├─→ Passwords don't match? → Show Error
         ├─→ Password < 6 chars? → Show Error
         └─→ All valid
                ↓
         Verify Current Password
                ├─→ Wrong? → Show Error
                └─→ Correct
                       ↓
                Update Password
                       ↓
                Show Success Toast
                       ↓
                Clear Form
```

## Delete Account Flow

```
User Opens Settings → Account Tab
         ↓
System Checks Pending Orders
         ↓
    Has Pending Orders?
         ├─→ YES
         │      ↓
         │   Show Warning
         │   "You have X pending orders"
         │   "Status: pending, in_queue, etc."
         │      ↓
         │   Disable Delete Button
         │
         └─→ NO
                ↓
             Show Green Status
             "Account can be deleted"
                ↓
             Enable Delete Button
                ↓
          User Clicks Delete
                ↓
          Show Confirmation Dialog
          "Are you absolutely sure?"
          Lists what will be deleted
                ↓
          User Confirms
                ↓
          Start Deletion Process
                ↓
          Delete in Order:
          1. Shop Printers
          2. Shop Services
          3. Shop Resources
          4. Order Items
          5. Completed Orders
          6. Shop Profile
          7. User Profile
                ↓
          Show Success Toast
                ↓
          Sign Out User
                ↓
          Redirect to /auth
```

## Component Architecture

```
Settings.tsx (Main Page)
    │
    ├─→ State Management
    │   ├─ shopId
    │   ├─ currentPassword
    │   ├─ newPassword
    │   ├─ confirmPassword
    │   ├─ changingPassword
    │   ├─ checkingOrders
    │   ├─ pendingOrdersInfo
    │   ├─ showDeleteDialog
    │   └─ deletingAccount
    │
    ├─→ Handler Functions
    │   ├─ checkPendingOrdersStatus()
    │   ├─ handleChangePassword()
    │   └─ handleDeleteAccount()
    │
    └─→ UI Components
        ├─ TabsList (5 tabs)
        │   ├─ Shop
        │   ├─ Resources
        │   ├─ Services
        │   ├─ Pricing
        │   └─ Account ← NEW
        │
        └─ TabsContent
            └─ AccountTab Component
                ├─ Change Password Card
                │   ├─ Current Password Input
                │   ├─ New Password Input
                │   ├─ Confirm Password Input
                │   └─ Change Password Button
                │
                └─ Delete Account Card
                    ├─ Pending Orders Status
                    │   ├─ Checking... (loading)
                    │   ├─ Warning (has pending)
                    │   └─ Success (can delete)
                    │
                    ├─ Warning List
                    │   └─ What will be deleted
                    │
                    ├─ Delete Button
                    │   └─ Disabled if pending orders
                    │
                    └─ Confirmation Dialog
                        ├─ Warning Message
                        ├─ Cancel Button
                        └─ Confirm Button
```

## Backend Function Flow

### changePassword.ts
```
Input: { currentPassword, newPassword }
    ↓
Get Current User from Supabase
    ↓
Verify Current Password
    ├─→ Invalid → Throw Error
    └─→ Valid
           ↓
    Update Password
           ↓
    Return Success
```

### checkPendingOrders.ts
```
Input: shopId
    ↓
Query Orders Table
    WHERE shop_id = shopId
    AND status != 'completed'
    ↓
Count Results
    ↓
Extract Unique Statuses
    ↓
Return: {
    hasPendingOrders: boolean,
    pendingCount: number,
    statuses: string[]
}
```

### deleteAccount.ts
```
Input: { shopId, userId }
    ↓
Check Pending Orders
    ├─→ Has Pending → Throw Error
    └─→ No Pending
           ↓
    Delete Shop Printers
           ↓
    Delete Shop Services
           ↓
    Delete Shop Resources
           ↓
    Get Completed Order IDs
           ↓
    Delete Order Items
           ↓
    Delete Completed Orders
           ↓
    Delete Shop
           ↓
    Delete Profile
           ↓
    Return Success
```

## Database Relationships

```
auth.users (Supabase Auth)
    ↓
profiles (id → auth.users.id)
    ↓
shops (owner_id → profiles.id)
    ├─→ shop_printers (shop_id → shops.id)
    ├─→ shop_services (shop_id → shops.id)
    ├─→ shop_resources (shop_id → shops.id)
    └─→ orders (shop_id → shops.id)
            └─→ order_items (order_id → orders.id)

Deletion Order (bottom to top):
1. order_items
2. orders
3. shop_printers
4. shop_services
5. shop_resources
6. shops
7. profiles
8. auth.users (manual/edge function)
```

## User Journey

### Scenario 1: Change Password
```
1. User navigates to Settings
2. Clicks on "Account" tab
3. Sees "Change Password" section
4. Enters current password
5. Enters new password (twice)
6. Clicks "Change Password"
7. System validates and updates
8. Sees success message
9. Form clears automatically
10. Can continue using app with new password
```

### Scenario 2: Delete Account (With Pending Orders)
```
1. User navigates to Settings
2. Clicks on "Account" tab
3. Sees "Delete Account" section
4. System shows: "You have 3 pending orders"
5. Delete button is disabled
6. Warning explains: "Complete all orders first"
7. User must complete orders before deletion
```

### Scenario 3: Delete Account (No Pending Orders)
```
1. User navigates to Settings
2. Clicks on "Account" tab
3. Sees "Delete Account" section
4. System shows: "Account can be deleted"
5. Delete button is enabled
6. User clicks "Delete Account"
7. Confirmation dialog appears
8. User reads warnings
9. User clicks "Yes, Delete My Account"
10. System deletes all data
11. User is signed out
12. Redirected to login page
13. Account and data are gone
```

## Error Handling

### Change Password Errors
```
Empty Fields
    → "Please fill in all password fields"

Wrong Current Password
    → "Current password is incorrect"

Passwords Don't Match
    → "New passwords do not match"

Password Too Short
    → "Password must be at least 6 characters"

Network Error
    → "Failed to change password"
```

### Delete Account Errors
```
Has Pending Orders
    → "Cannot delete account. You have X pending order(s)"

Network Error
    → "Failed to delete account"

Partial Deletion Failure
    → "Failed to delete [specific data]"
    → Transaction rolls back
```

## Success States

### Change Password Success
```
✓ Password changed successfully
✓ Form cleared
✓ User remains logged in
✓ Can continue using app
```

### Delete Account Success
```
✓ All data deleted
✓ User signed out
✓ Redirected to auth page
✓ Cannot log back in
✓ Data permanently removed
```

## Visual States

### Loading States
```
Checking Orders:
    [Spinner] Checking pending orders...

Changing Password:
    [Button] Changing Password...

Deleting Account:
    [Button] Deleting...
```

### Warning States
```
Pending Orders:
    [⚠️ Amber] Cannot Delete Account
    You have X pending orders
    Status: pending, in_queue, printing

Can Delete:
    [✓ Green] Account Can Be Deleted
    All orders are completed
```

### Error States
```
[❌ Red] Error
Description of what went wrong
```

### Success States
```
[✓ Green] Success
Operation completed successfully
```

## Complete Feature Map

```
Account Management Feature
│
├─ Change Password
│  ├─ UI Components
│  │  ├─ Current Password Input
│  │  ├─ New Password Input
│  │  ├─ Confirm Password Input
│  │  └─ Submit Button
│  │
│  ├─ Validation
│  │  ├─ Required Fields
│  │  ├─ Password Match
│  │  ├─ Minimum Length
│  │  └─ Current Password Verify
│  │
│  ├─ Backend
│  │  └─ changePassword.ts
│  │
│  └─ States
│     ├─ Idle
│     ├─ Loading
│     ├─ Success
│     └─ Error
│
└─ Delete Account
   ├─ UI Components
   │  ├─ Status Display
   │  ├─ Warning List
   │  ├─ Delete Button
   │  └─ Confirmation Dialog
   │
   ├─ Validation
   │  └─ Pending Orders Check
   │
   ├─ Backend
   │  ├─ checkPendingOrders.ts
   │  └─ deleteAccount.ts
   │
   └─ States
      ├─ Checking Orders
      ├─ Has Pending (Blocked)
      ├─ Can Delete (Enabled)
      ├─ Deleting
      ├─ Success (Redirect)
      └─ Error
```

This comprehensive flow documentation shows exactly how the Account management feature works from every angle!
