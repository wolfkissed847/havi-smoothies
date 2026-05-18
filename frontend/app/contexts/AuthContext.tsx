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
      const demoAccounts: Record<string, { id: string; email: string; username: string; name: string; role: UserRole }> = {
        admin: {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'admin@gmail.com',
          username: 'admin',
          name: 'Admin',
          role: 'admin',
        },
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'user@gmail.com',
          username: 'user',
          name: 'User',
          role: 'customer',
        },
      };

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

      const demoKey = trimmedEmail.includes('@') ? trimmedEmail.split('@')[0] : trimmedEmail;
      const demoAccount = demoAccounts[demoKey];

      if (demoAccount && demoAccount.username === password) {
        setUser({
          id: demoAccount.id,
          username: demoAccount.username,
          email: demoAccount.email,
          name: demoAccount.name,
          role: demoAccount.role,
          phone: undefined,
          avatar: undefined,
        });
        return true;
      }

      return false;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Sign up user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) throw error;
      
      const sessionUser = data?.user;
      if (sessionUser) {
        // 2. Update user profile details (trigger has already created the row, so we update it)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name, phone })
          .eq('auth_user_id', sessionUser.id);
          
        if (profileError) {
          console.error('Profile update warning:', profileError);
        }
        
        return { success: true };
      }
      return { success: false, error: 'Registration succeeded, but failed to retrieve user session.' };
    } catch (err: any) {
      console.error('Register error:', err);
      return { success: false, error: err.message || 'An unknown error occurred' };
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

