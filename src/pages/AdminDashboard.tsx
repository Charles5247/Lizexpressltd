import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Package, TrendingUp, DollarSign, Eye, Check, X,
  Search, Filter, Download, RefreshCw, Menu, ChevronLeft,
  UserCheck, UserX, Flag, Trash2, Mail, MapPin, Calendar,
  Phone, Home, Globe, AlertTriangle, Shield, LogOut,
  BarChart3, Activity, MessageCircle, Bell, FileText,
  ExternalLink, Image, CheckCircle, XCircle, Clock
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
  verifications?: any[];
}

interface VerificationDocument {
  id: string;
  document_type: string;
  document_url: string;
  document_name: string;
  file_size: number;
  status: 'pending' | 'approved' | 'rejected';
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

interface UserVerificationData {
  user: {
    id: string;
    full_name: string;
    email: string;
    is_verified: boolean;
    verification_submitted: boolean;
    created_at: string;
  };
  documents: VerificationDocument[];
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
  pendingVerifications: number;
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
  const [verificationData, setVerificationData] = useState<UserVerificationData | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

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
    activeUsers: 0,
    pendingVerifications: 0
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    checkAdminAuth();
  }, [navigate]);

  const checkAdminAuth = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('No valid session found');
        navigate('/admin');
        return;
      }

      // Verify user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', session.user.email)
        .eq('is_active', true)
        .single();

      if (adminError || !adminData) {
        console.log('User is not an admin:', adminError);
        await supabase.auth.signOut();
        navigate('/admin');
        return;
      }

      setCurrentAdmin(adminData);
      await fetchAdminData();
      setupRealTimeSubscriptions();

    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/admin');
    }
  };

  const setupRealTimeSubscriptions = () => {
    console.log('🔄 Setting up real-time subscriptions...');

    // Users subscription
    const userSubscription = supabase
      .channel('admin-users-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'users'
      }, (payload) => {
        console.log('👥 User data changed:', payload.eventType);
        fetchAdminData();
      })
      .subscribe((status) => {
        console.log('👥 Users subscription status:', status);
      });

    // Items subscription
    const itemSubscription = supabase
      .channel('admin-items-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'items'
      }, (payload) => {
        console.log('📦 Item data changed:', payload.eventType);
        fetchAdminData();
      })
      .subscribe((status) => {
        console.log('📦 Items subscription status:', status);
      });

    // Verification documents subscription
    const verificationSubscription = supabase
      .channel('admin-verifications-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'verification_documents'
      }, (payload) => {
        console.log('🔍 Verification data changed:', payload.eventType);
        fetchAdminData();
      })
      .subscribe((status) => {
        console.log('🔍 Verifications subscription status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('🔄 Cleaning up subscriptions...');
      userSubscription.unsubscribe();
      itemSubscription.unsubscribe();
      verificationSubscription.unsubscribe();
    };
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admin data...');

      // Fetch all users with their verification documents
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          *,
          verification_documents:verification_documents(*)
        `)
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
        status: user.is_verified ? 'active' : 'flagged' as const,
        verifications: user.verification_documents || []
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

      // Count pending verification documents
      const { data: pendingVerificationsData } = await supabase
        .from('verification_documents')
        .select('id')
        .eq('status', 'pending');

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
        activeUsers: Math.floor(transformedUsers.length * 0.3),
        pendingVerifications: pendingVerificationsData?.length || 0
      };

      setStats(calculatedStats);
      console.log('📊 Admin stats calculated:', calculatedStats);

    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewUserVerifications = async (userId: string) => {
    try {
      setActionLoading(userId);
      console.log(`🔍 Fetching verification documents for user: ${userId}`);

      const { data, error } = await supabase.rpc('get_user_verification_documents', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error fetching verification documents:', error);
        // Fallback to direct query
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        const { data: documentsData } = await supabase
          .from('verification_documents')
          .select('*')
          .eq('user_id', userId);

        setVerificationData({
          user: userData,
          documents: documentsData || []
        });
      } else if (data?.success) {
        setVerificationData({
          user: data.user,
          documents: data.documents || []
        });
      }
    } catch (error) {
      console.error('❌ Error viewing user verifications:', error);
      alert('Failed to load verification documents');
    } finally {
      setActionLoading(null);
    }
  };

  const reviewVerificationDocument = async (
    documentId: string, 
    status: 'approved' | 'rejected', 
    notes?: string
  ) => {
    if (!currentAdmin?.email) {
      alert('Admin session expired. Please login again.');
      return;
    }

    try {
      setActionLoading(documentId);
      
      const { data, error } = await supabase.rpc('review_verification_document', {
        document_id: documentId,
        admin_email: currentAdmin.email,
        new_status: status,
        review_notes_text: notes
      });

      if (error) throw error;

      if (data?.success) {
        alert(`✅ Document ${status} successfully!`);
        // Refresh verification data
        if (verificationData) {
          await viewUserVerifications(verificationData.user.id);
        }
        // Refresh main data
        await fetchAdminData();
      } else {
        throw new Error(data?.error || 'Failed to review document');
      }
    } catch (error) {
      console.error('❌ Error reviewing document:', error);
      alert('Failed to review document. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const approveUser = async (userId: string) => {
    if (!currentAdmin?.email) {
      alert('Admin session expired. Please login again.');
      return;
    }

    try {
      setActionLoading(userId);
      console.log(`🔄 Approving user: ${userId}`);

      const { data, error } = await supabase.rpc('admin_approve_user', {
        target_user_id: userId,
        admin_email: currentAdmin.email
      });

      if (error) throw error;

      if (data?.success) {
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

        alert('✅ User approved successfully!');
        await fetchAdminData();
      }

    } catch (error) {
      console.error('❌ Error approving user:', error);
      alert(`Failed to approve user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const flagUser = async (userId: string, reason: string = 'Policy violation') => {
    if (!currentAdmin?.email) {
      alert('Admin session expired. Please login again.');
      return;
    }

    try {
      setActionLoading(userId);
      console.log(`🚩 Flagging user: ${userId}`);

      const { data, error } = await supabase.rpc('admin_flag_user', {
        target_user_id: userId,
        admin_email: currentAdmin.email,
        reason: reason
      });

      if (error) throw error;

      if (data?.success) {
        console.log(`✅ User ${userId} flagged successfully`);

        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_verified: false, status: 'flagged' } : user
        ));

        setStats(prev => ({
          ...prev,
          verifiedUsers: Math.max(0, prev.verifiedUsers - 1)
        }));

        alert('✅ User flagged successfully!');
        await fetchAdminData();
      }

    } catch (error) {
      console.error('❌ Error flagging user:', error);
      alert(`Failed to flag user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!currentAdmin?.email) return;
    
    if (!confirm('⚠️ PERMANENT ACTION: Are you sure you want to completely delete this user? This will remove all their data including items, chats, and cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      console.log(`🗑️ Permanently deleting user: ${userId}`);
      
      const { data, error } = await supabase.rpc('admin_delete_user', {
        target_user_id: userId,
        admin_email: currentAdmin.email
      });

      if (error) throw error;

      if (data?.success) {
        console.log(`✅ User ${userId} permanently deleted`);

        setUsers(prev => prev.filter(user => user.id !== userId));
        setItems(prev => prev.filter(item => item.user_id !== userId));

        setStats(prev => ({
          ...prev,
          totalUsers: prev.totalUsers - 1,
          verifiedUsers: prev.verifiedUsers - (users.find(u => u.id === userId)?.is_verified ? 1 : 0)
        }));

        alert('✅ User permanently deleted successfully!');
        await fetchAdminData();
      }

    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const approveItem = async (itemId: string) => {
    if (!currentAdmin?.email) {
      alert('Admin session expired. Please login again.');
      return;
    }

    try {
      setActionLoading(itemId);
      console.log(`🔄 Approving item: ${itemId}`);

      const { data, error } = await supabase.rpc('admin_approve_item', {
        item_id: itemId,
        admin_email: currentAdmin.email
      });

      if (error) throw error;

      if (data?.success) {
        console.log(`✅ Item ${itemId} approved successfully`);
        
        setItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item, 
            status: 'active', 
            approved_at: new Date().toISOString(),
            approved_by: currentAdmin.email
          } : item
        ));

        setStats(prev => ({
          ...prev,
          pendingItems: prev.pendingItems - 1,
          approvedItems: prev.approvedItems + 1
        }));

        alert('✅ Item approved successfully!');
      }

    } catch (error) {
      console.error('❌ Error approving item:', error);
      alert(`Failed to approve item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectItem = async (itemId: string, reason: string = 'Does not meet guidelines') => {
    if (!currentAdmin?.email) return;

    try {
      setActionLoading(itemId);
      console.log(`❌ Rejecting item: ${itemId}`);

      const { data, error } = await supabase.rpc('admin_reject_item', {
        item_id: itemId,
        admin_email: currentAdmin.email,
        reason: reason
      });

      if (error) throw error;

      if (data?.success) {
        console.log(`✅ Item ${itemId} rejected successfully`);
        
        setItems(prev => prev.map(item => 
          item.id === itemId ? { 
            ...item, 
            status: 'rejected',
            rejection_reason: reason,
            approved_by: currentAdmin.email
          } : item
        ));

        setStats(prev => ({
          ...prev,
          pendingItems: prev.pendingItems - 1,
          rejectedItems: prev.rejectedItems + 1
        }));

        alert('✅ Item rejected successfully!');
      }

    } catch (error) {
      console.error('❌ Error rejecting item:', error);
      alert('Failed to reject item. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
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
          <p className="text-xs text-white/70">ADMINISTRATOR</p>
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
          { id: 'verifications', label: 'Verifications', icon: Shield, badge: stats.pendingVerifications },
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
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-white/10 rounded-lg p-3 mb-4">
          <p className="text-white/80 text-sm">Logged in as:</p>
          <p className="text-white font-medium text-sm">{currentAdmin?.full_name}</p>
          <p className="text-white/60 text-xs">{currentAdmin?.email}</p>
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
            {user.verification_submitted && (
              <button
                onClick={() => {
                  viewUserVerifications(user.id);
                  onClose();
                }}
                disabled={actionLoading === user.id}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === user.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileText size={16} />
                )}
                <span>View Verification Documents</span>
              </button>
            )}

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

  const VerificationModal = ({ data, onClose }: { data: UserVerificationData; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Verification Documents</h2>
              <p className="text-gray-600">{data.user.full_name} • {data.user.email}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {data.documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No verification documents submitted</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.documents.map((doc) => (
                <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="font-medium text-sm capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                      doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status === 'approved' ? <CheckCircle size={12} className="inline mr-1" /> :
                       doc.status === 'rejected' ? <XCircle size={12} className="inline mr-1" /> :
                       <Clock size={12} className="inline mr-1" />}
                      {doc.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={doc.document_url}
                        alt={doc.document_name || 'Document'}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(doc.document_url, '_blank')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <strong>File:</strong> {doc.document_name || 'Unnamed'}
                    </p>
                    <p className="text-gray-600">
                      <strong>Size:</strong> {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-gray-600">
                      <strong>Uploaded:</strong> {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    {doc.review_notes && (
                      <p className="text-gray-600">
                        <strong>Notes:</strong> {doc.review_notes}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center space-x-2">
                    <button
                      onClick={() => window.open(doc.document_url, '_blank')}
                      className="flex-1 flex items-center justify-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg transition-colors text-sm"
                    >
                      <ExternalLink size={14} />
                      <span>View Full</span>
                    </button>
                    
                    {doc.status === 'pending' && (
                      <>
                        <button
                          onClick={() => reviewVerificationDocument(doc.id, 'approved')}
                          disabled={actionLoading === doc.id}
                          className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50 text-sm"
                        >
                          {actionLoading === doc.id ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Check size={14} />
                          )}
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const notes = prompt('Enter rejection reason (optional):');
                            reviewVerificationDocument(doc.id, 'rejected', notes || undefined);
                          }}
                          disabled={actionLoading === doc.id}
                          className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors disabled:opacity-50 text-sm"
                        >
                          <X size={14} />
                          <span className="hidden sm:inline">Reject</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  title="Pending Verifications"
                  value={stats.pendingVerifications}
                  icon={Clock}
                  color="bg-orange-500"
                />
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Pending Items"
                  value={stats.pendingItems}
                  icon={AlertTriangle}
                  color="bg-yellow-600"
                />
                <StatCard
                  title="Approved Items"
                  value={stats.approvedItems}
                  icon={Check}
                  color="bg-green-600"
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
                              {user.verification_submitted && (
                                <button
                                  onClick={() => viewUserVerifications(user.id)}
                                  disabled={actionLoading === user.id}
                                  className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                                  title="View Verification Documents"
                                >
                                  {actionLoading === user.id ? (
                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <FileText size={16} />
                                  )}
                                </button>
                              )}
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

          {activeTab === 'verifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold">Verification Management</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{stats.pendingVerifications} pending reviews</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users
                  .filter(user => user.verification_submitted)
                  .map(user => (
                    <div key={user.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                          <img
                            src={user.avatar_url || "https://via.placeholder.com/48"}
                            alt={user.full_name || 'User'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{user.full_name || 'No name'}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Submitted: {new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{user.state && user.country ? `${user.state}, ${user.country}` : 'Location not provided'}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => viewUserVerifications(user.id)}
                        disabled={actionLoading === user.id}
                        className="w-full flex items-center justify-center space-x-2 bg-[#4A0E67] hover:bg-[#3a0b50] text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === user.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FileText size={16} />
                        )}
                        <span>Review Documents</span>
                      </button>
                    </div>
                  ))}
              </div>

              {users.filter(user => user.verification_submitted).length === 0 && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Verification Submissions</h3>
                  <p className="text-gray-600">Users haven't submitted verification documents yet.</p>
                </div>
              )}
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
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Pending Verifications</span>
                      <span className="text-lg font-bold text-orange-600">{stats.pendingVerifications}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {verificationData && (
        <VerificationModal data={verificationData} onClose={() => setVerificationData(null)} />
      )}
    </div>
  );
};

export default AdminDashboard;