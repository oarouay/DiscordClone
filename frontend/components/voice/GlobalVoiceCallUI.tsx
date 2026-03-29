"use client";

import { Phone, PhoneIncoming, PhoneOff, Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { CallState, User } from "@/types/calling";

interface GlobalVoiceCallUIProps {
  callState: CallState;
  remoteUser: User | null;
  duration: number;
  isMuted: boolean;
  wasDeclined: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onHangUp: () => void;
  onToggleMute: () => void;
}

export function GlobalVoiceCallUI({
  callState,
  remoteUser,
  duration,
  isMuted,
  wasDeclined,
  onAccept,
  onDecline,
  onHangUp,
  onToggleMute,
}: GlobalVoiceCallUIProps) {
  const [outgoingCountdown, setOutgoingCountdown] = useState(30);

  useEffect(() => {
    if (callState !== "calling") {
      setOutgoingCountdown(30);
      return;
    }

    setOutgoingCountdown(30);
    const timer = setInterval(() => {
      setOutgoingCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [callState]);

  const formatCallDuration = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, []);

  if (callState === "idle" && !wasDeclined) {
    return null;
  }

  return (
    <>
      {wasDeclined && (
        <div
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            background: "var(--bg-secondary)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            zIndex: 100,
          }}
        >
          Call declined
        </div>
      )}

      {callState === "calling" && remoteUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99,
          }}
        >
          <div
            style={{
              width: "min(420px, 92vw)",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              Calling {remoteUser.username}
            </p>
            <p style={{ marginTop: 8, marginBottom: 20, fontSize: 13, color: "var(--text-muted)" }}>
              Ringing... {outgoingCountdown}s
            </p>
            <button
              onClick={onHangUp}
              style={{
                border: "none",
                borderRadius: 999,
                background: "var(--danger)",
                color: "white",
                padding: "10px 16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {callState === "ringing" && remoteUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99,
          }}
        >
          <div
            style={{
              width: "min(420px, 92vw)",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 20,
              textAlign: "center",
            }}
          >
            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", letterSpacing: "0.2px" }}>
              Incoming voice call
            </p>
            <p style={{ marginTop: 8, marginBottom: 20, fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              {remoteUser.username}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button
                onClick={onDecline}
                style={{
                  border: "none",
                  borderRadius: 999,
                  background: "var(--danger)",
                  color: "white",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <PhoneOff size={18} style={{ marginRight: 6 }} /> Decline
              </button>
              <button
                onClick={onAccept}
                style={{
                  border: "none",
                  borderRadius: 999,
                  background: "var(--success)",
                  color: "white",
                  padding: "10px 16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <PhoneIncoming size={18} style={{ marginRight: 6 }} /> Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {callState === "connected" && remoteUser && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            zIndex: 99,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
            In call with {remoteUser.username}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatCallDuration(duration)}</span>
          <button
            onClick={onToggleMute}
            style={{
              background: isMuted ? "var(--bg-danger-subtle)" : "var(--bg-hover)",
              color: isMuted ? "var(--danger)" : "var(--text-primary)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          <button
            onClick={onHangUp}
            style={{
              background: "var(--danger)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <PhoneOff size={16} />
          </button>
        </div>
      )}
    </>
  );
}
