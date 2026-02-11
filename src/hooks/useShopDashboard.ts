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
        // First get shop data
        const shopData = await fetchMyShop()
        setShop(shopData)
        
        // Immediately show the page, then load printers
        setLoading(false)
        
        // Load printers in background
        const printersData = await fetchShopPrinters(shopData.id)
        setPrinters(printersData)
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
