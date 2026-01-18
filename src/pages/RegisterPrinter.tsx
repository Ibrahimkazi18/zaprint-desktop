import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import fetchMyShop from "@/backend/shops/fetchMyShop"
import registerPrinter from "@/backend/printers/registerPrinter"

const PRINTER_TYPES = [
  { label: "Black & White", value: "bw" },
  { label: "Color", value: "color" },
  { label: "Photo", value: "photo" },
  { label: "Passport / ID", value: "passport" },
  { label: "Large Format", value: "large_format" },
]

const SERVICES = [
  "Black & White Printing",
  "Color Printing",
  "Photocopy",
  "Photo Printing",
  "Passport Size Prints",
]

const PAPER_SIZES = ["A4", "A3", "A5", "Legal", "Letter", "Passport"]

export default function RegisterPrinter() {
  const navigate = useNavigate()

  const [shopId, setShopId] = useState<string | null>(null)

  const [printerName, setPrinterName] = useState("")
  const [printerType, setPrinterType] = useState("")
  const [services, setServices] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadShop = async () => {
      const shop = await fetchMyShop()
      setShopId(shop.id)
    }
    loadShop()
  }, [])

  const toggle = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    setter(
      list.includes(value)
        ? list.filter(v => v !== value)
        : [...list, value]
    )
  }

  const handleSubmit = async () => {
    if (!shopId) return
    if (!printerName || !printerType || services.length === 0 || sizes.length === 0) {
      setError("All fields are required")
      return
    }

    setLoading(true)
    setError("")

    try {
      await registerPrinter({
        shop_id: shopId,
        printer_name: printerName,
        printer_type: printerType,
        supported_services: services,
        supported_sizes: sizes,
      })

      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Register Printer</h1>

      {error && <p className="text-red-500">{error}</p>}

      <input
        className="border p-2 w-full"
        placeholder="Printer name (e.g. HP LaserJet BW)"
        value={printerName}
        onChange={e => setPrinterName(e.target.value)}
      />

      <select
        className="border p-2 w-full"
        value={printerType}
        onChange={e => setPrinterType(e.target.value)}
      >
        <option value="">Select printer type</option>
        {PRINTER_TYPES.map(p => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>

      <div>
        <h3 className="font-medium">Supported Services</h3>
        {SERVICES.map(s => (
          <label key={s} className="block">
            <input
              type="checkbox"
              checked={services.includes(s)}
              onChange={() => toggle(s, services, setServices)}
            />{" "}
            {s}
          </label>
        ))}
      </div>

      <div>
        <h3 className="font-medium">Supported Paper Sizes</h3>
        {PAPER_SIZES.map(s => (
          <label key={s} className="block">
            <input
              type="checkbox"
              checked={sizes.includes(s)}
              onChange={() => toggle(s, sizes, setSizes)}
            />{" "}
            {s}
          </label>
        ))}
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Register Printer"}
      </button>
    </div>
  )
}
