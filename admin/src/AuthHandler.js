// AuthHandler.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash.substring(1);
        if (!hash) {
          navigate('/admin/login');
          return;
        }

        const params = new URLSearchParams(hash);
        const type = params.get('type');
        
        if (type === 'recovery') {
          // This is a password recovery flow
          // Set the session using the tokens in the URL
          const { error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            navigate('/admin/login?error=session_error');
            return;
          }
          
          // Redirect to the reset password page
          navigate('/admin/reset-password');
        } else {
          // Not a recovery flow, redirect to login
          navigate('/admin/login');
        }
      } catch (err) {
        console.error('Auth handler error:', err);
        navigate('/admin/login?error=auth_error');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="text-white text-xl">Processing authentication...</div>
    </div>
  );
};

export default AuthHandler;
