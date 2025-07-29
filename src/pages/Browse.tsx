import React, { useState, useEffect } from 'react';
import { Search, Heart, MessageCircle, Filter, Grid, List } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Item } from '../lib/supabase';

const Browse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [condition, setCondition] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'nearest'>('newest');

  const categories = [
    'Electronics', 'Furniture', 'Computer', 'Phones', 'Clothing',
    'Cosmetics', 'Automobiles', 'Shoes', 'Jewelry', 'Real Estate', 'Others'
  ];

  useEffect(() => {
    // Get search params from URL
    const urlSearch = searchParams.get('search');
    const urlCategory = searchParams.get('category');
    
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    
    if (urlCategory && urlCategory !== 'all') {
      setSelectedCategories([urlCategory]);
    }

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    fetchItems();
    if (user) {
      fetchFavorites();
    }
  }, [selectedCategories, condition, searchQuery, user, searchParams, sortBy]);

  const fetchItems = async () => {
    try {
      setError(null);
      setLoading(true);

      console.log('Fetching items from database...');

      let query = supabase
        .from('items')
        .select(`
          *,
          users!inner(id, full_name, avatar_url)
        `)
        .eq('status', 'active');

      // Exclude current user's items to focus on items available for swapping
      if (user) {
        query = query.neq('user_id', user.id);
      }

      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }

      if (condition) {
        query = query.eq('condition', condition);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,swap_for.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
      }

      // Apply sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'oldest') {
        query = query.order('created_at', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log(`Fetched ${data?.length || 0} items from database`);

      // Sort by location if user's location is available and sorting by nearest
      let sortedData = data || [];
      if (userLocation && sortBy === 'nearest') {
        sortedData = sortedData.sort((a, b) => {
          const distanceA = calculateDistance(userLocation, a.location);
          const distanceB = calculateDistance(userLocation, b.location);
          return distanceA - distanceB;
        });
      }

      setItems(sortedData);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('item_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(new Set(data.map(fav => fav.item_id)));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const calculateDistance = (userLoc: { lat: number; lng: number }, itemLocation: string) => {
    if (!itemLocation) return Infinity;
    
    const [lat, lng] = itemLocation.split(',').map(Number);
    if (!lat || !lng) return Infinity;

    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat - userLoc.lat);
    const dLon = toRad(lng - userLoc.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(userLoc.lat)) * Math.cos(toRad(lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number) => {
    return value * Math.PI / 180;
  };

  const toggleFavorite = async (itemId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      if (favorites.has(itemId)) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_id', itemId);

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_id: itemId
          });

        if (error) throw error;

        setFavorites(prev => new Set([...prev, itemId]));

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'favorite_added',
            title: 'Item Added to Favorites',
            content: `You've added an item to your favorites list.`
          });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleStartChat = async (itemId: string, ownerId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (user.id === ownerId) {
      alert("You can't chat with yourself!");
      return;
    }

    try {
      setError(null);
      // Check if chat already exists
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('item_id', itemId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${ownerId}),and(sender_id.eq.${ownerId},receiver_id.eq.${user.id})`)
        .single();

      if (chatError && chatError.code !== 'PGRST116') { // PGRST116 is the "not found" error
        throw chatError;
      }

      if (existingChat) {
        navigate(`/chat/${existingChat.id}`);
        return;
      }

      // Create new chat
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({
          item_id: itemId,
          sender_id: user.id,
          receiver_id: ownerId
        })
        .select()
        .single();

      if (error) throw error;

      // Create notifications for both users
      await supabase
        .from('notifications')
        .insert([
          {
            user_id: user.id,
            type: 'chat_started',
            title: 'Chat Started',
            content: 'You started a new chat conversation.'
          },
          {
            user_id: ownerId,
            type: 'new_chat',
            title: 'New Chat Request',
            content: 'Someone is interested in your item and started a chat.'
          }
        ]);

      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to start chat');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL params
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
    fetchItems();
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setCondition('');
    setSearchQuery('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#F7941D] p-6 min-h-screen">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">List Your Item Here</h2>
            <button 
              onClick={() => navigate('/list-item')}
              className="bg-[#4A0E67] text-white px-6 py-2 rounded-full hover:bg-[#3a0b50] transition-colors w-full"
            >
              List an Item
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-white text-sm underline hover:no-underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category} className="flex items-center text-white text-sm">
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
              <h3 className="text-lg font-bold text-white mb-4">Condition</h3>
              <div className="space-y-2">
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="condition"
                    value=""
                    checked={condition === ''}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  All Conditions
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="condition"
                    value="Brand New"
                    checked={condition === 'Brand New'}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  Brand New
                </label>
                <label className="flex items-center text-white text-sm">
                  <input
                    type="radio"
                    name="condition"
                    value="Fairly Used"
                    checked={condition === 'Fairly Used'}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  Fairly Used
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-4">Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'nearest')}
                className="w-full p-2 rounded text-black"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                {userLocation && <option value="nearest">Nearest to Me</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search items to swap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:border-[#4A0E67]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </form>
            
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">
                {items.length} items available for swap
              </p>
              <div className="flex border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-[#4A0E67] text-white' : 'text-gray-600'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-[#4A0E67] text-white' : 'text-gray-600'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button 
                onClick={fetchItems}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}

          {!user && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
              <p className="mb-2">
                <strong>Sign in to unlock all features:</strong> Save favorites, start conversations, and list your own items!
              </p>
              <button
                onClick={() => navigate('/signin')}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                Sign In
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4A0E67] border-t-transparent"></div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" 
              : "space-y-4"
            }>
              {items.map((item) => (
                <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex' : ''
                }`}>
                  <div className={`relative ${viewMode === 'list' ? 'w-48 h-48' : ''}`}>
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className={`object-cover cursor-pointer ${
                        viewMode === 'list' ? 'w-full h-full' : 'w-full h-48'
                      }`}
                      onClick={() => navigate(`/items/${item.id}`)}
                    />
                    {user && (
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className={`absolute top-2 right-2 p-2 rounded-full ${
                          favorites.has(item.id) 
                            ? 'bg-red-500 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100'
                        } transition-colors`}
                      >
                        <Heart size={16} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-lg mb-2 cursor-pointer hover:text-[#4A0E67]" 
                        onClick={() => navigate(`/items/${item.id}`)}>
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        item.condition === 'Brand New' ? 'bg-green-100 text-green-800' :
                        item.condition === 'Fairly Used' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.condition}
                      </span>
                      <span className="ml-2 text-[#4A0E67]">{item.category}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Looking for:</strong> {item.swap_for}
                    </p>
                    <p className="text-sm text-gray-500 mb-3 flex items-center">
                      By: {item.users?.full_name || 'Anonymous'}
                      <span className="ml-2 text-xs">
                        • {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartChat(item.id, item.user_id)}
                        className="flex-1 bg-[#4A0E67] text-white py-2 px-3 rounded text-sm hover:bg-[#3a0b50] transition-colors flex items-center justify-center"
                        disabled={!user}
                      >
                        <MessageCircle size={16} className="mr-1" />
                        {user ? 'Chat' : 'Sign in to Chat'}
                      </button>
                      <button
                        onClick={() => navigate(`/items/${item.id}`)}
                        className="bg-[#F7941D] text-white py-2 px-3 rounded text-sm hover:bg-[#e68a1c] transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No items found for swapping</p>
                  {user ? (
                    <div>
                      <p className="text-gray-400 mb-4">Try adjusting your search criteria or be the first to list an item!</p>
                      <button
                        onClick={clearFilters}
                        className="mr-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => navigate('/list-item')}
                        className="bg-[#F7941D] text-white px-4 py-2 rounded hover:bg-[#e68a1c]"
                      >
                        List Your First Item
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-400 mb-4">Sign in to see all available items and start swapping!</p>
                      <button
                        onClick={() => navigate('/signin')}
                        className="bg-[#4A0E67] text-white px-6 py-2 rounded hover:bg-[#3a0b50]"
                      >
                        Sign In to Browse
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;