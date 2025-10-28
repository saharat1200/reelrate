'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Skip waiting and activate new service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const waitingWorker = registration.waiting;
        
        if (waitingWorker) {
          waitingWorker.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for controlling change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        }
      }
    } catch (error) {
      console.error('Failed to update app:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <RefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                อัปเดตใหม่พร้อมใช้งาน
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                เวอร์ชันใหม่ของแอปพร้อมแล้ว
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-green-400 hover:text-green-600 dark:hover:text-green-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-green-700 dark:text-green-300 mb-4">
          รีเฟรชแอปเพื่อใช้งานฟีเจอร์ใหม่และการปรับปรุงต่างๆ
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 text-sm bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} suppressHydrationWarning />
            {isUpdating ? 'กำลังอัปเดต...' : 'อัปเดตเลย'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="text-sm border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
            size="sm"
          >
            ภายหลัง
          </Button>
        </div>
      </div>
    </div>
  );
}