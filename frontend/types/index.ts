export type Attachment = {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
};

export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: "online" | "idle" | "dnd" | "offline";
  avatarUrl?: string;
  isAdmin?: boolean;
  timeoutUntil?: string;
};

export type Role = {
  id: string;
  guildId: string;
  name: string;
  permissions: number;
  color?: string;
};

export type Member = {
  userId: string;
  guildId: string;
  user: User;
  roles: Role[];
  joinedAt: string;
};

export type Channel = {
  id: string;
  guildId: string;
  name: string;
  type: "TEXT" | "VOICE";
  category?: string;
  subType?: "ANNOUNCEMENTS" | "FORUMS" | "DEFAULT";
  position: number;
};

export type Guild = {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  ownerId: string;
  memberCount: number;
  createdAt: string;
  // existing UI fields
  guildType?: "HOUSE" | "CRIB";
  isPrivate?: boolean;
  channels?: Channel[];
  members?: Member[];
};

export type Message = {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
  editedAt?: string;
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
};

export type GuildMessage = {
  id: string;
  channelId: string;
  senderId: string;
  senderUsername: string;
  senderDisplayName: string;
  senderAvatarUrl?: string;
  content: string;
  timestamp: string;
};

export type GuildMember = {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  role: "OWNER" | "ADMIN" | "MOD" | "MEMBER";
  joinedAt: string;
};

export type InviteResponse = {
  inviteCode: string;
  expiresAt: string;
};

export type Invite = {
  code: string;
  guildId: string;
  createdBy: string;
  expiresAt: string;
};

export type ApiError = {
  message: string;
  status: number;
};

// ── Union / Enum types ───────────────────────────────────────────────────────

export type ChannelType = "TEXT" | "VOICE";
export type MemberRole = "OWNER" | "ADMIN" | "MOD" | "MEMBER";

// ── API Request Payloads ─────────────────────────────────────────────────────

export type CreateGuildPayload = {
  name: string;
  description?: string;
  iconUrl?: string;
};

export type UpdateGuildPayload = {
  name?: string;
  description?: string;
  iconUrl?: string;
};

export type CreateChannelPayload = {
  name: string;
  type: ChannelType;
};

export type UpdateChannelPayload = {
  name?: string;
  type?: ChannelType;
};

export type SendGuildMessagePayload = {
  content: string;
};

// ── WebSocket Event Types ────────────────────────────────────────────────────

export type GuildMessageEvent = {
  type: "GUILD_MESSAGE";
  message: GuildMessage;
};

export type GuildTypingEvent = {
  type: "GUILD_TYPING";
  userId: string;
  username: string;
  isTyping: boolean;
};

export type GuildMemberEvent = {
  type: "MEMBER_JOIN" | "MEMBER_LEAVE" | "MEMBER_KICK";
  userId: string;
  username: string;
};

export type ChannelUpdateEvent = {
  type: "CHANNEL_CREATE" | "CHANNEL_UPDATE" | "CHANNEL_DELETE";
  channel: Channel;
};

export type GuildWebSocketEvent =
  | GuildMessageEvent
  | GuildTypingEvent
  | GuildMemberEvent
  | ChannelUpdateEvent;