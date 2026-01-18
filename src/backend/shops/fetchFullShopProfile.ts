import fetchMyShop from "./fetchMyShop"
import fetchShopServices from "./fetchShopServices"
import fetchShopResources from "./fetchShopResources"

export async function fetchFullShopProfile() {
  const shop = await fetchMyShop()

  const [services, resources] = await Promise.all([
    fetchShopServices(shop.id),
    fetchShopResources(shop.id),
  ])

  return {
    shop,
    services,
    resources,
  }
}
