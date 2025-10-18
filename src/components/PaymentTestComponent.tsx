import React, { useState } from 'react';
import { usePayment } from '../hooks/usePayment';
import PaymentModal from './PaymentModal';
import PaymentStatus from './PaymentStatus';
import PaymentNotification from './PaymentNotification';

const PaymentTestComponent: React.FC = () => {
  const { paymentState, initiatePayment, verifyPayment, resetPayment } = usePayment();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  const handleTestPayment = async () => {
    try {
      const txRef = await initiatePayment({
        amount: 5000, // Test amount: ₦5,000
        currency: 'NGN',
        user_id: 'test-user-id',
        item_id: 'test-item-id'
      });

      if (txRef) {
        setShowPaymentModal(true);
      } else {
        setNotification({
          show: true,
          type: 'error',
          title: 'Payment Initiation Failed',
          message: 'Could not initiate payment. Please try again.'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Payment Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setNotification({
      show: true,
      type: 'success',
      title: 'Payment Successful',
      message: 'Your listing payment has been processed successfully!'
    });
    resetPayment();
  };

  const handlePaymentClose = () => {
    setShowPaymentModal(false);
    resetPayment();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment System Test</h1>
      
      {/* Payment Status Display */}
      {paymentState.status !== 'idle' && (
        <div className="mb-6">
          <PaymentStatus 
            status={paymentState.status} 
            message={paymentState.error || undefined}
          />
        </div>
      )}

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Payment Flow</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Test the complete payment flow with a ₦5,000 listing fee.
            </p>
            <button
              onClick={handleTestPayment}
              disabled={paymentState.status === 'processing' || paymentState.status === 'pending'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {paymentState.status === 'processing' ? 'Processing...' : 'Test Payment'}
            </button>
          </div>

          <div>
            <button
              onClick={resetPayment}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Reset Payment State
            </button>
          </div>
        </div>
      </div>

      {/* Payment State Debug Info */}
      <div className="bg-gray-100 rounded-lg p-4 mb-6">
        <h3 className="font-semibold mb-2">Payment State Debug Info</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(paymentState, null, 2)}
        </pre>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentClose}
        itemValue={100000} // Test item value: ₦100,000
        onPaymentSuccess={handlePaymentSuccess}
        itemId="test-item-id"
      />

      {/* Notification */}
      <PaymentNotification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        show={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      {/* Test Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Click "Test Payment" to initiate a payment flow</li>
          <li>• Use Flutterwave test card: 4187427415564246</li>
          <li>• CVV: 828, Expiry: 09/32, PIN: 3310</li>
          <li>• Check browser console for detailed logs</li>
          <li>• Verify payment status updates in real-time</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentTestComponent;
