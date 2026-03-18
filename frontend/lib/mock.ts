import type { User, Guild, Channel, Member } from "@/types";

export const mockUser: User = {
  id: "1",
  username: "devuser",
  displayName: "Dev User",
  email: "dev@example.com",
  status: "online",
};

export const mockChannels: Channel[] = [
  { id: "101", guildId: "1", name: "general", type: "TEXT", position: 0 },
  { id: "102", guildId: "1", name: "random", type: "TEXT", position: 1 },
  { id: "103", guildId: "1", name: "Voice 1", type: "VOICE", position: 2 },
];

export const mockGuilds: Guild[] = [
  {
    id: "1",
    name: "Test Server",
    ownerId: "1",
    channels: mockChannels,
    members: [],
  },
];