"use client";

import type { User } from "@/types";

// Deterministic color per user so the same person always gets the same avatar color
function avatarColor(username: string): string {
  const palette = [
    "#6c6fff", "#3ddc97", "#f5a623", "#ff5c5c",
    "#a78bfa", "#38bdf8", "#fb923c", "#f472b6",
  ];
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = username.charCodeAt(i) + ((h << 5) - h);
  }
  return palette[Math.abs(h) % palette.length];
}

export function Avatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const sizeMap = {
    sm: { dim: 28, font: 11 },
    md: { dim: 36, font: 13 },
    lg: { dim: 42, font: 15 },
  };
  const { dim, font } = sizeMap[size];

  const initials = (user.displayName || user.username)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className="avatar"
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        backgroundColor: user.avatarUrl ? undefined : avatarColor(user.username),
        backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : undefined,
        ...(user.avatarUrl ? { backgroundSize: "cover", backgroundPosition: "center" } : {}),
      }}
    >
      {!user.avatarUrl && initials}
    </div>
  );
}