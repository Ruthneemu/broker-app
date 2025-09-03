// AdminListings.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './Admin.css';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchTerm, statusFilter, typeFilter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let result = listings;

    if (searchTerm) {
      result = result.filter(listing => 
        listing.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(listing => listing.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(listing => listing.type === typeFilter);
    }

    setFilteredListings(result);
  };

  const handleDeleteListing = async (id) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        const { error } = await supabase
          .from('listings')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Update local state
        setListings(listings.filter(listing => listing.id !== id));

        // Log activity
        await supabase
          .from('activity_log')
          .insert([{
            action: 'Deleted Listing',
            description: `Admin deleted listing #${id}`,
            icon: 'fa-trash',
            color: 'text-red-500'
          }]);
      } catch (error) {
        console.error('Error deleting listing:', error.message);
        alert('Failed to delete listing');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setListings(listings.map(listing => 
        listing.id === id ? { ...listing, status: newStatus } : listing
      ));

      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Updated Status',
          description: `Admin changed listing #${id} status to ${newStatus}`,
          icon: 'fa-edit',
          color: 'text-blue-500'
        }]);
    } catch (error) {
      console.error('Error updating status:', error.message);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">Active</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'sold':
        return <span className="status-badge sold">Sold</span>;
      case 'draft':
        return <span className="status-badge draft">Draft</span>;
      default:
        return <span className="status-badge">{status}</span>;
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
            <li className="active">
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
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="text-2xl font-bold text-gray-900">Listings Management</h1>
          <button 
            onClick={() => navigate('/admin/listings/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i> Add New Listing
          </button>
        </div>

        <div className="admin-filters">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="house">House</option>
              <option value="car">Car</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Address</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <tr key={listing.id}>
                      <td>#{listing.id}</td>
                      <td>
                        <div>
                          <div className="font-medium">{listing.address}</div>
                          <div className="text-sm text-gray-500">{listing.city}</div>
                        </div>
                      </td>
                      <td className="capitalize">{listing.type}</td>
                      <td>${new Intl.NumberFormat().format(listing.price)}</td>
                      <td>{getStatusBadge(listing.status)}</td>
                      <td>{new Date(listing.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => navigate(`/admin/listings/edit/${listing.id}`)}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          <select
                            value={listing.status}
                            onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                            <option value="draft">Draft</option>
                          </select>

                          <button 
                            onClick={() => handleDeleteListing(listing.id)}
                            className="action-btn delete"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No listings found
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

export default AdminListings;