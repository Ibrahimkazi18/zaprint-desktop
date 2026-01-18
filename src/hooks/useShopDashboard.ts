import { useEffect, useRef, useState } from "react"
import fetchMyShop from "@/backend/shops/fetchMyShop"
import fetchShopPrinters from "@/backend/printers/fetchPrinters"
import subscribeToShopPrinters from "@/backend/realtime/shopRealtime"

export function useShopDashboard() {
  const [shop, setShop] = useState<any>(null)
  const [printers, setPrinters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const subscriptionRef = useRef<any>(null)

  // Load shop + printers once
  useEffect(() => {
    const load = async () => {
      const shopData = await fetchMyShop()
      setShop(shopData)

      const printersData = await fetchShopPrinters(shopData.id)
      setPrinters(printersData)

      setLoading(false)
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
