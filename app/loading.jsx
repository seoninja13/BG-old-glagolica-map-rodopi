// app/loading.jsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
          Interactive Geographic Triangle
        </h1>
        
        <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading application...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
