// PasswordResetPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const PasswordResetPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // This effect will run when the component mounts
    // We'll check if there's an access token in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');
    
    if (!accessToken || type !== 'recovery') {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Extract the access token from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const accessToken = urlParams.get('access_token');
      
      if (!accessToken) {
        throw new Error('Invalid reset link');
      }
      
      // Set the session with the access token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: urlParams.get('refresh_token'),
      });
      
      if (sessionError) {
        throw sessionError;
      }
      
      // Now update the password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      // Redirect to login after successful reset
      setTimeout(() => {
        navigate('/admin/login');
      }, 3000);
    } catch (err) {
      console.error('Reset error:', err);
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">BC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-circle text-red-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <i className="fas fa-check-circle text-green-500"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Password reset successful! Redirecting to login...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••••"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button 
              onClick={() => navigate('/admin/login')}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
