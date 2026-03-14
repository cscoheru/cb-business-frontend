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

      return originalFetch(url, options);
    };
  }, []);

  return <>{children}</>;
}
