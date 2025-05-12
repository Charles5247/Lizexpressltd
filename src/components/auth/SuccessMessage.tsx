import React from 'react';
import { Check } from 'lucide-react';

const SuccessMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center p-4">
      <div className="bg-[#FFF5E6] rounded-lg p-12 text-center max-w-md w-full">
        <div className="w-24 h-24 bg-[#4A0E67] rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={48} className="text-white" />
        </div>
        <h2 className="text-[#4A0E67] text-3xl font-bold mb-4">LOGIN SUCCESSFUL!</h2>
      </div>
    </div>
  );
};

export default SuccessMessage;