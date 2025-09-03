// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api';
import './index.css';
import { createClient } from '@supabase/supabase-js';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import AdminListings from './AdminListings';
import AdminUsers from './AdminUsers';
import AdminInquiries from './AdminInquiries';
import AdminSettings from './AdminSettings';

const supabaseUrl = 'https://ouscjkmgdsnzakairivo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c2Nqa21nZHNuemFrYWlyaXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzY0MzYsImV4cCI6MjA3MTUxMjQzNn0.ii49ymR7Bi7WZTYOkYnE1-kJIlZ7DV5xR_tM3kbX-MU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ... existing components ...

function App() {
  // ... existing state and functions ...

  return (
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Routes>
          {/* Main app routes */}
          <Route path="/" element={<HomePage />} />
          {/* ... other main app routes ... */}

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/inquiries" element={<AdminInquiries />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;