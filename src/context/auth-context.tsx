import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type Session } from "@/services/auth.service";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithQr: (payload: string) => Promise<User>;
  signup: (input: { name: string; email: string; organization: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => authService.getSession());
  const [loading, setLoading] = useState(false);

  // Re-check persisted session when browser storage changes.
  useEffect(() => {
    const onStorage = () => setSession(authService.getSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const s = await authService.login(email, password);
      setSession(s);
      return s.user;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    const remaining = session.expiresAt - Date.now();
    if (remaining <= 0) {
      authService.logout();
      setSession(null);
      return;
    }
    const timer = window.setTimeout(() => {
      authService.logout();
      setSession(null);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [session]);

  const loginWithQr = useCallback(async (payload: string) => {
    setLoading(true);
    try {
      const s = await authService.loginWithQr(payload);
      setSession(s);
      return s.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (input: { name: string; email: string; organization: string }) => {
    setLoading(true);
    try {
      const s = await authService.signup(input);
      setSession(s);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: !!session,
      loading,
      login,
      loginWithQr,
      signup,
      logout,
    }),
    [session, loading, login, loginWithQr, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
