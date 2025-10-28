'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, X } from 'lucide-react';
import { useNetworkStatus } from '@/lib/api';

export function OfflineBanner() {
  const { isOnline, isOffline } = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client side to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run network effects until client-side
    
    if (isOffline && !wasOffline) {
      setShowBanner(true);
      setWasOffline(true);
    } else if (isOnline && wasOffline) {
      // Show "back online" message briefly
      setShowBanner(true);
      setWasOffline(false);
      
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, isOffline, wasOffline, isClient]);

  // Don't render anything on server side to prevent hydration mismatch
  if (!isClient || !showBanner) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-sm font-medium text-white transition-all duration-300 ${
      isOffline 
        ? 'bg-red-600' 
        : 'bg-green-600'
    }`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          {isOffline ? (
            <WifiOff className="w-4 h-4" />
          ) : (
            <Wifi className="w-4 h-4" />
          )}
          <span>
            {isOffline 
              ? 'คุณอยู่ในโหมดออฟไลน์ - แสดงข้อมูลที่บันทึกไว้'
              : 'เชื่อมต่ออินเทอร์เน็ตแล้ว'
            }
          </span>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="ปิดแบนเนอร์"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}