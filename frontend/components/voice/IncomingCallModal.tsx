"use client";

import React from "react";
import { User } from "@/types/index";
import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallModalProps {
  caller: User;
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * IncomingCallModal
 * Displays an incoming call notification with accept/decline buttons
 */
export function IncomingCallModal({
  caller,
  onAccept,
  onDecline,
}: IncomingCallModalProps): React.ReactNode {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderRadius: "var(--radius)",
          padding: "32px",
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
          maxWidth: "300px",
          border: "1px solid var(--border)",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            backgroundColor: caller.avatarUrl
              ? undefined
              : avatarColor(caller.username),
            backgroundImage: caller.avatarUrl
              ? `url(${caller.avatarUrl})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          {!caller.avatarUrl &&
            caller.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Caller name */}
        <h2
          style={{
            color: "var(--text-primary)",
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 8px",
            fontFamily: "var(--font-display)",
          }}
        >
          {caller.displayName}
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            margin: "0 0 24px",
          }}
        >
          is calling...
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={onDecline}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "var(--radius)",
              border: "none",
              backgroundColor: "var(--danger)",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.98)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            <PhoneOff size={16} />
            Decline
          </button>
          <button
            onClick={onAccept}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "var(--radius)",
              border: "none",
              backgroundColor: "var(--success)",
              color: "white",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "background 0.2s, transform 0.1s",
            }}
            onMouseDown={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(0.98)";
            }}
            onMouseUp={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "scale(1)";
            }}
          >
            <Phone size={16} />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Deterministic color generation based on username
 */
function avatarColor(username: string): string {
  const palette = [
    "#6c6fff",
    "#3ddc97",
    "#f5a623",
    "#ff5c5c",
    "#a78bfa",
    "#38bdf8",
    "#fb923c",
    "#f472b6",
  ];
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = username.charCodeAt(i) + ((h << 5) - h);
  }
  return palette[Math.abs(h) % palette.length];
}
