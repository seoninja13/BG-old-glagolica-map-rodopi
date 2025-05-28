'use client';
// app/page.jsx
import { useState, useEffect } from 'react';
import MapComponent from '@/components/MapComponent';

export default function HomePage() {
  const [mapConfig, setMapConfig] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/map');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Error: ${response.status}`);
        }
        setMapConfig(data);
      } catch (err) {
        console.error("Failed to fetch map config:", err);
        setError(err.message || "Could not load map configuration.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapConfig();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8 font-inter">
      <main className="w-full max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Interactive Geographic Triangle
        </h1>
        
        {isLoading && (
          <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-xl">
            <p className="text-gray-500">Loading Map...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-xl p-6 text-center">
            <p className="text-red-500 font-semibold text-lg">Could not load map:</p>
            <p className="text-gray-700 mt-2">{error}</p>
            {error.includes("Rate limit exceeded") && (
              <p className="text-sm text-gray-500 mt-4">
                You've reached the maximum number of views for this hour. Please try again later.
              </p>
            )}
          </div>
        )}

        {!isLoading && !error && mapConfig && (
          <div className="w-full h-[60vh] md:h-[70vh] bg-white p-2 rounded-lg shadow-xl">
            <MapComponent 
              apiKey={mapConfig.apiKey} 
              locations={mapConfig.locations} 
            />
          </div>
        )}

        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>
            This interactive map displays the geographic triangle connecting important historical locations.
          </p>
        </div>
      </main>
    </div>
  );
}
