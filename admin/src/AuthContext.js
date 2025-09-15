// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly in this file
const supabaseUrl = 'https://ouscjkmgdsnzakairivo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91c2Nqa21nZHNuemFrYWlyaXZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzY0MzYsImV4cCI6MjA3MTUxMjQzNn0.ii49ymR7Bi7WZTYOkYnE1-kJIlZ7DV5xR_tM3kbX-MU';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        if (user && isMounted) {
          setUser(user);
          
          // Check if user is admin
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profileError) {
            console.error('Profile fetch error:', profileError);
            // Default to non-admin if profile fetch fails
            setIsAdmin(false);
          } else {
            setIsAdmin(profile?.role === 'admin');
          }
        } else if (isMounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (isMounted) {
          setAuthError(error.message);
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
              
            if (profileError) {
              console.error('Profile fetch error on sign in:', profileError);
              setIsAdmin(false);
            } else {
              setIsAdmin(profile?.role === 'admin');
            }
          } catch (error) {
            console.error('Error checking admin status on sign in:', error);
            setIsAdmin(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );
    
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAdmin(false);
      setAuthError(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthError(error.message);
    }
  };

  const value = {
    user,
    isAdmin,
    loading,
    authError,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
