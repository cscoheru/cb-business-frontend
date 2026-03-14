'use client';

import { useEffect } from 'react';

export function ForceHttpsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Override fetch to force HTTPS for api.zenconsult.top
    const originalFetch = window.fetch;
    window.fetch = function(url: RequestInfo | URL, options?: RequestInit): Promise<Response> {
      // Convert URL to string
      const urlStr = url.toString();

      // Force HTTPS for api.zenconsult.top
      if (urlStr.includes('http://api.zenconsult.top')) {
        const httpsUrl = urlStr.replace('http://api.zenconsult.top', 'https://api.zenconsult.top');
        console.log('⚠️ Forced HTTP to HTTPS:', urlStr, '→', httpsUrl);
        return originalFetch(httpsUrl, options);
      }

      // Log all api.zenconsult.top requests for debugging
      if (urlStr.includes('api.zenconsult.top')) {
        console.log('📡 API Request:', urlStr);
      }

      return originalFetch(url, options);
    };

    // Also intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
      const urlStr = url.toString();
      if (urlStr.includes('http://api.zenconsult.top')) {
        const httpsUrl = urlStr.replace('http://api.zenconsult.top', 'https://api.zenconsult.top');
        console.log('⚠️ Forced XHR HTTP to HTTPS:', urlStr, '→', httpsUrl);
        arguments[1] = httpsUrl;
      }
      return originalXHROpen.apply(this, arguments as any);
    };

    console.log('✅ HTTPS Force Provider initialized');
  }, []);

  return <>{children}</>;
}
