'use client';

export default function DebugEnvPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Environment Variables Debug</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>API URL Configuration:</h2>
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
        <p><strong>Fallback URL:</strong> https://api.zenconsult.top</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Test API Call:</h2>
        <button
          onClick={async () => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top';
            const url = `${apiUrl}/api/v1/opportunities/?limit=1`;

            console.log('Fetching from:', url);

            try {
              const response = await fetch(url);
              const data = await response.json();
              console.log('Response:', data);
              alert(`Success! API URL: ${url}\nResponse: ${JSON.stringify(data, null, 2)}`);
            } catch (error) {
              console.error('Error:', error);
              alert(`Error fetching from: ${url}\n${error}`);
            }
          }}
        >
          Test API Call (Check Console)
        </button>
      </div>

      <div style={{ padding: '10px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Current Configuration:</h3>
        <p>Build Time API URL: <code>{process.env.NEXT_PUBLIC_API_URL || 'https://api.zenconsult.top'}</code></p>
        <p>Is HTTPS: {String(process.env.NEXT_PUBLIC_API_URL?.startsWith('https://') || 'true (fallback)')}</p>
      </div>
    </div>
  );
}
