import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, clearToken, getToken } from './api';
import type { PendingVerification, User } from './types';

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<PendingVerification>;
  verifyOtp: (pendingId: string, codes: { emailOtp?: string; phoneOtp?: string }) => Promise<void>;
  resendOtp: (pendingId: string) => Promise<PendingVerification['devOtps']>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<{ user: User }>('/auth/me');
        setUser(res.user);
      } catch {
        await clearToken();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const res = await api.post<{ token: string; user: User }>(
      '/auth/login',
      { email, password },
      false
    );
    await setToken(res.token);
    setUser(res.user);
  }

  // Registration no longer returns a token — the account must be verified
  // via OTP (email or phone, either works) first.
  async function signUp(name: string, email: string, phone: string, password: string) {
    return api.post<PendingVerification>(
      '/auth/register',
      { name, email, phone, password },
      false
    );
  }

  async function verifyOtp(
    pendingId: string,
    codes: { emailOtp?: string; phoneOtp?: string }
  ) {
    const res = await api.post<{ token: string; user: User }>(
      '/auth/verify-otp',
      { pendingId, ...codes },
      false
    );
    await setToken(res.token);
    setUser(res.user);
  }

  async function resendOtp(pendingId: string) {
    const res = await api.post<{ devOtps?: PendingVerification['devOtps'] }>(
      '/auth/resend-otp',
      { pendingId },
      false
    );
    return res.devOtps;
  }

  async function signOut() {
    await clearToken();
    setUser(null);
  }

  async function refresh() {
    try {
      const res = await api.get<{ user: User }>('/auth/me');
      setUser(res.user);
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, verifyOtp, resendOtp, signOut, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
