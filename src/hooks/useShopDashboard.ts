import { useEffect, useRef, useState, useMemo } from "react"
import fetchMyShop from "@/backend/shops/fetchMyShop"
import fetchShopPrinters from "@/backend/printers/fetchPrinters"
import subscribeToShopPrinters from "@/backend/realtime/shopRealtime"

export function useShopDashboard() {
  const [shop, setShop] = useState<any>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const subscriptionRef = useRef<any>(null)
  const loadedRef = useRef(false)

  // Load shop + printers once
  useEffect(() => {
    if (loadedRef.current) return // Prevent reloading on every render
    
    const load = async () => {
      try {
        const shopData = await fetchMyShop()
        setShop(shopData)

        const printersData = await fetchShopPrinters(shopData.id)
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
