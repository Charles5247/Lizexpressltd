import { useState, useCallback } from 'react';
import { paymentService } from '../services/paymentService';

export interface PaymentState {
  status: 'idle' | 'pending' | 'processing' | 'successful' | 'failed';
  error: string | null;
  paymentId: string | null;
  txRef: string | null;
}

export interface PaymentHookReturn {
  paymentState: PaymentState;
  initiatePayment: (paymentData: {
    amount: number;
    currency: string;
    user_id: string;
    item_id?: string;
  }) => Promise<string | null>;
  verifyPayment: (txRef: string) => Promise<boolean>;
  resetPayment: () => void;
  setPaymentStatus: (status: PaymentState['status']) => void;
  setError: (error: string | null) => void;
}

export const usePayment = (): PaymentHookReturn => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    status: 'idle',
    error: null,
    paymentId: null,
    txRef: null,
  });

  const initiatePayment = useCallback(async (paymentData: {
    amount: number;
    currency: string;
    user_id: string;
    item_id?: string;
  }): Promise<string | null> => {
    try {
      setPaymentState(prev => ({
        ...prev,
        status: 'pending',
        error: null,
      }));

      // Generate unique transaction reference
      const txRef = `lizexpress_${Date.now()}_${paymentData.user_id}`;

      // Create payment record
      const payment = await paymentService.createPaymentRecord({
        tx_ref: txRef,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: 'pending',
        user_id: paymentData.user_id,
        item_id: paymentData.item_id,
      });

      setPaymentState(prev => ({
        ...prev,
        paymentId: payment.id,
        txRef: txRef,
        status: 'pending',
      }));

      return txRef;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      setPaymentState(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  const verifyPayment = useCallback(async (txRef: string): Promise<boolean> => {
    try {
      setPaymentState(prev => ({
        ...prev,
        status: 'processing',
        error: null,
      }));

      const isVerified = await paymentService.verifyPayment(txRef);

      if (isVerified) {
        setPaymentState(prev => ({
          ...prev,
          status: 'successful',
          error: null,
        }));
        return true;
      } else {
        setPaymentState(prev => ({
          ...prev,
          status: 'failed',
          error: 'Payment verification failed',
        }));
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      setPaymentState(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const resetPayment = useCallback(() => {
    setPaymentState({
      status: 'idle',
      error: null,
      paymentId: null,
      txRef: null,
    });
  }, []);

  const setPaymentStatus = useCallback((status: PaymentState['status']) => {
    setPaymentState(prev => ({
      ...prev,
      status,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setPaymentState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  return {
    paymentState,
    initiatePayment,
    verifyPayment,
    resetPayment,
    setPaymentStatus,
    setError,
  };
};
