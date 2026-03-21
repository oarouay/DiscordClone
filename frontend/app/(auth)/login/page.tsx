"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";

type LoginResponse = {
  token: string;
  user: User;
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await api.post<LoginResponse>("/auth/login", { email, password });
      login(data.token, data.user);
      router.replace("/channels/me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Welcome back</h1>
      <p className="auth-subtitle">We're so excited to see you again!</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" disabled={isLoading} className="auth-submit">
          {isLoading ? "Logging in..." : "Log In"}
        </Button>
      </form>

      <p className="auth-footer">
        Need an account?{" "}
        <Link href="/register" className="auth-link">
          Register
        </Link>
      </p>
    </div>
  );
}