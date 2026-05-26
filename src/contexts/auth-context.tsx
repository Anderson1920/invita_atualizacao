"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { demoUsers } from "@/lib/demo-data";
import type { UserProfile, UserRole } from "@/lib/types";

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  backendAuth: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  signup: (input: { name: string; email: string; password: string }) => Promise<UserProfile>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  authHeaders: () => Promise<HeadersInit>;
  setDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function defaultDemoUser(role: UserRole): UserProfile {
  const found = demoUsers.find((item) => item.role === role) || demoUsers[1];

  return found;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/session", { credentials: "same-origin" })
      .then((response) => response.json())
      .then((payload) => {
        if (active) {
          setUser(payload.data?.user || null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Nao foi possivel entrar.");
    }

    const profile = payload.data as UserProfile;

    setUser(profile);
    return profile;
  }, []);

  const signup = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(input),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Nao foi possivel criar a conta.");
      }

      const profile = payload.data as UserProfile;

      setUser(profile);
      return profile;
    },
    [],
  );

  const resetPassword = useCallback(async (email: string) => {
    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const payload = await response.json();
      throw new Error(payload.error || "Nao foi possivel recuperar a senha.");
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setUser(null);
  }, []);

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    return {};
  }, []);

  const setDemoRole = useCallback((role: UserRole) => {
    const profile = defaultDemoUser(role);

    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      backendAuth: true,
      login,
      signup,
      resetPassword,
      logout,
      authHeaders,
      setDemoRole,
    }),
    [authHeaders, loading, login, logout, resetPassword, setDemoRole, signup, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return value;
}
