"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types/index";
import { Phone, Mic, MicOff } from "lucide-react";

interface ActiveCallBarProps {
  peer: User;
  onHangUp: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

/**
 * ActiveCallBar
 * Displays active call information with timer, mute, and hangup controls
 */
export function ActiveCallBar({
  peer,
  onHangUp,
  toggleMute,
  isMuted,
}: ActiveCallBarProps): React.ReactNode {
  const [duration, setDuration] = useState("00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => {
        const [mm, ss] = prev.split(":").map(Number);
        const totalSeconds = mm * 60 + ss + 1;
        const newMm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const newSs = String(totalSeconds % 60).padStart(2, "0");
        return `${newMm}:${newSs}`;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        zIndex: 9998,
        minWidth: "280px",
      }}
    >
      {/* Peer info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: peer.avatarUrl
              ? undefined
              : avatarColor(peer.username),
            backgroundImage: peer.avatarUrl ? `url(${peer.avatarUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            flexShrink: 0,
          }}
        >
          {!peer.avatarUrl && peer.displayName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              color: "var(--text-primary)",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {peer.displayName}
          </p>
          <p
            style={{
              margin: "4px 0 0",
              color: "var(--text-muted)",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            {duration}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={toggleMute}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: isMuted ? "var(--danger)" : "var(--accent)",
            color: "white",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.1s",
          }}
          title={isMuted ? "Unmute" : "Mute"}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(0.95)";
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
          {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          onClick={onHangUp}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "var(--danger)",
            color: "white",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.1s",
          }}
          title="Hang up"
          onMouseDown={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform =
              "scale(0.95)";
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
          <Phone size={18} style={{ transform: "rotate(135deg)" }} />
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
