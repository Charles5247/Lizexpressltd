import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import ResetPassword from './auth/ResetPassword';

const HomePageHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is an auth callback using hash parameters (Supabase modern flow)
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const type = hashParams.get('type');
    const errorParam = hashParams.get('error');
    
    console.log('Homepage handler - checking for auth callback:', { 
      type,
      hasTokens: !!(accessToken && refreshToken),
      errorParam,
      hash: location.hash 
    });

    // Only redirect if we have actual auth tokens/parameters
    if (accessToken && refreshToken) {
      if (type === 'signup') {
        console.log('🔄 Detected email confirmation, redirecting...');
        navigate('/email-confirmation', { replace: true });
        return;
      }
      
      if (type === 'recovery') {
        console.log('🔄 Detected password reset, redirecting...');
        navigate('/reset-password', { replace: true });
        return;
      }
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