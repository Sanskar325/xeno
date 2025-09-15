import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Data Insights Dashboard
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Multi-tenant Shopify data ingestion and insights service
          </p>
          
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Data Sync</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Sync your Shopify store data including customers, orders, and products.
                </p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
                <p className="mt-2 text-sm text-gray-600">
                  View comprehensive analytics and insights about your store performance.
                </p>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Multi-tenant</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Support for multiple stores with isolated data and secure access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}