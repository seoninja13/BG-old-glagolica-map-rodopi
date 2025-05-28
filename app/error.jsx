'use client';
// app/error.jsx
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Something went wrong
        </h1>
        
        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-xl p-6 text-center">
          <p className="text-red-500 font-semibold text-lg">Error:</p>
          <p className="text-gray-700 mt-2">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => reset()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
