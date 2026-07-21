import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FamilyMember } from '../types';

export function useSupabaseAuth() {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [supabaseProfile, setSupabaseProfile] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to map DB profile to FamilyMember interface
  const mapProfileToMember = (profile: any, email?: string): FamilyMember => ({
    id: profile.id,
    name: profile.name || email?.split('@')[0] || 'Membro Família',
    role: profile.role || 'Membro do Grupo',
    spendingLimit: Number(profile.spending_limit || profile.spendingLimit || 2500),
    currentSpending: Number(profile.current_spending || profile.currentSpending || 0),
    points: Number(profile.points || 100),
    avatarUrl: profile.avatar_url || profile.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + profile.id,
    limitStatus: profile.limit_status || profile.limitStatus || 'Dentro do limite',
    email: profile.email || email,
  });

  // Fetch or create public.profiles row for authenticated user
  const fetchOrCreateProfile = async (user: any): Promise<FamilyMember | null> => {
    if (!user) return null;

    try {
      // 1. Check if profile exists
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existing && !error) {
        const member = mapProfileToMember(existing, user.email);
        setSupabaseProfile(member);
        return member;
      }

      // 2. Insert new profile if missing
      const newProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Membro',
        role: user.user_metadata?.role || 'Membro do Grupo',
        spending_limit: Number(user.user_metadata?.spendingLimit || 2500),
        avatar_url: user.user_metadata?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id,
      };

      const { data: created } = await supabase
        .from('profiles')
        .upsert([newProfile])
        .select()
        .single();

      const member = mapProfileToMember(created || newProfile, user.email);
      setSupabaseProfile(member);
      return member;
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err);
      // Fallback object from auth metadata
      const fallbackMember: FamilyMember = {
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Membro',
        role: user.user_metadata?.role || 'Membro do Grupo',
        spendingLimit: 2500,
        currentSpending: 0,
        points: 100,
        avatarUrl: user.user_metadata?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id,
        limitStatus: 'Dentro do limite',
        email: user.email
      };
      setSupabaseProfile(fallbackMember);
      return fallbackMember;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchOrCreateProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        await fetchOrCreateProfile(session.user);
      } else {
        setSupabaseUser(null);
        setSupabaseProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Supabase Sign In with Email & Password
  const signInWithEmail = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) throw error;
    if (data.user) {
      const profile = await fetchOrCreateProfile(data.user);
      return profile;
    }
    return null;
  };

  // Supabase Sign Up with Email & Password
  const signUpWithEmail = async (
    email: string,
    pass: string,
    metadata: { name: string; role: string; spendingLimit: number; avatarUrl: string }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: metadata.name,
          role: metadata.role,
          spendingLimit: metadata.spendingLimit,
          avatarUrl: metadata.avatarUrl,
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const profile = await fetchOrCreateProfile(data.user);
      return profile;
    }
    return null;
  };

  // Supabase Google OAuth
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return data;
  };

  // Supabase Sign Out
  const signOut = async () => {
    await supabase.auth.signOut();
    setSupabaseUser(null);
    setSupabaseProfile(null);
  };

  return {
    supabaseUser,
    supabaseProfile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}
