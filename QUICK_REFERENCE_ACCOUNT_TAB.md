# Account Tab - Quick Reference Card

## 📦 What You Got

### ✅ 3 Backend Functions
- `src/backend/account/changePassword.ts`
- `src/backend/account/checkPendingOrders.ts`
- `src/backend/account/deleteAccount.ts`

### ✅ 1 UI Component
- `src/components/settings/AccountTab.tsx`

### ✅ 4 Documentation Files
- `ACCOUNT_TAB_IMPLEMENTATION_GUIDE.md` (detailed steps)
- `SETTINGS_ACCOUNT_TAB_COMPLETE.md` (copy-paste ready)
- `ACCOUNT_FEATURE_SUMMARY.md` (overview)
- `ACCOUNT_FEATURE_FLOW.md` (diagrams)

## 🚀 Integration in 6 Steps

### 1. Add Imports (Top of Settings.tsx)
```typescript
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { changePassword } from "@/backend/account/changePassword";
import { checkPendingOrders } from "@/backend/account/checkPendingOrders";
import { deleteAccount } from "@/backend/account/deleteAccount";
import { supabase } from "@/auth/supabase";
import { AccountTab } from "@/components/settings/AccountTab";
```

### 2. Add State (After useToast line)
```typescript
const navigate = useNavigate();
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

### 3. Update useEffect
```typescript
// After: const { shop } = await fetchFullShopProfile();
setShopId(shop.id);

// Before: setLoading(false);
await checkPendingOrdersStatus(shop.id);
```

### 4. Add 3 Functions (Before return)
See `SETTINGS_ACCOUNT_TAB_COMPLETE.md` Step 4 for full code

### 5. Update TabsList
```typescript
// Change: grid-cols-4 → grid-cols-5
<TabsList className="grid w-full grid-cols-5">

// Add after Pricing tab:
<TabsTrigger value="account" className="flex items-center space-x-2">
  <User className="h-4 w-4" />
  <span className="hidden sm:inline">Account</span>
</TabsTrigger>
```

### 6. Add TabsContent (After Pricing)
```typescript
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

## 🎯 Features

### Change Password
- ✅ Current password verification
- ✅ Min 6 characters
- ✅ Password confirmation
- ✅ Success/error toasts
- ✅ Auto-clear form

### Delete Account
- ✅ Pending orders check
- ✅ Visual warnings
- ✅ Confirmation dialog
- ✅ Complete data deletion
- ✅ Auto sign-out & redirect

## 🧪 Test Checklist

### Password
- [ ] Empty fields → Error
- [ ] Wrong current → Error
- [ ] Mismatch → Error
- [ ] Too short → Error
- [ ] Success → Works

### Delete
- [ ] With pending → Blocked
- [ ] Without pending → Works
- [ ] Data deleted → Verified
- [ ] Signed out → Yes
- [ ] Redirected → Yes

## 📚 Full Documentation

- **Quick Start**: `SETTINGS_ACCOUNT_TAB_COMPLETE.md`
- **Detailed Guide**: `ACCOUNT_TAB_IMPLEMENTATION_GUIDE.md`
- **Overview**: `ACCOUNT_FEATURE_SUMMARY.md`
- **Flow Diagrams**: `ACCOUNT_FEATURE_FLOW.md`

## ⚡ Quick Commands

```bash
# Check if files exist
ls src/backend/account/
ls src/components/settings/AccountTab.tsx

# Run diagnostics
# (All files should have no errors)
```

## 🎨 UI Preview

```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ [Shop][Resources][Services][Pricing][Account] │
├─────────────────────────────────────┤
│                                     │
│ 🔒 Change Password                  │
│ ┌─────────────────────────────────┐ │
│ │ Current Password: [_________]   │ │
│ │ New Password:     [_________]   │ │
│ │ Confirm Password: [_________]   │ │
│ │ [Change Password]               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🗑️  Delete Account                  │
│ ┌─────────────────────────────────┐ │
│ │ ⚠️  Cannot Delete Account        │ │
│ │ You have 3 pending orders       │ │
│ │ Status: pending, in_queue       │ │
│ │                                 │ │
│ │ [Delete Account] (disabled)     │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 💡 Pro Tips

1. **Test with pending orders first** to see the blocking behavior
2. **Complete all orders** before testing deletion
3. **Use a test account** for deletion testing
4. **Check dark mode** appearance
5. **Verify all toasts** appear correctly

## 🔗 Related Files

- Settings page: `src/pages/Settings.tsx`
- Auth context: `src/context/AuthContext.tsx`
- Supabase client: `src/auth/supabase.ts`
- Toast hook: `src/components/toast/useToast.tsx`

## ✨ You're All Set!

Everything is ready. Just follow the 6 integration steps and you'll have a fully functional Account management system!

Need help? Check the detailed guides in the documentation files.
