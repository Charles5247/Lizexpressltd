import React from 'react';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#4A0E67]">Privacy Policy</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-gray-700 space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-[#F7941D]">Information We Collect</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Listing and transaction details</li>
              <li>Device and usage data</li>
              <li>Location information</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#F7941D]">How We Use Your Information</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>To create and manage user accounts</li>
              <li>To display and manage listings</li>
              <li>To process listing fee payments</li>
              <li>For analytics and platform improvement</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#F7941D]">Data Protection</h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>We use industry-standard encryption and secure APIs</li>
              <li>Data is not sold or shared with third parties without consent</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#F7941D]">Cookies</h3>
            <p>Cookies are used to personalize user experience and improve platform functionality.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#F7941D]">Third-Party Services</h3>
            <p>We use services such as Flutterwave and Firebase. These services may collect anonymized data for performance analysis.</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-[#F7941D]">User Rights</h3>
            <p>
              Users may request access, update, or deletion of their personal data by contacting{' '}
              <a href="mailto:privacy@lizexpressltd.com" className="text-[#4A0E67] underline">
                privacy@lizexpressltd.com
              </a>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="bg-[#4A0E67] text-white px-5 py-2 rounded-lg hover:bg-[#3a0b52] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
