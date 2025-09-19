import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ResetPassword from './auth/ResetPassword';

const HomePageHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is a password reset link - handle both URL formats
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
    
    console.log('Homepage handler - checking for reset:', { 
      code, 
      token, 
      type, 
      hashCode, 
      hashToken, 
      hashType,
      accessToken,
      refreshToken,
      search: location.search,
      hash: location.hash 
    });

    // Check for password reset indicators
    const isPasswordReset = 
      code || // Direct code parameter
      token || // Token parameter
      hashCode || // Hash code parameter
      hashToken || // Hash token parameter
      type === 'recovery' || // Recovery type
      hashType === 'recovery' || // Hash recovery type
      (accessToken && refreshToken && hashType === 'recovery'); // Full token reset
    
    if (isPasswordReset) {
      console.log('🔄 Detected password reset link, redirecting...');
      // Navigate to reset password page with all parameters
      const fullParams = location.search + (location.hash ? '&' + location.hash.substring(1) : '');
      navigate(`/reset-password${fullParams}`, { replace: true });
    }
  }, [location, navigate]);

  // Check if this should be a reset password page (for direct rendering)
  const urlParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(location.hash.substring(1));
  
  const hasResetCode = 
    urlParams.get('code') || 
    urlParams.get('token') ||
    urlParams.get('type') === 'recovery' ||
    hashParams.get('code') ||
    hashParams.get('token') ||
    hashParams.get('type') === 'recovery' ||
    (hashParams.get('access_token') && hashParams.get('refresh_token'));

  if (hasResetCode) {
    return <ResetPassword />;
  }

  return <LandingPage />;
};

export default HomePageHandler;