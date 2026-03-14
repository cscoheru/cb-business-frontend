'use client';

import { useState } from 'react';

export default function DebugEnvPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [actualUrlUsed, setActualUrlUsed] = useState<string>('');

  const testApiCall = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';
    const url = `${apiUrl}/api/v1/opportunities/?limit=1`;

    setActualUrlUsed(url);
    console.log('=== API URL Debug ===');
    console.log('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Final URL to fetch:', url);
    console.log('Is HTTPS:', url.startsWith('https://'));

    try {
      // 使用 fetch 并在拦截器中打印实际 URL
      const response = await fetch(url);
      const data = await response.json();

      setTestResult(`✅ SUCCESS!\n\nURL: ${url}\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);
      console.log('Response:', data);
    } catch (error) {
      setTestResult(`❌ ERROR!\n\nURL: ${url}\nError: ${error}`);
      console.error('Error:', error);
    }
  };

  const testRawFetch = async () => {
    const testUrls = [
      'https://api.zenconsult.top/health',
      'http://api.zenconsult.top/health'  // This will fail due to Mixed Content
    ];

    for (const url of testUrls) {
      console.log(`Testing: ${url}`);
      try {
        const response = await fetch(url);
        console.log(`✅ ${url} - Status: ${response.status}`);
      } catch (error) {
        console.error(`❌ ${url} - Error: ${error}`);
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>🔍 Environment Variables Debug</h1>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Environment Variables:</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> <code style={{ background: '#fff', padding: '2px 5px' }}>{process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</code></p>
        <p><strong>Fallback URL:</strong> <code>https://api.zenconsult.top</code></p>
        <p><strong>Is HTTPS:</strong> <strong>{String(process.env.NEXT_PUBLIC_API_URL?.startsWith('https://') || 'true (fallback)')}</strong></p>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f4f8', borderRadius: '5px' }}>
        <h2>Test API Call:</h2>
        <button
          onClick={testApiCall}
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Test API Call (Check Console)
        </button>
        {actualUrlUsed && (
          <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
            Actual URL: <code style={{ background: '#fff', padding: '2px 5px' }}>{actualUrlUsed}</code>
          </p>
        )}
      </div>

      {testResult && (
        <div style={{ marginBottom: '20px', padding: '15px', background: testResult.includes('SUCCESS') ? '#d4edda' : '#f8d7da', borderRadius: '5px' }}>
          <h3>Result:</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{testResult}</pre>
        </div>
      )}

      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '5px' }}>
        <h2>Raw Fetch Test:</h2>
        <button
          onClick={testRawFetch}
          style={{
            padding: '10px 20px',
            background: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Test Raw Fetch (Console)
        </button>
        <p style={{ fontSize: '12px', marginTop: '10px' }}>This will test both HTTPS and HTTP URLs. Check console for results.</p>
      </div>

      <div style={{ padding: '15px', background: '#d1ecf1', borderRadius: '5px' }}>
        <h3>Instructions:</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>Click "Test API Call" button</li>
          <li>Check the browser <strong>Console</strong> for detailed logs</li>
          <li>Look for the actual URL being used</li>
          <li>If you see "http://" in the URL, that's the problem!</li>
        </ol>
      </div>
    </div>
  );
}
