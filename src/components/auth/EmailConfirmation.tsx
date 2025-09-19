import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, User, Settings, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const EmailConfirmation: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already_confirmed'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get parameters from both URL and hash
        const urlParams = new URLSearchParams(location.search);
        const hashParams = new URLSearchParams(location.hash.substring(1));
        
        // Check URL parameters first
        const code = urlParams.get('code');
        const type = urlParams.get('type');
        const token = urlParams.get('token');
        
        // Then check hash parameters
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const hashType = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('Email confirmation params:', {
          code,
          type,
          token,
          hashType,
          errorParam,
          errorDescription, 
          hasTokens: !!(accessToken && refreshToken)
        });

        // Handle errors from Supabase
        if (errorParam) {
          if (errorParam === 'access_denied' && errorDescription?.includes('already_confirmed')) {
            setStatus('already_confirmed');
            setMessage('Your email is already confirmed! You can sign in now.');
            return;
          }
          throw new Error(errorDescription || errorParam);
        }

        // Handle email confirmation with code parameter
        if (code && type === 'signup') {
          console.log('Processing email confirmation with code...');
          
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: code,
            type: 'signup'
          });

          if (verifyError) {
            console.error('Code verification error:', verifyError);
            throw verifyError;
          }

          if (data.user) {
            console.log('User confirmed successfully with code:', data.user.email);
            
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                profile_completed: false
              }, {
                onConflict: 'id'
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            }

            setStatus('success');
            setMessage('Email confirmed successfully! Please complete your profile to start listing items.');
            
            // Redirect to settings after 3 seconds
            setTimeout(() => {
              navigate('/signin');
            }, 3000);
          } else {
            throw new Error('No user data received');
          }
        }
        // Handle signup confirmation with tokens
        else if ((type === 'signup' || !hashType) && accessToken && refreshToken) {
          console.log('Processing signup confirmation...');
          
          // Set the session with the tokens
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            throw sessionError;
          }

          if (data.user) {
            console.log('User confirmed successfully:', data.user.email);
            
            // Create user profile
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                profile_completed: false
              }, {
                onConflict: 'id'
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            }

            setStatus('success');
            setMessage('Email confirmed successfully! Please complete your profile to start listing items.');
            
            // Redirect to sign in after 3 seconds
            setTimeout(() => {
              navigate('/signin');
            }, 3000);
          } else {
            throw new Error('No user data received');
          }
        } else {
          // Invalid confirmation data
          throw new Error('Invalid confirmation link. Please check your email for the correct link.');
        }
      } catch (error: any) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to confirm email. Please try signing up again or contact support.');
      }
    };

    // Check if there are auth parameters in URL or hash
    if (location.search || location.hash) {
      handleEmailConfirmation();
    } else {
      setStatus('error');
      setMessage('Invalid confirmation link. Please check your email for the correct link.');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader className="w-16 h-16 text-[#4A0E67] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">Confirming Email...</h2>
            <p className="text-gray-600">Please wait while we confirm your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">🎉 Email Confirmed Successfully!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-sm font-semibold text-blue-800">Next Step: Complete Your Profile</p>
              </div>
              <p className="text-sm text-blue-700">
                You must complete your profile with all required information before you can list items. This ensures quality and trust in our marketplace.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-[#4A0E67] text-white py-3 px-4 rounded hover:bg-[#3a0b50] transition-colors flex items-center justify-center"
              >
                <User className="w-5 h-5 mr-2" />
                Sign In Now
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
              >
                Complete Profile Later
              </button>
            </div>
          </>
        )}

        {status === 'already_confirmed' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">Already Confirmed!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-sm font-semibold text-yellow-800">Profile Required</p>
              </div>
              <p className="text-sm text-yellow-700">
                Complete your profile to start listing items and unlock all features.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-[#4A0E67] text-white py-2 px-4 rounded hover:bg-[#3a0b50] transition-colors"
              >
                Sign In Now
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full bg-[#F7941D] text-white py-2 px-4 rounded hover:bg-[#e68a1c] transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">Confirmation Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-sm font-semibold text-red-800">Email Delivery Issues</p>
              </div>
              <p className="text-sm text-red-700">
                <strong>Check your spam folder!</strong> Verification emails sometimes go to spam. 
                Mark the email as "Not Spam\" and add lizexpressltd.com to your trusted senders.
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/signin')}
                className="w-full bg-[#4A0E67] text-white py-2 px-4 rounded hover:bg-[#3a0b50] transition-colors"
              >
                Try Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-[#F7941D] text-white py-2 px-4 rounded hover:bg-[#e68a1c] transition-colors"
              >
                Sign Up Again
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;