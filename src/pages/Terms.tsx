import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-[#4A0E67] mb-8">Terms & Conditions</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">1. ACCOUNT OPENING</h2>
            <div className="space-y-4 text-gray-700">
              <p>To access and use the Services, you must register for a LizExpress account ("Account"). To complete your Account registration, you must provide us with your full legal name, address, phone number, a valid email address, and any other information indicated as required. LizExpress may reject your application for an Account, or cancel an existing Account, for any reason, at our sole discretion.</p>
              <p>You must be the older of: (i) 18 years, or (ii) at least the age of majority in the jurisdiction where you reside and from which you use the Services to open an Account.</p>
              <p>You confirm that you are receiving any Services provided by LizExpres for the purposes of carrying on a business activity and not for any personal, household or family purpose.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">2. LizExpress Rights</h2>
            <div className="space-y-4 text-gray-700">
              <p>LizExpress has the right to control who we make our Services available to and we can modify them at any time. We also have the right to refuse or remove Materials from any part of the Services, including your product.</p>
              <p>The Services have a range of features and functionalities. Not all Services or features will be available to all Merchants at all times and we are under no obligation to make any Services or features available in any jurisdiction.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">3. Your Responsibilities</h2>
            <div className="space-y-4 text-gray-700">
              <p>You are responsible for your LizExpress Account, the goods or services you sell, and your relationship with your customers, not us. If you access the LizExpress platform, your use of the Liz Express platform is subject to Liz Express Terms and Conditions.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">4. Confidentiality</h2>
            <div className="space-y-4 text-gray-700">
              <p>Both you and LizExpress agree to use the Confidential Information of the other only to perform the obligations in these Terms of Service. Confidential Information must be protected and respected.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">5. Limitation of Liability and Indemnification</h2>
            <div className="space-y-4 text-gray-700">
              <p>We are not responsible for damages or lawsuits that arise if you break the law, breach this agreement or go against the rights of a third party. The Service is provided on an "as is" and "as available" basis.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">6. Intellectual Property and Your Materials</h2>
            <div className="space-y-4 text-gray-700">
              <p>Anything you upload remains yours (if it was yours) and is your responsibility, but LizExpress can use and publish the things you upload.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#F7941D] mb-4">7. Feedback and Reviews</h2>
            <div className="space-y-4 text-gray-700">
              <p>We welcome customer feedback but are under no obligation to ensure that ideas and suggestions regarding our Services or the services of third parties remain confidential and we can use the feedback in any way we want.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;