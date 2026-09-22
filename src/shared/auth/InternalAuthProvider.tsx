"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getInternalProfile } from "@/src/shared/api/internalAuth.api";
import { ApiError, logoutInternalRequest, markSessionHealthy } from "@/src/shared/api/http";
import type { InternalRole, InternalUser } from "@/src/shared/types/internal";

type AuthContextValue = {
  user: InternalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: InternalRole | null;
  refreshUser: () => Promise<InternalUser | null>;
  logout: () => Promise<void>;
  setAuthenticatedUser: (user: InternalUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InternalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthenticatedUser = useCallback((nextUser: InternalUser | null) => {
    setUser(nextUser);
    if (nextUser) markSessionHealthy();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getInternalProfile();
      setAuthenticatedUser(response.user);
      return response.user;
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        setAuthenticatedUser(null);
        return null;
      }
      throw error;
    }
  }, [setAuthenticatedUser]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        await refreshUser();
      } catch {
        if (active) setAuthenticatedUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [refreshUser, setAuthenticatedUser]);

  useEffect(() => {
    const handleExpired = () => setAuthenticatedUser(null);
    window.addEventListener("repairflow-internal-session-expired", handleExpired);
    return () => window.removeEventListener("repairflow-internal-session-expired", handleExpired);
  }, [setAuthenticatedUser]);

  const logout = useCallback(async () => {
    await logoutInternalRequest();
    setAuthenticatedUser(null);
  }, [setAuthenticatedUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      refreshUser,
      logout,
      setAuthenticatedUser,
    }),
    [isLoading, logout, refreshUser, setAuthenticatedUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useInternalAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useInternalAuth must be used inside InternalAuthProvider");
  return value;
}
