"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { mockGuilds, mockRoles, mockMembers } from "@/lib/mock";
import { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";
import { hasPermission } from "@/lib/utils";
import type { Role, Member } from "@/types";
import type { PermissionKey } from "@/lib/permissions";

type Tab = "roles" | "members";

export default function GuildSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params?.guildId as string;

  const guild = mockGuilds.find((g) => g.id === guildId);

  const [activeTab, setActiveTab] = useState<Tab>("roles");
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

  if (!guild) {
    router.replace("/channels/me");
    return null;
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  function handleCreateRole() {
    if (!newRoleName.trim()) return;
    // TODO: replace with API call to POST /guilds/:guildId/roles
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
    // TODO: replace with API call to DELETE /guilds/:guildId/roles/:roleId
    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    if (selectedRoleId === roleId) {
      setSelectedRoleId(roles.find((r) => r.id !== roleId)?.id ?? null);
    }
  }

  function handleTogglePermission(permission: number) {
    if (!selectedRole) return;
    // TODO: replace with API call to PATCH /guilds/:guildId/roles/:roleId
    const updated = hasPermission(selectedRole.permissions, permission)
      ? selectedRole.permissions & ~permission
      : selectedRole.permissions | permission;
    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: updated } : r))
    );
  }

  function handleAssignRole(memberId: string, roleId: string) {
    // TODO: replace with API call to POST /guilds/:guildId/members/:memberId/roles
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
                                {enabled ? "✓" : "✗"}
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