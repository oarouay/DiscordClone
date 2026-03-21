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

type RegisterResponse = {
  token: string;
  user: User;
};

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await api.post<RegisterResponse>("/auth/register", {
        username,
        displayName,
        email,
        password,
      });
      login(data.token, data.user);
      router.replace("/channels/me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>Create an account</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="auth-field">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

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
            autoComplete="new-password"
          />
        </div>

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" disabled={isLoading} className="auth-submit">
          {isLoading ? "Creating account..." : "Continue"}
        </Button>
      </form>

      <p className="auth-footer">
        Already have an account?{" "}
        <Link href="/login" className="auth-link">
          Log in
        </Link>
      </p>
    </div>
  );
}