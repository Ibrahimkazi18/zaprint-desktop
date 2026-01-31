import { cleanupPrinterHandlers, setupPrinterHandlers } from "./main/printerHandlers";
const { ipcMain, app: electronApp } = require('electron');
const fs = require('fs');

// electron/main.ts
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow: any = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

async function createWindow() {
  try {
    // Correct preload path - it's in dist-electron after build
    const preloadPath = path.join(__dirname, 'index.js');

    console.log('=== PRELOAD DEBUG ===');
    console.log('__dirname:', __dirname);
    console.log('Preload path:', preloadPath);
    console.log('Preload exists:', require('fs').existsSync(preloadPath));
    console.log('===================');

    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
      show: false,
    });

    const getSessionPath = () => {
      const userDataPath = electronApp.getPath('userData');
      return path.join(userDataPath, 'session.json');
    };

    // Setup auth and printer IPC handlers
    const setupAuthHandlers = () => {
      // Save session to disk
      ipcMain.handle('auth:save-session', async (_: any, session: any) => {
        try {
          const sessionPath = getSessionPath();
          const sessionData = JSON.stringify(session, null, 2);
          
          // Ensure directory exists
          const dir = path.dirname(sessionPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(sessionPath, sessionData, 'utf8');
          console.log('[Auth] Session saved successfully');
          
          return { success: true };
        } catch (error: any) {
          console.error('[Auth] Error saving session:', error);
          return { success: false, error: error.message };
        }
      });

      // Get session from disk
      ipcMain.handle('auth:get-session', async () => {
        try {
          const sessionPath = getSessionPath();
          
          if (!fs.existsSync(sessionPath)) {
            console.log('[Auth] No session file found');
            return null;
          }
          
          const sessionData = fs.readFileSync(sessionPath, 'utf8');
          const session = JSON.parse(sessionData);
          
          console.log('[Auth] Session loaded successfully');
          return session;
        } catch (error) {
          console.error('[Auth] Error loading session:', error);
          return null;
        }
      });

      // Clear session
      ipcMain.handle('auth:clear-session', async () => {
        try {
          const sessionPath = getSessionPath();
          
          if (fs.existsSync(sessionPath)) {
            fs.unlinkSync(sessionPath);
            console.log('[Auth] Session cleared successfully');
          }
          
          return { success: true };
        } catch (error: any) {
          console.error('[Auth] Error clearing session:', error);
          return { success: false, error: error.message };
        }
      });

      console.log('[Auth] Auth handlers registered');
    };

    setupAuthHandlers()
    setupPrinterHandlers(mainWindow);

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
    });

    if (isDev) {
      await mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (error) {
    console.error('Error creating window:', error);
    app.quit();
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  cleanupPrinterHandlers();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  cleanupPrinterHandlers();
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});