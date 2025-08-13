import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // User password reset with proper redirect
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please check if the email exists.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">Reset Email Sent!</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to <strong>{email}</strong>. 
            Please check your inbox and click the link to reset your password.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Mail className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm font-semibold text-green-800">✅ Email Sent to Inbox</p>
            </div>
            <p className="text-sm text-green-700">
              Password reset emails are delivered directly to your inbox. If you don't see it within 2-3 minutes, check your spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/signin')}
              className="w-full bg-[#4A0E67] text-white py-2 px-4 rounded hover:bg-[#3a0b50] transition-colors"
            >
              Back to Sign In
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/signin')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft size={20} className="text-[#4A0E67]" />
          </button>
          <h1 className="text-2xl font-bold text-[#4A0E67]">Reset Password</h1>
        </div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#4A0E67] rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#4A0E67] font-semibold mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4A0E67] text-white py-3 rounded font-bold hover:bg-[#3a0b50] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            to="/signin" 
            className="text-[#4A0E67] hover:underline"
          >
            Back to Sign In
          </Link>
        </div>

        {/* Email Delivery Tips */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">📧 Email Delivery Tips:</h3>
          <ul className="text-xs text-blue-700 space-y-1 text-left">
            <li>• Password reset emails go directly to inbox</li>
            <li>• Check spam folder if not received in 3 minutes</li>
            <li>• Add lizexpressltd.com to trusted senders</li>
            <li>• Contact support if no email received</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;