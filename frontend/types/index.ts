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
  category?: string;
  subType?: "ANNOUNCEMENTS" | "FORUMS" | "DEFAULT";
  position: number;
  connectedUsers?: VoiceChannelUser[];
};

export type VoiceChannelUser = {
  userId: string;
  user: User;
  isMuted?: boolean;
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

/** WebRTC Voice Call Signal Types */
export type VoiceCallSignal =
  | { type: "CALL_INITIATE"; callerId: string; callerName?: string }
  | { type: "CALL_ACCEPT"; peerId: string }
  | { type: "CALL_DECLINE"; peerId: string }
  | { type: "CALL_HANGUP"; peerId: string }
  | { type: "CALL_TIMEOUT"; peerId: string }
  | {
      type: "WEBRTC_OFFER";
      peerId: string;
      payload: RTCSessionDescriptionInit;
    }
  | {
      type: "WEBRTC_ANSWER";
      peerId: string;
      payload: RTCSessionDescriptionInit;
    }
  | {
      type: "WEBRTC_ICE_CANDIDATE";
      peerId: string;
      payload: RTCIceCandidateInit;
    };

export type VoiceCallState = "idle" | "calling" | "ringing" | "connected" | "ended";