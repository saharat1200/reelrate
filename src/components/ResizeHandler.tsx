'use client';

import { useEffect } from 'react';
import { useResizeHandler } from '@/hooks/useResizeHandler';

interface ResizeHandlerProps {
  children: React.ReactNode;
}

export default function ResizeHandler({ children }: ResizeHandlerProps) {
  const { screenSize, isResizing, forceRefresh } = useResizeHandler();

  useEffect(() => {
    // Handle screen fold/unfold detection
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again, might be after unfolding
        setTimeout(() => {
          forceRefresh();
        }, 200);
      }
    };

    // Handle orientation change
    const handleOrientationChange = () => {
      setTimeout(() => {
        forceRefresh();
      }, 300);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [forceRefresh]);

  // Add CSS classes based on screen size
  useEffect(() => {
    const body = document.body;
    
    // Remove existing classes
    body.classList.remove('is-mobile', 'is-tablet', 'is-desktop', 'is-foldable', 'is-resizing');
    
    // Add current classes
    if (screenSize.isMobile) body.classList.add('is-mobile');
    if (screenSize.isTablet) body.classList.add('is-tablet');
    if (screenSize.isDesktop) body.classList.add('is-desktop');
    if (screenSize.isFoldable) body.classList.add('is-foldable');
    if (isResizing) body.classList.add('is-resizing');
  }, [screenSize, isResizing]);

  return <>{children}</>;
}