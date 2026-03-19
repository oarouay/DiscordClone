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
      style={{
        width: dim,
        height: dim,
        minWidth: dim,
        borderRadius: "50%",
        background: avatarColor(user.username),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
        fontWeight: 700,
        fontSize: font,
        letterSpacing: "0.5px",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}