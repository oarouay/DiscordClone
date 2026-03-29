"use client";

import { MessageCircle } from "lucide-react";

interface EmptyChannelStateProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EmptyChannelState({
  title = "Start the conversation",
  subtitle = "Be the first to send a message.",
  icon = <MessageCircle size={52} style={{ opacity: 0.2 }} />,
}: EmptyChannelStateProps) {
  return (
    <div
      className="empty-state"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "40px 20px",
      }}
    >
      {icon}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 8,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
