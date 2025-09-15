import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }) {
  const { user, loading, firebaseError } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user && !firebaseError) {
      router.push('/login');
    }
  }, [user, loading, firebaseError, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (firebaseError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Firebase Configuration Error</h3>
            <p className="text-sm text-gray-600 mb-4">
              Firebase is not properly configured. Please check your environment variables.
            </p>
            <div className="bg-gray-100 rounded-md p-3 text-left">
              <p className="text-xs text-gray-700 font-mono">
                Error: {firebaseError}
              </p>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>To fix this issue:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file in the frontend directory</li>
                <li>Add your Firebase project credentials</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return children;
}