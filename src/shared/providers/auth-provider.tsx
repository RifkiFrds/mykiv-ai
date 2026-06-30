'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { createClient } from '@/shared/lib/supabase/client';
import type { UserRow, CoupleRow } from '@/shared/types/database';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  /** Supabase Auth user */
  user: User | null;
  /** App user profile from users table */
  profile: UserRow | null;
  /** Couple data */
  couple: CoupleRow | null;
  /** Partner profile */
  partner: UserRow | null;
  /** Auth session */
  session: Session | null;
  /** Loading state */
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  /** Sign out */
  signOut: () => Promise<void>;
  /** Refresh user profile data */
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    couple: null,
    partner: null,
    session: null,
    isLoading: true,
  });

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          await loadProfile(session.user.id);
          setState((prev) => ({
            ...prev,
            user: session.user,
            session,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadProfile(session.user.id);
        setState((prev) => ({
          ...prev,
          user: session.user,
          session,
          isLoading: false,
        }));
      } else if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          profile: null,
          couple: null,
          partner: null,
          session: null,
          isLoading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      // Load user profile
      const { data: profile } = await (supabase.from('users') as any)
        .select('*')
        .eq('id', userId)
        .single();

      if (!profile) return;

      let couple: CoupleRow | null = null;
      let partner: UserRow | null = null;

      if (profile.couple_id) {
        // Load couple data
        const { data: coupleData } = await (supabase.from('couples') as any)
          .select('*')
          .eq('id', profile.couple_id)
          .single();

        couple = coupleData;

        if (coupleData) {
          // Load partner profile
          const partnerId =
            coupleData.partner_a === userId
              ? coupleData.partner_b
              : coupleData.partner_a;

          const { data: partnerData } = await (supabase.from('users') as any)
            .select('*')
            .eq('id', partnerId)
            .single();

          partner = partnerData;
        }
      }

      setState((prev) => ({ ...prev, profile, couple, partner }));
    } catch {
      // Profile may not exist yet (first login)
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (state.user) {
      await loadProfile(state.user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
