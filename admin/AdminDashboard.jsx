// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingInquiries: 0,
    activeUsers: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
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

      // Fetch recent activity
      const { data: activity, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;

      setStats({
        totalListings: listingsCount || 0,
        pendingInquiries: inquiriesCount || 0,
        activeUsers: usersCount || 0,
        recentActivity: activity || []
      });
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

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 ml-2">
            <span className="text-blue-600">Broker</span><span className="text-gray-800">Connect</span>
          </h1>
        </div>

        <nav className="mt-8">
          <ul>
            <li className="active">
              <a href="/admin/dashboard">
                <i className="fas fa-tachometer-alt mr-3"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/listings">
                <i className="fas fa-home mr-3"></i> Listings
              </a>
            </li>
            <li>
              <a href="/admin/users">
                <i className="fas fa-users mr-3"></i> Users
              </a>
            </li>
            <li>
              <a href="/admin/inquiries">
                <i className="fas fa-envelope mr-3"></i> Inquiries
              </a>
            </li>
            <li>
              <a href="/admin/settings">
                <i className="fas fa-cog mr-3"></i> Settings
              </a>
            </li>
          </ul>
        </nav>

        <div className="mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900 w-full p-3 rounded-lg hover:bg-gray-100"
          >
            <i className="fas fa-sign-out-alt mr-3"></i> Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
            <div className="admin-stats">
              <div className="stat-card">
                <div className="stat-icon bg-blue-100 text-blue-600">
                  <i className="fas fa-home"></i>
                </div>
                <div className="stat-info">
                  <h3 className="text-gray-500">Total Listings</h3>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon bg-yellow-100 text-yellow-600">
                  <i className="fas fa-envelope"></i>
                </div>
                <div className="stat-info">
                  <h3 className="text-gray-500">Pending Inquiries</h3>
                  <p className="text-2xl font-bold">{stats.pendingInquiries}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon bg-green-100 text-green-600">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <h3 className="text-gray-500">Active Users</h3>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div className="card-header">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <a href="/admin/activity" className="text-blue-600 hover:text-blue-800">
                  View All
                </a>
              </div>

              <div className="activity-list">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <i className={`fas ${activity.icon} ${activity.color}`}></i>
                      </div>
                      <div className="activity-details">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.description}</p>
                      </div>
                      <div className="activity-time">
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            <div className="admin-card">
              <div className="card-header">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              </div>

              <div className="quick-actions">
                <a href="/admin/listings/new" className="quick-action">
                  <i className="fas fa-plus-circle text-blue-600"></i>
                  <span>Add New Listing</span>
                </a>
                <a href="/admin/users/new" className="quick-action">
                  <i className="fas fa-user-plus text-green-600"></i>
                  <span>Add New User</span>
                </a>
                <a href="/admin/inquiries" className="quick-action">
                  <i className="fas fa-envelope-open-text text-yellow-600"></i>
                  <span>Review Inquiries</span>
                </a>
                <a href="/admin/settings" className="quick-action">
                  <i className="fas fa-cog text-purple-600"></i>
                  <span>Site Settings</span>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;