import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Browse: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [condition, setCondition] = useState<string>('');

  const categories = [
    'Electronics', 'Furniture', 'Books/Novels', 'Clothing', 'Food',
    'Gaming', 'Real Estate', 'Automobiles', 'Others'
  ];

  const items = [
    {
      id: 1,
      name: 'Golden 2 Sitter Sofa',
      swapFor: '4 by 6 foam',
      location: 'OAU Campus, Nigeria',
      image: 'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg'
    },
    {
      id: 2,
      name: 'GO Portable BT Speaker',
      swapFor: 'VR Glasses',
      location: 'Lagos, Nigeria',
      image: 'https://images.pexels.com/photos/1279107/pexels-photo-1279107.jpeg'
    },
    // Add more items as needed
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#F7941D] p-6 min-h-screen">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">List Your Item Here</h2>
            <button className="bg-[#4A0E67] text-white px-6 py-2 rounded-full">
              List an Item
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Category Filter</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center text-white">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedCategories.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        }
                      }}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Condition</h3>
              <div className="space-y-2">
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="condition"
                    value="old"
                    checked={condition === 'old'}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  Old
                </label>
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="condition"
                    value="new"
                    checked={condition === 'new'}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  New
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:border-[#4A0E67]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <select className="p-2 rounded border focus:outline-none focus:border-[#4A0E67]">
              <option value="">Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600">Swap for: {item.swapFor}</p>
                  <p className="text-sm text-gray-500">{item.location}</p>
                  <button className="mt-4 w-full bg-[#4A0E67] text-white py-2 rounded hover:bg-[#3a0b50] transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {[1, 2, 3, 4, 5, 6, 7].map((page) => (
              <button
                key={page}
                className={`w-3 h-3 rounded-full ${page === 3 ? 'bg-[#F7941D]' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;