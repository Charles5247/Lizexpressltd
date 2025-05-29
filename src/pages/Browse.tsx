import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Item } from '../lib/supabase';

const Browse: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [condition, setCondition] = useState<string>('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const categories = [
    'Electronics', 'Furniture', 'Books/Novels', 'Clothing', 'Food',
    'Gaming', 'Real Estate', 'Automobiles', 'Others'
  ];

  useEffect(() => {
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
  }, [selectedCategories, condition, searchQuery]);

  const fetchItems = async () => {
    try {
      setError(null);
      setLoading(true);

      // Test the connection first
      const { error: connectionError } = await supabase.from('items').select('count');
      if (connectionError) {
        throw new Error('Failed to connect to the database');
      }

      let query = supabase
        .from('items')
        .select('*, users!inner(*)')
        .eq('status', 'active');

      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories);
      }

      if (condition) {
        query = query.eq('condition', condition);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Sort by location if user's location is available
      let sortedData = data || [];
      if (userLocation) {
        sortedData = sortedData.sort((a, b) => {
          const distanceA = calculateDistance(userLocation, a.location);
          const distanceB = calculateDistance(userLocation, b.location);
          return distanceA - distanceB;
        });
      }

      setItems(sortedData);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setLoading(false);
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

  const handleStartChat = async (itemId: string, ownerId: string) => {
    if (!user) {
      navigate('/signin');
      return;
    }

    try {
      setError(null);
      // Check if chat already exists
      const { data: existingChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('item_id', itemId)
        .eq('sender_id', user.id)
        .eq('receiver_id', ownerId)
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

      navigate(`/chat/${newChat.id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to start chat');
    }
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
              className="bg-[#4A0E67] text-white px-6 py-2 rounded-full"
            >
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
                    value="Brand New"
                    checked={condition === 'Brand New'}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  Brand New
                </label>
                <label className="flex items-center text-white">
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
                <label className="flex items-center text-white">
                  <input
                    type="radio"
                    name="condition"
                    value="Well Used"
                    checked={condition === 'Well Used'}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mr-2"
                  />
                  Well Used
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:border-[#4A0E67]"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4A0E67] border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img 
                    src={item.images[0]} 
                    alt={item.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">Swap for: {item.swap_for}</p>
                    <p className="text-sm text-gray-500">{item.location}</p>
                    <button
                      onClick={() => handleStartChat(item.id, item.user_id)}
                      className="mt-4 w-full bg-[#4A0E67] text-white py-2 rounded hover:bg-[#3a0b50] transition-colors"
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;