import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const PersonalData: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    language: '',
    gender: '',
    address: '',
    country: '',
    state: '',
    zipCode: '',
    nationality: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="min-h-screen bg-[#4A0E67] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#4A0E67]">Personal Data</h1>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center">1</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">2</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">3</span>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Ensure the data you submit matches with the information on your ID
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#4A0E67] mb-2">Full Names:</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Residential Address:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-[#4A0E67] mb-2">Date of Birth:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                    required
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Country of Residence:</label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                >
                  <option value="">Select Country</option>
                  {/* Add country options */}
                </select>
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Language:</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                >
                  <option value="">Select Preferred Language</option>
                  {/* Add language options */}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4A0E67] mb-2">State of Residence:</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                    required
                  >
                    <option value="">Select State</option>
                    {/* Add state options */}
                  </select>
                </div>

                <div>
                  <label className="block text-[#4A0E67] mb-2">Zip Code:</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Gender:</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Nationality:</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                >
                  <option value="">Select Country</option>
                  {/* Add country options */}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
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
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalData;