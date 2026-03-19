export const PERMISSIONS = {
  SEND_MESSAGES:    1 << 0,  // 1
  MANAGE_MESSAGES:  1 << 1,  // 2
  MANAGE_CHANNELS:  1 << 2,  // 4
  MANAGE_ROLES:     1 << 3,  // 8
  KICK_MEMBERS:     1 << 4,  // 16
  BAN_MEMBERS:      1 << 5,  // 32
  CONNECT_TO_VOICE: 1 << 6,  // 64
  MUTE_MEMBERS:     1 << 7,  // 128
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

export const PERMISSION_LABELS: Record<PermissionKey, { label: string; description: string }> = {
  SEND_MESSAGES:    { label: "Send Messages",     description: "Allows members to send messages in text channels." },
  MANAGE_MESSAGES:  { label: "Manage Messages",   description: "Allows members to delete or edit other members' messages." },
  MANAGE_CHANNELS:  { label: "Manage Channels",   description: "Allows members to create, edit, or delete channels." },
  MANAGE_ROLES:     { label: "Manage Roles",      description: "Allows members to create, edit, or delete roles below their own." },
  KICK_MEMBERS:     { label: "Kick Members",      description: "Allows members to remove other members from the server." },
  BAN_MEMBERS:      { label: "Ban Members",       description: "Allows members to permanently ban other members from the server." },
  CONNECT_TO_VOICE: { label: "Connect to Voice",  description: "Allows members to join voice channels." },
  MUTE_MEMBERS:     { label: "Mute Members",      description: "Allows members to mute others in voice channels." },
};