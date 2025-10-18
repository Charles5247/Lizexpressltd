import React, { useState } from 'react';
import { Upload, X, User, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import VerificationFlow from '../verification/VerificationFlow';
import { useVerificationStatus } from '../../hooks/useVerificationStatus';
import LoadingSpinner from '../ui/LoadingSpinner';
import PaymentModal from '../PaymentModal';
import { countries, getStatesForCountry } from '../../data/locationData';

const ItemListing: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { needsVerification, loading: verificationLoading } = useVerificationStatus();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingItemData, setPendingItemData] = useState<any>(null);
  const [formData, setFormData] = useState({
    itemName: '',
    buyingPrice: '',
    estimatedCost: '',
    condition: '',
    category: '',
    swapFor: '',
    description: '',
    itemLocation: '',
    itemState: '',
    itemCountry: 'Nigeria', // Default to Nigeria
    receipt: null as File | null,
    images: [] as File[]
  });

  const categories = [
    'Electronics', 'Furniture', 'Computer', 'Phones', 'Clothing',
    'Cosmetics', 'Automobiles', 'Shoes', 'Jewelry', 'Real Estate', 'Others'
  ];

  const availableStates = getStatesForCountry(formData.itemCountry);

  // Show verification flow if needed
  if (verificationLoading) {
    return (
      <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center">
        <LoadingSpinner size="large" color="white" />
      </div>
    );
  }

  if (needsVerification && !showVerification) {
    return (
      <VerificationFlow
        onComplete={() => setShowVerification(false)}
        onSkip={() => setShowVerification(false)}
      />
    );
  }

  // Check if profile is completed
  const isProfileComplete = profile && 
    profile.full_name && 
    profile.residential_address && 
    profile.date_of_birth && 
    profile.country && 
    profile.state;

  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-[#4A0E67] py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#4A0E67] mb-4">Complete Your Profile First</h2>
            <p className="text-gray-600 mb-6">
              Before you can list items, please complete your profile with all required information.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Required Information:</h3>
              <ul className="text-sm text-blue-700 text-left space-y-1">
                <li>• Full Name {!profile?.full_name && <span className="text-red-500">✗</span>}</li>
                <li>• Residential Address {!profile?.residential_address && <span className="text-red-500">✗</span>}</li>
                <li>• Date of Birth {!profile?.date_of_birth && <span className="text-red-500">✗</span>}</li>
                <li>• Country {!profile?.country && <span className="text-red-500">✗</span>}</li>
                <li>• State {!profile?.state && <span className="text-red-500">✗</span>}</li>
              </ul>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/settings')}
                className="w-full bg-[#4A0E67] text-white py-3 px-6 rounded-lg font-bold hover:bg-[#3a0b50] transition-colors"
              >
                Complete Profile Now
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCountryChange = (country: string) => {
    setFormData({ 
      ...formData, 
      itemCountry: country, 
      itemState: '' // Reset state when country changes
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 3) {
        setError('Maximum 3 images allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        images: files
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadFile = async (file: File, path: string) => {
    try {
      // Add timeout to prevent hanging
      const uploadPromise = supabase.storage
        .from('items')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000)
      );

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('items')
        .getPublicUrl(data.path);
      
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/signin');
      return;
    }

    if (formData.images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    if (!formData.estimatedCost) {
      setError('Please enter the estimated cost value');
      return;
    }

    if (!formData.itemLocation || !formData.itemState || !formData.itemCountry) {
      setError('Please fill in all location fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Ensure user profile exists
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user!.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
      }

      // Get user location coordinates (optional)
      const userLocation = localStorage.getItem('userLocation');
      let location = '';
      if (userLocation) {
        const { lat, lng } = JSON.parse(userLocation);
        location = `${lat},${lng}`;
      }

      // Upload images with timeout protection
      const imageUrls: string[] = [];
      for (let i = 0; i < formData.images.length; i++) {
        const file = formData.images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user!.id}/items/${Date.now()}_${i}.${fileExt}`;
        const url = await uploadFile(file, fileName);
        imageUrls.push(url);
      }

      // Upload receipt if provided
      let receiptUrl = null;
      if (formData.receipt) {
        const receiptExt = formData.receipt.name.split('.').pop();
        const receiptFileName = `${user!.id}/receipts/${Date.now()}_receipt.${receiptExt}`;
        receiptUrl = await uploadFile(formData.receipt, receiptFileName);
      }

      // Create item in database
      const itemData = {
        user_id: user!.id,
        name: formData.itemName,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
        buying_price: formData.buyingPrice ? parseFloat(formData.buyingPrice) : null,
        estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
        swap_for: formData.swapFor,
        location: location, // GPS coordinates
        item_location: formData.itemLocation, // Specific area
        item_state: formData.itemState, // State
        item_country: formData.itemCountry, // Country
        images: imageUrls,
        receipt_image: receiptUrl,
        status: 'pending' // Always start as pending for admin approval
      };

      // Defer item creation until after successful payment
      setPendingItemData(itemData);
      setShowPaymentModal(true);
      setLoading(false);
      return;
    } catch (err: any) {
      console.error('Error creating item:', err);
      setError(err.message || 'Failed to create item');
    } finally {
      // loading state handled around payment flow
    }
  };

  const handlePaymentSuccess = async () => {
    if (!pendingItemData || !user) {
      setShowPaymentModal(false);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('items')
        .insert(pendingItemData)
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'item_submitted',
          title: 'Item Submitted for Review! ⏳',
          content: `Your item "${pendingItemData.name}" has been submitted for admin review. You'll be notified once it's approved and visible to other users.`
        });

      setShowPaymentModal(false);
      setPendingItemData(null);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Post-payment item creation failed:', err);
      setError(err.message || 'Payment succeeded but listing could not be created. Please contact support.');
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#4A0E67] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" color="white" />
          <p className="mt-4 text-white font-semibold">Creating your listing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4A0E67] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-[#4A0E67]" />
              </button>
              <h1 className="text-4xl font-bold text-[#4A0E67]">List Your Item</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">1</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">2</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center">3</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Listing fee memo removed per request */}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Item Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Item Name *</label>
                <input
                  type="text"
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">Estimated Cost Value (₦) *</label>
                <input
                  type="number"
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  placeholder="Enter estimated value"
                  required
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] font-semibold mb-2">What to Swap For *</label>
                <input
                  type="text"
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  value={formData.swapFor}
                  onChange={(e) => setFormData({ ...formData, swapFor: e.target.value })}
                  placeholder="What would you like in exchange?"
                  required
                />
              </div>
            </div>

            {/* Item Condition */}
            <div>
              <label className="block text-[#4A0E67] font-semibold mb-2">Item Condition *</label>
              <div className="flex space-x-4">
                {['Brand New', 'Fairly Used'].map((condition) => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value={condition}
                      checked={formData.condition === condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="mr-2"
                      required
                    />
                    <span className="text-gray-700">{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Item Category */}
            <div>
              <label className="block text-[#4A0E67] font-semibold mb-2">Item Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={formData.category === category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="mr-2"
                      required
                    />
                    <span className="text-gray-700 text-sm">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Item Location Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-[#4A0E67] font-semibold mb-4 flex items-center">
                <MapPin size={20} className="mr-2" />
                Item Location *
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#4A0E67] font-semibold mb-2">Country *</label>
                  <select
                    value={formData.itemCountry}
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
                    value={formData.itemState}
                    onChange={(e) => setFormData({ ...formData, itemState: e.target.value })}
                    className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                    disabled={!formData.itemCountry}
                    required
                  >
                    <option value="">Select State</option>
                    {availableStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {!formData.itemCountry && (
                    <p className="text-sm text-gray-500 mt-1">Please select a country first</p>
                  )}
                </div>

                <div>
                  <label className="block text-[#4A0E67] font-semibold mb-2">Specific Location *</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                    value={formData.itemLocation}
                    onChange={(e) => setFormData({ ...formData, itemLocation: e.target.value })}
                    placeholder="e.g., Ikeja, Victoria Island, Wuse 2"
                    required
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                📍 This location will be displayed to potential swappers to help them find your item.
              </p>
            </div>

            {/* Item Description */}
            <div>
              <label className="block text-[#4A0E67] font-semibold mb-2">Item Description *</label>
              <textarea
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] h-32"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your item in detail - condition, features, why you're swapping it..."
                required
              />
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[#F7941D] font-semibold mb-4">Item Receipt (Optional)</h3>
                <label className="cursor-pointer block">
                  <div className="border-2 border-[#F7941D] border-dashed rounded-lg p-8 hover:bg-gray-50">
                    <Upload className="mx-auto text-[#F7941D] mb-2" size={32} />
                    <p className="text-center text-sm text-gray-500">
                      {formData.receipt ? formData.receipt.name : 'Upload Item Receipt'}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.png,.pdf"
                    onChange={(e) => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              <div>
                <h3 className="text-[#4A0E67] font-semibold mb-4">Item Images (Required) *</h3>
                <label className="cursor-pointer block">
                  <div className="border-2 border-[#4A0E67] border-dashed rounded-lg p-8 hover:bg-gray-50">
                    <div className="flex justify-center space-x-4">
                      <Upload className="text-[#4A0E67]" size={32} />
                      <Upload className="text-[#4A0E67]" size={32} />
                      <Upload className="text-[#4A0E67]" size={32} />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Upload up to 3 images from various angles
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.png,.jpeg"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
                
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#4A0E67] text-white px-8 py-3 rounded font-bold hover:bg-[#3a0b50] transition-colors disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" color="white" className="mr-2" />
                    CREATING LISTING...
                  </>
                ) : (
                  'CREATE LISTING'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        itemValue={parseFloat(formData.estimatedCost || '0') || 0}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ItemListing;