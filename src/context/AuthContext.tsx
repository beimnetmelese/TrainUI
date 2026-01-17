import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginApi,
  registerApi,
  refreshTokenApi,
  setAuthToken,
} from "../services/api";
import { AuthResponse, User } from "../types";

interface AuthContextProps {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user?: User) => void;
  updateToken: (access: string) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const STORAGE_KEY = "trains_auth";

const persistAuth = (payload: {
  user?: User;
  access?: string;
  refresh?: string;
}) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const loadAuth = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as {
      user?: User;
      access?: string;
      refresh?: string;
    };
  } catch (err) {
    console.error("Failed to parse auth cache", err);
    return {};
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const cached = useMemo(() => loadAuth(), []);
  const [user, setUser] = useState<User | undefined>(cached.user);
  const [accessToken, setAccessToken] = useState<string | undefined>(
    cached.access,
  );
  const [refreshToken, setRefreshToken] = useState<string | undefined>(
    cached.refresh,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
    }
  }, [accessToken]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setUser(data.user);
    setAccessToken(data.access);
    setRefreshToken(data.refresh);
    persistAuth({
      user: data.user,
      access: data.access,
      refresh: data.refresh,
    });
    setAuthToken(data.access);
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      // Ensure we don't send a stale Authorization header during login
      setAuthToken(undefined);
      const data = await loginApi(username.trim(), password);
      handleAuthSuccess(data);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: Partial<User> & { password: string }) => {
    setLoading(true);
    try {
      // Avoid stale Authorization on public register
      setAuthToken(undefined);
      const data = await registerApi(payload);
      handleAuthSuccess(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(undefined);
    setAccessToken(undefined);
    setRefreshToken(undefined);
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(undefined);
  };

  const updateToken = (access: string) => {
    setAccessToken(access);
    persistAuth({ user, access, refresh: refreshToken });
    setAuthToken(access);
  };

  // Simple refresh helper (manual trigger; could be wired to axios interceptor later)
  useEffect(() => {
    const maybeRefresh = async () => {
      if (!refreshToken || !accessToken) return;
      try {
        const fresh = await refreshTokenApi(refreshToken);
        updateToken(fresh.access);
      } catch (err) {
        console.warn("Token refresh failed", err);
      }
    };
    const timer = setInterval(maybeRefresh, 1000 * 60 * 10);
    return () => clearInterval(timer);
  }, [refreshToken, accessToken]);

  const value: AuthContextProps = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAdmin: Boolean(
      user?.is_staff || user?.is_superuser || (user as any)?.is_admin,
    ),
    login,
    register,
    logout,
    setUser,
    updateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
