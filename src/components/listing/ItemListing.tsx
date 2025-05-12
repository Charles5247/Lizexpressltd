import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const ItemListing: React.FC = () => {
  const [formData, setFormData] = useState({
    itemName: '',
    buyingPrice: '',
    estimatedCost: '',
    condition: '',
    category: '',
    swapFor: '',
    description: '',
    receipt: null,
    images: []
  });

  const categories = [
    'Electronics', 'Furniture', 'Computer', 'Phones', 'Clothing',
    'Cosmetics', 'Automobiles', 'Shoes', 'Jewelry', 'Real Estate', 'Others'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(e.target.files!)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#4A0E67] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#4A0E67]">Item Listing</h1>
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">1</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#4A0E67] text-white flex items-center justify-center">2</span>
              <span className="w-8 border-t-2 border-gray-300"></span>
              <span className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center">3</span>
            </div>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1">
                <label className="block text-[#4A0E67] mb-2">Item Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Buying Price</label>
                <input
                  type="number"
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  value={formData.buyingPrice}
                  onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[#4A0E67] mb-2">Estimated Cost Value</label>
                <input
                  type="number"
                  className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4A0E67] mb-2">Item Condition</label>
              <div className="flex space-x-4">
                {['Brand New', 'Fairly Used', 'Well Used'].map((condition) => (
                  <label key={condition} className="flex items-center">
                    <input
                      type="radio"
                      name="condition"
                      value={condition}
                      checked={formData.condition === condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="mr-2"
                    />
                    {condition}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#4A0E67] mb-2">Item Category</label>
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
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#4A0E67] mb-2">Swap For</label>
              <input
                type="text"
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67]"
                value={formData.swapFor}
                onChange={(e) => setFormData({ ...formData, swapFor: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[#4A0E67] mb-2">Item Description</label>
              <textarea
                className="w-full p-3 rounded border focus:outline-none focus:border-[#4A0E67] h-32"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter the details of your items here..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[#F7941D] font-semibold mb-4">Item Receipt</h3>
                <label className="cursor-pointer block">
                  <div className="border-2 border-[#F7941D] border-dashed rounded-lg p-8 hover:bg-gray-50">
                    <Upload className="mx-auto text-[#F7941D] mb-2" size={32} />
                    <p className="text-center text-sm text-gray-500">Upload Item Receipt</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.png"
                    onChange={(e) => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              <div>
                <h3 className="text-[#4A0E67] font-semibold mb-4">Item Images</h3>
                <label className="cursor-pointer block">
                  <div className="border-2 border-[#4A0E67] border-dashed rounded-lg p-8 hover:bg-gray-50">
                    <div className="flex justify-center space-x-4">
                      <Upload className="text-[#4A0E67]" size={32} />
                      <Upload className="text-[#4A0E67]" size={32} />
                      <Upload className="text-[#4A0E67]" size={32} />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Upload 3 images from various angles</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.png"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-[#4A0E67] text-white px-8 py-3 rounded font-bold hover:bg-[#3a0b50] transition-colors"
              >
                SUBMIT
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemListing;