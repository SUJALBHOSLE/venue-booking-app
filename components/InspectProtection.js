'use client';

import { useEffect } from 'react';

/**
 * Inspect Protection & WWW Domain Standardization Hook/Component
 * - Enforces www. canonical URL redirection
 * - Disables Right Click / Context Menu
 * - Disables DevTools shortcuts (F12, Ctrl+Shift+I, Cmd+Option+I, etc.)
 * - Runs anti-debugger trap to disrupt inspection
 */
export default function InspectProtection() {
  useEffect(() => {
    // 1. WWW Domain & HTTPS Standardization
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      const isLocalhost = host === 'localhost' || host === '127.0.0.1' || host.includes('192.168.');
      const isVercel = host.endsWith('.vercel.app');
      
      if (!isLocalhost && !isVercel && !host.startsWith('www.')) {
        const canonicalUrl = `https://www.${host}${window.location.pathname}${window.location.search}`;
        window.location.replace(canonicalUrl);
      }
    }

    // 2. Disable Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Disable DevTools & View Source Keyboard Shortcuts
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // F12 key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Opt+I (Inspect)
      if (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Opt+J (Console)
      if (cmdOrCtrl && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+C / Cmd+Opt+C (Element Selector)
      if (cmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U / Cmd+Opt+U (View Page Source)
      if ((cmdOrCtrl && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) || 
          (isMac && e.altKey && cmdOrCtrl && (e.key === 'U' || e.key === 'u'))) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page)
      if (cmdOrCtrl && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    };

    // 4. Anti-Debugger Loop
    let intervalId;
    if (process.env.NODE_ENV === 'production') {
      intervalId = setInterval(() => {
        const startTime = performance.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const endTime = performance.now();
        // If DevTools is open and paused execution, time gap will be > 100ms
        if (endTime - startTime > 100) {
          console.clear();
        }
      }, 1000);
    }

    // Attach Event Listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return null;
}
