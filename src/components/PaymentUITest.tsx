import React, { useState } from 'react';

// Simple test component to verify payment UI
const PaymentUITest: React.FC = () => {
  const [showTest, setShowTest] = useState(false);

  const testFlutterwaveIntegration = () => {
    console.log('Testing Flutterwave Integration...');
    
    // Check if FlutterwaveCheckout is available
    if (typeof (window as any).FlutterwaveCheckout !== 'undefined') {
      console.log('✅ FlutterwaveCheckout is loaded successfully');
      
      // Test configuration with your live key
      const testConfig = {
        public_key: "FLWPUBK-a1368523a69b943a37fb262905da65ed-X",
        tx_ref: `test_${Date.now()}`,
        amount: 1000, // ₦1,000 test amount
        currency: "NGN",
        payment_options: "card,mobilemoney,ussd",
        customer: {
          email: "test@lizexpress.com",
          phone_number: "08012345678",
          name: "Test User",
        },
        customizations: {
          title: "LizExpress Test Payment",
          description: "Test payment for LizExpress listing",
          logo: "https://imgur.com/CtN9l7s.png",
        },
        callback: (response: any) => {
          console.log('Payment callback received:', response);
          if (response.status === 'successful') {
            alert('✅ Payment successful! Check console for details.');
          } else {
            alert('❌ Payment failed. Check console for details.');
          }
        },
        onclose: () => {
          console.log('Payment modal closed');
        }
      };
      
      console.log('Opening Flutterwave payment modal...');
      (window as any).FlutterwaveCheckout(testConfig);
      
    } else {
      console.log('❌ FlutterwaveCheckout is not loaded');
      alert('FlutterwaveCheckout is not loaded. Please check the script inclusion.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center">Payment UI Test</h2>
      
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Test the Flutterwave payment integration with your live key
          </p>
          
          <button
            onClick={testFlutterwaveIntegration}
            className="w-full bg-[#F7941D] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#e68a1c] transition-colors"
          >
            Test Payment (₦1,000)
          </button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Test Instructions:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Click "Test Payment" to open Flutterwave modal</li>
            <li>• Use test card: 4187427415564246</li>
            <li>• CVV: 828, Expiry: 09/32, PIN: 3310</li>
            <li>• Check browser console for logs</li>
            <li>• Payment will be processed with live key</li>
          </ul>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">Live Key Status:</h3>
          <p className="text-sm text-green-700">
            ✅ Using live Flutterwave key: FLWPUBK-a1368523a69b943a37fb262905da65ed-X
          </p>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => setShowTest(!showTest)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showTest ? 'Hide' : 'Show'} Environment Check
          </button>
          
          {showTest && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
              <p><strong>Environment Variables:</strong></p>
              <p>VITE_FLUTTERWAVE_PUBLIC_KEY: {import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'Not set'}</p>
              <p><strong>Current Key:</strong> FLWPUBK-a1368523a69b943a37fb262905da65ed-X</p>
              <p><strong>FlutterwaveCheckout:</strong> {typeof (window as any).FlutterwaveCheckout !== 'undefined' ? '✅ Loaded' : '❌ Not loaded'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentUITest;
