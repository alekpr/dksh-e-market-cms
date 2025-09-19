import React, { useEffect, useState } from 'react';

export function TestApiComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testApi = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Testing API call to /api/v1/store-layout-templates');
      
      const response = await fetch('/api/v1/store-layout-templates');
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      setData(result);
      
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApi();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">API Test Component</h3>
      
      <button 
        onClick={testApi}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded">
          Loading...
        </div>
      )}
    </div>
  );
}