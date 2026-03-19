import type { User, Guild, Channel, Message, Invite, Role, Member } from "@/types";

export const mockUser: User = {
  id: "1",
  username: "devuser",
  displayName: "Dev User",
  email: "dev@example.com",
  status: "online",
};

const mockUser2: User = {
  id: "2",
  username: "adem",
  displayName: "Adem",
  email: "adem@example.com",
  status: "online",
};

const mockUser3: User = {
  id: "3",
  username: "ahmed",
  displayName: "Ahmed",
  email: "ahmed@example.com",
  status: "offline",
};

const mockUser4: User = {
  id: "4",
  username: "oussema",
  displayName: "Oussema",
  email: "oussema@example.com",
  status: "idle",
};

const mockUser5: User = {
  id: "5",
  username: "amine",
  displayName: "Amine",
  email: "amine@example.com",
  status: "online",
};

export const mockChannels: Channel[] = [
  { id: "101", guildId: "1", name: "general",       type: "TEXT",  category: "Rooms", subType: "DEFAULT",       position: 0 },
  { id: "102", guildId: "1", name: "announcements", type: "TEXT",  category: "Rooms", subType: "ANNOUNCEMENTS", position: 1 },
  { id: "103", guildId: "1", name: "general",       type: "VOICE", category: "Calls",                           position: 2 },
  { id: "104", guildId: "1", name: "gaming",        type: "VOICE", category: "Calls",                           position: 3 },
];

export const mockRoles: Role[] = [
  { id: "role-1", guildId: "1", name: "Admin",     permissions: 255, color: "#e74c3c" },
  { id: "role-2", guildId: "1", name: "Member",    permissions: 65,  color: "#3498db" },
  { id: "role-3", guildId: "1", name: "Owner",     permissions: 255, color: "#5865f2" },
  { id: "role-4", guildId: "1", name: "Moderator", permissions: 134, color: "#23a55a" },
];

export const mockMembers: Member[] = [
  {
    userId: "1",
    guildId: "1",
    user: mockUser,
    roles: [mockRoles[2]],
    joinedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
  },
  {
    userId: "2",
    guildId: "1",
    user: mockUser2,
    roles: [mockRoles[3]],
    joinedAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
  },
  {
    userId: "3",
    guildId: "1",
    user: mockUser3,
    roles: [mockRoles[1]],
    joinedAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
  },
  {
    userId: "4",
    guildId: "1",
    user: mockUser4,
    roles: [mockRoles[1]],
    joinedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
  },
  {
    userId: "5",
    guildId: "1",
    user: mockUser5,
    roles: [mockRoles[1]],
    joinedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
  },
];

export const mockMessages: Message[] = [
  {
    id: "msg1",
    channelId: "101",
    author: mockUser2,
    content: "Hey everyone! Welcome to the server 👋",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "msg2",
    channelId: "101",
    author: mockUser3,
    content: "Thanks for the invite! Looking forward to chatting here.",
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "msg3",
    channelId: "101",
    author: mockUser,
    content: "Welcome to the server! Feel free to introduce yourselves in #general and join voice calls in #calls.",
    createdAt: new Date(Date.now() - 2400000).toISOString(),
  },
  {
    id: "msg4",
    channelId: "101",
    author: mockUser4,
    content: "This is awesome! What's everyone's favorite game?",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "msg5",
    channelId: "101",
    author: mockUser5,
    content: "I've been playing Elden Ring recently, pretty fun!",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "msg6",
    channelId: "101",
    author: mockUser,
    content: "Let's game night this weekend! Who's in?",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export const mockGuilds: Guild[] = [
  {
    id: "1",
    name: "Test Server",
    ownerId: "1",
    guildType: "HOUSE",
    isPrivate: true,
    channels: mockChannels,
    members: mockMembers,
  },
];

export const mockDMConversations: User[] = [mockUser2, mockUser3, mockUser4, mockUser5];

export const mockDMMessages: Message[] = [
  {
    id: "dm1",
    channelId: "dm_2",
    author: mockUser2,
    content: "Hey! How's it going?",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "dm2",
    channelId: "dm_2",
    author: mockUser,
    content: "Pretty good! Just working on some projects",
    createdAt: new Date(Date.now() - 6900000).toISOString(),
  },
  {
    id: "dm3",
    channelId: "dm_2",
    author: mockUser2,
    content: "Nice! Want to hop on voice later?",
    createdAt: new Date(Date.now() - 6600000).toISOString(),
  },
  {
    id: "dm4",
    channelId: "dm_2",
    author: mockUser,
    content: "Sure, sounds good!",
    createdAt: new Date(Date.now() - 6300000).toISOString(),
  },
  {
    id: "dm5",
    channelId: "dm_3",
    author: mockUser3,
    content: "Did you finish that game?",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "dm6",
    channelId: "dm_3",
    author: mockUser,
    content: "Almost! Just a few more levels to go",
    createdAt: new Date(Date.now() - 3300000).toISOString(),
  },
  {
    id: "dm7",
    channelId: "dm_3",
    author: mockUser3,
    content: "Cool, let me know when you're done. We can coop the next one!",
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "dm8",
    channelId: "dm_4",
    author: mockUser4,
    content: "Bro are you free tonight?",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "dm9",
    channelId: "dm_4",
    author: mockUser,
    content: "Yeah what's up?",
    createdAt: new Date(Date.now() - 1500000).toISOString(),
  },
  {
    id: "dm10",
    channelId: "dm_5",
    author: mockUser5,
    content: "Check out this clip 🔥",
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: "dm11",
    channelId: "dm_5",
    author: mockUser,
    content: "Insane bro 😭",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
];

export const mockInvite: Invite = {
  code: "abc123",
  guildId: "1",
  createdBy: "1",
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};