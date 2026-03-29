"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken, setToken, clearToken, isTokenExpired } from "@/lib/auth";
import { mockUser } from "@/lib/mock";
import type { User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();

    if (!stored || isTokenExpired(stored)) {
      clearToken();
      // TODO: remove mockUser fallback when backend is ready
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    setTokenState(stored);

    api
      .get<User>("/users/me")
      .then((me) => setUser(me))
      .catch(() => {
        // TODO: replace with proper error handling when backend is ready
        setUser(mockUser);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(newToken: string, newUser: User) {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }

  function logout() {
    clearToken();
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}