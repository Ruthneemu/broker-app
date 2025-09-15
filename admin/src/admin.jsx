import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import AdminLogin from './adminLogin';
import AdminDashboard from './AdminDashboard';
import AdminListings from './AdminListings';
import AdminUsers from './AdminUsers';
import AdminInquiries from './AdminInquiries';
import AdminSettings from './AdminSettings';
import AdminAnalytics from './AdminAnalytics';
import AdminResetPassword from './AdminResetPassword';
import AuthHandler from './AuthHandler';
import './admin.css';

// Move ProtectedRoute outside of App component
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Add a root redirect component
const RootRedirect = () => {
  const { user, isAdmin, loading } = useAuth(); // Destructure loading state

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-gray-50 min-h-screen">
          <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route path="/admin/auth-handler" element={<AuthHandler />} />

            {/* Protected Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/listings" element={
              <ProtectedRoute>
                <AdminListings />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/inquiries" element={
              <ProtectedRoute>
                <AdminInquiries />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />

            {/* Root and Catch-all Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
