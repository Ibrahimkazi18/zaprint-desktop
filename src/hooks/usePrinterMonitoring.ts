// src/hooks/usePrinterMonitoring.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/auth/supabase';

interface AppPrinter {
  id: string;
  shop_id: string;
  printer_name: string;
  printer_type: string;
  supported_services: string[];
  supported_sizes: string[];
  status: 'online' | 'offline' | 'error';
  last_heartbeat: string;
}

interface SystemPrinter {
  name: string;
  isDefault: boolean;
  status: 'online' | 'offline' | 'error';
  driver?: string;
  port?: string;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

export function usePrinterMonitoring(shopId?: string) {
  const { user } = useAuth();
  const [printers, setPrinters] = useState<AppPrinter[]>([]);
  const [systemPrinters, setSystemPrinters] = useState<SystemPrinter[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const monitoringStartedRef = useRef(false);

  // Get access token from Supabase session
  const getAccessToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }, []);

  // Detect system printers (manual check)
  const detectSystemPrinters = useCallback(async () => {
    if (!window.printerAPI) {
      setError('Printer API not available. Please ensure you are running in Electron.');
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const result = await window.printerAPI.detectSystemPrinters();
      
      if (result.success && result.printers) {
        setSystemPrinters(result.printers);
        console.log('✅ Detected system printers:', result.printers);
        return result.printers;
      } else {
        throw new Error(result.error || 'Failed to detect printers');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error detecting system printers:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync printer status with database
  const syncPrinterStatus = useCallback(async () => {
    if (!window.printerAPI) {
      setError('Printer API not available');
      return [];
    }

    if (!shopId) {
      console.warn('⚠️ Cannot sync: missing shopId');
      return [];
    }

    try {
      setLoading(true);
      setError(null);



      console.log("Url: ", supabaseUrl, "Key:", supabaseAnonKey)

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const result = await window.printerAPI.syncPrinterStatus({
        shopId,
        accessToken,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_KEY
      });

      if (result.success && result.printers) {
        setPrinters(result.printers);
        console.log('✅ Synced printer status:', result.printers);
        return result.printers;
      } else {
        throw new Error(result.error || 'Failed to sync printer status');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error syncing printer status:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [shopId, getAccessToken]);

  // Start automatic monitoring
  const startMonitoring = useCallback(async () => {
    if (!window.printerAPI) {
      setError('Printer API not available');
      return;
    }

    if (!shopId) {
      console.warn('⚠️ Cannot start monitoring: missing shopId');
      return;
    }

    if (monitoringStartedRef.current) {
      console.log('ℹ️ Monitoring already started');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      const result = await window.printerAPI.startMonitoring({
        shopId,
        accessToken,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY
      });

      if (result.success) {
        setIsMonitoring(true);
        monitoringStartedRef.current = true;
        
        if (result.printers) {
          setPrinters(result.printers);
        }

        console.log('✅ Printer monitoring started');
      } else {
        throw new Error(result.error || 'Failed to start monitoring');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Error starting monitoring:', err);
    } finally {
      setLoading(false);
    }
  }, [shopId, getAccessToken]);

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    if (!window.printerAPI) return;

    try {
      await window.printerAPI.stopMonitoring();
      setIsMonitoring(false);
      monitoringStartedRef.current = false;
      console.log('🛑 Printer monitoring stopped');
    } catch (err: any) {
      console.error('❌ Error stopping monitoring:', err);
    }
  }, []);

  // Listen to real-time status changes from Electron
  useEffect(() => {
    if (!window.printerAPI) {
      console.warn('⚠️ Printer API not available');
      return;
    }

    const handleStatusChange = (updatedPrinters: AppPrinter[]) => {
      console.log('📡 Printer status update received:', updatedPrinters);
      setPrinters(updatedPrinters);
    };

    window.printerAPI.onStatusChanged(handleStatusChange);

    return () => {
      window.printerAPI.removeStatusListener();
    };
  }, []);

  // Auto-start monitoring when component mounts
  useEffect(() => {
    if (shopId && user && !monitoringStartedRef.current) {
      startMonitoring();
    }

    return () => {
      if (monitoringStartedRef.current) {
        stopMonitoring();
      }
    };
  }, [shopId, user, startMonitoring, stopMonitoring]);

  return {
    printers,
    systemPrinters,
    isMonitoring,
    loading,
    error,
    detectSystemPrinters,
    syncPrinterStatus,
    startMonitoring,
    stopMonitoring
  };
}