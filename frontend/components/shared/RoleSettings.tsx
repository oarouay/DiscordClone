"use client";

import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { Role } from "@/types";
import { useMockData } from "@/context/MockDataProvider";

interface RoleSettingsProps {
  guildId: string;
  isAdmin: boolean;
  onClose: () => void;
}

const PERMISSIONS = [
  "Send Messages",
  "Manage Messages",
  "Kick Members",
  "Ban Members",
  "Manage Channels",
  "Manage Roles",
  "Administrator",
];

type TabType = "list" | "display" | "permissions" | "members";

export function RoleSettings({ guildId, isAdmin, onClose }: RoleSettingsProps) {
  const mockData = useMockData();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("list");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const selectedRole = selectedRoleId ? mockData.roles.find((r) => r.id === selectedRoleId) : null;

  const handleAddRole = () => {
    const randomId = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const newRole: Role = {
      id: `role-${randomId}`,
      guildId,
      name: "New Role",
      permissions: 0,
      color: "#99aab5",
    };
    mockData.addRole(newRole);
    setSelectedRoleId(newRole.id);
    setTab("display");
    showToast("Role created");
  };

  const handleDeleteRole = () => {
    if (selectedRoleId) {
      mockData.deleteRole(selectedRoleId);
      setSelectedRoleId(null);
      setTab("list");
      showToast("Role deleted");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  if (!isAdmin) {
    return (
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "var(--bg-secondary, rgba(255,255,255,0.05))",
          border: "1px solid var(--border, rgba(255,255,255,0.1))",
          borderRadius: "8px",
          padding: "20px",
          minWidth: "300px",
          textAlign: "center",
          zIndex: 1000,
        }}
      >
        <p style={{ color: "var(--text-primary, #fff)", marginBottom: 16 }}>
          You do not have permission to manage roles.
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "8px 16px",
            background: "var(--bg-hover, rgba(255,255,255,0.1))",
            color: "var(--text-primary, #fff)",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "var(--bg-secondary, rgba(255,255,255,0.05))",
        border: "1px solid var(--border, rgba(255,255,255,0.1))",
        borderRadius: "8px",
        minWidth: "600px",
        maxHeight: "80vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
      role="dialog"
      aria-labelledby="role-settings-title"
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          id="role-settings-title"
          style={{
            margin: 0,
            color: "var(--text-primary, #fff)",
            fontSize: 18,
            fontWeight: 600,
          }}
        >
          Role Management
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-muted, #72767d)",
            cursor: "pointer",
            fontSize: 24,
          }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", display: "flex" }}>
        {/* Role list panel */}
        <div
          style={{
            width: "250px",
            borderRight: "1px solid var(--border, rgba(255,255,255,0.1))",
            padding: "12px 8px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {mockData.roles
              .filter((r) => r.guildId === guildId)
              .map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRoleId(role.id);
                    setTab("display");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "4px",
                    border:
                      selectedRoleId === role.id
                        ? "2px solid var(--link, #0a8cc9)"
                        : "1px solid transparent",
                    background:
                      selectedRoleId === role.id
                        ? "var(--bg-hover, rgba(255,255,255,0.15))"
                        : "transparent",
                    color: "var(--text-primary, #fff)",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "2px",
                      background: role.color || "#99aab5",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {role.name}
                  </span>
                </button>
              ))}
          </div>

          <button
            onClick={handleAddRole}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "4px",
              border: "1px dashed var(--border, rgba(255,255,255,0.2))",
              background: "transparent",
              color: "var(--text-muted, #72767d)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--link, #0a8cc9)";
              e.currentTarget.style.color = "var(--link, #0a8cc9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border, rgba(255,255,255,0.2))";
              e.currentTarget.style.color = "var(--text-muted, #72767d)";
            }}
            aria-label="Add new role"
          >
            <Plus size={16} />
            Add Role
          </button>
        </div>

        {/* Role details panel */}
        {selectedRole ? (
          <div
            style={{
              flex: 1,
              padding: "16px 20px",
              overflow: "auto",
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 16,
                borderBottom: "1px solid var(--border, rgba(255,255,255,0.1))",
              }}
            >
              {(["display", "permissions", "members"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "12px 0",
                    border: "none",
                    background: "none",
                    color:
                      tab === t ? "var(--link, #0a8cc9)" : "var(--text-muted, #72767d)",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 500,
                    borderBottom: tab === t ? "3px solid var(--link, #0a8cc9)" : "none",
                    transition: "all 0.2s",
                  }}
                  data-active={tab === t}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Display Tab */}
            {tab === "display" && selectedRole && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-muted, #72767d)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={selectedRole.name}
                    onChange={(e) => {
                      mockData.updateRole(selectedRole.id, { name: e.target.value });
                    }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "var(--bg-primary, #1e1f22)",
                      border: "1px solid var(--border, rgba(255,255,255,0.1))",
                      borderRadius: "4px",
                      color: "var(--text-primary, #fff)",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text-muted, #72767d)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Role Color
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="color"
                      value={selectedRole.color || "#99aab5"}
                      onChange={(e) => {
                        mockData.updateRole(selectedRole.id, { color: e.target.value });
                      }}
                      style={{
                        width: 50,
                        height: 40,
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    />
                    <input
                      type="text"
                      value={selectedRole.color || "#99aab5"}
                      onChange={(e) => {
                        mockData.updateRole(selectedRole.id, { color: e.target.value });
                      }}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        background: "var(--bg-primary, #1e1f22)",
                        border: "1px solid var(--border, rgba(255,255,255,0.1))",
                        borderRadius: "4px",
                        color: "var(--text-primary, #fff)",
                        fontSize: 14,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p style={{ margin: 0, color: "var(--text-muted, #72767d)", fontSize: 12 }}>
                    Preview:
                  </p>
                  <span
                    style={{
                      display: "inline-block",
                      color: selectedRole.color,
                      fontSize: 14,
                      fontWeight: 500,
                      marginTop: 8,
                    }}
                  >
                    {selectedRole.name}
                  </span>
                </div>
              </div>
            )}

            {/* Permissions Tab */}
            {tab === "permissions" && selectedRole && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        defaultChecked={perm === "Administrator"}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ fontSize: 13, color: "var(--text-primary, #fff)" }}>
                        {perm}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {tab === "members" && selectedRole && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mockData.members
                  .filter((m) => m.roles.some((r) => r.id === selectedRole.id))
                  .map((member) => (
                    <div
                      key={member.userId}
                      style={{
                        padding: "8px",
                        background: "var(--bg-primary, #1e1f22)",
                        borderRadius: "4px",
                        fontSize: 13,
                        color: "var(--text-primary, #fff)",
                      }}
                    >
                      {member.user.displayName}
                    </div>
                  ))}
                {mockData.members.filter((m) => m.roles.some((r) => r.id === selectedRole.id))
                  .length === 0 && (
                  <p style={{ color: "var(--text-muted, #72767d)", fontSize: 13, margin: 0 }}>
                    No members with this role.
                  </p>
                )}
              </div>
            )}

            {/* Delete button */}
            <div
              style={{
                marginTop: 24,
                paddingTop: 12,
                borderTop: "1px solid var(--border, rgba(255,255,255,0.1))",
              }}
            >
              <button
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 12px",
                  background: "rgba(237, 66, 69, 0.15)",
                  color: "#ed4245",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <Trash2 size={14} />
                Delete Role
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted, #72767d)",
              fontSize: 14,
            }}
          >
            Select a role to view details
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {showConfirmDelete && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "var(--bg-secondary, rgba(255,255,255,0.05))",
            border: "1px solid var(--border, rgba(255,255,255,0.1))",
            borderRadius: "8px",
            padding: "20px",
            minWidth: "300px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            zIndex: 1001,
          }}
        >
          <p style={{ margin: "0 0 16px 0", color: "var(--text-primary, #fff)" }}>
            Delete {selectedRole?.name}? This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                handleDeleteRole();
                setShowConfirmDelete(false);
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "var(--error, #ed4245)",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setShowConfirmDelete(false)}
              style={{
                flex: 1,
                padding: "8px 16px",
                background: "var(--bg-hover, rgba(255,255,255,0.1))",
                color: "var(--text-primary, #fff)",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            background: "var(--success, #23a55a)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "4px",
            zIndex: 1002,
          }}
          role="status"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
