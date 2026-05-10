"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockRoles, mockMembers } from "@/lib/mock";
import { fetchGuild, deleteGuild, updateGuild } from "@/lib/guilds";
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";
import { hasPermission } from "@/lib/utils";
import type { Guild, Role, Member } from "@/types";
import type { PermissionKey } from "@/lib/permissions";
import { Trash2 } from "lucide-react";

type Tab = "general" | "roles" | "members";

export default function GuildSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params?.guildId as string;

  const [guild, setGuild] = useState<Guild | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [guildName, setGuildName] = useState("");
  const [guildIcon, setGuildIcon] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [roles, setRoles] = useState<Role[]>(
    mockRoles.filter((r) => r.guildId === guildId)
  );
  const [members, setMembers] = useState<Member[]>(
    mockMembers.filter((m) => m.guildId === guildId)
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    roles[0]?.id ?? null
  );
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#5865f2");

  useEffect(() => {
    if (!guildId) return;
    fetchGuild(guildId)
      .then((g) => {
        setGuild(g);
        setGuildName(g.name);
        setGuildIcon(g.iconUrl ?? "");
      })
      .catch(() => router.replace("/channels/me"))
      .finally(() => setLoading(false));
  }, [guildId, router]);

  if (loading) {
    return (
      <div className="settings-page">
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!guild) {
    return null;
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  async function handleSaveGuildSettings() {
    try {
      const updated = await updateGuild(guildId, { name: guildName, iconUrl: guildIcon });
      setGuild(updated);
    } catch (err) {
      console.error("Failed to save guild settings:", err);
    }
  }

  function handleIconUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setGuildIcon(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleDeleteGuild() {
    if (deletePassword !== "password") {
      setDeleteError("Incorrect password");
      return;
    }
    try {
      await deleteGuild(guildId);
      router.push("/channels/me");
    } catch (err) {
      setDeleteError("Failed to delete guild");
    }
  }

  function handleCreateRole() {
    if (!newRoleName.trim()) return;
    const role: Role = {
      id: String(Date.now()),
      guildId,
      name: newRoleName.trim(),
      permissions: PERMISSIONS.SEND_MESSAGES | PERMISSIONS.CONNECT_TO_VOICE,
      color: newRoleColor,
    };
    setRoles((prev) => [...prev, role]);
    setSelectedRoleId(role.id);
    setNewRoleName("");
  }

  function handleDeleteRole(roleId: string) {
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    if (selectedRoleId === roleId) {
      setSelectedRoleId(roles.find((r) => r.id !== roleId)?.id ?? null);
    }
  }

  function handleTogglePermission(permission: number) {
    if (!selectedRole) return;
    const updated = hasPermission(selectedRole.permissions, permission)
      ? selectedRole.permissions & ~permission
      : selectedRole.permissions | permission;
    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updated } : r))
    );
  }

  function handleAssignRole(memberId: string, roleId: string) {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.userId !== memberId) return m;
        const hasRole = m.roles.some((r) => r.id === roleId);
        return {
          ...m,
          roles: hasRole
            ? m.roles.filter((r) => r.id !== roleId)
            : [...m.roles, role],
        };
      })
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={() => router.back()}>
          ← Back
        </button>
        <h1 className="settings-title">{guild.name} — Settings</h1>
      </div>

      <div className="settings-body">
        <nav className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === "general" ? "settings-tab-active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`settings-tab ${activeTab === "roles" ? "settings-tab-active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
          <button
            className={`settings-tab ${activeTab === "members" ? "settings-tab-active" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>
        </nav>

        {activeTab === "general" && (
          <div className="settings-content">
            <div className="settings-general-container">
              <h2 className="settings-section-heading">Server Settings</h2>
              
              <div className="settings-form-group">
                <label className="settings-form-label">
                  Server Icon
                </label>
                <div className="settings-avatar-wrapper">
                  <div
                    className="settings-avatar-circle"
                    style={{
                      backgroundColor: guildIcon ? undefined : "var(--bg-tertiary)",
                      backgroundImage: guildIcon ? `url(${guildIcon})` : undefined,
                      ...(guildIcon ? { backgroundSize: "cover", backgroundPosition: "center" } : {}),
                    }}
                  >
                    {!guildIcon && guild.name[0]}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="settings-avatar-upload-input"
                    id="icon-upload"
                  />
                  <label htmlFor="icon-upload" className="settings-avatar-upload-label">
                    <button
                      type="button"
                      onClick={() => document.getElementById("icon-upload")?.click()}
                      className="settings-avatar-upload-btn"
                    >
                      Upload
                    </button>
                  </label>
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">
                  Server Name
                </label>
                <input
                  type="text"
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  className="settings-text-input"
                />
              </div>

              <button
                onClick={handleSaveGuildSettings}
                className="settings-save-btn"
              >
                Save Changes
              </button>

              <div className="settings-danger-zone">
                <h3 className="settings-danger-title">
                  Danger Zone
                </h3>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="settings-delete-btn"
                >
                  <Trash2 size={16} />
                  Delete Server
                </button>

                {showDeleteModal && (
                  <div
                    className="settings-modal-overlay"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <div
                      className="settings-modal-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h2 className="settings-modal-title">
                        Delete Server
                      </h2>
                      <p className="settings-modal-subtitle">
                        This action cannot be undone. Enter your password to confirm deletion.
                      </p>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={deletePassword}
                        onChange={(e) => {
                          setDeletePassword(e.target.value);
                          setDeleteError("");
                        }}
                        className={`settings-modal-password-input ${deleteError ? "with-error" : ""}`}
                      />
                      {deleteError && (
                        <p className="settings-modal-error">
                          {deleteError}
                        </p>
                      )}
                      <div className="settings-modal-buttons">
                        <button
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeletePassword("");
                            setDeleteError("");
                          }}
                          className="settings-modal-button settings-modal-button-cancel"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteGuild}
                          className="settings-modal-button settings-modal-button-confirm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "roles" && (
          <div className="settings-content">
            <div className="roles-layout">
              <div className="roles-list-panel">
                <p className="settings-panel-label">Roles</p>
                {roles.map((role) => (
                  <button
                    key={role.id}
                    className={`role-list-item ${selectedRoleId === role.id ? "role-list-item-active" : ""}`}
                    onClick={() => setSelectedRoleId(role.id)}
                  >
                    <span
                      className="role-color-dot"
                      style={{ background: role.color ?? "var(--text-muted)" }}
                    />
                    {role.name}
                  </button>
                ))}

                <div className="role-create-form">
                  <input
                    type="text"
                    placeholder="New role name"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="role-name-input"
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreateRole(); }}
                  />
                  <div className="role-create-row">
                    <input
                      type="color"
                      value={newRoleColor}
                      onChange={(e) => setNewRoleColor(e.target.value)}
                      className="role-color-input"
                      title="Role color"
                    />
                    <button
                      className="role-create-btn"
                      onClick={handleCreateRole}
                      disabled={!newRoleName.trim()}
                    >
                      Create Role
                    </button>
                  </div>
                </div>
              </div>

              <div className="roles-detail-panel">
                {selectedRole ? (
                  <>
                    <div className="roles-detail-header">
                      <div className="roles-detail-title-row">
                        <span
                          className="role-color-dot"
                          style={{ background: selectedRole.color ?? "var(--text-muted)" }}
                        />
                        <p className="settings-panel-label">{selectedRole.name}</p>
                      </div>
                      <button
                        className="role-delete-btn"
                        onClick={() => handleDeleteRole(selectedRole.id)}
                      >
                        Delete Role
                      </button>
                    </div>

                    <div className="permissions-list">
                      {(Object.entries(PERMISSION_LABELS) as [PermissionKey, { label: string; description: string }][]).map(
                        ([key, { label, description }]) => {
                          const flag = PERMISSIONS[key];
                          const enabled = hasPermission(selectedRole.permissions, flag);
                          return (
                            <div key={key} className="permission-row">
                              <div className="permission-info">
                                <p className="permission-label">{label}</p>
                                <p className="permission-description">{description}</p>
                              </div>
                              <button
                                className={`permission-toggle ${enabled ? "permission-toggle-on" : ""}`}
                                onClick={() => handleTogglePermission(flag)}
                              >
                                {enabled ? "On" : "Off"}
                              </button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>Select a role to edit its permissions.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div className="settings-content">
            <p className="settings-panel-label">Members</p>
            <div className="members-list">
              {members.map((member) => (
                <div key={member.userId} className="member-row">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="member-name">{member.user.displayName}</p>
                      <p className="member-username">@{member.user.username}</p>
                    </div>
                  </div>
                  <div className="member-roles">
                    {roles.map((role) => {
                      const assigned = member.roles.some((r) => r.id === role.id);
                      return (
                        <button
                          key={role.id}
                          className={`member-role-tag ${assigned ? "member-role-tag-assigned" : ""}`}
                          style={assigned ? { borderColor: role.color ?? "var(--accent)", color: role.color ?? "var(--accent)" } : {}}
                          onClick={() => handleAssignRole(member.userId, role.id)}
                          title={assigned ? `Remove ${role.name}` : `Assign ${role.name}`}
                        >
                          {role.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}