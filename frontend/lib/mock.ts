import type { User, Guild, Channel, Member } from "@/types";

export const mockUser: User = {
  id: "1",
  username: "devuser",
  displayName: "Dev User",
  email: "dev@example.com",
  status: "online",
};

export const mockChannels: Channel[] = [
  { id: "101", guildId: "1", name: "general", type: "TEXT", category: "Rooms", subType: "DEFAULT", position: 0 },
  { id: "102", guildId: "1", name: "announcements", type: "TEXT", category: "Rooms", subType: "ANNOUNCEMENTS", position: 1 },
  { id: "103", guildId: "1", name: "general", type: "VOICE", category: "Calls", position: 2 },
  { id: "104", guildId: "1", name: "gaming", type: "VOICE", category: "Calls", position: 3 },
];

export const mockGuilds: Guild[] = [
  {
    id: "1",
    name: "Test Server",
    ownerId: "1",
    guildType: "HOUSE",
    isPrivate: true,
    channels: mockChannels,
    members: [],
  },
];