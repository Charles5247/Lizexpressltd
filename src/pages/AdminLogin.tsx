import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Default admin credentials (will implement registration later)
    if (credentials.email === 'admin@lizexpress.com' && credentials.password === 'Lizexpress@2025') {
      localStorage.setItem('adminSession', JSON.stringify({
        email: credentials.email,
        loginTime: new Date().toISOString(),
        role: 'admin',
        authenticated: true
      }));
      
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Access denied.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A0E67] to-[#2d0a3d] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4A0E67] to-[#5a1077] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A0E67] mb-2">Admin Portal</h1>
          <p className="text-gray-600 font-medium">LizExpress Administration System</p>
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
            <label className="block text-[#4A0E67] font-semibold mb-3">Admin Email</label>
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
            <label className="block text-[#4A0E67] font-semibold mb-3">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 pr-12 transition-all duration-300"
                placeholder="Enter admin password"
                required
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#4A0E67] to-[#5a1077] text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center transform hover:scale-105"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Access Admin Dashboard'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-[#4A0E67] hover:underline font-medium transition-colors"
          >
            ← Return to Main Site
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center">
            Default Credentials: admin@lizexpress.com / Lizexpress@2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;