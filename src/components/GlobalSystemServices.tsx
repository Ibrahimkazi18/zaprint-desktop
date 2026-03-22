import { useEffect } from "react";
import { useShopDashboard } from "@/hooks/useShopDashboard";
import { usePrinterMonitoring } from "@/hooks/usePrinterMonitoring";
import { usePrintQueue } from "@/hooks/usePrintQueue";
import { fetchMissedOrders, subscribeToOrders } from "@/backend/realtime/subscribeToOrders";
import { supabase } from "@/auth/supabase";

export default function GlobalSystemServices() {
  const { shop, printers } = useShopDashboard();
  
  // 1. Maintain Printer Monitoring globally for the shop
  // This hook automatically starts/stops monitoring background printers
  usePrinterMonitoring(shop?.id, { autoStart: true });

  // 2. Maintain Print Queue and Order Subscription globally
  const { addJob: addToQueue } = usePrintQueue(printers, {
    detectSystemPrinters: false, // Pages like Printers.tsx can trigger this manually
  });

  useEffect(() => {
    if (!shop?.id) return;

    // Fetch missed orders when shop loads
    fetchMissedOrders(shop.id, addToQueue);
    
    // Subscribe to new orders globally
    const channel = subscribeToOrders(shop.id, addToQueue);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop?.id, addToQueue]);

  return null;
}
