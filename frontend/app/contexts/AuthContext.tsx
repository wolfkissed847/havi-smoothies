"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'customer' | 'admin';

interface User {
  id: string;
  username?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  register: async () => ({ success: false, error: 'Not implemented' }),
  logout: async () => {},
  isAdmin: false,
  isLoggedIn: false,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = React.useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Helper function to fetch profile from DB
  const fetchProfile = async (uid: string, email: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', uid)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile from Supabase profiles table:', error);
        return null;
      }

      if (!data) {
        return {
          id: uid,
          username: email.split('@')[0],
          email,
          name: email,
          role: 'customer',
          phone: undefined,
          avatar: undefined,
        };
      }
      
      return {
        id: uid,
        username: data?.username || data?.name || email.split('@')[0],
        email: email,
        name: data?.name || data?.username || email,
        role: (data?.role as UserRole) || 'customer',
        phone: data?.phone,
        avatar: data?.avatar_url || undefined,
      };
    } catch (err) {
      console.error('Fetch profile catch error:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email || '');
          setUser(profile);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = userRef.current;
      
      // Skip loading and fetching if session matches already loaded user (e.g. on window focus or token refresh)
      if (session?.user && currentUser && currentUser.id === session.user.id) {
        return;
      }
      
      // Skip loading if already logged out and session is empty
      if (!session?.user && !currentUser) {
        return;
      }

      setLoading(true);
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || '');
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const attemptLogin = async (candidateEmail: string) => supabase.auth.signInWithPassword({
        email: candidateEmail,
        password,
      });

      const trimmedEmail = email.trim();
      const candidateEmails = trimmedEmail.includes('@')
        ? [
            trimmedEmail,
            trimmedEmail.endsWith('@gmail.com')
              ? trimmedEmail.replace('@gmail.com', '@example.com')
              : trimmedEmail.endsWith('@example.com')
                ? trimmedEmail.replace('@example.com', '@gmail.com')
                : '',
          ].filter(Boolean)
        : [
            `${trimmedEmail}@gmail.com`,
            `${trimmedEmail}@example.com`,
          ];

      for (const candidateEmail of candidateEmails) {
        const { data, error } = await attemptLogin(candidateEmail);
        if (!error && data?.user) {
          const profile = await fetchProfile(data.user.id, data.user.email || '');
          setUser(profile);
          return true;
        }
      }

      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Sign up user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          }
        }
      });
      
      if (error) throw error;
      
      const sessionUser = data?.user;
      if (sessionUser) {
        // 2. Fallback: Update user profile details (trigger has already created the row, so we update it)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name, phone })
          .eq('auth_user_id', sessionUser.id);
          
        if (profileError) {
          console.warn('Profile update fallback warning (usually safe to ignore if trigger saved it):', profileError);
        }
        
        return { success: true };
      }
      return { success: false, error: 'Registration succeeded, but failed to retrieve user session.' };
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin: user?.role === 'admin',
      isLoggedIn: !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

