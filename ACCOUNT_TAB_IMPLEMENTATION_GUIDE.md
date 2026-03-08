# Account Tab Implementation Guide

## Overview
This guide explains how to add the Account tab to the Settings page with change password and delete account features.

## Files Created

### 1. Backend Functions

#### `src/backend/account/changePassword.ts`
- Handles password change functionality
- Verifies current password before updating
- Uses Supabase auth API

#### `src/backend/account/checkPendingOrders.ts`
- Checks if shop has any pending orders
- Returns count and status of non-completed orders
- Used to determine if account can be deleted

#### `src/backend/account/deleteAccount.ts`
- Deletes all shop data in correct order
- Respects foreign key constraints
- Deletes: printers, services, resources, orders, order_items, shop, profile

### 2. UI Component

#### `src/components/settings/AccountTab.tsx`
- Reusable Account tab component
- Change password form
- Delete account section with warnings
- Shows pending orders status
- Confirmation dialog for deletion

## Integration Steps

### Step 1: Update Settings.tsx Imports

Add these imports at the top of `src/pages/Settings.tsx`:

```typescript
import { useNavigate } from "react-router-dom";
import { User, Lock, Trash2, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { changePassword } from "@/backend/account/changePassword";
import { checkPendingOrders } from "@/backend/account/checkPendingOrders";
import { deleteAccount } from "@/backend/account/deleteAccount";
import { supabase } from "@/auth/supabase";
import { AccountTab } from "@/components/settings/AccountTab";
```

### Step 2: Add State Variables

Add these state variables in the Settings component:

```typescript
const navigate = useNavigate();

// Account management state
const [shopId, setShopId] = useState<string>("");
const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [changingPassword, setChangingPassword] = useState(false);
const [checkingOrders, setCheckingOrders] = useState(false);
const [pendingOrdersInfo, setPendingOrdersInfo] = useState<{
  hasPending: boolean;
  count: number;
  statuses: string[];
}>({ hasPending: false, count: 0, statuses: [] });
const [showDeleteDialog, setShowDeleteDialog] = useState(false);
const [deletingAccount, setDeletingAccount] = useState(false);
```

### Step 3: Update useEffect to Store Shop ID

Modify the `loadShopData` function in useEffect to store the shop ID:

```typescript
const { shop } = await fetchFullShopProfile();
setShopId(shop.id); // Add this line

// ... rest of the code

// Add this at the end before setLoading(false)
await checkPendingOrdersStatus(shop.id);
```

### Step 4: Add Handler Functions

Add these functions before the return statement:

```typescript
const checkPendingOrdersStatus = async (shopIdParam: string) => {
  try {
    setCheckingOrders(true);
    const result = await checkPendingOrders(shopIdParam);
    setPendingOrdersInfo({
      hasPending: result.hasPendingOrders,
      count: result.pendingCount,
      statuses: result.statuses,
    });
  } catch (error) {
    console.error("Error checking pending orders:", error);
  } finally {
    setCheckingOrders(false);
  }
};

const handleChangePassword = async () => {
  if (!newPassword || !currentPassword) {
    showToast({
      title: "Error",
      description: "Please fill in all password fields",
      variant: "error",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast({
      title: "Error",
      description: "New passwords do not match",
      variant: "error",
    });
    return;
  }

  if (newPassword.length < 6) {
    showToast({
      title: "Error",
      description: "Password must be at least 6 characters",
      variant: "error",
    });
    return;
  }

  try {
    setChangingPassword(true);
    await changePassword({
      currentPassword,
      newPassword,
    });

    showToast({
      title: "Success",
      description: "Password changed successfully",
      variant: "success",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message || "Failed to change password",
      variant: "error",
    });
  } finally {
    setChangingPassword(false);
  }
};

const handleDeleteAccount = async () => {
  if (!user || !shopId) return;

  try {
    setDeletingAccount(true);
    await deleteAccount(shopId, user.id);

    showToast({
      title: "Success",
      description: "Account deleted successfully",
      variant: "success",
    });

    await supabase.auth.signOut();
    navigate("/auth");
  } catch (error: any) {
    showToast({
      title: "Error",
      description: error.message || "Failed to delete account",
      variant: "error",
    });
    setDeletingAccount(false);
    setShowDeleteDialog(false);
  }
};
```

### Step 5: Update TabsList

Change the TabsList from `grid-cols-4` to `grid-cols-5`:

```typescript
<TabsList className="grid w-full grid-cols-5">
  {/* existing tabs */}
  
  <TabsTrigger value="account" className="flex items-center space-x-2">
    <User className="h-4 w-4" />
    <span className="hidden sm:inline">Account</span>
  </TabsTrigger>
</TabsList>
```

### Step 6: Add Account TabsContent

Add this after the Pricing TabsContent:

```typescript
{/* Account Tab */}
<TabsContent value="account" className="space-y-6">
  <AccountTab
    currentPassword={currentPassword}
    setCurrentPassword={setCurrentPassword}
    newPassword={newPassword}
    setNewPassword={setNewPassword}
    confirmPassword={confirmPassword}
    setConfirmPassword={setConfirmPassword}
    changingPassword={changingPassword}
    handleChangePassword={handleChangePassword}
    pendingOrdersInfo={pendingOrdersInfo}
    checkingOrders={checkingOrders}
    showDeleteDialog={showDeleteDialog}
    setShowDeleteDialog={setShowDeleteDialog}
    deletingAccount={deletingAccount}
    handleDeleteAccount={handleDeleteAccount}
  />
</TabsContent>
```

## Features

### Change Password
- Validates current password
- Requires minimum 6 characters
- Confirms new password matches
- Shows success/error toasts
- Clears form on success

### Delete Account
- Checks for pending orders first
- Shows warning if orders exist
- Lists what will be deleted
- Requires confirmation dialog
- Deletes all data in correct order:
  1. Shop printers
  2. Shop services
  3. Shop resources
  4. Order items
  5. Completed orders
  6. Shop profile
  7. User profile
- Signs out and redirects to auth page

## Security Notes

1. **Password Verification**: Current password is verified before allowing change
2. **Order Check**: Account cannot be deleted if there are pending orders
3. **Cascade Delete**: All related data is deleted in proper order
4. **Auth User**: The Supabase auth user deletion requires service role key, so it's handled separately

## Testing

1. **Change Password**:
   - Try with wrong current password
   - Try with mismatched new passwords
   - Try with password < 6 characters
   - Try successful password change

2. **Delete Account**:
   - Try with pending orders (should be blocked)
   - Try with only completed orders (should work)
   - Verify all data is deleted
   - Verify redirect to auth page

## UI/UX Features

- Loading states for all async operations
- Clear error messages
- Success confirmations
- Visual warnings for destructive actions
- Disabled states when operations in progress
- Dark mode support
- Responsive design

## Complete!

After following these steps, your Settings page will have a fully functional Account tab with password change and account deletion features.
