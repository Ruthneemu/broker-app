// AdminUsers.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
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
            <li>
              <a href="/admin/dashboard">
                <i className="fas fa-tachometer-alt mr-3"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/listings">
                <i className="fas fa-home mr-3"></i> Listings
              </a>
            </li>
            <li className="active">
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
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <button 
            onClick={() => navigate('/admin/users/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-user-plus mr-2"></i> Add New User
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
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Date Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id.substring(0, 8)}</td>
                      <td>
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>{user.name}</div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
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
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;