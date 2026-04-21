"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken, setToken, clearToken, isTokenExpired } from "@/lib/auth";
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
  const router = useRouter();

  useEffect(() => {
    const stored = getToken();

    if (!stored || isTokenExpired(stored)) {
      clearToken();
      setIsLoading(false);
      return;
    }

    setTokenState(stored);

    api
      .get<User>("/users/me")
      .then((me) => setUser(me))
      .catch(() => {
        clearToken();
        setTokenState(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(newToken: string, newUser: User) {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    localStorage.clear();
    router.replace("/login");
  }, [router]);

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