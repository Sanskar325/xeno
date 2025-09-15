import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function EmailVerification({ onVerified }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, sendVerificationEmail, refreshUser } = useAuth();

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      await sendVerificationEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      await refreshUser();
      if (user?.emailVerified) {
        setMessage('Email verified successfully!');
        onVerified && onVerified();
      } else {
        setMessage('Email not verified yet. Please check your email and click the verification link.');
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification email to <strong>{user?.email}</strong>. 
          Please check your inbox and click the verification link.
        </p>
        
        {message && (
          <div className={`mb-4 p-3 rounded ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'I\'ve Verified My Email'}
          </button>
          
          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </div>
      </div>
    </div>
  );
}