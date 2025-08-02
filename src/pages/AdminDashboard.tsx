import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Package, TrendingUp, DollarSign, Eye, Check, X,
  Search, Filter, Download, RefreshCw, Menu, ChevronLeft,
  UserCheck, UserX, Flag, Trash2, Mail, MapPin, Calendar,
  Phone, Home, Globe, AlertTriangle, Shield, LogOut,
  BarChart3, Activity, MessageCircle, Bell
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  residential_address: string | null;
  country: string | null;
  state: string | null;
  is_verified: boolean;
  verification_submitted: boolean;
  created_at: string;
  last_sign_in_at?: string;
  items_count: number;
  status: 'active' | 'flagged' | 'suspended';
}

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems: number;
  totalRevenue: number;
  newUsersToday: number;
  newItemsToday: number;
  totalChats: number;
  activeUsers: number;
}

interface Item {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  condition: string;
  buying_price: number | null;
  estimated_cost: number | null;
  swap_for: string | null;
  location: string | null;
  images: string[];
  receipt_image: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
  approved_at?: string;
  approved_by?: string;
  rejection_reason?: string;
  users?: {
    id: string;
    full_name: string | null;
  };
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminSession, setAdminSession] = useState<any>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    totalItems: 0,
    pendingItems: 0,
    approvedItems: 0,
    rejectedItems: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    newItemsToday: 0,
    totalChats: 0,
    activeUsers: 0
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    // Check admin authentication
    const sessionData = localStorage.getItem('adminSession');
    if (!sessionData) {
      navigate('/admin');
      return;
    }

    const session = JSON.parse(sessionData);
    if (!session.authenticated) {
      navigate('/admin');
      return;
    }

    setAdminSession(session);
    fetchAdminData();

    // Set up real-time subscriptions
    const userSubscription = supabase
      .channel('admin-users-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, () => {
        console.log('User data changed, refreshing...');
        fetchAdminData();
      })
      .subscribe();

    const itemSubscription = supabase
      .channel('admin-items-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items'
      }, () => {
        console.log('Item data changed, refreshing...');
        fetchAdminData();
      })
      .subscribe();

    return () => {
      userSubscription.unsubscribe();
      itemSubscription.unsubscribe();
    };
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admin data...');

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Users fetch error:', usersError);
        throw usersError;
      }

      // Get items count for each user
      const { data: itemCounts } = await supabase
        .from('items')
        .select('user_id')
        .then(({ data }) => {
          const counts: { [key: string]: number } = {};
          data?.forEach(item => {
            counts[item.user_id] = (counts[item.user_id] || 0) + 1;
          });
          return { data: counts };
        });

      // Transform users data
      const transformedUsers: AdminUser[] = (usersData || []).map(user => ({
        id: user.id,
        email: user.email || `user-${user.id.slice(0, 8)}@lizexpress.com`,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        residential_address: user.residential_address,
        country: user.country,
        state: user.state,
        is_verified: user.is_verified || false,
        verification_submitted: user.verification_submitted || false,
        created_at: user.created_at,
        items_count: itemCounts?.[user.id] || 0,
        status: user.is_verified ? 'active' : 'flagged' as const
      }));

      console.log(`✅ Fetched ${transformedUsers.length} users`);
      setUsers(transformedUsers);

      // Fetch items with user details
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(`
          *,
          users!inner(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Items fetch error:', itemsError);
        throw itemsError;
      }

      console.log(`✅ Fetched ${itemsData?.length || 0} items`);
      setItems(itemsData || []);

      // Fetch chats count
      const { data: chatsData } = await supabase
        .from('chats')
        .select('id');

      // Calculate statistics
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = transformedUsers.filter(user => 
        user.created_at?.startsWith(today)
      ).length;
      const newItemsToday = (itemsData || []).filter(item => 
        item.created_at.startsWith(today)
      ).length;

      const calculatedStats: AdminStats = {
        totalUsers: transformedUsers.length,
        verifiedUsers: transformedUsers.filter(u => u.is_verified).length,
        totalItems: itemsData?.length || 0,
        pendingItems: itemsData?.filter(item => item.status === 'pending').length || 0,
        approvedItems: itemsData?.filter(item => item.status === 'active').length || 0,
        rejectedItems: itemsData?.filter(item => item.status === 'rejected').length || 0,
        totalRevenue: 0,
        newUsersToday,
        newItemsToday,
        totalChats: chatsData?.length || 0,
        activeUsers: Math.floor(transformedUsers.length * 0.3)
      };

      setStats(calculatedStats);
      console.log('📊 Admin stats calculated:', calculatedStats);

    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string) => {
    if (!adminSession?.admin?.email) return;

    try {
      setActionLoading(userId);
      console.log(`🔄 Approving user: ${userId}`);

      const { data, error } = await supabase.rpc('admin_approve_user', {
        target_user_id: userId,
        admin_email: adminSession.admin.email
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to approve user');
      }

      console.log(`✅ User ${userId} approved successfully`);
      
      // Update local state immediately
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_verified: true, status: 'active' } : user
      ));

      // Update stats immediately
      setStats(prev => ({
        ...prev,
        verifiedUsers: prev.verifiedUsers + 1
      }));

      // Refresh data in background
      setTimeout(fetchAdminData, 1000);

    } catch (error) {
      console.error('❌ Error approving user:', error);
      alert('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const flagUser = async (userId: string, reason: string = 'Policy violation') => {
    if (!adminSession?.admin?.email) return;

    try {
      setActionLoading(userId);
      console.log(`🚩 Flagging user: ${userId}`);

      const { data, error } = await supabase.rpc('admin_flag_user', {
        target_user_id: userId,
        admin_email: adminSession.admin.email,
        reason: reason
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to flag user');
      }

      console.log(`✅ User ${userId} flagged successfully`);

      // Update local state immediately
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, is_verified: false, status: 'flagged' } : user
      ));

      // Update stats immediately
      setStats(prev => ({
        ...prev,
        verifiedUsers: Math.max(0, prev.verifiedUsers - 1)
      }));

      // Refresh data in background
      setTimeout(fetchAdminData, 1000);

    } catch (error) {
      console.error('❌ Error flagging user:', error);
      alert('Failed to flag user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!adminSession?.admin?.email) return;
    
    if (!confirm('⚠️ PERMANENT ACTION: Are you sure you want to completely delete this user? This will remove all their data including items, chats, and cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      console.log(`🗑️ Permanently deleting user: ${userId}`);
      
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
        admin_email: adminSession.admin.email
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to delete user');
      }

      console.log(`✅ User ${userId} permanently deleted`);

      // Immediately remove from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      setItems(prev => prev.filter(item => item.user_id !== userId));

      // Update stats immediately
      setStats(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        verifiedUsers: prev.verifiedUsers - (users.find(u => u.id === userId)?.is_verified ? 1 : 0)
      }));

      alert('✅ User permanently deleted successfully!');

      // Refresh data in background
      setTimeout(fetchAdminData, 1000);

    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const approveItem = async (itemId: string) => {
    if (!adminSession?.admin?.email) return;

    try {
      setActionLoading(itemId);
      console.log(`🔄 Approving item: ${itemId}`);

      const { data, error } = await supabase.rpc('admin_approve_item', {
        item_id: itemId,
        admin_email: adminSession.admin.email
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to approve item');
      }

      console.log(`✅ Item ${itemId} approved successfully`);
      
      // Update local state immediately
      setItems(prev => prev.map(item => 
        item.id === itemId ? { 
          ...item, 
          status: 'active', 
          approved_at: new Date().toISOString(),
          approved_by: adminSession.admin.email
        } : item
      ));

      // Update stats immediately
      setStats(prev => ({
        ...prev,
        pendingItems: prev.pendingItems - 1,
        approvedItems: prev.approvedItems + 1
      }));

    } catch (error) {
      console.error('❌ Error approving item:', error);
      alert('Failed to approve item. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const rejectItem = async (itemId: string, reason: string = 'Does not meet guidelines') => {
    if (!adminSession?.admin?.email) return;

    try {
      setActionLoading(itemId);
      console.log(`❌ Rejecting item: ${itemId}`);

      const { data, error } = await supabase.rpc('admin_reject_item', {
        item_id: itemId,
        admin_email: adminSession.admin.email,
        reason: reason
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to reject item');
      }

      console.log(`✅ Item ${itemId} rejected successfully`);
      
      // Update local state immediately
      setItems(prev => prev.map(item => 
        item.id === itemId ? { 
          ...item, 
          status: 'rejected',
          rejection_reason: reason,
          approved_by: adminSession.admin.email
        } : item
      ));

      // Update stats immediately
      setStats(prev => ({
        ...prev,
        pendingItems: prev.pendingItems - 1,
        rejectedItems: prev.rejectedItems + 1
      }));

    } catch (error) {
      console.error('❌ Error rejecting item:', error);
      alert('Failed to reject item. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin');
  };

  const exportUsers = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Email,Name,Country,State,Verified,Items Count,Created At\n" +
      users.map(user =>
        `${user.id},${user.email},"${user.full_name || 'N/A'}",${user.country || 'N/A'},${user.state || 'N/A'},${user.is_verified},${user.items_count},${user.created_at}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lizexpress_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportItems = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Name,Category,Condition,Status,User,Created At,Approved At\n" +
      items.map(item =>
        `${item.id},"${item.name}",${item.category},${item.condition},${item.status},"${item.users?.full_name || 'N/A'}",${item.created_at},${item.approved_at || 'N/A'}`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `lizexpress_items_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter data based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.country && user.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#4A0E67] to-[#2d0a3d] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex items-center justify-between h-16 px-6 bg-black/20">
        <div>
          <h1 className="text-xl font-bold text-white">LizExpress Admin</h1>
          <p className="text-xs text-white/70">{adminSession?.admin?.role?.replace('_', ' ').toUpperCase()}</p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-white hover:bg-white/20 p-2 rounded"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="mt-8 px-4">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'items', label: 'Item Approvals', icon: Package },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <IconComponent size={20} className="mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-white/80 text-sm">Logged in as:</p>
          <p className="text-white font-medium text-sm">{adminSession?.admin?.full_name}</p>
          <p className="text-white/60 text-xs">{adminSession?.admin?.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, change, trend }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change} {trend || 'today'}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );

  const UserModal = ({ user, onClose }: { user: AdminUser; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">User Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
              <img
                src={user.avatar_url || "https://via.placeholder.com/64"}
                alt={user.full_name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.full_name || 'No name provided'}</h3>
              <p className="text-gray-600">{user.email}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.is_verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium">
                  {user.state && user.country ? `${user.state}, ${user.country}` : 'Not provided'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Home size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Address:</span>
                <span className="text-sm font-medium">{user.residential_address || 'Not provided'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Joined:</span>
                <span className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Package size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Items Listed:</span>
                <span className="text-sm font-medium">{user.items_count}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Verification:</span>
                <span className="text-sm font-medium">
                  {user.verification_submitted ? 'Documents Submitted' : 'Not Submitted'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {!user.is_verified && (
              <button
                onClick={() => {
                  approveUser(user.id);
                  onClose();
                }}
                disabled={actionLoading === user.id}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === user.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <UserCheck size={16} />
                )}
                <span>Verify User</span>
              </button>
            )}
            
            <button
              onClick={() => {
                const reason = prompt('Enter reason for flagging:');
                if (reason) {
                  flagUser(user.id, reason);
                  onClose();
                }
              }}
              disabled={actionLoading === user.id}
              className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Flag size={16} />
              <span>Flag User</span>
            </button>
            
            <button
              onClick={() => {
                deleteUser(user.id);
                onClose();
              }}
              disabled={actionLoading === user.id}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Delete User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4A0E67] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('_', ' ')}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A0E67] w-64"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                
                <button
                  onClick={fetchAdminData}
                  className="flex items-center space-x-2 bg-[#4A0E67] text-white px-4 py-2 rounded-lg hover:bg-[#3a0b50] transition-colors"
                >
                  <RefreshCw size={18} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={Users}
                  color="bg-blue-500"
                  change={stats.newUsersToday}
                />
                <StatCard
                  title="Verified Users"
                  value={stats.verifiedUsers}
                  icon={UserCheck}
                  color="bg-green-500"
                />
                <StatCard
                  title="Total Items"
                  value={stats.totalItems}
                  icon={Package}
                  color="bg-purple-500"
                  change={stats.newItemsToday}
                />
                <StatCard
                  title="Pending Approvals"
                  value={stats.pendingItems}
                  icon={AlertTriangle}
                  color="bg-orange-500"
                />
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Approved Items"
                  value={stats.approvedItems}
                  icon={Check}
                  color="bg-green-600"
                />
                <StatCard
                  title="Rejected Items"
                  value={stats.rejectedItems}
                  icon={X}
                  color="bg-red-600"
                />
                <StatCard
                  title="Total Chats"
                  value={stats.totalChats}
                  icon={MessageCircle}
                  color="bg-blue-600"
                />
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden">
                            <img
                              src={user.avatar_url || "https://via.placeholder.com/32"}
                              alt={user.full_name || 'User'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.full_name || 'No name'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Pending Items</h3>
                  <div className="space-y-3">
                    {items.filter(item => item.status === 'pending').slice(0, 5).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-lg overflow-hidden">
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveItem(item.id)}
                            disabled={actionLoading === item.id}
                            className="text-green-600 hover:bg-green-100 p-1 rounded disabled:opacity-50"
                          >
                            {actionLoading === item.id ? (
                              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for rejection:');
                              if (reason) rejectItem(item.id, reason);
                            }}
                            disabled={actionLoading === item.id}
                            className="text-red-600 hover:bg-red-100 p-1 rounded disabled:opacity-50"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">User Management ({filteredUsers.length} users)</h2>
                <button
                  onClick={exportUsers}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={18} />
                  <span>Export Users</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden mr-3">
                                <img
                                  src={user.avatar_url || "https://via.placeholder.com/40"}
                                  alt={user.full_name || 'User'}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.full_name || 'No name provided'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.state && user.country ? `${user.state}, ${user.country}` : 'Not provided'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.items_count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.is_verified 
                                ? 'bg-green-100 text-green-800' 
                                : user.status === 'flagged'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.is_verified ? 'Verified' : user.status === 'flagged' ? 'Flagged' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </button>
                              {!user.is_verified && (
                                <button
                                  onClick={() => approveUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Verify User"
                                >
                                  {actionLoading === user.id ? (
                                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Check size={16} />
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  const reason = prompt('Enter reason for flagging:');
                                  if (reason) flagUser(user.id, reason);
                                }}
                                disabled={actionLoading === user.id}
                                className="text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                                title="Flag User"
                              >
                                <Flag size={16} />
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={actionLoading === user.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
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

          {activeTab === 'items' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Item Approvals ({filteredItems.length} items)</h2>
                <button
                  onClick={exportItems}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={18} />
                  <span>Export Items</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'active' ? 'bg-green-100 text-green-800' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status === 'active' ? 'Approved' : 
                           item.status === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <p><strong>Category:</strong> {item.category}</p>
                        <p><strong>Condition:</strong> {item.condition}</p>
                        <p><strong>User:</strong> {item.users?.full_name || 'Unknown'}</p>
                        <p><strong>Swap for:</strong> {item.swap_for}</p>
                        {item.estimated_cost && (
                          <p><strong>Est. Value:</strong> ₦{item.estimated_cost.toLocaleString()}</p>
                        )}
                        <p><strong>Listed:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
                        {item.approved_at && (
                          <p><strong>Approved:</strong> {new Date(item.approved_at).toLocaleDateString()}</p>
                        )}
                        {item.rejection_reason && (
                          <p><strong>Reason:</strong> {item.rejection_reason}</p>
                        )}
                      </div>

                      {item.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveItem(item.id)}
                            disabled={actionLoading === item.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                          >
                            {actionLoading === item.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Check size={16} className="mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for rejection:');
                              if (reason) rejectItem(item.id, reason);
                            }}
                            disabled={actionLoading === item.id}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                          >
                            <X size={16} className="mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Real-Time Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="mr-2 text-blue-500" size={20} />
                    User Growth Trends
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Total Registered Users</span>
                      <span className="text-lg font-bold text-blue-600">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Verified Users</span>
                      <span className="text-lg font-bold text-green-600">{stats.verifiedUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Verification Rate</span>
                      <span className="text-lg font-bold text-orange-600">
                        {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">New Users Today</span>
                      <span className="text-lg font-bold text-purple-600">{stats.newUsersToday}</span>
                    </div>
                  </div>
                </div>
                
                {/* Item Analytics */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Package className="mr-2 text-purple-500" size={20} />
                    Item Analytics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Total Items Listed</span>
                      <span className="text-lg font-bold text-purple-600">{stats.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Approved Items</span>
                      <span className="text-lg font-bold text-green-600">{stats.approvedItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">Pending Approval</span>
                      <span className="text-lg font-bold text-yellow-600">{stats.pendingItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Rejected Items</span>
                      <span className="text-lg font-bold text-red-600">{stats.rejectedItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Approval Rate</span>
                      <span className="text-lg font-bold text-blue-600">
                        {stats.totalItems > 0 ? Math.round((stats.approvedItems / stats.totalItems) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
                  <div className="space-y-3">
                    {Array.from(new Set(items.map(item => item.category))).map(category => {
                      const count = items.filter(item => item.category === category).length;
                      const percentage = items.length > 0 ? (count / items.length) * 100 : 0;
                      return (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{category}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#4A0E67] h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold w-8 text-right">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Platform Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Activity className="mr-2 text-indigo-500" size={20} />
                    Platform Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                      <span className="text-sm font-medium">Total Conversations</span>
                      <span className="text-lg font-bold text-indigo-600">{stats.totalChats}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Active Users</span>
                      <span className="text-lg font-bold text-green-600">{stats.activeUsers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Items Listed Today</span>
                      <span className="text-lg font-bold text-blue-600">{stats.newItemsToday}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Platform Health</span>
                      <span className="text-lg font-bold text-gray-600">
                        {stats.totalUsers > 0 && stats.totalItems > 0 ? 'Excellent' : 'Growing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;