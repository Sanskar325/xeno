import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export default function EmailVerificationGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !user.emailVerified) {
      // Only redirect if not already on verify-email page
      if (router.pathname !== '/verify-email') {
        router.push('/verify-email');
      }
    }
  }, [user, loading, router]);

  // Don't render children if user is not verified
  if (!loading && user && !user.emailVerified && router.pathname !== '/verify-email') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting to email verification...</p>
        </div>
      </div>
    );
  }

  return children;
}


