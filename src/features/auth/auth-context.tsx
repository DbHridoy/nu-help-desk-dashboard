"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearStoredSession, getStoredAdmin, getStoredToken, setStoredSession } from "@/lib/auth";
import { adminApi } from "@/lib/api/client";
import type { AdminUser } from "@/types";

interface AuthContextValue {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setToken(null);
      setAdmin(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const currentAdmin = (await adminApi.me()) as AdminUser;
      setAdmin(currentAdmin);
      setStoredSession(storedToken, currentAdmin);
    } catch {
      const fallbackAdmin = getStoredAdmin() as AdminUser | null;
      setAdmin(fallbackAdmin);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const storedToken = getStoredToken();

      if (!storedToken) {
        if (!cancelled) {
          setToken(null);
          setAdmin(null);
          setIsLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setToken(storedToken);
      }

      try {
        const currentAdmin = (await adminApi.me()) as AdminUser;
        if (!cancelled) {
          setAdmin(currentAdmin);
          setStoredSession(storedToken, currentAdmin);
        }
      } catch {
        if (!cancelled) {
          setAdmin((getStoredAdmin() as AdminUser | null) ?? null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await adminApi.login(email, password);
      setStoredSession(response.token, response.admin);
      setToken(response.token);
      setAdmin(response.admin);
      router.push("/dashboard");
      router.refresh();
    },
    [router],
  );

  const logout = useCallback(() => {
    clearStoredSession();
    setToken(null);
    setAdmin(null);
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      refreshAdmin,
    }),
    [admin, isLoading, login, logout, refreshAdmin, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
