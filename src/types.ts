export interface PrintJob {
  id: string
  customerName: string
  jobType: string
  status: 'Queued' | 'Printing' | 'Completed' | 'Cancelled'
  pages: number
  copies: number
  colorMode: 'Color' | 'B&W'
  paperSize: string
  binding?: string
  notes?: string
  estimatedTime: string
  createdAt?: string
}

export interface Printer {
  id: string
  shop_id: string
  printer_name: string
  printer_type: string
  supported_services: string[]
  supported_sizes: string[]
  status: 'online' | 'offline' | 'error'
  last_heartbeat?: string
  created_at?: string
}