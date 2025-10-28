'use client';

import { useEffect, useState, useCallback } from 'react';

interface ScreenSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isFoldable: boolean;
  isLandscape: boolean;
}

export function useResizeHandler() {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isFoldable: false,
    isLandscape: false,
  });

  const [isResizing, setIsResizing] = useState(false);

  const calculateScreenSize = useCallback((width: number, height: number): ScreenSize => {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const isFoldable = width <= 320 || (width <= 360 && height <= 400);
    const isLandscape = width > height;

    return {
      width,
      height,
      isMobile,
      isTablet,
      isDesktop,
      isFoldable,
      isLandscape,
    };
  }, []);

  const handleResize = useCallback(() => {
    setIsResizing(true);
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setScreenSize(calculateScreenSize(width, height));
    
    // Clear resizing state after a short delay
    setTimeout(() => {
      setIsResizing(false);
    }, 150);
  }, [calculateScreenSize]);

  useEffect(() => {
    // Set initial size
    if (typeof window !== 'undefined') {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => {
        handleResize();
      }, 0);
    }

    // Add event listener
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  // Force re-render on screen fold/unfold
  const forceRefresh = useCallback(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, []);

  return {
    screenSize,
    isResizing,
    forceRefresh,
  };
}