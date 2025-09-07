// AdminInquiries.js
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './admin.css';
import { 
  FaHome, 
  FaUsers, 
  FaEnvelope, 
  FaCog, 
  FaTachometerAlt,
  FaFolder,
  FaEye,
  FaReply,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [responseText, setResponseText] = useState('');
  
  useEffect(() => {
    fetchInquiries();
  }, []);
  
  useEffect(() => {
    filterInquiries();
  }, [inquiries, searchTerm, statusFilter]);
  
  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const filterInquiries = () => {
    let result = inquiries;
    if (searchTerm) {
      result = result.filter(inquiry => 
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(inquiry => inquiry.status === statusFilter);
    }
    setFilteredInquiries(result);
  };
  
  const handleStatusChange = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      // Update local state
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: newStatus } : inquiry
      ));
      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Updated Inquiry Status',
          description: `Admin changed inquiry #${id} status to ${newStatus}`,
          icon: 'fa-envelope',
          color: 'text-blue-500'
        }]);
    } catch (error) {
      console.error('Error updating inquiry status:', error.message);
      alert('Failed to update status');
    }
  };
  
  const handleArchiveInquiry = async (id) => {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status: 'archived' })
        .eq('id', id);
      if (error) throw error;
      // Update local state
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === id ? { ...inquiry, status: 'archived' } : inquiry
      ));
      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Archived Inquiry',
          description: `Admin archived inquiry #${id}`,
          icon: 'fa-folder',
          color: 'text-yellow-500'
        }]);
    } catch (error) {
      console.error('Error archiving inquiry:', error.message);
      alert('Failed to archive inquiry');
    }
  };
  
  const handleSendResponse = async () => {
    if (!selectedInquiry || !responseText.trim()) return;
    try {
      // In a real app, you would send an email here
      // For demo purposes, we'll just update the inquiry status
      const { error } = await supabase
        .from('inquiries')
        .update({ 
          status: 'responded',
          response: responseText,
          responded_at: new Date().toISOString()
        })
        .eq('id', selectedInquiry.id);
      if (error) throw error;
      // Update local state
      setInquiries(inquiries.map(inquiry => 
        inquiry.id === selectedInquiry.id 
          ? { ...inquiry, status: 'responded', response: responseText } 
          : inquiry
      ));
      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Responded to Inquiry',
          description: `Admin responded to inquiry #${selectedInquiry.id}`,
          icon: 'fa-reply',
          color: 'text-green-500'
        }]);
      // Reset form
      setSelectedInquiry(null);
      setResponseText('');
      alert('Response sent successfully!');
    } catch (error) {
      console.error('Error sending response:', error.message);
      alert('Failed to send response');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      case 'responded':
        return <span className="status-badge responded">Responded</span>;
      case 'archived':
        return <span className="status-badge archived">Archived</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const handleLogout = async () => {
    // Add your logout logic here
    window.location.href = '/admin/login';
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
                <FaTachometerAlt className="mr-3" /> Dashboard
              </a>
            </li>
            <li>
              <a href="/admin/listings">
                <FaHome className="mr-3" /> Listings
              </a>
            </li>
            <li>
              <a href="/admin/users">
                <FaUsers className="mr-3" /> Users
              </a>
            </li>
            <li className="active">
              <a href="/admin/inquiries">
                <FaEnvelope className="mr-3" /> Inquiries
              </a>
            </li>
            <li>
              <a href="/admin/settings">
                <FaCog className="mr-3" /> Settings
              </a>
            </li>
            <li className="mt-auto">
              <button 
                onClick={handleLogout}
                className="flex items-center w-full p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <FaSignOutAlt className="mr-3" /> Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="admin-content">
        <div className="admin-header">
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
        </div>
        
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab-button ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Inquiries
          </button>
          <button 
            className={`tab-button ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`tab-button ${statusFilter === 'responded' ? 'active' : ''}`}
            onClick={() => setStatusFilter('responded')}
          >
            Responded
          </button>
          <button 
            className={`tab-button ${statusFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setStatusFilter('archived')}
          >
            Archived
          </button>
        </div>
        
        <div className="admin-filters">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading inquiries...</p>
          </div>
        ) : (
          <div className="admin-inquiries-container">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Listing</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInquiries.length > 0 ? (
                    filteredInquiries.map((inquiry) => (
                      <tr key={inquiry.id}>
                        <td>#{inquiry.id}</td>
                        <td>{inquiry.name}</td>
                        <td>
                          <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                            {inquiry.email}
                          </a>
                        </td>
                        <td>
                          <a href={`/admin/listings/${inquiry.listing_id}`} className="text-blue-600 hover:underline">
                            #{inquiry.listing_id}
                          </a>
                        </td>
                        <td>{new Date(inquiry.created_at).toLocaleDateString()}</td>
                        <td>{getStatusBadge(inquiry.status)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              onClick={() => setSelectedInquiry(inquiry)}
                              className="action-btn view"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button 
                              onClick={() => handleArchiveInquiry(inquiry.id)}
                              className="action-btn archive"
                              title="Archive"
                              disabled={inquiry.status === 'archived'}
                            >
                              <FaFolder />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        No inquiries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {selectedInquiry && (
              <div className="inquiry-detail">
                <div className="inquiry-header">
                  <h3 className="text-xl font-bold">Inquiry #{selectedInquiry.id}</h3>
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="inquiry-info">
                  <div className="info-row">
                    <span className="font-medium">Name:</span>
                    <span>{selectedInquiry.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="font-medium">Email:</span>
                    <span>{selectedInquiry.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="font-medium">Phone:</span>
                    <span>{selectedInquiry.phone || 'Not provided'}</span>
                  </div>
                  <div className="info-row">
                    <span className="font-medium">Listing:</span>
                    <span>#{selectedInquiry.listing_id}</span>
                  </div>
                  <div className="info-row">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(selectedInquiry.created_at).toLocaleString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="font-medium">Status:</span>
                    {getStatusBadge(selectedInquiry.status)}
                  </div>
                </div>
                <div className="inquiry-message">
                  <h4 className="font-medium mb-2">Message:</h4>
                  <p>{selectedInquiry.message}</p>
                </div>
                {selectedInquiry.response && (
                  <div className="inquiry-response">
                    <h4 className="font-medium mb-2">Previous Response:</h4>
                    <p>{selectedInquiry.response}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      Responded on: {new Date(selectedInquiry.responded_at).toLocaleString()}
                    </div>
                  </div>
                )}
                <div className="inquiry-response-form">
                  <h4 className="font-medium mb-2">Send Response:</h4>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your response here..."
                  ></textarea>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Send Response
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;