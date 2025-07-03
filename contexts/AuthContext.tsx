import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { authService } from '../lib/auth';
import { databaseService } from '../lib/database';
import { User } from '../types/database';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        Promise.resolve().then(() => {
          if (isMounted.current) {
            setLoading(false);
          }
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          Promise.resolve().then(() => {
            if (isMounted.current) {
              setUser(null);
              setLoading(false);
            }
          });
        }
      }
    );

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await databaseService.getUserProfile(userId);
      if (data && !error && isMounted.current) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      Promise.resolve().then(() => {
        if (isMounted.current) {
          setLoading(false);
        }
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn(email, password);
    return { error };
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    const { data, error } = await authService.signUp(email, password, userData);
    
    if (data.user && !error) {
      // Create user profile in database
      await databaseService.createUserProfile({
        id: data.user.id,
        email: data.user.email!,
        ...userData,
      });
    }
    
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
    Promise.resolve().then(() => {
      if (isMounted.current) {
        setUser(null);
      }
    });
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await databaseService.updateUserProfile(user.id, updates);
    if (!error && isMounted.current) {
      setUser({ ...user, ...updates });
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}