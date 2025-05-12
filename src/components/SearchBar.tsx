import React from 'react';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  return (
    <section className="bg-[#F7941D] py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="text-white text-sm whitespace-nowrap mr-2">
            Find what you need:
          </div>
          <div className="flex-grow max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-1 px-3 pr-8 rounded text-sm"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search size={16} />
              </span>
            </div>
          </div>
          <button className="bg-[#4A0E67] text-white text-sm py-1 px-3 rounded ml-2 whitespace-nowrap">
            Filter by
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;