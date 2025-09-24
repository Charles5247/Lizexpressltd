import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ResetPassword from './auth/ResetPassword';

const HomePageHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is an auth callback (email confirmation or password reset)
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const type = urlParams.get('type');
    const token = urlParams.get('token');
    
    // Also check hash parameters (alternative format)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const hashType = hashParams.get('type');
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const errorParam = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    console.log('Homepage handler - checking for auth callback:', { 
      code, 
      token, 
      type, 
      hashType,
      accessToken,
      refreshToken,
      errorParam,
      errorDescription,
      search: location.search,
      hash: location.hash 
    });

    // Handle email confirmation (signup)
    if (type === 'signup' || (accessToken && refreshToken && !hashType)) {
      console.log('🔄 Detected email confirmation, redirecting...');
      navigate('/email-confirmation', { replace: true });
      return;
    }

    // Handle password reset
    if (code || type === 'recovery' || hashType === 'recovery' || (accessToken && refreshToken && hashType === 'recovery')) {
      console.log('🔄 Detected password reset, redirecting...');
      navigate('/reset-password', { replace: true });
      return;
    }
    
    // Handle auth errors
    if (errorParam) {
      console.log('🔄 Detected auth error, redirecting to confirmation...');
      navigate('/email-confirmation', { replace: true });
      return;
    }
  }, [location, navigate]);

  return <LandingPage />;
};

export default HomePageHandler;