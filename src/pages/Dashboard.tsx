import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Package2, Heart, MessageCircle, Bell, ChevronLeft, Search, Filter, Trash2, Edit, Eye, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Item, Notification, Chat } from '../lib/supabase';

function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }

    // Set active tab based on URL
    const path = location.pathname.split('/').pop();
    if (path && ['items', 'favorites', 'messages', 'notifications'].includes(path)) {
      setActiveTab(path);
    }

    fetchData();
  }, [user, navigate, location.pathname]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

      // Fetch user's items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []); // Show all user's items regardless of status

      // Fetch favorites
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select(`
          *,
          items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;
      setFavorites(favoritesData || []);

      // Fetch chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select(`
          *,
          items (*),
          sender:sender_id (id, full_name, avatar_url),
          receiver:receiver_id (id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (chatsError) throw chatsError;
      setChats(chatsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const filteredNotifications = notifications.filter(notif =>
    notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (notif.content && notif.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFavorites = favorites.filter(fav =>
    fav.items?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChats = chats.filter(chat => {
    const otherUser = chat.sender_id === user?.id ? chat.receiver : chat.sender;
    return otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           chat.items?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getTabData = (tab: string) => {
    switch (tab) {
      case 'items':
        return { icon: Package2, label: 'My Items', count: items.length, color: 'text-[#4A0E67]' };
      case 'favorites':
        return { icon: Heart, label: 'Favorites', count: favorites.length, color: 'text-[#F7941D]' };
      case 'messages':
        return { icon: MessageCircle, label: 'Messages', count: chats.length, color: 'text-[#4A0E67]' };
      case 'notifications':
        return { 
          icon: Bell, 
          label: 'Notifications', 
          count: notifications.filter(n => !n.is_read).length, 
          color: 'text-[#F7941D]',
          suffix: 'unread'
        };
      default:
        return { icon: Bell, label: 'Dashboard', count: 0, color: 'text-[#4A0E67]' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header with 3D Effect */}
      <div className="bg-gradient-to-r from-[#F7941D] via-[#FF8C00] to-[#F7941D] text-white shadow-2xl">
        <div className="px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              Dashboard
            </h1>
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-300 transform hover:scale-110 backdrop-blur-sm sm:hidden"
            >
              {showMobileSearch ? <X size={20} /> : <Search size={20} />}
            </button>
          </div>

          {/* Enhanced Profile Section with 3D Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white overflow-hidden flex-shrink-0 shadow-lg ring-4 ring-white/30">
                  <img
                    src={profile?.avatar_url || "https://via.placeholder.com/64"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate">
                  {profile?.full_name || 'User'}
                </h2>
                <p className="opacity-90 text-sm truncate">{user?.email}</p>
                <p className="text-xs sm:text-sm opacity-75 bg-white/20 inline-block px-2 py-1 rounded-full mt-1">
                  {items.length} items • {favorites.length} favorites
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Search with Animation */}
          {showMobileSearch && (
            <div className="mt-4 sm:hidden animate-slideDown">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 bg-white/90 backdrop-blur-sm shadow-lg"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Navigation Tabs - No Scrolling */}
      <div className="bg-white shadow-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="px-4">
          <div className="grid grid-cols-4 gap-0">
            {['notifications', 'items', 'favorites', 'messages'].map((tab) => {
              const tabData = getTabData(tab);
              const IconComponent = tabData.icon;
              
              return (
                <Link
                  key={tab}
                  to={`/dashboard/${tab}`}
                  className={`relative flex flex-col items-center justify-center py-3 sm:py-4 transition-all duration-300 group ${
                    activeTab === tab
                      ? 'text-[#4A0E67] bg-gradient-to-t from-[#4A0E67]/5 to-transparent'
                      : 'text-gray-600 hover:text-[#4A0E67] hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <div className="relative">
                    <IconComponent 
                      size={18} 
                      className={`mb-1 transition-all duration-300 ${
                        activeTab === tab ? 'text-[#4A0E67] scale-110' : 'group-hover:scale-105'
                      }`} 
                    />
                    {tabData.count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#F7941D] text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg animate-pulse">
                        {tabData.count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium truncate max-w-full px-1">
                    {tabData.label}
                  </span>
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#4A0E67] to-[#F7941D] rounded-full shadow-lg"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area with 3D Cards */}
      <div className="px-4 py-4 sm:py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Desktop Search Header */}
          <div className="hidden sm:flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4A0E67] capitalize flex items-center">
              {React.createElement(getTabData(activeTab).icon, { 
                size: 28, 
                className: "mr-3 text-[#F7941D]" 
              })}
              {activeTab}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 rounded-full border-2 border-gray-200 focus:outline-none focus:border-[#4A0E67] focus:ring-4 focus:ring-[#4A0E67]/10 w-64 transition-all duration-300 bg-white shadow-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <button className="p-3 hover:bg-gray-100 rounded-full transition-all duration-300 transform hover:scale-110 shadow-sm border border-gray-200">
                <Filter size={18} className="text-[#4A0E67]" />
              </button>
            </div>
          </div>

          {/* Mobile Search Results Info */}
          <div className="sm:hidden p-4 border-b bg-gradient-to-r from-gray-50 to-white">
            <p className="text-sm text-gray-600 font-medium">
              {activeTab === 'items' && `${filteredItems.length} items`}
              {activeTab === 'favorites' && `${filteredFavorites.length} favorites`}
              {activeTab === 'messages' && `${filteredChats.length} conversations`}
              {activeTab === 'notifications' && `${filteredNotifications.length} notifications`}
            </p>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-[#4A0E67] border-t-transparent"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 sm:h-12 sm:w-12 border-2 border-[#F7941D] opacity-20"></div>
                </div>
              </div>
            ) : (
              <div>
                {/* My Items */}
                {activeTab === 'items' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredItems.map((item) => (
                      <div key={item.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                        <div className="relative overflow-hidden">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1 group-hover:text-[#4A0E67] transition-colors duration-300">{item.name}</h3>
                          <div className="space-y-1 mb-3">
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                                item.condition === 'Brand New' ? 'bg-green-100 text-green-800' :
                                item.condition === 'Fairly Used' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {item.condition}
                              </span>
                              <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === 'active' ? 'bg-green-100 text-green-800' :
                                item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {item.status === 'active' ? 'Approved' : 
                                 item.status === 'rejected' ? 'Rejected' : 'Pending Review'}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                              <strong>Swap for:</strong> {item.swap_for}
                            </p>
                            <p className="text-xs text-gray-500">
                              Listed: {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/items/${item.id}`)}
                              className="flex-1 bg-gradient-to-r from-[#4A0E67] to-[#5a1077] text-white py-2 px-3 rounded-xl text-xs sm:text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-xl text-xs sm:text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="col-span-full text-center py-8 sm:py-12">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                          <Package2 size={40} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-4 text-lg font-medium">No items found</p>
                        <button
                          onClick={() => navigate('/list-item')}
                          className="bg-gradient-to-r from-[#F7941D] to-[#FF8C00] text-white px-4 sm:px-6 py-3 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base font-medium"
                        >
                          List Your First Item
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Favorites */}
                {activeTab === 'favorites' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredFavorites.map((favorite) => (
                      <div key={favorite.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                        <div className="relative overflow-hidden">
                          <img
                            src={favorite.items?.images[0]}
                            alt={favorite.items?.name}
                            className="w-full h-40 sm:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1 group-hover:text-[#4A0E67] transition-colors duration-300">{favorite.items?.name}</h3>
                          <div className="space-y-1 mb-3">
                            <p className="text-xs sm:text-sm text-gray-600">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                                favorite.items?.condition === 'Brand New' ? 'bg-green-100 text-green-800' :
                                favorite.items?.condition === 'Fairly Used' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {favorite.items?.condition}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                              <strong>Swap for:</strong> {favorite.items?.swap_for}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/items/${favorite.items?.id}`)}
                              className="flex-1 bg-gradient-to-r from-[#4A0E67] to-[#5a1077] text-white py-2 px-3 rounded-xl text-xs sm:text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              View Item
                            </button>
                            <button
                              onClick={() => removeFavorite(favorite.id)}
                              className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-xl text-xs sm:text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                              <Heart size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredFavorites.length === 0 && (
                      <div className="col-span-full text-center py-8 sm:py-12">
                        <div className="bg-gradient-to-br from-red-100 to-pink-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                          <Heart size={40} className="text-red-400" />
                        </div>
                        <p className="text-gray-500 mb-4 text-lg font-medium">No favorites yet</p>
                        <button
                          onClick={() => navigate('/browse')}
                          className="bg-gradient-to-r from-[#F7941D] to-[#FF8C00] text-white px-4 sm:px-6 py-3 rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base font-medium"
                        >
                          Browse Items
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Messages */}
                {activeTab === 'messages' && (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredChats.map((chat) => {
                      const otherUser = chat.sender_id === user?.id ? chat.receiver : chat.sender;
                      return (
                        <div
                          key={chat.id}
                          onClick={() => navigate(`/chat/${chat.id}`)}
                          className="group p-3 sm:p-4 border border-gray-200 rounded-2xl hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:scale-102 bg-white hover:bg-gradient-to-r hover:from-white hover:to-gray-50"
                        >
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="relative">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 shadow-md ring-2 ring-white group-hover:ring-[#4A0E67]/20 transition-all duration-300">
                                <img
                                  src={otherUser?.avatar_url || "https://via.placeholder.com/48"}
                                  alt={otherUser?.full_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-[#4A0E67] transition-colors duration-300">
                                {otherUser?.full_name}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 truncate">
                                Item: {chat.items?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(chat.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                            <MessageCircle size={18} className="text-[#4A0E67] flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        </div>
                      );
                    })}
                    {filteredChats.length === 0 && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                          <MessageCircle size={40} className="text-blue-400" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No messages yet</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div className="space-y-3 sm:space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markNotificationAsRead(notification.id)}
                        className={`group p-3 sm:p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-102 border ${
                          notification.is_read 
                            ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 hover:shadow-xl'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-[#4A0E67] transition-colors duration-300">
                              {notification.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex-shrink-0 mt-1 shadow-lg animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredNotifications.length === 0 && (
                      <div className="text-center py-8 sm:py-12">
                        <div className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                          <Bell size={40} className="text-yellow-500" />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">No notifications</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Routes>
        <Route path="items" element={<div />} />
        <Route path="favorites" element={<div />} />
        <Route path="messages" element={<div />} />
        <Route path="notifications" element={<div />} />
      </Routes>
    </div>
  );
}

export default Dashboard;