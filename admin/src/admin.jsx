// App.js
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import './admin.css';
import { createClient } from '@supabase/supabase-js';
import AdminLogin from './adminLogin';
import AdminDashboard from './AdminDashboard';
import AdminListings from './AdminListings';
import AdminUsers from './AdminUsers';
import AdminInquiries from './AdminInquiries';
import AdminSettings from './AdminSettings';
import AdminAnalytics from './AdminAnalytics';

const supabaseUrl = 'https://ouscjkmgdsnzakairivo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c2Nqa21nZHNuemFrYWlyaXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzY0MzYsImV4cCI6MjA3MTUxMjQzNn0.ii49ymR7Bi7WZTYOkYnE1-kJIlZ7DV5xR_tM3kbX-MU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        setIsAdmin(profile?.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    };

    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user);
          
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          setIsAdmin(profile?.role === 'admin');
          navigate('/admin/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
          navigate('/admin/login');
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  // Sign out function
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    navigate('/admin/login');
  };

  const value = {
    user,
    isAdmin,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected route component for admin pages
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-gray-50 min-h-screen">
          <Routes>
            {/* Admin login page - this is the first page users will see */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* Protected admin routes - only accessible after login */}
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
            
            {/* Redirect root to admin login */}
            <Route path="/" element={<Navigate to="/admin/login" />} />
            
            {/* Catch-all route - redirect to admin login */}
            <Route path="*" element={<Navigate to="/admin/login" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;