export type User = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: "online" | "idle" | "offline";
  avatarUrl?: string;
};

export type Guild = {
  id: string;
  name: string;
  iconUrl?: string;
  ownerId: string;
  guildType: "HOUSE" | "CRIB";
  isPrivate: boolean;
  channels: Channel[];
  members: Member[];
};

export type Channel = {
  id: string;
  guildId: string;
  name: string;
  type: "TEXT" | "VOICE";
  category?: string; // "Rooms" or "Calls"
  subType?: "ANNOUNCEMENTS" | "FORUMS" | "DEFAULT";
  position: number;
};

export type Message = {
  id: string;
  channelId: string;
  author: User;
  content: string;
  createdAt: string;
  editedAt?: string;
  metadata?: Record<string, unknown>;
};

export type Member = {
  userId: string;
  guildId: string;
  user: User;
  roles: Role[];
  joinedAt: string;
};

export type Role = {
  id: string;
  guildId: string;
  name: string;
  permissions: number;
  color?: string;
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