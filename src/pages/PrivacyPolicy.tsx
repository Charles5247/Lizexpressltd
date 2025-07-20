import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-[#4A0E67] mb-8">Privacy Policy</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">1. Information We Collect</h2>
            <div className="space-y-2 text-gray-700">
              <p>• Name, email address, and phone number</p>
              <p>• Listing and transaction details</p>
              <p>• Device and usage data</p>
              <p>• Location information</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">2. How We Use Your Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>• To create and manage user accounts</p>
              <p>• To display and manage listings</p>
              <p>• To process listing fee payments</p>
              <p>• For analytics and platform improvement</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">3. Data Protection</h2>
            <div className="space-y-2 text-gray-700">
              <p>• We use industry-standard encryption and secure APIs.</p>
              <p>• Data is not sold or shared with third parties without consent.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">4. Cookies</h2>
            <div className="space-y-2 text-gray-700">
              <p>Cookies are used to personalize user experience and improve platform functionality.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">5. Third-Party Services</h2>
            <div className="space-y-2 text-gray-700">
              <p>We use services such as Flutterwave and Firebase. These services may collect anonymized data for performance analysis.</p>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">6. User Rights</h2>
            <div className="space-y-2 text-gray-700">
              <p>Users may request access, update, or deletion of their personal data by contacting <a href="mailto:privacy@lizexpressltd.com" className="text-[#4A0E67] underline">privacy@lizexpressltd.com</a>.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 