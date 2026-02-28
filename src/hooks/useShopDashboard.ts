import { useState, useEffect, useMemo, useRef } from "react"
import fetchMyShop from "@/backend/shops/fetchMyShop"
import fetchShopPrinters from "@/backend/printers/fetchPrinters"
import subscribeToShopPrinters from "@/backend/realtime/shopRealtime"

export function useShopDashboard() {
  const [shop, setShop] = useState<any>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const subscriptionRef = useRef<any>(null)
  const loadedRef = useRef(false)

  // Load shop + printers once with optimized loading
  useEffect(() => {
    if (loadedRef.current) return // Prevent reloading on every render
    
    const load = async () => {
      try {
        const shopPromise = fetchMyShop();
        const [shopData, printersData] = await Promise.all([
          shopPromise,
          shopPromise.then(shop =>
            shop?.id ? fetchShopPrinters(shop.id) : Promise.resolve([])
          ),
        ]);
        
        setShop(shopData)
        setPrinters(printersData)
      } catch (error) {
        console.error("Error loading shop data:", error)
      } finally {
        setLoading(false)
        loadedRef.current = true
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

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(
    () => ({ shop, printers, loading }),
    [shop, printers, loading]
  )
}
