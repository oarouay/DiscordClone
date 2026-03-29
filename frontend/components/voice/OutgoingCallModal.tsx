"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/index";
import { X } from "lucide-react";

interface OutgoingCallModalProps {
  recipient: User;
  onCancel: () => void;
}

/**
 * OutgoingCallModal
 * Displays outgoing call UI with countdown timer
 */
export function OutgoingCallModal({
  recipient,
  onCancel,
}: OutgoingCallModalProps): React.ReactNode {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onCancel]);

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
            backgroundColor: recipient.avatarUrl
              ? undefined
              : avatarColor(recipient.username),
            backgroundImage: recipient.avatarUrl
              ? `url(${recipient.avatarUrl})`
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
          {!recipient.avatarUrl &&
            recipient.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Recipient name */}
        <h2
          style={{
            color: "var(--text-primary)",
            fontSize: "20px",
            fontWeight: "600",
            margin: "0 0 8px",
            fontFamily: "var(--font-display)",
          }}
        >
          {recipient.displayName}
        </h2>

        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "14px",
            margin: "0 0 24px",
          }}
        >
          Calling...
        </p>

        {/* Countdown timer */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "var(--accent)",
            margin: "0 0 24px",
            fontFamily: "monospace",
          }}
        >
          {countdown}s
        </div>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "12px 24px",
            borderRadius: "50%",
            width: "56px",
            height: "56px",
            margin: "0 auto",
            border: "none",
            backgroundColor: "var(--danger)",
            color: "white",
            cursor: "pointer",
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
          <X size={24} />
        </button>
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
