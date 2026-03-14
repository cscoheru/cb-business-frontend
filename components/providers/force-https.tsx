'use client';

import { useEffect } from 'react';

/**
 * ForceHttpsProvider - Ensures all API requests use HTTPS
 *
 * This provider intercepts fetch and XMLHttpRequest to automatically
 * convert any HTTP requests to api.zenconsult.top into HTTPS.
 *
 * Combined with the CSP upgrade-insecure-requests policy in layout.tsx,
 * this provides comprehensive HTTPS enforcement at multiple levels.
 */
export function ForceHttpsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Intercept fetch to force HTTPS
    const originalFetch = window.fetch;
    window.fetch = function(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
      const urlStr = url.toString();

      // Force HTTPS for api.zenconsult.top
      if (urlStr.includes('http://api.zenconsult.top')) {
        const httpsUrl = urlStr.replace('http://api.zenconsult.top', 'https://api.zenconsult.top');
        return originalFetch(httpsUrl, options);
      }

      return originalFetch(url, options);
    };

    // Intercept XMLHttpRequest to force HTTPS
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
      const urlStr = url.toString();
      if (urlStr.includes('http://api.zenconsult.top')) {
        const httpsUrl = urlStr.replace('http://api.zenconsult.top', 'https://api.zenconsult.top');
        arguments[1] = httpsUrl;
      }
      return originalXHROpen.apply(this, arguments as any);
    };
  }, []);

  return <>{children}</>;
}
