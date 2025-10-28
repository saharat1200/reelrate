'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { pwaManager } from '@/lib/pwa';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleInstallAvailable = () => {
      // Show prompt after a delay if user hasn't dismissed it
      const hasPromptBeenDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasPromptBeenDismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    const handleInstallCompleted = () => {
      setShowPrompt(false);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      console.log('PWA was installed successfully');
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-completed', handleInstallCompleted);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaManager.showInstallPrompt();
      if (success) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if no prompt available
  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                ติดตั้ง ReelRate
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                เพิ่มไปยังหน้าจอหลัก
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            ติดตั้งแอปเพื่อประสบการณ์ที่ดีขึ้น:
          </p>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4" />
              <span>เข้าถึงได้แม้ไม่มีอินเทอร์เน็ต</span>
            </li>
            <li className="flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>การแจ้งเตือนแบบ Push</span>
            </li>
            <li className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>เปิดเร็วขึ้น</span>
            </li>
          </ul>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="flex-1 text-sm"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isInstalling ? 'กำลังติดตั้ง...' : 'ติดตั้งแอป'}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="outline"
            className="text-sm"
            size="sm"
          >
            ไม่ใช่ตอนนี้
          </Button>
        </div>
      </div>
    </div>
  );
}