import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Lock, Trash2, AlertTriangle } from "lucide-react";

interface AccountTabProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  changingPassword: boolean;
  handleChangePassword: () => void;
  pendingOrdersInfo: {
    hasPending: boolean;
    count: number;
    statuses: string[];
  };
  checkingOrders: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (value: boolean) => void;
  deletingAccount: boolean;
  handleDeleteAccount: () => void;
}

export function AccountTab({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  handleChangePassword,
  pendingOrdersInfo,
  checkingOrders,
  showDeleteDialog,
  setShowDeleteDialog,
  deletingAccount,
  handleDeleteAccount,
}: AccountTabProps) {
  return (
    <div className="space-y-6">
      {/* Change Password Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <span>Change Password</span>
          </CardTitle>
          <CardDescription>
            Update your account password. Make sure to use a strong password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="w-full md:w-auto"
          >
            <Lock className="h-4 w-4 mr-2" />
            {changingPassword ? "Changing Password..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <span>Delete Account</span>
          </CardTitle>
          <CardDescription>
            Permanently delete your shop account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checkingOrders ? (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Checking pending orders...</span>
            </div>
          ) : pendingOrdersInfo.hasPending ? (
            <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-600 dark:text-amber-400">
                    Cannot Delete Account
                  </p>
                  <p className="text-sm text-amber-600/80 dark:text-amber-400/80 mt-1">
                    You have {pendingOrdersInfo.count} pending order(s) with status:{" "}
                    {pendingOrdersInfo.statuses.join(", ")}. Please complete all orders before deleting your account.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    Account Can Be Deleted
                  </p>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
                    All orders are completed. You can safely delete your account.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium mb-2">
              Warning: This will permanently delete:
            </p>
            <ul className="text-sm text-destructive/80 space-y-1 list-disc list-inside">
              <li>Your shop profile and settings</li>
              <li>All registered printers</li>
              <li>All services and pricing</li>
              <li>All resources</li>
              <li>Completed order history</li>
              <li>Your user account</li>
            </ul>
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={pendingOrdersInfo.hasPending || checkingOrders}
            className="w-full md:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Are you absolutely sure?</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <p className="font-medium text-foreground">
                All shop data, printers, services, resources, and order history will be permanently deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingAccount ? "Deleting..." : "Yes, Delete My Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
