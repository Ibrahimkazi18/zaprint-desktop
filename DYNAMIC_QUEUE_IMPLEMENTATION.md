# Dynamic Print Queue Implementation

## Overview
The print queue in the Dashboard is now fully dynamic and connected to the database and printer system.

## How It Works

### 1. Order Flow
1. **New Order Arrives** → Supabase realtime subscription detects new order
2. **Download Files** → Files are downloaded from Supabase storage to local system
3. **Add to Queue** → Job is added to the print queue manager
4. **Process Queue** → Queue manager sends jobs to connected printers
5. **Update Status** → Order status is updated in database as it progresses

### 2. Components

#### useLiveQueue Hook (`src/hooks/useLiveQueue.ts`)
- Polls the print queue manager every second
- Returns live queue data with current status
- First item in queue is marked as "printing", rest as "queued"

#### Print Queue Manager (`src/print/printQueueManager.ts`)
- Manages the queue of print jobs
- Handles printer selection and job processing
- Automatically cleans up files after printing
- Updates order status in database

#### Dashboard (`src/pages/Dashboard.tsx`)
- Displays live queue data in a table
- Shows order ID, status, and job details
- Updates automatically as jobs are processed
- Empty state when no jobs in queue

### 3. Data Flow

```
Database (orders table)
    ↓
Realtime Subscription (subscribeToOrders)
    ↓
Download Files (Supabase Storage)
    ↓
Add to Queue (printQueueManager.addJob)
    ↓
Process Queue (printQueueManager.processQueue)
    ↓
Send to Printer (window.electron.printFile)
    ↓
Update Status (updateOrderStatus)
    ↓
Cleanup (delete local files & storage)
```

### 4. Queue Display

The queue table shows:
- **Order ID**: First 8 characters of the order ID
- **Job Type**: "Print Job"
- **Status**: 