import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  LogOut, 
  Search,
  Eye,
  UserCheck,
  Shield,
  TrendingUp,
  AlertTriangle,
  Settings,
  RefreshCw,
  MessageCircle,
  Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string;
  country: string;
  state: string;
  is_verified: boolean;
  created_at: string;
  items_count: number;
  status: 'active' | 'pending' | 'suspended';
}

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  estimated_cost: number;
  swap_for: string;
  images: string[];
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  user_id: string;
  user_name: string;
  user_email: string;
}

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newUsersToday: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    totalItems: 0,
    pendingItems: 0,
    approvedItems: 0,
    rejectedItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/admin');
      return;
    }

    try {
      const session = JSON.parse(adminSession);
      if (!session.email || session.email !== 'admin@lizexpress.com') {
        navigate('/admin');
        return;
      }
    } catch {
      navigate('/admin');
      return;
    }

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch users from custom users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Users fetch error:', usersError);
        throw usersError;
      }

      // Get auth users for email data
      let authUsersMap = new Map();
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        if (!authError && authUsers?.users) {
          authUsers.users.forEach(user => {
            authUsersMap.set(user.id, user.email);
          });
        }
      } catch (authErr) {
        console.log('Auth admin access not available, using fallback');
      }

      // Transform users data
      const transformedUsers: User[] = usersData?.map(user => {
        const email = authUsersMap.get(user.id) || `user-${user.id.slice(0, 8)}@example.com`;
        return {
          id: user.id,
          full_name: user.full_name || 'Anonymous User',
          email: email,
          avatar_url: user.avatar_url || '',
          country: user.country || 'Not specified',
          state: user.state || 'Not specified',
          is_verified: user.is_verified || false,
          created_at: user.created_at,
          items_count: 0, // Will be calculated separately
          status: user.is_verified ? 'active' : 'pending'
        };
      }) || [];

      setUsers(transformedUsers);

      // Fetch items with user info (without email from users table)
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(`
          *,
          users!inner(full_name)
        `)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Items fetch error:', itemsError);
        throw itemsError;
      }

      const transformedItems: Item[] = itemsData?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        condition: item.condition,
        estimated_cost: item.estimated_cost || 0,
        swap_for: item.swap_for,
        images: item.images || [],
        status: item.status === 'active' ? 'active' : (item.status === 'rejected' ? 'rejected' : 'pending'),
        created_at: item.created_at,
        user_id: item.user_id,
        user_name: item.users?.full_name || 'Anonymous',
        user_email: authUsersMap.get(item.user_id) || 'No email'
      })) || [];

      setItems(transformedItems);

      // Calculate item counts per user
      const itemCounts = transformedItems.reduce((acc, item) => {
        acc[item.user_id] = (acc[item.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Update users with item counts
      setUsers(prev => prev.map(user => ({
        ...user,
        items_count: itemCounts[user.id] || 0
      })));

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = transformedUsers.filter(user => 
        user.created_at.startsWith(today)
      ).length;

      const verifiedUsers = transformedUsers.filter(user => user.is_verified).length;
      const pendingVerifications = transformedUsers.filter(user => !user.is_verified).length;

      const pendingItems = transformedItems.filter(item => item.status === 'pending').length;
      const approvedItems = transformedItems.filter(item => item.status === 'active').length;
      const rejectedItems = transformedItems.filter(item => item.status === 'rejected').length;

      setStats({
        totalUsers: transformedUsers.length,
        newUsersToday,
        verifiedUsers,
        pendingVerifications,
        totalItems: transformedItems.length,
        pendingItems,
        approvedItems,
        rejectedItems
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAdminData();
    setRefreshing(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin');
  };

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_verified: true, status: 'active' } : user
      ));

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'account_verified',
          title: 'Account Verified! ✅',
          content: 'Congratulations! Your account has been verified by our admin team. You can now list items for swapping.'
        });

      // Update stats
      setStats(prev => ({
        ...prev,
        verifiedUsers: prev.verifiedUsers + 1,
        pendingVerifications: prev.pendingVerifications - 1
      }));

    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const approveItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'active' })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'active' } : item
      ));

      // Find the item to get user info for notification
      const item = items.find(i => i.id === itemId);
      if (item) {
        await supabase
          .from('notifications')
          .insert({
            user_id: item.user_id,
            type: 'item_approved',
            title: 'Item Approved! 🎉',
            content: `Great news! Your item "${item.name}" has been approved and is now live on the platform. Other users can now discover and chat about it.`
          });
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingItems: prev.pendingItems - 1,
        approvedItems: prev.approvedItems + 1
      }));

    } catch (error) {
      console.error('Error approving item:', error);
    }
  };

  const rejectItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ status: 'rejected' })
        .eq('id', itemId);

      if (error) throw error;

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, status: 'rejected' } : item
      ));

      // Find the item to get user info for notification
      const item = items.find(i => i.id === itemId);
      if (item) {
        await supabase
          .from('notifications')
          .insert({
            user_id: item.user_id,
            type: 'item_rejected',
            title: 'Item Needs Review 📝',
            content: `Your item "${item.name}" needs some adjustments before it can go live. Please review our guidelines and feel free to edit and resubmit.`
          });
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingItems: prev.pendingItems - 1,
        rejectedItems: prev.rejectedItems + 1
      }));

    } catch (error) {
      console.error('Error rejecting item:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#4A0E67] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#4A0E67] font-semibold text-lg">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#4A0E67] rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#4A0E67]">LizExpress Admin</h1>
              <p className="text-sm text-gray-600">Platform Management Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-[#F7941D] text-white px-4 py-2 rounded-lg hover:bg-[#e68a1c] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {[
                { id: 'overview', icon: Home, label: 'Overview' },
                { id: 'users', icon: Users, label: 'User Management' },
                { id: 'items', icon: Package, label: 'Item Approvals' },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#4A0E67] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#4A0E67]">Dashboard Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-[#4A0E67]">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-[#4A0E67]" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">New Today</p>
                      <p className="text-3xl font-bold text-green-600">{stats.newUsersToday}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Users</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.pendingVerifications}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pending Items</p>
                      <p className="text-3xl font-bold text-red-600">{stats.pendingItems}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Recent User Registrations</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#F7941D] rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {user.full_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold mb-4">Recent Item Submissions</h3>
                  <div className="space-y-3">
                    {items.slice(0, 5).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {item.images[0] && (
                            <img 
                              src={item.images[0]} 
                              alt={item.name} 
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">by {item.user_name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#4A0E67]">User Management</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E67]"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-[#F7941D] rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {user.full_name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{user.full_name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{user.state}, {user.country}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium">{user.items_count}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {user.is_verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm">{new Date(user.created_at).toLocaleDateString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {!user.is_verified && (
                                <button
                                  onClick={() => approveUser(user.id)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Verify User"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#4A0E67]">Item Approvals</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E67]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {item.images[0] && (
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      
                      <div className="space-y-1 mb-3">
                        <p className="text-sm"><strong>Category:</strong> {item.category}</p>
                        <p className="text-sm"><strong>Condition:</strong> {item.condition}</p>
                        <p className="text-sm"><strong>Value:</strong> ₦{item.estimated_cost?.toLocaleString()}</p>
                        <p className="text-sm"><strong>Looking for:</strong> {item.swap_for}</p>
                        <p className="text-sm"><strong>By:</strong> {item.user_name}</p>
                      </div>

                      <p className="text-xs text-gray-500 mb-3">
                        Submitted: {new Date(item.created_at).toLocaleDateString()}
                      </p>

                      {item.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveItem(item.id)}
                            className="flex-1 bg-green-500 text-white py-2 px-3 rounded text-sm hover:bg-green-600 transition-colors flex items-center justify-center"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectItem(item.id)}
                            className="flex-1 bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No items found</p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#4A0E67]">Admin Settings</h2>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Platform Statistics</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-[#4A0E67]">{stats.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verified Users</p>
                    <p className="text-2xl font-bold text-green-600">{stats.verifiedUsers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-[#4A0E67]">{stats.totalItems}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Approved Items</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approvedItems}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;