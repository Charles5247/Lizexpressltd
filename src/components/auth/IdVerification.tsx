import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const IdVerification: React.FC = () => {
  const [files, setFiles] = useState({
    identity: null,
    address: null,
    selfie: null
  });

  const handleFileUpload = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({
        ...prev,
        [type]: e.target.files![0]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#4A0E67] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#4A0E67]">ID Verification</h1>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">1</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center">2</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">3</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-[#4A0E67] font-semibold mb-2">Proof of Identity</h3>
              <p className="text-sm text-gray-600 mb-4">Upload Any Verified means of ID (National/State ID, Drivers' Licence, BVN, Voters' Card, etc)</p>
              <label className="cursor-pointer block">
                <div className="border-2 border-[#4A0E67] border-dashed rounded-lg p-8 hover:bg-gray-50">
                  <Upload className="mx-auto text-[#4A0E67] mb-2" size={32} />
                  <p className="text-sm text-gray-500">.jpg or .png</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.png"
                  onChange={(e) => handleFileUpload('identity', e)}
                />
              </label>
            </div>

            <div className="text-center">
              <h3 className="text-[#F7941D] font-semibold mb-2">Proof of Address</h3>
              <p className="text-sm text-gray-600 mb-4">Upload Utility Bill</p>
              <label className="cursor-pointer block">
                <div className="border-2 border-[#F7941D] border-dashed rounded-lg p-8 hover:bg-gray-50">
                  <Upload className="mx-auto text-[#F7941D] mb-2" size={32} />
                  <p className="text-sm text-gray-500">.jpg or .png</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.png"
                  onChange={(e) => handleFileUpload('address', e)}
                />
              </label>
            </div>

            <div className="text-center">
              <h3 className="text-[#4A0E67] font-semibold mb-2">Selfie</h3>
              <p className="text-sm text-gray-600 mb-4">Upload Passport Photograph/Profile Picture</p>
              <label className="cursor-pointer block">
                <div className="border-2 border-[#4A0E67] border-dashed rounded-lg p-8 hover:bg-gray-50">
                  <Upload className="mx-auto text-[#4A0E67] mb-2" size={32} />
                  <p className="text-sm text-gray-500">.jpg or .png</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.png"
                  onChange={(e) => handleFileUpload('selfie', e)}
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              className="bg-[#4A0E67] text-white p-4 rounded-full hover:bg-[#3a0b50] transition-colors"
            >
              <svg
                className="w-6 h-6 transform rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdVerification;