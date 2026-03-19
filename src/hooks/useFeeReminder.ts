import { useEffect, useRef } from 'react';
import { useShopDashboard } from './useShopDashboard';
import { fetchFeeSummary } from '@/backend/fees/platformFees';

export function useFeeReminder() {
  const { shop } = useShopDashboard();
  const reminderShownRef = useRef(false);

  useEffect(() => {
    async function checkFeesAndRemind() {
      // Only do this once per session to avoid spamming the user
      if (reminderShownRef.current || !shop?.id) return;
      
      try {
        const summary = await fetchFeeSummary(shop.id);
        
        // Check if there are outstanding fees
        if (summary.unpaidFees > 0) {
          reminderShownRef.current = true;
          
          let title = "Zaprint Platform Fees";
          let body = `You have outstanding platform fees of ₹${summary.unpaidFees.toFixed(2)}.`;
          
          if (summary.isOverdue || summary.daysOverdue! >= 7) {
            title = "⚠️ Urgent: Platform Fees Overdue";
            body = `Your shop is at risk of being blocked (or is blocked)! Please pay your pending ₹${summary.unpaidFees.toFixed(2)} immediately to continue receiving orders.`;
          } else if (summary.daysOverdue && summary.daysOverdue >= 5) {
            title = "⚠️ Platform Fees Due Soon";
            body = `You have ₹${summary.unpaidFees.toFixed(2)} in platform fees that are due. Please settle them to prevent your shop from being hidden.`;
          }

          // Request permission and show HTML5 Desktop Notification
          if ("Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(title, { body, icon: '/Zaprint_Logo.png' });
            } else if (Notification.permission !== "denied") {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                new Notification(title, { body, icon: '/Zaprint_Logo.png' });
              }
            }
          }
        }
      } catch (error) {
        console.error("Failed to check fees for reminder", error);
      }
    }

    checkFeesAndRemind();
  }, [shop?.id]);
}
