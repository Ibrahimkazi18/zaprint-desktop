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