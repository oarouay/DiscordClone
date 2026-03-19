"use client";

import { useState } from "react";
import { X, User, Palette, LogOut } from "lucide-react";
import type { User as UserType } from "@/types";
import { useTheme } from "@/hooks/useTheme";

type Section = "my-account" | "appearance";
type Props = { user: UserType; onClose: () => void; onLogout?: () => void; onSave?: (updates: Partial<UserType>) => void; };

function avatarColor(username: string): string {
  const palette = ["#6c6fff","#3ddc97","#f5a623","#ff5c5c","#a78bfa","#38bdf8","#fb923c","#f472b6"];
  let h = 0;
  for (let i = 0; i < username.length; i++) h = username.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

export function UserSettingsModal({ user, onClose, onLogout, onSave }: Props) {
  const [section, setSection] = useState<Section>("my-account");
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [username, setUsername] = useState(user.username || "");
  const [status, setStatus] = useState(user.status);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [dirty, setDirty] = useState(false);

  const initials = (displayName || username).split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  const handleSave = () => {
    onSave?.({ displayName, username, status, avatarUrl });
    setDirty(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarUrl(event.target?.result as string);
        setDirty(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusClick = (s: typeof status) => {
    setStatus(s);
    setDirty(true);
  };

  const navItems: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
    { id: "my-account", label: "My Account", icon: <User size={16} /> },
    { id: "appearance", label: "Appearance",  icon: <Palette size={16} /> },
  ];

  const statusColors = { online: "var(--success)", idle: "var(--warning)", offline: "var(--text-muted)" };

  return (
    <div className="settings-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-modal">

        <div className="settings-nav">
          <p className="settings-nav-heading">User Settings</p>
          {navItems.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setSection(id)} className={`settings-nav-btn${section === id ? " settings-nav-btn--active" : ""}`}>
              {icon}{label}
            </button>
          ))}
          <div className="settings-nav-divider" />
          <button onClick={onLogout} className="settings-nav-btn settings-nav-btn--danger">
            <LogOut size={16} />Log Out
          </button>
        </div>

        <div className="settings-content-panel">
          <div className="settings-close-row">
            <button onClick={onClose} aria-label="Close settings" className="settings-close-btn"><X size={16} /></button>
          </div>

          <div className="settings-content-body">

            {section === "my-account" && (
              <div>
                <h2 className="settings-section-title">My Account</h2>

                <div className="settings-profile-banner">
                  <div className="settings-user-avatar-wrapper">
                    <div
                      className="settings-avatar-circle"
                      style={{
                        backgroundColor: avatarUrl ? undefined : avatarColor(user.username),
                        backgroundImage: avatarUrl ? `url(${avatarUrl})` : undefined,
                        ...(avatarUrl ? { backgroundSize: "cover", backgroundPosition: "center" } : {}),
                      }}
                    >
                      {!avatarUrl && initials}
                    </div>
                    <div className="settings-user-avatar-section">
                      <p className="settings-profile-name">{displayName || username}</p>
                      <p className="settings-profile-username">@{username}</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="settings-avatar-upload-input"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload" className="settings-avatar-upload-label">
                        <button
                          type="button"
                          onClick={() => document.getElementById("avatar-upload")?.click()}
                          className="settings-avatar-upload-btn"
                        >
                          Change Avatar
                        </button>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="settings-fields">
                  {[
                    { label: "Display Name", value: displayName, set: (v: string) => { setDisplayName(v); setDirty(true); } },
                    { label: "Username",     value: username,    set: (v: string) => { setUsername(v);    setDirty(true); } },
                  ].map(({ label, value, set }) => (
                    <div key={label} className="settings-field">
                      <label className="settings-field-label">{label}</label>
                      <input type="text" value={value} onChange={(e) => set(e.target.value)} className="settings-field-input" />
                    </div>
                  ))}

                  <div className="settings-field">
                    <label className="settings-field-label">Status</label>
                    <div className="settings-status-row">
                      {(["online", "idle", "offline"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusClick(s)}
                          className={`settings-status-chip${status === s ? " settings-status-chip--active" : ""}`}
                        >
                          <span className="settings-status-chip-dot" style={{ background: statusColors[s] }} />
                          {s === "offline" ? "Appear Offline" : s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {dirty && (
                  <div className="settings-save-bar">
                    <button onClick={() => { setDisplayName(user.displayName || ""); setUsername(user.username); setStatus(user.status); setAvatarUrl(user.avatarUrl || ""); setDirty(false); }} className="settings-btn-reset">Reset</button>
                    <button onClick={handleSave} className="settings-btn-save">Save Changes</button>
                  </div>
                )}
              </div>
            )}

            {section === "appearance" && (
              <div>
                <h2 className="settings-section-title">Appearance</h2>
                <div className="settings-appearance-card">
                  <p className="settings-field-label">Theme</p>
                  <div className="settings-theme-row">
                    {(["dark", "light"] as const).map((t) => (
                      <button key={t} onClick={() => { if (theme !== t) toggleTheme(); }} className={`settings-theme-btn${theme === t ? " settings-theme-btn--active" : ""}`}>
                        <div className={`settings-theme-preview settings-theme-preview--${t}`}>
                          <span className="settings-theme-preview-dot" />
                          <span className="settings-theme-preview-bar" />
                        </div>
                        <span className={`settings-theme-label${theme === t ? " settings-theme-label--active" : ""}`}>{t}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}