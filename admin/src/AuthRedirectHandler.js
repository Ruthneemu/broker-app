// AuthRedirectHandler.js
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const AuthRedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashFragment = async () => {
      const hash = location.hash.substring(1); // Remove the #
      const params = new URLSearchParams(hash);
      
      // Check if this is a password reset flow
      if (params.get('type') === 'recovery') {
        // Extract the access token
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          // Set the session with the access token
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: params.get('refresh_token'),
          });
          
          if (error) {
            console.error('Error setting session:', error);
            navigate('/admin/login');
            return;
          }
          
          // Redirect to the reset password page
          navigate('/admin/src/AdminResetPassword');
        }
      }
    };

    handleHashFragment();
  }, [location, navigate]);

  return null;
};

export default AuthRedirectHandler;
