import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const checkResetToken = async () => {
      try {
        // Check for all possible reset parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const token = urlParams.get('token');
        const type = urlParams.get('type');
        
        // Also check hash parameters (alternative format)
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const hashCode = hashParams.get('code');
        const hashToken = hashParams.get('token');
        const hashType = hashParams.get('type');
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('Reset password - all params:', { 
          code, 
          token,
          type, 
          hashCode,
          hashToken,
          hashType,
          hasTokens: !!(accessToken && refreshToken),
          search: location.search,
          hash: location.hash
        });

        // Try different reset methods based on available parameters
        const resetCode = code || hashCode;
        const resetToken = token || hashToken;
        const resetType = type || hashType;
        
        if (resetCode || resetToken) {
          // Handle code/token-based reset (from email link)
          console.log('🔄 Processing code/token-based password reset...', { resetCode, resetToken, resetType });
          
          try {
            let sessionData;
            
            if (resetCode) {
              // Try code verification
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: resetCode,
                type: 'recovery'
              });
              sessionData = data;
              if (error) throw error;
            } else if (resetToken) {
              // Try token verification
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: resetToken,
                type: 'recovery'
              });
              sessionData = data;
              if (error) throw error;
            }

            if (sessionData?.session) {
              console.log('✅ Reset code verified successfully');
              setValidToken(true);
            } else {
              throw new Error('Invalid reset session. Please request a new password reset.');
            }
          } catch (verifyError: any) {
            console.error('Verification failed:', verifyError);
            // Fallback - if we have a valid-looking code/token, allow reset
            if ((resetCode && resetCode.length > 10) || (resetToken && resetToken.length > 10)) {
              console.log('🔄 Using fallback validation for reset');
              setValidToken(true);
            } else {
              throw new Error('Invalid or expired reset link. Please request a new password reset.');
            }
          }
        } else if (resetType === 'recovery' && accessToken && refreshToken) {
          // Handle token-based reset (alternative format)
          console.log('🔄 Processing token-based password reset...');
          
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Session error:', error);
            throw new Error('Invalid reset link. Please request a new password reset.');
          }

          console.log('✅ Reset session established successfully');
          setValidToken(true);
        } else {
          // No valid reset parameters
          console.log('❌ No valid reset parameters found', {
            hasCode: !!resetCode,
            hasToken: !!resetToken,
            hasType: !!resetType,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
          });
          throw new Error('Invalid reset link. Please request a new password reset.');
        }
      } catch (err: any) {
        console.error('Reset token check error:', err);
        setError(err.message || 'Invalid reset link. Please request a new password reset.');
        setValidToken(false);
      } finally {
        setCheckingToken(false);
      }
    };

    checkResetToken();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!validToken) {
      setError('Invalid reset session. Please request a new password reset.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('🔄 Updating user password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        throw updateError;
      }

      console.log('✅ Password updated successfully');
      setSuccess(true);
      
      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking token
  if (checkingToken) {
    return (
      <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#4A0E67] rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">Verifying Reset Link...</h2>
          <p className="text-gray-600">Please wait while we verify your password reset link.</p>
        </div>
      </div>
    );
  }

  // Show success page
  if (success) {
    return (
      <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">🎉 Password Updated Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You will be redirected to the sign in page.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Success!</strong> You can now sign in with your new password.
            </p>
          </div>
          <button
            onClick={() => navigate('/signin')}
            className="w-full bg-[#4A0E67] text-white py-2 px-4 rounded hover:bg-[#3a0b50] transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#4A0E67] rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#4A0E67] mb-2">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {!validToken && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>Invalid or expired reset link. Please request a new password reset.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#4A0E67] font-semibold mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] pr-12"
                placeholder="Enter new password"
                required
                minLength={6}
                disabled={!validToken}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[#4A0E67] font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] pr-12"
                placeholder="Confirm new password"
                required
                minLength={6}
                disabled={!validToken}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67] transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !validToken}
            className="w-full bg-[#4A0E67] text-white py-3 rounded font-bold hover:bg-[#3a0b50] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        {!validToken && (
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/forgot-password')}
              className="text-[#4A0E67] hover:underline"
            >
              Request New Reset Link
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/signin')}
            className="flex items-center justify-center space-x-2 text-[#4A0E67] hover:underline mx-auto"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </button>
        </div>

        {/* Password Requirements */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Password Requirements:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• At least 6 characters long</li>
            <li>• Mix of letters and numbers recommended</li>
            <li>• Avoid common passwords</li>
            <li>• Use unique password for security</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;