import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Shield } from 'lucide-react';

const ListingCharge: React.FC = () => {
  const navigate = useNavigate();

  const handlePayment = async () => {
    // Payment logic will be implemented later
    navigate('/success');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Listing Fee</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Payment Details</h2>
          </div>
          <span className="text-2xl font-bold text-blue-600">$4.99</span>
        </div>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            A small fee is required to list your item. This helps maintain the quality of our platform and ensures serious sellers.
          </p>
          
          <div className="flex items-start space-x-2 text-sm text-gray-500">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p>Your payment is secured by our trusted payment processor. We never store your card details.</p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Pay $4.99 to List Item
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition duration-200"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>By proceeding with the payment, you agree to our terms and conditions.</p>
      </div>
    </div>
  );
};

export default ListingCharge;