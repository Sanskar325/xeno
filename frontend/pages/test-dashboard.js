import { useAuth } from '../contexts/AuthContext';

export default function TestDashboard() {
  const { user, loading, logout } = useAuth();

  console.log('TestDashboard - User:', user);
  console.log('TestDashboard - Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Dashboard</h1>
              <p className="text-gray-600">
                {user ? `Welcome, ${user.email}` : 'Not logged in'}
              </p>
            </div>
            <div className="flex space-x-4">
              {user ? (
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              ) : (
                <a
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Authentication Status
            </h3>
            
            <div className="space-y-2">
              <p><strong>User:</strong> {user ? user.email : 'Not logged in'}</p>
              <p><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>User ID:</strong> {user?.uid || 'None'}</p>
            </div>

            {user ? (
              <div className="mt-6">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <h4 className="font-medium">Success!</h4>
                  <p className="text-sm">You are successfully logged in and can access the dashboard.</p>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <h4 className="font-medium">Not Authenticated</h4>
                  <p className="text-sm">Please log in to access the dashboard.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}