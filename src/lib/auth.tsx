import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authToken, TOKEN_CHANGED_EVENT, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { usersApi } from "@/lib/api";
import type { AuthUser } from "@/lib/api/types";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!authToken.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setUser(await usersApi.getMe());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChange = () => void refresh();
    const onUnauthorized = () => setUser(null);
    window.addEventListener(TOKEN_CHANGED_EVENT, onChange);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => {
      window.removeEventListener(TOKEN_CHANGED_EVENT, onChange);
      window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    };
  }, [refresh]);

  const signOut = useCallback(() => {
    usersApi.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, isAuthenticated: Boolean(user), refresh, signOut }),
    [user, loading, refresh, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
