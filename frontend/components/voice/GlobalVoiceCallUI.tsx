"use client";

import { PhoneIncoming, PhoneOff, Mic, MicOff } from "lucide-react";
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
      return;
    }

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
        <div className="voice-call-notification">
          Call declined
        </div>
      )}

      {callState === "calling" && remoteUser && (
        <div className="voice-call-overlay">
          <div className="voice-call-modal">
            <p className="voice-call-title">
              Calling {remoteUser.username}
            </p>
            <p className="voice-call-subtitle">
              Ringing... {outgoingCountdown}s
            </p>
            <button
              onClick={onHangUp}
              className="voice-call-btn voice-call-btn-cancel"
            >
              Cancel Call
            </button>
          </div>
        </div>
      )}

      {callState === "ringing" && remoteUser && (
        <div className="voice-call-overlay">
          <div className="voice-call-modal">
            <p className="voice-call-label">
              Incoming voice call
            </p>
            <p className="voice-call-title">
              {remoteUser.username}
            </p>
            <div className="voice-call-buttons">
              <button
                onClick={onDecline}
                className="voice-call-btn voice-call-btn-decline"
              >
                <PhoneOff size={18} /> Decline
              </button>
              <button
                onClick={onAccept}
                className="voice-call-btn voice-call-btn-accept"
              >
                <PhoneIncoming size={18} /> Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {callState === "connected" && remoteUser && (
        <div className="voice-call-active-bar">
          <span className="voice-call-active-text">
            In call with {remoteUser.username}
          </span>
          <span className="voice-call-active-duration">{formatCallDuration(duration)}</span>
          <div className="voice-call-active-controls">
            <button
              onClick={onToggleMute}
              className={`voice-stage-button ${isMuted ? "voice-stage-button-danger" : ""}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={onHangUp}
              className="voice-stage-button voice-stage-button-danger"
              title="Disconnect"
            >
              <PhoneOff size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
