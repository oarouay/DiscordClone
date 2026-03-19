"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Headphones, Settings } from "lucide-react";
import type { User } from "@/types";
import { UserSettingsModal } from "./UserSettingsModal";

function avatarColor(username: string): string {
  const palette = ["#6c6fff","#3ddc97","#f5a623","#ff5c5c","#a78bfa","#38bdf8","#fb923c","#f472b6"];
  let h = 0;
  for (let i = 0; i < username.length; i++) h = username.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

const STATUS_OPTIONS = [
  { value: "online",  label: "Online",        color: "var(--success)" },
  { value: "idle",    label: "Idle",           color: "var(--warning)" },
  { value: "offline", label: "Appear Offline", color: "var(--text-muted)" },
] as const;

type Props = {
  user: User;
  richPresence?: { activity: string; detail: string } | null;
  isMuted: boolean;
  isDeafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onSave?: (updates: Partial<User>) => void;
  onLogout?: () => void;
};

export function UserPanel({ user, richPresence, isMuted, isDeafened, onToggleMute, onToggleDeafen, onSave, onLogout }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(user.status);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Keep local status in sync if parent updates user.status (e.g. from settings modal)
  useEffect(() => {
    setCurrentStatus(user.status);
  }, [user.status]);

  useEffect(() => {
    if (!showStatusPicker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowStatusPicker(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showStatusPicker]);

  const handleStatusChange = (s: typeof currentStatus) => {
    setCurrentStatus(s);
    user.status = s; // mutate mock object so settings modal stays in sync
    onSave?.({ status: s });
    setShowStatusPicker(false);
  };

  const handleSave = (updates: Partial<User>) => {
    // If settings modal changed status, sync it here too
    if (updates.status) setCurrentStatus(updates.status);
    onSave?.(updates);
  };

  const initials = (user.displayName || user.username).split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <>
      <div className="user-panel">
        {richPresence && (
          <div className="user-panel-presence">
            <p className="user-panel-presence-activity">{richPresence.activity}</p>
            <p className="user-panel-presence-detail">{richPresence.detail}</p>
          </div>
        )}

        <div className="user-panel-row">
          <div ref={pickerRef} className="user-panel-identity" onClick={() => setShowStatusPicker((v) => !v)} title="Change status">
            <div className="user-panel-avatar-wrap">
              <div className="user-panel-avatar" style={{ background: avatarColor(user.username) }}>{initials}</div>
              <div className={`user-panel-status-dot user-panel-status-dot--${currentStatus}`} />
            </div>
            <div className="user-panel-names">
              <p className="user-panel-display-name">{user.displayName || user.username}</p>
              <p className={`user-panel-status-label user-panel-status-label--${currentStatus}`}>
                {currentStatus === "offline" ? "Appear Offline" : currentStatus}
              </p>
            </div>

            {showStatusPicker && (
              <div className="status-picker">
                <p className="status-picker-heading">Set Status</p>
                {STATUS_OPTIONS.map(({ value, label, color }) => (
                  <button key={value}
                    className={`status-picker-option${currentStatus === value ? " status-picker-option--active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(value); }}>
                    <span className="status-picker-dot" style={{ background: color }} />
                    {label}
                    {currentStatus === value && <span className="status-picker-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="user-panel-controls">
            <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} title={isMuted ? "Unmute" : "Mute"} className={`user-ctrl-btn${isMuted ? " user-ctrl-btn--active" : ""}`}>
              {isMuted ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onToggleDeafen(); }} title={isDeafened ? "Undeafen" : "Deafen"} className={`user-ctrl-btn${isDeafened ? " user-ctrl-btn--active" : ""}`}>
              <Headphones size={15} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} title="User Settings" className="user-ctrl-btn">
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <UserSettingsModal user={user} onClose={() => setShowSettings(false)} onLogout={onLogout} onSave={handleSave} />
      )}
    </>
  );
}