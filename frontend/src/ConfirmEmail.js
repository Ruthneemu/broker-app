import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ouscjkmgdsnzakairivo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c2Nqa21nZHNuemFrYWlyaXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzY0MzYsImV4cCI6MjA3MTUxMjQzNn0.ii49ymR7Bi7WZTYOkYnE1-kJIlZ7DV5xR_tM3kbX-MU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ConfirmEmail = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const handleConfirmation = async () => {
      try {
        // Get the access token from the URL
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;

          setStatus('success');
          setMessage('Email confirmed successfully! You can now log in.');

          // Redirect to login after a delay
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          throw new Error('Invalid confirmation link');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during email confirmation.');
      }
    };

    handleConfirmation();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          {status === 'loading' && (
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {status === 'success' && (
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' ? 'Confirming Email' : 
             status === 'success' ? 'Email Confirmed' : 'Confirmation Failed'}
          </h2>
          <p className="text-gray-600 mb-6">{message}</p>

          {status === 'error' && (
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;