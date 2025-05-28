// app/not-found.jsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Page Not Found
        </h1>
        
        <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-xl p-6 text-center">
          <p className="text-gray-700 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/"
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
