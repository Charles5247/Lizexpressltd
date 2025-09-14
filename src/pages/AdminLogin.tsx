import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, UserPlus, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin using the function
        const { data: isAdminResult } = await supabase.rpc('is_admin', {
          user_email: session.user.email
        });

        if (isAdminResult) {
          navigate('/admin/dashboard');
        }
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Admin Sign Up
        if (credentials.password !== credentials.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (credentials.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        console.log('Creating admin account...', credentials.email);

        // Create the admin account using RPC
        const { data, error: rpcError } = await supabase.rpc('create_admin_account', {
          admin_email: credentials.email,
          admin_password: credentials.password,
          admin_name: credentials.fullName
        });

        if (rpcError) {
          console.error('RPC Error:', rpcError);
          throw new Error(rpcError.message || 'Failed to create admin account');
        }

        if (!data?.success) {
          throw new Error(data?.error || 'Failed to create admin account');
        }

        alert('✅ Admin account created successfully! You can now sign in.');
        setIsSignUp(false);
        setCredentials({
          email: credentials.email,
          password: '',
          confirmPassword: '',
          fullName: ''
        });

      } else {
        // Admin Sign In
        console.log('🔐 Attempting admin login...', credentials.email);

        // First try to authenticate as admin using RPC
        const { data: adminAuth, error: adminError } = await supabase.rpc('authenticate_admin', {
          admin_email: credentials.email,
          admin_password: credentials.password
        });

        if (adminError) {
          console.error('Admin auth error:', adminError);
          throw new Error('Authentication failed: ' + adminError.message);
        }

        if (!adminAuth?.success) {
          throw new Error(adminAuth?.error || 'Invalid admin credentials');
        }

        // Now sign in with Supabase Auth using the admin email
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        // If Supabase auth fails, try to create the auth user
        if (authError && authError.message.includes('Invalid login credentials')) {
          console.log('Creating Supabase auth user for admin...');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              emailRedirectTo: undefined // Skip email confirmation
            }
          });

          if (signUpError) {
            console.error('Failed to create auth user:', signUpError);
            throw new Error('Failed to create authentication user');
          }

          // Try signing in again
          const { data: retryAuth, error: retryError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          });

          if (retryError) {
            console.error('Retry auth failed:', retryError);
            throw new Error('Authentication setup failed');
          }
        } else if (authError) {
          console.error('Auth error:', authError);
          throw new Error('Authentication failed: ' + authError.message);
        }

        console.log('✅ Admin login successful:', adminAuth.admin.email);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Admin auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt('Enter your admin email:');
    if (!email) return;

    try {
      setLoading(true);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/admin/reset-password',
      });

      if (error) throw error;

      alert(`Password reset instructions have been sent to ${email}`);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      alert('Unable to process password reset. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0E67] to-[#2d0a3d] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4A0E67] to-[#5a1077] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A0E67] mb-2">
            {isSignUp ? 'Create Admin Account' : 'Admin Portal'}
          </h1>
          <p className="text-gray-600 font-medium">
            {isSignUp ? 'Join the LizExpress Admin Team' : 'LizExpress Administration System'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#4A0E67] font-semibold mb-3 flex items-center">
              <Mail size={16} className="mr-2" />
              Admin Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 transition-all duration-300"
              placeholder="Enter admin email"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[#4A0E67] font-semibold mb-3">Full Name</label>
              <input
                type="text"
                value={credentials.fullName}
                onChange={(e) => setCredentials({ ...credentials, fullName: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 transition-all duration-300"
                placeholder="Enter full name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[#4A0E67] font-semibold mb-3 flex items-center">
              <Lock size={16} className="mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 pr-12 transition-all duration-300"
                placeholder="Enter password"
                required
                minLength={isSignUp ? 8 : 1}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-[#4A0E67] font-semibold mb-3">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={credentials.confirmPassword}
                  onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 pr-12 transition-all duration-300"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4A0E67] to-[#5a1077] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center transform hover:scale-105"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isSignUp ? <UserPlus size={20} className="mr-2" /> : <Shield size={20} className="mr-2" />}
                {isSignUp ? 'Create Admin Account' : 'Sign In to Dashboard'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <div className="text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setCredentials({ email: '', password: '', confirmPassword: '', fullName: '' });
              }}
              className="text-[#4A0E67] hover:underline font-medium transition-colors"
            >
              {isSignUp ? '← Back to Sign In' : 'Create New Admin Account →'}
            </button>
          </div>

          {!isSignUp && (
            <div className="text-center">
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-[#F7941D] hover:underline font-medium transition-colors disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/"
              className="text-[#4A0E67] hover:underline font-medium transition-colors"
            >
              ← Return to Main Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;