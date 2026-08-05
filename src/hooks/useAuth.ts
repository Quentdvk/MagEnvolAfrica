import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SUPABASE_MISSING_CONFIG_MESSAGE, isSupabaseConfigured } from '@/lib/supabase/config';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const configured = isSupabaseConfigured();
  const [loading, setLoading] = useState(configured);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: new Error(SUPABASE_MISSING_CONFIG_MESSAGE) };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) {
      return { data: null, error: new Error(SUPABASE_MISSING_CONFIG_MESSAGE) };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { data, error };
  };

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    if (!supabase) {
      return { data: null, error: new Error(SUPABASE_MISSING_CONFIG_MESSAGE) };
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) {
      return { error: new Error(SUPABASE_MISSING_CONFIG_MESSAGE) };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { data: null, error: new Error(SUPABASE_MISSING_CONFIG_MESSAGE) };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    isConfigured: configured,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
  };
}
