"use client";

import { useState } from "react";

type CreateChannelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: "TEXT" | "VOICE", category: string) => Promise<void>;
};

export function CreateChannelModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [channelType, setChannelType] = useState<"TEXT" | "VOICE">("TEXT");
  const [subType, setSubType] = useState<"DEFAULT" | "ANNOUNCEMENTS" | "FORUMS">("DEFAULT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const category = channelType === "TEXT" ? "Rooms" : "Calls";
      await onSubmit(name, channelType, category);
      setName("");
      setChannelType("TEXT");
      setSubType("DEFAULT");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const typeOpts: Array<{ value: "TEXT" | "VOICE"; label: string; desc: string }> = [
    { value: "TEXT",  label: "💬 Text Channel",  desc: "Send messages and media" },
    { value: "VOICE", label: "🎤 Voice Channel", desc: "Hang out over voice" },
  ];

  const subTypeOpts: Array<{ value: "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS"; label: string }> = [
    { value: "DEFAULT",       label: "💬 Chat" },
    { value: "ANNOUNCEMENTS", label: "📢 Announcements" },
    { value: "FORUMS",        label: "💭 Forums" },
  ];

  const fieldLabel: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: 8,
  };

  const radioRow = (selected: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    background: selected ? "rgba(108,111,255,0.08)" : "var(--bg-floating)",
    border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
    borderRadius: "var(--radius)",
    cursor: "pointer",
    transition: "border-color 0.12s, background 0.12s",
  });

  const radioDot = (selected: boolean): React.CSSProperties => ({
    width: 16,
    height: 16,
    borderRadius: "50%",
    flexShrink: 0,
    border: `2px solid ${selected ? "var(--accent)" : "var(--text-muted)"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.12s",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          width: 440,
          maxWidth: "95vw",
          padding: 32,
          boxShadow: "0 32px 80px rgba(0,0,0,0.55)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display, 'Rajdhani', sans-serif)",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Add a Channel
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 28 }}>
          Create a text room or voice call channel
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Channel type */}
          <div>
            <label style={fieldLabel}>Channel Type</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {typeOpts.map(({ value, label, desc }) => (
                <label key={value} style={radioRow(channelType === value)} onClick={() => setChannelType(value)}>
                  <div style={radioDot(channelType === value)}>
                    {channelType === value && (
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Sub-type (TEXT only) */}
          {channelType === "TEXT" && (
            <div>
              <label style={fieldLabel}>Channel Subtype</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {subTypeOpts.map(({ value, label }) => (
                  <label key={value} style={radioRow(subType === value)} onClick={() => setSubType(value)}>
                    <div style={radioDot(subType === value)}>
                      {subType === value && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)" }} />
                      )}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Channel name */}
          <div>
            <label style={fieldLabel}>Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={channelType === "TEXT" ? "e.g. general" : "e.g. gaming"}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--bg-floating)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(255,92,92,0.1)",
                border: "1px solid rgba(255,92,92,0.3)",
                borderRadius: "var(--radius)",
                color: "var(--danger)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              paddingTop: 8,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-secondary)",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "9px 22px",
                background: "var(--accent)",
                border: "none",
                borderRadius: "var(--radius)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--accent-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            >
              {isLoading ? "Creating…" : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}