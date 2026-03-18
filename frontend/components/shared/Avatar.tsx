"use client";

import type { User } from "@/types";

export function Avatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(user.displayName || user.username);

  return (
    <div
      className={`
        ${sizeClasses[size]}
        bg-gradient-to-br from-blue-500 to-purple-600
        rounded-full flex items-center justify-center
        text-white font-bold
      `}
    >
      {initials}
    </div>
  );
}
