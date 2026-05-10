import { api } from './api';
import type {
  Guild,
  Channel,
  GuildMessage,
  GuildMember,
  InviteResponse,
  CreateGuildPayload,
  UpdateGuildPayload,
  CreateChannelPayload,
  UpdateChannelPayload,
  SendGuildMessagePayload,
} from '@/types';

// ── Guild Management ─────────────────────────────────────────────────────────

export async function createGuild(payload: CreateGuildPayload): Promise<Guild> {
  return api.post<Guild>('/guilds', payload);
}

export async function fetchMyGuilds(): Promise<Guild[]> {
  return api.get<Guild[]>('/guilds');
}

export async function fetchGuild(guildId: string): Promise<Guild> {
  return api.get<Guild>(`/guilds/${guildId}`);
}

export async function updateGuild(
  guildId: string,
  payload: UpdateGuildPayload
): Promise<Guild> {
  return api.put<Guild>(`/guilds/${guildId}`, payload);
}

export async function deleteGuild(guildId: string): Promise<void> {
  return api.delete<void>(`/guilds/${guildId}`);
}

export async function generateInvite(guildId: string): Promise<InviteResponse> {
  return api.post<InviteResponse>(`/guilds/${guildId}/invite`);
}

export async function joinGuild(inviteCode: string): Promise<Guild> {
  return api.post<Guild>(`/guilds/join/${inviteCode}`);
}

export async function leaveGuild(guildId: string): Promise<void> {
  return api.delete<void>(`/guilds/${guildId}/leave`);
}

// ── Channel Management ───────────────────────────────────────────────────────

export async function createChannel(
  guildId: string,
  payload: CreateChannelPayload
): Promise<Channel> {
  return api.post<Channel>(`/guilds/${guildId}/channels`, payload);
}

export async function fetchChannels(guildId: string): Promise<Channel[]> {
  return api.get<Channel[]>(`/guilds/${guildId}/channels`);
}

export async function updateChannel(
  guildId: string,
  channelId: string,
  payload: UpdateChannelPayload
): Promise<Channel> {
  return api.put<Channel>(`/guilds/${guildId}/channels/${channelId}`, payload);
}

export async function deleteChannel(
  guildId: string,
  channelId: string
): Promise<void> {
  return api.delete<void>(`/guilds/${guildId}/channels/${channelId}`);
}

// ── Guild Messages ───────────────────────────────────────────────────────────

export async function sendGuildMessage(
  guildId: string,
  channelId: string,
  payload: SendGuildMessagePayload
): Promise<GuildMessage> {
  return api.post<GuildMessage>(
    `/guilds/${guildId}/channels/${channelId}/messages`,
    payload
  );
}

export async function fetchChannelMessages(
  guildId: string,
  channelId: string,
  page = 0,
  size = 50
): Promise<GuildMessage[]> {
  return api.get<GuildMessage[]>(
    `/guilds/${guildId}/channels/${channelId}/messages?page=${page}&size=${size}`
  );
}

// ── Guild Members ────────────────────────────────────────────────────────────

export async function fetchGuildMembers(guildId: string): Promise<GuildMember[]> {
  return api.get<GuildMember[]>(`/guilds/${guildId}/members`);
}

export async function kickMember(
  guildId: string,
  userId: string
): Promise<void> {
  return api.delete<void>(`/guilds/${guildId}/members/${userId}`);
}