import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './admin.css';
import { 
  FaHome, 
  FaUsers, 
  FaEnvelope, 
  FaDollarSign, 
  FaBars, 
  FaTimes,
  FaList,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingInquiries: 0,
    activeUsers: 0,
    estimatedValue: '$5M+',
    lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentListings, setRecentListings] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      // Fetch total listings
      const { count: listingsCount, error: listingsError } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });
      if (listingsError) throw listingsError;
      
      // Fetch pending inquiries
      const { count: inquiriesCount, error: inquiriesError } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (inquiriesError) throw inquiriesError;
      
      // Fetch active users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'admin');
      if (usersError) throw usersError;
      
      // Fetch recent listings
      const { data: listings, error: listingsDataError } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
      if (listingsDataError) throw listingsDataError;
      
      // Fetch recent activity with user information
      const { data: activity, error: activityError } = await supabase
        .from('activity_log')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (activityError) throw activityError;
      
      setStats({
        totalListings: listingsCount || 0,
        pendingInquiries: inquiriesCount || 0,
        activeUsers: usersCount || 0,
        estimatedValue: '$5M+',
        lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recentActivity: activity || []
      });
      
      setRecentListings(listings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome, current: true },
    { name: 'Listings', href: '/admin/listings', icon: FaList, current: false },
    { name: 'Users', href: '/admin/users', icon: FaUsers, current: false },
    { name: 'Inquiries', href: '/admin/inquiries', icon: FaEnvelope, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar, current: false },
    { name: 'Settings', href: '/admin/settings', icon: FaCog, current: false },
  ];
  
  // Helper function to extract item from description
  const extractItem = (description) => {
    const parts = description.split(':');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return description;
  };
  
  return (
    <div className="flex h-screen bg-gray-50 font-inter">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">BrokerConnect</p>
            </div>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <FaTimes className="h-6 w-6 text-gray-500" />
          </button>
        </div>
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  item.current
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.name}
              </a>
            ))}
          </div>
        </nav>
        <div className="mt-auto px-2 py-4">
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 w-full p-3 rounded-lg hover:bg-gray-100"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between h-16 px-4 border-b bg-white">
          <button onClick={() => setSidebarOpen(true)}>
            <FaBars className="h-6 w-6 text-gray-500" />
          </button>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="admin-header">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="admin-user">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                A
              </div>
              <span className="ml-2 text-gray-700">Admin</span>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
                  <FaHome className="h-10 w-10 text-blue-500 mb-2" />
                  <div className="text-4xl font-semibold text-gray-900">{stats.totalListings}</div>
                  <div className="text-gray-500">Total Listings</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
                  <FaUsers className="h-10 w-10 text-green-500 mb-2" />
                  <div className="text-4xl font-semibold text-gray-900">{stats.activeUsers}</div>
                  <div className="text-gray-500">Active Users</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
                  <FaEnvelope className="h-10 w-10 text-orange-500 mb-2" />
                  <div className="text-4xl font-semibold text-gray-900">{stats.pendingInquiries}</div>
                  <div className="text-gray-500">Pending Inquiries</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
                  <FaDollarSign className="h-10 w-10 text-purple-500 mb-2" />
                  <div className="text-4xl font-semibold text-gray-900">{stats.estimatedValue}</div>
                  <div className="text-gray-500">Estimated Value</div>
                </div>
              </div>
              
              {/* Recent Listings */}
              <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-gray-900">Recent Listings</h2>
                  <a href="/admin/listings" className="text-blue-600 hover:text-blue-800">
                    View All
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentListings.length > 0 ? (
                    recentListings.map((listing) => (
                      <div key={listing.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-200">
                        <img 
                          className="w-full h-48 object-cover" 
                          src={listing.image_urls && listing.image_urls[0] || 'https://placehold.co/600x400/e5e7eb/4b5563?text=Image+Not+Found'} 
                          alt={listing.type} 
                          onError={(e) => e.target.src = 'https://placehold.co/600x400/e5e7eb/4b5563?text=Image+Not+Found'}
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-800">{listing.type}</h3>
                          <p className="text-gray-600 mt-1">${listing.price ? listing.price.toLocaleString() : 'N/A'}</p>
                          <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${
                            listing.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                            listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {listing.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-gray-500">
                      No recent listings found
                    </div>
                  )}
                </div>
              </div>
              
              {/* Recent Activity Table */}
              <div className="admin-card">
                <div className="card-header">
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                  <a href="/admin/activity" className="text-blue-600 hover:text-blue-800">
                    View All
                  </a>
                </div>
                <div className="activity-table-container">
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Item</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentActivity.length > 0 ? (
                        stats.recentActivity.map((activity, index) => (
                          <tr key={index}>
                            <td className="user-cell">
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium mr-2">
                                  {activity.profiles?.name ? activity.profiles.name.charAt(0) : 'A'}
                                </div>
                                <span>{activity.profiles?.name || 'Admin'}</span>
                              </div>
                            </td>
                            <td className="action-cell">
                              <div className="flex items-center">
                                <i className={`fas ${activity.icon} ${activity.color} mr-2`}></i>
                                <span>{activity.action}</span>
                              </div>
                            </td>
                            <td className="item-cell">{extractItem(activity.description)}</td>
                            <td className="date-cell">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center py-8 text-gray-500">
                            No recent activity
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;