import type { User, Guild, Channel, Member, Message } from "@/types";

export const mockUser: User = {
  id: "1",
  username: "devuser",
  displayName: "Dev User",
  email: "dev@example.com",
  status: "online",
};

const mockUser2: User = {
  id: "2",
  username: "alice",
  displayName: "Alice",
  email: "alice@example.com",
  status: "online",
};

const mockUser3: User = {
  id: "3",
  username: "bob",
  displayName: "Bob",
  email: "bob@example.com",
  status: "idle",
};

export const mockChannels: Channel[] = [
  { id: "101", guildId: "1", name: "general", type: "TEXT", category: "Rooms", subType: "DEFAULT", position: 0 },
  { id: "102", guildId: "1", name: "announcements", type: "TEXT", category: "Rooms", subType: "ANNOUNCEMENTS", position: 1 },
  { id: "103", guildId: "1", name: "general", type: "VOICE", category: "Calls", position: 2 },
  { id: "104", guildId: "1", name: "gaming", type: "VOICE", category: "Calls", position: 3 },
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
    content: "Thanks for the invite Alice! Looking forward to chatting here.",
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
    author: mockUser2,
    content: "This is awesome! What's everyone's favorite game?",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "msg5",
    channelId: "101",
    author: mockUser3,
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
    members: [],
  },
];

// DM Conversations - list of users
export const mockDMConversations: User[] = [mockUser2, mockUser3];

// DM Messages
export const mockDMMessages: Message[] = [
  // Messages with Alice (user 2)
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
  // Messages with Bob (user 3)
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
];