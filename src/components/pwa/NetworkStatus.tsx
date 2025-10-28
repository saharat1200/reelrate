'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { pwaManager } from '@/lib/pwa';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run network effects until client-side
    
    // Set initial status
    setIsOnline(pwaManager.isOnline());

    // Listen for network changes
    const cleanup = pwaManager.onNetworkChange((online) => {
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineMessage(true);
      } else {
        // Hide offline message after coming back online
        setTimeout(() => setShowOfflineMessage(false), 3000);
      }
    });

    return cleanup;
  }, [isClient]);

  // Auto-hide offline message after 5 seconds
  useEffect(() => {
    if (!isClient) return; // Don't run effects until client-side
    
    if (showOfflineMessage && !isOnline) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showOfflineMessage, isOnline, isClient]);

  // Don't render anything on server side to prevent hydration mismatch
  if (!isClient || (!showOfflineMessage && isOnline)) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
        isOnline 
          ? 'bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
          : 'bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
      }`}>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                กลับมาออนไลน์แล้ว
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                ไม่มีการเชื่อมต่ออินเทอร์เน็ต
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}