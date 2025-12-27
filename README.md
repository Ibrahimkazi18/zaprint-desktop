# Zaprint Desktop App

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/framework-Electron-47848F)
![React](https://img.shields.io/badge/frontend-React-61DAFB)

Zaprint Desktop is a specialized desktop application for print shop owners. It acts as a local controller, bridging the **Zaprint Cloud Platform** and physical printing hardware via native system APIs.

> [!IMPORTANT]
> This application is strictly for authorized **print shop owners**. It is not intended for end-customers.

---

## 🚀 Purpose

* **Local Bridge:** Receives print jobs from the Zaprint web backend.
* **Automation:** Handles print job queuing and processing with minimal manual intervention.
* **Native Control:** Interacts directly with OS-level printer APIs for precise control.
* **Hardware Management:** Manages multiple connected printers from a single interface.

---

## 🧠 Core Features

- 🖨️ **Printer Management:** Detect and configure local/network printers.
- 📥 **Local Receipt:** Securely pull jobs from the Zaprint cloud.
- 🗂️ **Queue Handling:** Manage states (Pending, Printing, Completed, Failed).
- 📄 **Format Support:** Native handling of PDFs, images, and documents.
- 🔄 **Real-time Sync:** Instant status updates back to the cloud dashboard.
- 🔐 **Secure Operations:** No local customer data storage or credential exposure.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Desktop Framework** | Electron |
| **Frontend** | React + TypeScript |
| **Bundler** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Native Access** | Node.js APIs & Electron IPC |

---

## 📁 Project Structure

```text
zaprint-desktop/
├── electron/
│   ├── main.ts        # Electron main process (Native logic)
│   └── preload.ts     # Secure IPC bridge
├── src/
│   ├── components/    # shadcn UI components
│   ├── pages/         # View logic
│   ├── lib/           # Utilities & helpers
│   ├── hooks/         # Custom React hooks
│   └── main.tsx       # React entry point
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json 
```


## 🔄 Print Job Lifecycle

Received → Queued → Printing → Completed / Failed

1. Received: Job payload arrives from Zaprint cloud.

2. Queued: Job is prioritized and added to the local database.

3. Printing: Document is sent to the OS Spooler via Native APIs.

4. Finalized: Status is reported as Completed or Failed.


Each job contains:
- File data  
- Printer selection  
- Print configuration  
- Job status  

## 🔐 Security

- Secure IPC via Electron preload scripts  
- No direct Node.js access from the UI  
- Local-only printer operations  
- No customer credentials stored  

## 🧪 Development Setup

### Prerequisites
- Node.js (18+ recommended)  
- npm / pnpm  
- Windows, macOS, or Linux  

### Installation
1. Clone the repository:
```bash
git clone [https://github.com/your-repo/zaprint-desktop.git](https://github.com/Ibrahimkazi18/zaprint-desktop.git)
cd zaprint-desktop
```

2. Install dependencies:
```bash
npm install
```

3. Launch development mode:
```bash
npm run dev
```

### Building for Production
To package the app for distribution:
```bash
npm run build
```

## 🧭 Future Enhancements
[ ] Background service/System tray mode.

[ ] Auto-start on system boot.

[ ] Advanced queue prioritization.

[ ] Printer health (Ink/Paper) monitoring.

[ ] Offline job caching.


## 👤 Target Users

- Local Print Shops

- Commercial Copy Centers

- Authorized Zaprint Partners

License: Proprietary – © Zaprint. All rights reserved.
