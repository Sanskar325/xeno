import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Don't show header on dashboard pages
  const isDashboard = router.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      {user && !isDashboard && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">

              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.displayName || user.email}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main>{children}</main>
    </div>
  );
}