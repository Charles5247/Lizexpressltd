import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Package2, Heart, MessageCircle, Bell, ChevronLeft, Search, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Profile Section */}
      <div className="bg-[#F7941D] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#e68a1c] rounded-full">
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full bg-white overflow-hidden">
                  <img
                    src={profile?.avatar_url || "https://via.placeholder.com/80"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile?.full_name || 'User'}</h1>
                  <p className="opacity-90">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/dashboard/items"
            className={`p-6 rounded-lg shadow transition-all ${
              activeTab === 'items' ? 'bg-[#4A0E67] text-white' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('items')}
          >
            <Package2 className={`w-8 h-8 mb-2 ${activeTab === 'items' ? 'text-white' : 'text-[#4A0E67]'}`} />
            <h2 className="text-lg font-semibold">My Items</h2>
          </Link>
          
          <Link
            to="/dashboard/favorites"
            className={`p-6 rounded-lg shadow transition-all ${
              activeTab === 'favorites' ? 'bg-[#4A0E67] text-white' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            <Heart className={`w-8 h-8 mb-2 ${activeTab === 'favorites' ? 'text-white' : 'text-[#F7941D]'}`} />
            <h2 className="text-lg font-semibold">Favorites</h2>
          </Link>
          
          <Link
            to="/dashboard/messages"
            className={`p-6 rounded-lg shadow transition-all ${
              activeTab === 'messages' ? 'bg-[#4A0E67] text-white' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <MessageCircle className={`w-8 h-8 mb-2 ${activeTab === 'messages' ? 'text-white' : 'text-[#4A0E67]'}`} />
            <h2 className="text-lg font-semibold">Messages</h2>
          </Link>
          
          <Link
            to="/dashboard/notifications"
            className={`p-6 rounded-lg shadow transition-all ${
              activeTab === 'notifications' ? 'bg-[#4A0E67] text-white' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className={`w-8 h-8 mb-2 ${activeTab === 'notifications' ? 'text-white' : 'text-[#F7941D]'}`} />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </Link>
        </div>

        {/* Content Area */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          {activeTab === 'notifications' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#4A0E67]">Notifications</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      className="pl-10 pr-4 py-2 rounded-full border focus:outline-none focus:border-[#4A0E67]"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Filter size={20} className="text-[#4A0E67]" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4A0E67] border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div
                      key={notification.id}
                      className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{notification.title}</h3>
                          <p className="text-gray-600">{notification.content}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Routes>
            <Route path="items" element={<div>My Items Content</div>} />
            <Route path="favorites" element={<div>Favorites Content</div>} />
            <Route path="messages" element={<div>Messages Content</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;