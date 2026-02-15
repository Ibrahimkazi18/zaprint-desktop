import { useEffect, useRef, useState } from "react"
import fetchMyShop from "@/backend/shops/fetchMyShop"
import fetchShopPrinters from "@/backend/printers/fetchPrinters"
import subscribeToShopPrinters from "@/backend/realtime/shopRealtime"

export function useShopDashboard() {
  const [shop, setShop] = useState<any>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const subscriptionRef = useRef<any>(null)

  // Load shop + printers in parallel for faster loading
  useEffect(() => {
    const load = async () => {
      try {
        // Get shop data first (required for printers)
        const shopData = await fetchMyShop()
        setShop(shopData)
        
        // Exit loading state immediately to show UI
        setLoading(false)
        
        // Load printers asynchronously without blocking
        fetchShopPrinters(shopData.id).then(setPrinters).catch(console.error)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setLoading(false)
      }
    }

    load()
  }, [])

  // Stable realtime subscription
  useEffect(() => {
    if (!shop?.id) return
    if (subscriptionRef.current) return // 🔒 prevent re-subscribing

    console.log("🟢 Subscribing to realtime printers for shop:", shop.id)

    subscriptionRef.current = subscribeToShopPrinters(
      shop.id,
      async () => {
        console.log("🔁 Printer change detected, refetching...")
        const updated = await fetchShopPrinters(shop.id)
        setPrinters(updated)
      }
    )

    return () => {
      console.log("🔴 Unsubscribing printers")
      subscriptionRef.current?.unsubscribe()
      subscriptionRef.current = null
    }
  }, [shop?.id])

  return { shop, printers, loading }
}
