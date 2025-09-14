import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, ArrowLeft, Upload, Lock, Eye, EyeOff, Video, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { countries, getStatesForCountry, getAllNationalities } from '../data/locationData';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    residential_address: profile?.residential_address || '',
    date_of_birth: profile?.date_of_birth || '',
    language: profile?.language || '',
    gender: profile?.gender || '',
    country: profile?.country || '',
    state: profile?.state || '',
    zip_code: profile?.zip_code || '',
    nationality: profile?.nationality || ''
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setError('');
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please allow camera permission.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || !user) return;

    try {
      setUploading(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Unable to capture image');

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to capture image');

        const timestamp = Date.now();
        const fileName = `${user.id}/avatar_camera_${timestamp}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // Upload the captured image
        await uploadImageFile(file);
        
        stopCamera();
        setShowCameraModal(false);
      }, 'image/jpeg', 0.9);
    } catch (err: any) {
      console.error('Capture error:', err);
      setError(err.message || 'Failed to capture photo');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    await uploadImageFile(file);
  };

  const uploadImageFile = async (file: File) => {
    if (!user) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // Create unique filename with timestamp
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/avatar_${timestamp}.${fileExt}`;

      // Quick cleanup of old avatars (don't wait for it)
      supabase.storage
        .from('avatars')
        .list(`${user.id}/`)
        .then(({ data: existingFiles }) => {
          if (existingFiles && existingFiles.length > 0) {
            const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
            supabase.storage.from('avatars').remove(filesToDelete);
          }
        })
        .catch(() => {}); // Ignore cleanup errors

      // Upload new avatar with timeout
      const uploadPromise = supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const { data, error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      // Add cache busting parameter
      const avatarUrl = `${publicUrl}?t=${timestamp}`;
      
      await updateProfile({ avatar_url: avatarUrl });
      setSuccess('Profile picture updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setUpdatingPassword(true);
      setError('');

      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating password:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      
      // Check if profile is now complete
      const isComplete = formData.full_name && 
                        formData.residential_address && 
                        formData.date_of_birth && 
                        formData.country && 
                        formData.state;
      
      if (isComplete) {
        setSuccess('Profile completed successfully! You can now list items.');
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-[#4A0E67]" />
              </button>
              <h1 className="text-3xl font-bold text-[#4A0E67]">Settings</h1>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Profile Picture Section */}
          <div className="mb-8 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mx-auto mb-4">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-[#4A0E67] flex items-center justify-center">
                    <Camera size={48} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <button
                  onClick={() => setShowCameraModal(true)}
                  disabled={uploading}
                  className="flex items-center space-x-2 bg-[#4A0E67] text-white px-4 py-2 rounded-lg hover:bg-[#3a0b50] transition-colors disabled:opacity-50"
                >
                  <Camera size={16} />
                  <span>Take Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2 bg-[#F7941D] text-white px-4 py-2 rounded-lg hover:bg-[#e68a1c] transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Upload size={16} />
                  )}
                  <span>Upload</span>
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <p className="text-sm text-gray-600">Take a photo or upload from your device</p>
          </div>

          {/* Camera Modal */}
          {showCameraModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#4A0E67]">Take Profile Photo</h3>
                  <button
                    onClick={() => {
                      stopCamera();
                      setShowCameraModal(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <div className="relative w-full bg-black rounded overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                    />
                    {!isCameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <p>Camera inactive</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center space-x-3">
                  {!isCameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex items-center space-x-2 bg-[#4A0E67] text-white px-4 py-2 rounded-lg"
                    >
                      <Video size={16} />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={capturePhoto}
                        disabled={uploading}
                        className="flex items-center space-x-2 bg-[#F7941D] text-white px-4 py-2 rounded-lg disabled:opacity-50"
                      >
                        <Camera size={16} />
                        <span>{uploading ? 'Capturing...' : 'Capture'}</span>
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
                      >
                        Stop Camera
                      </button>
                    </>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}

          {/* Password Update Section */}
          <div className="mb-8 bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#4A0E67] flex items-center">
                <Lock size={20} className="mr-2" />
                Password & Security
              </h2>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-[#F7941D] hover:underline font-medium"
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordSection && (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-[#4A0E67] font-semibold mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] pr-12"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67]"
                    >
                      {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#4A0E67] font-semibold mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] pr-12"
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67]"
                    >
                      {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[#4A0E67] font-semibold mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] pr-12"
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#4A0E67]"
                    >
                      {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="bg-[#4A0E67] text-white px-6 py-2 rounded-lg hover:bg-[#3a0b50] transition-colors disabled:opacity-50 flex items-center"
                  >
                    {updatingPassword ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <Lock size={16} className="mr-2" />
                    )}
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setError('');
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-3 rounded border bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Date of Birth *</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Language</label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                >
                  <option value="">Select Language</option>
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

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Country *</label>
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
                <label className="block text-[#4A0E67] font-semibold mb-2">State *</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  disabled={!formData.country}
                  required
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
                <label className="block text-[#4A0E67] font-semibold mb-2">Zip Code</label>
                <input
                  type="text"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  placeholder="Enter zip code"
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Nationality</label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                >
                  <option value="">Select Nationality</option>
                  {nationalities.map((nationality) => (
                    <option key={nationality} value={nationality}>
                      {nationality}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#4A0E67] font-semibold mb-2">Residential Address *</label>
                <textarea
                  value={formData.residential_address}
                  onChange={(e) => setFormData({ ...formData, residential_address: e.target.value })}
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] h-24"
                  placeholder="Enter your full address"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#4A0E67] text-white rounded-lg hover:bg-[#3a0b50] transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save size={20} className="mr-2" />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;