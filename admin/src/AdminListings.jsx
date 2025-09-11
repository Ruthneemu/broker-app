import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './admin.css';
import { 
  FaHome, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaBars, 
  FaTimes,
  FaList,
  FaUsers,
  FaEnvelope,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaTshirt // Added icon for clothing
} from 'react-icons/fa';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
        listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (listing.type === 'clothing' && listing.brand?.toLowerCase().includes(searchTerm.toLowerCase())) || // Added brand search for clothing
        (listing.type === 'clothing' && listing.category?.toLowerCase().includes(searchTerm.toLowerCase())) // Added category search for clothing
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
  
  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };
  
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaHome, current: false },
    { name: 'Listings', href: '/admin/listings', icon: FaList, current: true },
    { name: 'Users', href: '/admin/users', icon: FaUsers, current: false },
    { name: 'Inquiries', href: '/admin/inquiries', icon: FaEnvelope, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar, current: false },
    { name: 'Settings', href: '/admin/settings', icon: FaCog, current: false },
  ];
  
  // Get category specific information
  const getCategoryInfo = (listing) => {
    if (listing.type === 'clothing') {
      return {
        display: listing.brand || 'Clothing',
        subDisplay: listing.category ? `${listing.category} ${listing.size ? `• Size: ${listing.size}` : ''}` : '',
        icon: <FaTshirt className="mr-1" />
      };
    } else {
      return {
        display: listing.type,
        subDisplay: '',
        icon: null
      };
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Listings Management</h1>
            <button 
              onClick={() => navigate('/admin/listings/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" /> Add New Listing
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
                <option value="apartment">Apartment</option>
                <option value="car">Car</option>
                <option value="land">Land</option>
                <option value="clothing">Clothing</option> {/* Added clothing option */}
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
                    <th>Title</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredListings.length > 0 ? (
                    filteredListings.map((listing) => {
                      const categoryInfo = getCategoryInfo(listing);
                      return (
                        <tr key={listing.id}>
                          <td>#{listing.id}</td>
                          <td>
                            <div className="font-medium text-gray-900">
                              {listing.title || `${listing.type} in ${listing.city}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {listing.type === 'clothing' 
                                ? (listing.brand || 'Clothing Item') 
                                : `${listing.address}, ${listing.city}`}
                            </div>
                          </td>
                          <td>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full flex items-center">
                              {categoryInfo.icon}
                              {categoryInfo.display}
                            </span>
                            {categoryInfo.subDisplay && (
                              <div className="text-xs text-gray-500 mt-1">
                                {categoryInfo.subDisplay}
                              </div>
                            )}
                          </td>
                          <td className="font-medium text-gray-900">
                            {listing.type === 'clothing' 
                              ? `$${listing.price ? listing.price.toLocaleString() : 'N/A'}`
                              : `$${listing.price ? listing.price.toLocaleString() : 'N/A'}`}
                          </td>
                          <td>{getStatusBadge(listing.status)}</td>
                          <td className="text-gray-500">
                            {formatDate(listing.created_at)}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                onClick={() => navigate(`/admin/listings/edit/${listing.id}`)}
                                className="action-btn edit"
                                title="Edit"
                              >
                                <FaEdit />
                              </button>
                              <button 
                                onClick={() => handleDeleteListing(listing.id)}
                                className="action-btn delete"
                                title="Delete"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
        </main>
      </div>
    </div>
  );
};

export default AdminListings;