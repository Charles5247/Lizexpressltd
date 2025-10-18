// Test script to verify Flutterwave integration
console.log('Testing Flutterwave Integration...');

// Check if FlutterwaveCheckout is available
if (typeof FlutterwaveCheckout !== 'undefined') {
  console.log('✅ FlutterwaveCheckout is loaded successfully');
  
  // Test configuration
  const testConfig = {
    public_key: "FLWPUBK-a1368523a69b943a37fb262905da65ed-X",
    tx_ref: `test_${Date.now()}`,
    amount: 1000,
    currency: "NGN",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: "test@example.com",
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
        console.log('✅ Payment successful!');
      } else {
        console.log('❌ Payment failed');
      }
    },
    onclose: () => {
      console.log('Payment modal closed');
    }
  };
  
  console.log('Test configuration:', testConfig);
  console.log('✅ Flutterwave is ready for payments');
  
  // Uncomment the line below to test the payment modal (be careful in production!)
  // FlutterwaveCheckout(testConfig);
  
} else {
  console.log('❌ FlutterwaveCheckout is not loaded');
  console.log('Please check if the Flutterwave script is properly included');
}

// Check environment variables
console.log('Environment check:');
console.log('VITE_FLUTTERWAVE_PUBLIC_KEY:', import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'Not set');
console.log('Current public key:', "FLWPUBK-a1368523a69b943a37fb262905da65ed-X");
