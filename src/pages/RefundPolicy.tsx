import React from 'react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-[#4A0E67] mb-8">Refund Policy</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">1. Non-Refundable Listing Fees</h2>
            <div className="space-y-2 text-gray-700">
              <p>All listing fees (5%) paid to LizExpress for item or service listings are non-refundable once the listing is successfully published.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">2. Duplicate or Erroneous Charges</h2>
            <div className="space-y-2 text-gray-700">
              <p>Contact us at <a href="mailto:support@lizexpressltd.com" className="text-[#4A0E67] underline">support@lizexpressltd.com</a> for any errors or duplicate billing. Refunds, if approved, will be processed within 5–10 working days.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">3. Technical Errors</h2>
            <div className="space-y-2 text-gray-700">
              <p>In the case of a confirmed technical failure preventing a listing from being published, a full or partial refund may be considered.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">4. Unauthorized Transactions</h2>
            <div className="space-y-2 text-gray-700">
              <p>If an unauthorized transaction is detected, notify us within 48 hours for investigation and possible refund.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">Contact</h2>
            <div className="space-y-2 text-gray-700">
              <p>Email – <a href="mailto:support@lizexpressltd.com" className="text-[#4A0E67] underline">support@lizexpressltd.com</a></p>
              <p>Phone – [Insert Number]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy; 