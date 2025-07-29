import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface VerificationStatus {
  isVerified: boolean;
  hasSubmitted: boolean;
  needsVerification: boolean;
  loading: boolean;
}

export const useVerificationStatus = (): VerificationStatus => {
  const { user, profile } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    hasSubmitted: false,
    needsVerification: false,
    loading: true
  });

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) {
        setStatus({
          isVerified: false,
          hasSubmitted: false,
          needsVerification: false,
          loading: false
        });
        return;
      }

      try {
        // Check if user has submitted verification
        const { data: verification } = await supabase
          .from('verifications')
          .select('status')
          .eq('user_id', user.id)
          .single();

        // Check if user has any items listed
        const { data: items } = await supabase
          .from('items')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        const isVerified = profile?.is_verified || verification?.status === 'approved';
        const hasSubmitted = !!verification || profile?.verification_submitted;
        const hasListedItems = items && items.length > 0;
        const needsVerification = !isVerified && !hasSubmitted && !hasListedItems;

        setStatus({
          isVerified,
          hasSubmitted,
          needsVerification,
          loading: false
        });
      } catch (error) {
        console.error('Error checking verification status:', error);
        setStatus({
          isVerified: false,
          hasSubmitted: false,
          needsVerification: false,
          loading: false
        });
      }
    };

    checkVerificationStatus();
  }, [user, profile]);

  return status;
};