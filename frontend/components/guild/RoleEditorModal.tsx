"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ColorPicker } from "@/components/shared/ColorPicker";

interface RoleEditorModalProps {
  roleId: string;
  roleName: string;
  roleColor: string;
  guildId: string;
  onSave: (roleId: string, name: string, color: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

/**
 * Modal for editing a role's name and colour.
 * Supports HSV and RGB colour picker modes.
 * Submits as single PATCH request with optimistic update.
 */
export function RoleEditorModal({ roleId, roleName, roleColor, guildId, onSave, onClose, isLoading = false }: RoleEditorModalProps) {
  const [name, setName] = useState(roleName);
  const [color, setColor] = useState(roleColor);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Role name cannot be empty.");
      return;
    }

    try {
      await onSave(roleId, name.trim(), color);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown} role="dialog" aria-modal aria-labelledby="role-editor-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="role-editor-title" className="modal-title">
            Edit Role
          </h2>
          <button
            onClick={onClose}
            className="modal-close"
            aria-label="Close role editor"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ── Name Input ── */}
          <div>
            <label
              htmlFor="role-name"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-secondary)",
                marginBottom: 6,
              }}
            >
              Role Name
            </label>
            <input
              id="role-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 14,
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
          </div>

          {/* ── Colour Picker ── */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
              Role Colour
            </label>
            <ColorPicker initialColor={color} onChange={setColor} defaultMode="hsv" />
          </div>

          {/* ── Error Message ── */}
          {error && (
            <div
              style={{
                padding: "12px",
                backgroundColor: "rgba(255, 92, 92, 0.1)",
                border: "1px solid var(--danger)",
                borderRadius: "var(--radius-sm)",
                color: "var(--danger)",
                fontSize: 13,
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.5 : 1,
                transition: "background-color 0.2s, opacity 0.2s",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                borderRadius: "var(--radius-sm)",
                border: "none",
                backgroundColor: isLoading ? "var(--bg-hover)" : "var(--accent)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
                transition: "background-color 0.2s, opacity 0.2s",
              }}
            >
              {isLoading ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
