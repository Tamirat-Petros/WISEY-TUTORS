"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { apiRequest, type AdminUser, type AuthResponse } from "@/lib/api";

type AuthContextValue = {
  accessToken: string | null;
  user: AdminUser | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  refresh: () => Promise<AuthResponse | null>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const refreshInFlight = useRef<Promise<AuthResponse | null> | null>(null);

  const refresh = useCallback((): Promise<AuthResponse | null> => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const request = apiRequest<AuthResponse>("/auth/refresh", { method: "POST" })
      .then((session) => {
        setAccessToken(session.accessToken);
        setUser(session.user);
        return session;
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
        return null;
      })
      .finally(() => { refreshInFlight.current = null; });
    refreshInFlight.current = request;
    return request;
  }, []);

  useEffect(() => {
    void refresh().finally(() => setIsReady(true));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiRequest<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    try { await apiRequest<void>("/auth/logout", { method: "POST" }); }
    finally { setAccessToken(null); setUser(null); }
  }, []);

  return <AuthContext.Provider value={{ accessToken, user, isReady, login, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return context;
}
