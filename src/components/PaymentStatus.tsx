import React from 'react';
import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

export interface PaymentStatusProps {
  status: 'pending' | 'processing' | 'successful' | 'failed';
  message?: string;
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, message }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-6 h-6 text-yellow-500" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Payment Pending',
          defaultMessage: 'Your payment is being processed. Please wait...'
        };
      case 'processing':
        return {
          icon: <Loader className="w-6 h-6 text-blue-500 animate-spin" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Processing Payment',
          defaultMessage: 'Verifying your payment with Flutterwave...'
        };
      case 'successful':
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Successful',
          defaultMessage: 'Your payment has been processed successfully!'
        };
      case 'failed':
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          defaultMessage: 'Your payment could not be processed. Please try again.'
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-gray-500" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Unknown Status',
          defaultMessage: 'Payment status is unknown.'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
      <div className="flex items-center space-x-3">
        {config.icon}
        <div>
          <h3 className={`text-sm font-semibold ${config.color}`}>
            {config.title}
          </h3>
          <p className={`text-sm ${config.color}`}>
            {message || config.defaultMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;
