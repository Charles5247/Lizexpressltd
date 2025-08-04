import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Shuffle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Item } from '../lib/supabase';

const ProductCategories: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const slidesPerView = {
    sm: 2,
    md: 3,
    lg: 5
  };

  useEffect(() => {
    fetchRecentItems();
  }, [user]);

  const fetchRecentItems = async () => {
    try {
      setError(null);
      console.log('Fetching recent items for homepage...');
      
      let query = supabase
        .from('items')
        .select(`
          *,
          users!inner(id, full_name, avatar_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(15); // Get more items for better variety

      // REMOVED: The code that was excluding current user's items
      // This was causing items to disappear after user signs in

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} recent items for homepage`);
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };
  
  const totalSlides = Math.ceil(items.length / slidesPerView.lg);
  
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };
  
  const goToSlide = (index: number) => {
    setActiveSlide(index);
  };

  // Calculate visible items based on active slide and screen size
  const visibleItems = items.slice(
    activeSlide * slidesPerView.lg, 
    (activeSlide + 1) * slidesPerView.lg
  );

  if (loading) {
    return (
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4A0E67] border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Search size={48} className="mx-auto mb-2" />
              <p className="text-lg font-semibold">Unable to load items</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchRecentItems}
              className="bg-[#F7941D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e68a1c] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <Shuffle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {user ? 'No Items Available for Swap Yet' : 'Discover Amazing Items to Swap'}
            </h3>
            <p className="text-gray-500 mb-6">
              {user 
                ? 'Be the first to list an item and start the swapping community!' 
                : 'Sign in to see all available items and start swapping with others!'
              }
            </p>
            <div className="space-y-3">
              {user ? (
                <button
                  onClick={() => navigate('/list-item')}
                  className="bg-[#F7941D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e68a1c] transition-colors"
                >
                  List Your First Item
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/signin')}
                    className="bg-[#4A0E67] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#3a0b50] transition-colors mr-4"
                  >
                    Sign In to Explore
                  </button>
                  <button
                    onClick={() => navigate('/browse')}
                    className="bg-[#F7941D] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#e68a1c] transition-colors"
                  >
                    Browse Without Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#4A0E67] flex items-center">
              <Shuffle className="mr-2" size={28} />
              {user ? 'Items Available for Swap' : 'Recent Items'}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {user 
                ? 'Discover items others want to swap - start a conversation!' 
                : 'Sign in to see personalized recommendations and start swapping'
              }
            </p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[#F7941D] hover:underline font-semibold flex items-center"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </button>
        </div>

        <div className="relative">
          {/* Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {visibleItems.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col items-center p-2 transition-transform hover:scale-105 cursor-pointer group"
                onClick={() => navigate(`/items/${item.id}`)}
              >
                <div className="bg-gray-100 p-2 rounded-lg mb-2 w-full flex justify-center items-center relative overflow-hidden" style={{ height: '120px' }}>
                  <img 
                    src={item.images[0]} 
                    alt={item.name} 
                    className="h-auto max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.condition === 'Brand New' ? 'bg-green-100 text-green-800' :
                      item.condition === 'Fairly Used' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {item.condition}
                    </span>
                  </div>
                </div>
                <h3 className="text-center font-semibold text-sm line-clamp-2">{item.name}</h3>
                <p className="text-[#4A0E67] text-xs text-center">
                  {item.category}
                </p>
                <p className="text-[#F7941D] text-xs text-center font-medium">
                  Swap for: <span className="font-semibold">{item.swap_for}</span>
                </p>
                <p className="text-gray-500 text-xs text-center">
                  by {item.users?.full_name || 'Anonymous'}
                </p>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-1 shadow-md hidden md:block hover:bg-gray-50 transition-colors"
                onClick={prevSlide}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-1 shadow-md hidden md:block hover:bg-gray-50 transition-colors"
                onClick={nextSlide}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
        
        {/* Pagination Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === activeSlide ? 'bg-[#F7941D]' : 'bg-gray-300'
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        )}

        {/* Call to Action for non-users */}
        {!user && items.length > 0 && (
          <div className="mt-8 text-center bg-[#4A0E67] text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Ready to Start Swapping?</h3>
            <p className="mb-4">Join our community and discover amazing items to swap with others!</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/signin')}
                className="bg-[#F7941D] text-white px-6 py-2 rounded hover:bg-[#e68a1c] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-[#4A0E67] px-6 py-2 rounded hover:bg-gray-100 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCategories;