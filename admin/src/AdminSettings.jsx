// AdminSettings.js
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './Admin.css';

const AdminSettings = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'BrokerConnect',
    contactEmail: 'contact@brokerconnect.com',
    contactPhone: '(555) 123-4567',
    address: '123 Main St, Anytown, USA',
    aboutUs: 'BrokerConnect is your ultimate marketplace for premium apartments, reliable cars, and valuable land.',
    privacyPolicy: 'Your privacy is important to us...',
    termsOfService: 'By using our service, you agree to the following terms...'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSiteSettings();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSiteSettings(data);
      }
    } catch (error) {
      console.error('Error fetching site settings:', error.message);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: newCategory }]);

      if (error) throw error;

      // Update local state
      setCategories([...categories, { name: newCategory }]);
      setNewCategory('');

      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Added Category',
          description: `Admin added new category: ${newCategory}`,
          icon: 'fa-folder-plus',
          color: 'text-green-500'
        }]);
    } catch (error) {
      console.error('Error adding category:', error.message);
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (name) => {
    if (window.confirm(`Are you sure you want to delete the "${name}" category?`)) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('name', name);

        if (error) throw error;

        // Update local state
        setCategories(categories.filter(cat => cat.name !== name));

        // Log activity
        await supabase
          .from('activity_log')
          .insert([{
            action: 'Deleted Category',
            description: `Admin deleted category: ${name}`,
            icon: 'fa-folder-minus',
            color: 'text-red-500'
          }]);
      } catch (error) {
        console.error('Error deleting category:', error.message);
        alert('Failed to delete category');
      }
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert([siteSettings]);

      if (error) throw error;

      // Log activity
      await supabase
        .from('activity_log')
        .insert([{
          action: 'Updated Site Settings',
          description: `Admin updated site settings`,
          icon: 'fa-cog',
          color: 'text-blue-500'
        }]);

      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error.message);
      alert('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field, value) => {
    setSiteSettings({
      ...siteSettings,
      [field]: value
    });
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
            <li className="active">
              <a href="/admin/settings">
                <i className="fas fa-cog mr-3"></i> Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        </div>

        <div className="admin-settings-container">
          <div className="admin-card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            </div>

            <div className="categories-list">
              {categories.length > 0 ? (
                <ul>
                  {categories.map((category, index) => (
                    <li key={index} className="category-item">
                      <span>{category.name}</span>
                      <button 
                        onClick={() => handleDeleteCategory(category.name)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-4">No categories found</p>
              )}
            </div>

            <div className="add-category">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category"
                className="p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          <div className="admin-card">
            <div className="card-header">
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
            </div>

            <div className="settings-form">
              <div className="form-group">
                <label>Site Name</label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  value={siteSettings.contactPhone}
                  onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => handleSettingChange('address', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="form-group">
                <label>About Us</label>
                <textarea
                  value={siteSettings.aboutUs}
                  onChange={(e) => handleSettingChange('aboutUs', e.target.value)}
                  rows="4"
                  className="p-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Privacy Policy</label>
                <textarea
                  value={siteSettings.privacyPolicy}
                  onChange={(e) => handleSettingChange('privacyPolicy', e.target.value)}
                  rows="6"
                  className="p-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Terms of Service</label>
                <textarea
                  value={siteSettings.termsOfService}
                  onChange={(e) => handleSettingChange('termsOfService', e.target.value)}
                  rows="6"
                  className="p-2 border border-gray-300 rounded-lg"
                ></textarea>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleSaveSettings}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;