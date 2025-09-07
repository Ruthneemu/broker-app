import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './admin.css';
import { 
  FaUsers, 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaBars, 
  FaTimes,
  FaHome,
  FaList,
  FaEnvelope,
  FaChartBar,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterUsers = () => {
    let result = users;
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    setFilteredUsers(result);
  };
  
  const handleRoleChange = async (id, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);
      if (error) throw error;
      // Update local state
      setUsers(users.map(user => 
        user.id === id ? { ...user, role: newRole } : user
      ));
      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Updated User Role',
          description: `Admin changed user #${id} role to ${newRole}`,
          icon: 'fa-user-tag',
          color: 'text-purple-500'
        }]);
    } catch (error) {
      console.error('Error updating user role:', error.message);
      alert('Failed to update user role');
    }
  };
  
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="role-badge admin">Admin</span>;
      case 'broker':
        return <span className="role-badge broker">Broker</span>;
      case 'user':
        return <span className="role-badge user">User</span>;
      default:
        return <span className="role-badge">{role}</span>;
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">Active</span>;
      case 'inactive':
        return <span className="status-badge draft">Inactive</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome, current: false },
    { name: 'Listings', href: '/admin/listings', icon: FaList, current: false },
    { name: 'Users', href: '/admin/users', icon: FaUsers, current: true },
    { name: 'Inquiries', href: '/admin/inquiries', icon: FaEnvelope, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar, current: false },
    { name: 'Settings', href: '/admin/settings', icon: FaCog, current: false },
  ];
  
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <button 
              onClick={() => navigate('/admin/users/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaUserPlus className="mr-2" /> Add New User
            </button>
          </div>
          
          <div className="admin-filters">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="filter-group">
              <label>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="broker">Broker</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-3">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{getRoleBadge(user.role)}</td>
                        <td>
                          {user.status ? getStatusBadge(user.status) : getStatusBadge('active')}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                              className="action-btn edit"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="role-select"
                            >
                              <option value="admin">Admin</option>
                              <option value="broker">Broker</option>
                              <option value="user">User</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;