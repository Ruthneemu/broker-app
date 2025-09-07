import React, { useState } from 'react';
import { FaChartLine, FaUsers, FaEye, FaMousePointer, FaBars, FaTimes } from 'react-icons/fa';
import './admin.css';

const AdminAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: FaChartLine, current: false },
    { name: 'Listings', href: '/admin/listings', icon: FaChartLine, current: false },
    { name: 'Users', href: '/admin/users', icon: FaChartLine, current: false },
    { name: 'Inquiries', href: '/admin/inquiries', icon: FaChartLine, current: false },
    { name: 'Analytics', href: '/admin/analytics', icon: FaChartLine, current: true },
    { name: 'Settings', href: '/admin/settings', icon: FaChartLine, current: false },
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <FaChartLine className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Visits</p>
                <p className="text-2xl font-semibold text-gray-900">12,458</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <FaUsers className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">8,742</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <FaEye className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Page Views</p>
                <p className="text-2xl font-semibold text-gray-900">24,891</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <FaMousePointer className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Click Rate</p>
                <p className="text-2xl font-semibold text-gray-900">3.2%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Traffic Sources</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Traffic chart will be displayed here</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">User Engagement</h2>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">Engagement chart will be displayed here</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Performance Metrics</h2>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Performance metrics chart will be displayed here</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;