import updatePrinterStatus from "@/backend/printers/updatePrinterStatus"
import sendPrinterHeartbeat from "@/backend/printers/heartbeat"

export default function connectMockPrinter(printerId: string) {
  updatePrinterStatus(printerId, "online")

  const interval = setInterval(() => {
    sendPrinterHeartbeat(printerId)
  }, 15000)

  return () => {
    clearInterval(interval)
    updatePrinterStatus(printerId, "offline")
  }
}
