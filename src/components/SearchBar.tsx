import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/browse?search=${searchQuery}&category=${category}`);
  };

  return (
    <section className="bg-[#F7941D] py-3">
      <div className="container mx-auto px-4">
        <form onSubmit={handleSearch} className="flex items-center justify-between">
          <div className="text-white text-sm whitespace-nowrap mr-2">
            Find what you need:
          </div>
          <div className="flex-grow max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1 px-3 pr-8 rounded text-sm"
              />
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search size={16} />
              </span>
            </div>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-[#4A0E67] text-white text-sm py-1 px-3 rounded ml-2 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </form>
      </div>
    </section>
  );
};

export default SearchBar;