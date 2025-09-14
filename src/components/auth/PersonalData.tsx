import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { countries, getStatesForCountry, getAllNationalities } from '../../data/locationData';

const PersonalData: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    language: '',
    gender: '',
    residential_address: '',
    country: '',
    state: '',
    zip_code: '',
    nationality: ''
  });

  const availableStates = getStatesForCountry(formData.country);
  const nationalities = getAllNationalities();

  const handleCountryChange = (country: string) => {
    setFormData({ 
      ...formData, 
      country, 
      state: '' // Reset state when country changes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await updateProfile(formData);
      navigate('/id-verification');
    } catch (err) {
      setError('Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <p className="text-gray-600 mb-6">
            Ensure the data you submit matches with the information on your ID
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#4A0E67] mb-2">Full Names:</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Residential Address:</label>
                <input
                  type="text"
                  value={formData.residential_address}
                  onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                />
              </div>

              <div className="relative">
                <label className="block text-[#4A0E67] mb-2">Date of Birth:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
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
                  <option value="english">English</option>
                  <option value="french">French</option>
                  <option value="arabic">Arabic</option>
                  <option value="swahili">Swahili</option>
                  <option value="yoruba">Yoruba</option>
                  <option value="hausa">Hausa</option>
                  <option value="igbo">Igbo</option>
                  <option value="amharic">Amharic</option>
                  <option value="oromo">Oromo</option>
                  <option value="somali">Somali</option>
                  <option value="zulu">Zulu</option>
                  <option value="xhosa">Xhosa</option>
                  <option value="afrikaans">Afrikaans</option>
                  <option value="portuguese">Portuguese</option>
                  <option value="spanish">Spanish</option>
                  <option value="other">Other</option>
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
                    disabled={!formData.country}
                  >
                    <option value="">Select State</option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {!formData.country && (
                    <p className="text-sm text-gray-500 mt-1">Please select a country first</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#4A0E67] mb-2">Zip Code:</label>
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
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
                  <option value="prefer_not_to_say">Prefer not to say</option>
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
                  <option value="">Select Nationality</option>
                  {nationalities.map((nationality) => (
                    <option key={nationality} value={nationality}>
                      {nationality}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#4A0E67] text-white p-4 rounded-full hover:bg-[#3a0b50] transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
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
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PersonalData;