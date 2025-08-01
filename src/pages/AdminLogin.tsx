import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle, UserPlus, Mail, Lock } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    adminCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin accounts storage (in production, use a proper database)
  const getAdminAccounts = () => {
    const stored = localStorage.getItem('adminAccounts');
    return stored ? JSON.parse(stored) : [
      {
        email: 'admin@lizexpress.com',
        password: 'Lizexpress@2025',
        role: 'super_admin',
        created_at: new Date().toISOString()
      }
    ];
  };

  const saveAdminAccounts = (accounts: any[]) => {
    localStorage.setItem('adminAccounts', JSON.stringify(accounts));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const adminAccounts = getAdminAccounts();

      if (isSignUp) {
        // Admin Sign Up
        if (credentials.password !== credentials.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (credentials.password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        if (credentials.adminCode !== 'LIZEXPRESS2025') {
          throw new Error('Invalid admin code. Contact super admin for access.');
        }

        // Check if email already exists
        if (adminAccounts.find(admin => admin.email === credentials.email)) {
          throw new Error('Admin account with this email already exists');
        }

        // Create new admin account
        const newAdmin = {
          email: credentials.email,
          password: credentials.password,
          role: 'admin',
          created_at: new Date().toISOString()
        };

        adminAccounts.push(newAdmin);
        saveAdminAccounts(adminAccounts);

        alert('✅ Admin account created successfully! You can now sign in.');
        setIsSignUp(false);
        setCredentials({ email: credentials.email, password: '', confirmPassword: '', adminCode: '' });
      } else {
        // Admin Sign In
        const admin = adminAccounts.find(
          admin => admin.email === credentials.email && admin.password === credentials.password
        );

        if (!admin) {
          throw new Error('Invalid admin credentials. Access denied.');
        }

        // Create admin session
        const adminSession = {
          email: admin.email,
          role: admin.role,
          loginTime: new Date().toISOString(),
          authenticated: true
        };

        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        console.log('✅ Admin login successful:', admin.email);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const email = prompt('Enter your admin email:');
    if (email) {
      const adminAccounts = getAdminAccounts();
      const admin = adminAccounts.find(a => a.email === email);
      
      if (admin) {
        alert(`Your password is: ${admin.password}\n\nFor security, please change it after logging in.`);
      } else {
        alert('Admin account not found. Contact super admin for assistance.');
      }
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
            <>
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

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-3">Admin Access Code</label>
                <input
                  type="password"
                  value={credentials.adminCode}
                  onChange={(e) => setCredentials({ ...credentials, adminCode: e.target.value })}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 transition-all duration-300"
                  placeholder="Enter admin access code"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Contact super admin for access code</p>
              </div>
            </>
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
                {isSignUp ? 'Create Admin Account' : 'Access Admin Dashboard'}
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
                setCredentials({ email: '', password: '', confirmPassword: '', adminCode: '' });
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
                className="text-[#F7941D] hover:underline font-medium transition-colors"
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

        {!isSignUp && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              <strong>Default Credentials:</strong><br />
              Email: admin@lizexpress.com<br />
              Password: Lizexpress@2025
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;