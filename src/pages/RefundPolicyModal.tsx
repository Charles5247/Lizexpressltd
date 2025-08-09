import React from 'react';

interface RefundPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RefundPolicyModal: React.FC<RefundPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-[#4A0E67]">Refund Policy</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>Non-Refundable Listing Fees:</strong> All listing fees (5%) paid to LIZExpress 
            for item or service listings are non-refundable once the listing is successfully published.
          </li>
          <li>
            <strong>Duplicate or Erroneous Charges:</strong> Contact us at 
            <a href="mailto:support@lizexpressltd.com" className="text-[#4A0E67] hover:underline"> support@lizexpressltd.com</a> 
            for any errors or duplicate billing. Refunds, if approved, will be processed within 5–10 working days.
          </li>
          <li>
            <strong>Technical Errors:</strong> In the case of a confirmed technical failure preventing a listing from being published, 
            a full or partial refund may be considered.
          </li>
          <li>
            <strong>Unauthorized Transactions:</strong> If an unauthorized transaction is detected, notify us within 48 hours 
            for investigation and possible refund.
          </li>
        </ul>

        <div className="mt-4">
          <p><strong>Contact:</strong></p>
          <p>
            Email – <a href="mailto:support@lizexpressltd.com" className="text-[#4A0E67] hover:underline">
              support@lizexpressltd.com
            </a>
          </p>
          <p>
            Phone – <a href="tel:+2349048304531" className="text-[#4A0E67] hover:underline">
              +234 904 8304 531
            </a>
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#4A0E67] text-white px-4 py-2 rounded hover:bg-[#3a0b50] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyModal;
